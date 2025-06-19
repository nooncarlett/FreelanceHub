
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
  return (
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
