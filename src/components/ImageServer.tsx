
import React from 'react';

export const ImageServer = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const fileName = urlParams.get('file');
  const imageId = urlParams.get('id');

  if (!fileName || !imageId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Invalid image request</p>
      </div>
    );
  }

  const imageData = localStorage.getItem(`image_${imageId}`);
  
  if (!imageData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Image not found</p>
      </div>
    );
  }

  try {
    const parsedImageData = JSON.parse(imageData);
    
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <img 
          src={parsedImageData.content} 
          alt={parsedImageData.name}
          className="max-w-full max-h-full object-contain"
        />
      </div>
    );
  } catch (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Error loading image</p>
      </div>
    );
  }
};
