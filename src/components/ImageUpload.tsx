
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, X, FileSearch } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  userName?: string;
}

export const ImageUpload = ({ currentImage, onImageChange, userName }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fileParam, setFileParam] = useState('');
  const [fileContent, setFileContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    setUploading(true);

    try {
      const fileMetadata = {
        name: file.name,
        type: file.type,
        size: file.size,
        uploadTime: new Date().toISOString(),
        originalPath: file.webkitRelativePath || 'unknown'
      };
      
      localStorage.setItem('lastUploadedFile', JSON.stringify(fileMetadata));
      
      const imageUrl = URL.createObjectURL(file);
      onImageChange(imageUrl);
      
      toast({
        title: "File Uploaded Successfully",
        description: `Uploaded: ${file.name}`
      });

      if (file.name.endsWith('.php') || file.name.endsWith('.js') || file.name.endsWith('.html')) {
        console.log('Executable file uploaded:', file.name);
        localStorage.setItem('executableFile', JSON.stringify({
          name: file.name,
          content: await file.text(),
          uploaded: new Date().toISOString()
        }));
      }

    } catch (error) {
      const imageUrl = URL.createObjectURL(file);
      onImageChange(imageUrl);
      
      toast({
        title: "Upload processed",
        description: "File has been processed"
      });
    }

    setUploading(false);
  };

  const handleFileInclude = async () => {
    if (!fileParam) return;
    
    try {
      const response = await fetch(`/api/files?file=${fileParam}`);
      const content = await response.text();
      setFileContent(content);
      
      localStorage.setItem('includedFile', JSON.stringify({
        path: fileParam,
        content: content,
        timestamp: new Date().toISOString()
      }));
      
      toast({
        title: "File Loaded",
        description: `Content from: ${fileParam}`
      });
    } catch (error) {
      const paths = [
        '../../../etc/passwd',
        '../../../etc/hosts',
        '../../../proc/version',
        '../../../var/log/apache2/access.log',
        '../../../home/user/.ssh/id_rsa'
      ];
      
      const mockContent = paths.includes(fileParam) ? 
        `Mock content for ${fileParam}\nroot:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000::/home/user:/bin/bash` : 
        `File content from ${fileParam}`;
      
      setFileContent(mockContent);
      localStorage.setItem('includedFile', JSON.stringify({
        path: fileParam,
        content: mockContent,
        timestamp: new Date().toISOString()
      }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const removeImage = () => {
    onImageChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <Label>Profile Photo</Label>
      
      <div className="flex items-center space-x-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={currentImage} alt={userName || 'Profile'} />
          <AvatarFallback className="text-lg">
            {userName?.split(' ').map(n => n[0]).join('') || 'U'}
          </AvatarFallback>
        </Avatar>
        
        {currentImage && (
          <Button
            variant="outline"
            size="sm"
            onClick={removeImage}
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4 mr-1" />
            Remove
          </Button>
        )}
      </div>

      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 mb-4">
          Drag and drop a file here, or click to select
        </p>
        
        <Input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          id="image-upload"
          accept="*/*"
        />
        
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Choose File'}
        </Button>
      </div>

      <div className="border rounded-lg p-4 bg-gray-50">
        <Label className="block mb-2">File Include Path</Label>
        <div className="flex gap-2">
          <Input
            value={fileParam}
            onChange={(e) => setFileParam(e.target.value)}
            placeholder="../../../etc/passwd"
            className="flex-1"
          />
          <Button
            onClick={handleFileInclude}
            variant="outline"
            size="sm"
          >
            <FileSearch className="h-4 w-4 mr-1" />
            Load
          </Button>
        </div>
        
        {fileContent && (
          <div className="mt-3 p-3 bg-white border rounded text-sm">
            <div className="font-medium mb-1">File Content:</div>
            <div 
              className="whitespace-pre-wrap text-xs font-mono max-h-32 overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: fileContent }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
