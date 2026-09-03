import React, { useState } from 'react';

interface ProductImageWithShimmerProps {
  src: string;
  alt: string;
  className?: string;
}

/**
 * Product image that shows an animated shimmer skeleton until the image has
 * actually finished loading, then fades it in — gives listings a polished,
 * "professional product view" feel instead of a blank flash or layout jump.
 */
export const ProductImageWithShimmer: React.FC<ProductImageWithShimmerProps> = ({ src, alt, className = '' }) => {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  return (
    <>
      {!loaded && !errored && <div className="absolute inset-0 shimmer-loading" />}
      {errored ? (
        <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-xs font-semibold bg-gray-50">
          No image
        </div>
      ) : (
        <img
          loading="lazy"
          decoding="async"
          src={src}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
          className={`${className} transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </>
  );
};
