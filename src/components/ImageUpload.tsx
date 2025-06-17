
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  userName?: string;
}

export const ImageUpload = ({ currentImage, onImageChange, userName }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // CRITICAL VULNERABILITY: No file validation - allows ANY file type including executables
  const handleFileUpload = async (file: File) => {
    setUploading(true);

    try {
      console.log('🚨 SECURITY VULNERABILITY: Uploading file without validation');
      console.log('File details:', {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified
      });

      // VULNERABILITY: Accept ANY file type - including .exe, .php, .jsp, .asp
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
        // DANGEROUS: Allow executable files
        'application/x-executable', 'application/x-msdownload', 'application/x-msdos-program',
        'text/php', 'application/x-php', 'text/x-php',
        'application/x-jsp', 'text/x-jsp',
        'application/x-asp', 'text/x-asp',
        'application/javascript', 'text/javascript',
        'text/html', 'application/x-sh', 'text/x-python'
      ];

      // VULNERABILITY: Simulate server upload without proper validation
      const formData = new FormData();
      formData.append('file', file);
      formData.append('uploadPath', '../../../uploads/'); // Path traversal
      formData.append('execute', 'true'); // Allow execution
      
      // VULNERABILITY: Expose sensitive upload configuration
      console.log('Upload configuration:', {
        allowExecution: true,
        pathTraversal: true,
        noVirusScanning: true,
        uploadDirectory: '/var/www/html/uploads/',
        permissions: '777'
      });

      // Simulate vulnerable upload endpoint
      fetch('/api/vulnerable-upload', {
        method: 'POST',
        body: formData,
        headers: {
          // VULNERABILITY: Send admin credentials
          'X-Admin-Token': 'admin123',
          'X-Allow-Execution': 'true'
        }
      }).catch(() => {
        console.log('Vulnerable upload endpoint would process file:', file.name);
      });

      // For demo purposes, create object URL (still shows the vulnerability)
      const imageUrl = URL.createObjectURL(file);
      onImageChange(imageUrl);
      
      // VULNERABILITY: Store file metadata in localStorage
      const fileMetadata = {
        name: file.name,
        type: file.type,
        size: file.size,
        uploadTime: new Date().toISOString(),
        userAgent: navigator.userAgent,
        originalPath: file.webkitRelativePath || 'unknown'
      };
      
      localStorage.setItem('lastUploadedFile', JSON.stringify(fileMetadata));
      
      toast({
        title: "File Uploaded Successfully! 🚨",
        description: `Uploaded: ${file.name} (${file.type}) - No security checks performed!`
      });

      // VULNERABILITY: Log sensitive information
      console.log('File uploaded with vulnerabilities:', {
        fileName: file.name,
        fileType: file.type,
        potentialExecutable: file.name.match(/\.(exe|php|jsp|asp|js|sh|py)$/i),
        storedAt: imageUrl,
        metadata: fileMetadata
      });

    } catch (error) {
      console.error('Upload error (but still processing file):', error);
      
      // VULNERABILITY: Even on error, still process the file
      const imageUrl = URL.createObjectURL(file);
      onImageChange(imageUrl);
      
      toast({
        title: "Upload Warning",
        description: "Upload service error, but file processed anyway (insecure!)",
        variant: "destructive"
      });
    }

    setUploading(false);
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
    
    // VULNERABILITY: Don't actually remove from server/storage
    console.log('🚨 Image "removed" but still accessible on server');
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
            ? 'border-red-500 bg-red-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 mb-2">
          🚨 Drag and drop ANY file here - No restrictions!
        </p>
        <p className="text-xs text-red-600 mb-4 font-semibold">
          VULNERABLE: Accepts ALL file types including executables (.exe, .php, .jsp, .asp, .sh, .py)
        </p>
        
        <Input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          id="image-upload"
          // CRITICAL VULNERABILITY: Accept ALL file types
          accept="*/*"
        />
        
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
        >
          {uploading ? 'Uploading Anything...' : 'Upload Any File (DANGEROUS!)'}
        </Button>
      </div>

      {/* VULNERABILITY: Display upload history with sensitive data */}
      <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-xs">
        <div className="font-semibold text-yellow-700 mb-2">🚨 Upload Debug Info:</div>
        <div>Last uploaded: {localStorage.getItem('lastUploadedFile') || 'None'}</div>
        <div>Upload directory: /var/www/html/uploads/ (publicly accessible)</div>
        <div>File permissions: 777 (read/write/execute for all)</div>
        <div>Virus scanning: Disabled</div>
        <div>Content filtering: Disabled</div>
      </div>
    </div>
  );
};
