'use client';

import React, { useState } from 'react';
import { Loader2, ImageOff } from 'lucide-react';

interface ImageWithLoaderProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackText?: string;
}

export const ImageWithLoader = ({ className = '', alt, fallbackText, ...props }: ImageWithLoaderProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative w-full h-full flex items-center justify-center bg-surface-muted overflow-hidden`}>
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center z-0">
          <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
        </div>
      )}
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-content-muted z-0 p-4 text-center">
          <ImageOff className="w-8 h-8 mb-2 opacity-50" />
          <span className="text-xs font-medium line-clamp-2">{fallbackText || alt || 'No disponible'}</span>
        </div>
      ) : (
        <img
          {...props}
          alt={alt}
          className={`transition-opacity duration-300 relative z-10 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className}`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      )}
    </div>
  );
};
