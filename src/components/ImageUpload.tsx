
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FileUploadZone } from './upload/FileUploadZone';
import { ProfileAvatarDisplay } from './upload/ProfileAvatarDisplay';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (imageUrl: string) => void;
  userName?: string;
}

export const ImageUpload = ({ currentImage, onImageChange, userName }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
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
      
      // Create vulnerable image URL for LFI
      const imageId = Math.random().toString(36).substring(7);
      const imageUrl = `/images?file=${file.name}&id=${imageId}`;
      
      // Store file content for LFI exploitation
      const reader = new FileReader();
      reader.onload = (e) => {
        localStorage.setItem(`image_${imageId}`, JSON.stringify({
          name: file.name,
          content: e.target?.result,
          type: file.type,
          uploadTime: new Date().toISOString()
        }));
      };
      reader.readAsDataURL(file);
      
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
      const imageId = Math.random().toString(36).substring(7);
      const imageUrl = `/images?file=${file.name}&id=${imageId}`;
      onImageChange(imageUrl);
      
      toast({
        title: "Upload processed",
        description: "File has been processed"
      });
    }

    setUploading(false);
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
  };

  return (
    <div className="space-y-4">
      <Label>Profile Photo</Label>
      
      <ProfileAvatarDisplay
        currentImage={currentImage}
        userName={userName}
        onRemoveImage={removeImage}
      />

      <FileUploadZone
        onFileSelect={handleFileUpload}
        uploading={uploading}
        dragOver={dragOver}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      />
    </div>
  );
};
