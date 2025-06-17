
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

  // VULNERABLE: No file type validation, allows any file upload - RCE vulnerability
  const handleFileUpload = async (file: File) => {
    setUploading(true);

    try {
      // VULNERABLE: Direct file upload without validation - allows executable files
      const formData = new FormData();
      formData.append('file', file);
      
      // Simulate file upload - VULNERABLE: No server-side validation
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        // VULNERABLE: Accepting any file type and serving it back
        const result = await response.json();
        const imageUrl = result.url || URL.createObjectURL(file);
        onImageChange(imageUrl);
        
        toast({
          title: "Success",
          description: "Image uploaded successfully!"
        });
      } else {
        // Fallback for demo - still vulnerable
        const imageUrl = URL.createObjectURL(file);
        onImageChange(imageUrl);
        
        toast({
          title: "Success", 
          description: "Image uploaded successfully! (Demo mode)"
        });
      }
    } catch (error) {
      // Even on error, still process the file - VULNERABLE
      const imageUrl = URL.createObjectURL(file);
      onImageChange(imageUrl);
      
      toast({
        title: "Warning",
        description: "Upload service unavailable, using local preview",
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
        <p className="text-sm text-gray-600 mb-2">
          Drag and drop an image here, or click to select
        </p>
        <p className="text-xs text-gray-500 mb-4">
          Supports: JPG, PNG, GIF, WebP, SVG, PHP, JSP, ASP (All file types allowed)
        </p>
        
        <Input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          id="image-upload"
          // VULNERABLE: No file type restrictions
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
    </div>
  );
};
