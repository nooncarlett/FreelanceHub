
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X } from 'lucide-react';

interface ProfileAvatarDisplayProps {
  currentImage?: string;
  userName?: string;
  onRemoveImage: () => void;
}

export const ProfileAvatarDisplay = ({
  currentImage,
  userName,
  onRemoveImage
}: ProfileAvatarDisplayProps) => {
  // Handle the custom image URL format
  const getImageSrc = (imageUrl?: string) => {
    if (!imageUrl) return undefined;
    
    // If it's already a data URL, return as is
    if (imageUrl.startsWith('data:')) return imageUrl;
    
    // If it's our custom format (/images?file=...), we need to get the actual data
    if (imageUrl.startsWith('/images?')) {
      const urlParams = new URLSearchParams(imageUrl.split('?')[1]);
      const id = urlParams.get('id');
      
      if (id) {
        const storedImage = localStorage.getItem(`image_${id}`);
        if (storedImage) {
          try {
            const imageData = JSON.parse(storedImage);
            return imageData.content;
          } catch {
            return undefined;
          }
        }
      }
    }
    
    return imageUrl;
  };

  const imageSrc = getImageSrc(currentImage);

  return (
    <div className="flex items-center space-x-4">
      <Avatar className="h-20 w-20">
        <AvatarImage src={imageSrc} alt={userName || 'Profile'} />
        <AvatarFallback className="text-lg">
          {userName?.split(' ').map(n => n[0]).join('') || 'U'}
        </AvatarFallback>
      </Avatar>
      
      {currentImage && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRemoveImage}
          className="text-red-600 hover:text-red-700"
        >
          <X className="h-4 w-4 mr-1" />
          Remove
        </Button>
      )}
    </div>
  );
};
