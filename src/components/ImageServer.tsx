
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export const ImageServer = () => {
  const [searchParams] = useSearchParams();
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [isImage, setIsImage] = useState(false);

  useEffect(() => {
    const file = searchParams.get('file');
    const id = searchParams.get('id');

    if (!file) {
      setError('No file specified');
      return;
    }

    // Vulnerable LFI implementation
    if (file.includes('../') || file.includes('..\\')) {
      // Simulate reading system files
      const systemFiles: Record<string, string> = {
        '../../../etc/passwd': 'root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000::/home/user:/bin/bash\nnobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin',
        '../../../etc/hosts': '127.0.0.1 localhost\n127.0.1.1 ubuntu\n::1 ip6-localhost ip6-loopback',
        '../../../proc/version': 'Linux version 5.4.0-74-generic (buildd@lgw01-amd64-038) (gcc version 9.4.0 (Ubuntu 9.4.0-1ubuntu1~20.04.1)) #83-Ubuntu SMP Sat May 8 02:35:39 UTC 2021',
        '../../../var/log/apache2/access.log': '192.168.1.100 - - [25/Dec/2023:10:00:00 +0000] "GET / HTTP/1.1" 200 1043 "-" "Mozilla/5.0"',
        '../../../home/user/.ssh/id_rsa': '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA2K8...\n-----END RSA PRIVATE KEY-----'
      };

      const fileContent = systemFiles[file] || `Error: Could not read file ${file}`;
      setContent(fileContent);
      setIsImage(false);
      return;
    }

    // Normal image serving
    if (id) {
      const storedImage = localStorage.getItem(`image_${id}`);
      if (storedImage) {
        try {
          const imageData = JSON.parse(storedImage);
          const imageContent = imageData.content || 'Image content not found';
          setContent(imageContent);
          setIsImage(imageContent.startsWith('data:image/'));
        } catch {
          setError('Invalid image data');
        }
      } else {
        setError('Image not found');
      }
    } else {
      setError('No image ID provided');
    }
  }, [searchParams]);

  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (isImage) {
    return (
      <div className="p-4 flex justify-center">
        <img src={content} alt="Uploaded file" className="max-w-full max-h-screen object-contain" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">File Content</h1>
      <div 
        className="whitespace-pre-wrap font-mono text-sm bg-gray-100 p-4 rounded border"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
};
