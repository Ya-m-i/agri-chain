// Advanced image optimization utilities for better performance

// Image optimization configuration
const IMAGE_CONFIG = {
  quality: {
    high: 0.9,
    medium: 0.8,
    low: 0.6,
    thumbnail: 0.4
  },
  maxWidth: {
    desktop: 1920,
    tablet: 1024,
    mobile: 768,
    thumbnail: 300
  },
  formats: ['webp', 'jpeg', 'png'],
  lazyLoadOffset: 100, // pixels before image enters viewport
  compressionThreshold: 100 * 1024, // 100KB
};

// WebP support detection
let webpSupported = null;
const detectWebPSupport = () => {
  if (webpSupported !== null) return webpSupported;
  
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      webpSupported = webP.height === 2;
      resolve(webpSupported);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

// Intersection Observer for lazy loading
let imageObserver = null;
const getImageObserver = () => {
  if (imageObserver) return imageObserver;
  
  if ('IntersectionObserver' in window) {
    imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            loadImage(img);
            imageObserver.unobserve(img);
          }
        });
      },
      {
        rootMargin: `${IMAGE_CONFIG.lazyLoadOffset}px`,
      }
    );
  }
  
  return imageObserver;
};

// Load image with optimization
const loadImage = async (img) => {
  const src = img.dataset.src || img.src;
  if (!src) return;

  try {
    // Add loading state
    img.classList.add('loading');
    
    // Try to load optimized version
    const optimizedSrc = await getOptimizedImageUrl(src);
    
    // Preload image
    const imageLoader = new Image();
    imageLoader.onload = () => {
      img.src = optimizedSrc;
      img.classList.remove('loading');
      img.classList.add('loaded');
    };
    imageLoader.onerror = () => {
      // Fallback to original
      img.src = src;
      img.classList.remove('loading');
      img.classList.add('error');
    };
    imageLoader.src = optimizedSrc;
    
  } catch (error) {
    console.warn('Image loading error:', error);
    img.src = src;
    img.classList.remove('loading');
    img.classList.add('error');
  }
};

// Get optimized image URL
const getOptimizedImageUrl = async (originalUrl) => {
  try {
    // If it's a data URL (base64), optimize it
    if (originalUrl.startsWith('data:')) {
      const optimized = await optimizeDataUrl(originalUrl);
      return optimized;
    }

    // For external URLs, check if we can optimize
    const optimized = await optimizeImageUrl(originalUrl);
    return optimized;
    
  } catch (error) {
    console.warn('Image optimization failed:', error);
    return originalUrl;
  }
};

// Optimize data URL images
const optimizeDataUrl = async (dataUrl) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calculate optimal dimensions
      const { width, height } = getOptimalDimensions(img.width, img.height);
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to optimized format
      const quality = getOptimalQuality(dataUrl.length);
      const optimizedDataUrl = canvas.toDataURL('image/jpeg', quality);
      
      resolve(optimizedDataUrl);
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
};

// Optimize regular image URLs
const optimizeImageUrl = async (url) => {
  // For now, just return the original URL
  // In a production environment, you might use a service like Cloudinary or imgix
  const isWebPSupported = await detectWebPSupport();
  
  // Simple WebP conversion for supported formats
  if (isWebPSupported && (url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png'))) {
    // This would typically be handled by your CDN or image optimization service
    return url; // Return as-is for now
  }
  
  return url;
};

// Get optimal dimensions based on viewport
const getOptimalDimensions = (originalWidth, originalHeight) => {
  const viewport = getViewportSize();
  const maxWidth = IMAGE_CONFIG.maxWidth[viewport];
  
  if (originalWidth <= maxWidth) {
    return { width: originalWidth, height: originalHeight };
  }
  
  const ratio = maxWidth / originalWidth;
  return {
    width: Math.round(maxWidth),
    height: Math.round(originalHeight * ratio)
  };
};

// Get optimal quality based on file size
const getOptimalQuality = (originalSize) => {
  if (originalSize > IMAGE_CONFIG.compressionThreshold * 4) return IMAGE_CONFIG.quality.low;
  if (originalSize > IMAGE_CONFIG.compressionThreshold * 2) return IMAGE_CONFIG.quality.medium;
  return IMAGE_CONFIG.quality.high;
};

// Detect viewport size
const getViewportSize = () => {
  const width = window.innerWidth;
  if (width <= 768) return 'mobile';
  if (width <= 1024) return 'tablet';
  return 'desktop';
};

// Progressive image loading component
export const createProgressiveImage = (src, alt = '', className = '', placeholder = null) => {
  const img = document.createElement('img');
  img.alt = alt;
  img.className = `progressive-image ${className}`;
  img.dataset.src = src;
  
  // Add placeholder
  if (placeholder) {
    img.src = placeholder;
  } else {
    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+';
  }
  
  // Setup lazy loading
  const observer = getImageObserver();
  if (observer) {
    observer.observe(img);
  } else {
    // Fallback for browsers without IntersectionObserver
    loadImage(img);
  }
  
  return img;
};

// Optimize existing images on page
export const optimizeExistingImages = () => {
  const images = document.querySelectorAll('img[data-src], img:not([data-optimized])');
  const observer = getImageObserver();
  
  images.forEach(img => {
    if (img.dataset.src) {
      // Lazy load images with data-src
      if (observer) {
        observer.observe(img);
      } else {
        loadImage(img);
      }
    } else if (!img.dataset.optimized) {
      // Optimize existing images
      const originalSrc = img.src;
      img.dataset.optimized = 'true';
      
      getOptimizedImageUrl(originalSrc).then(optimizedSrc => {
        if (optimizedSrc !== originalSrc) {
          img.src = optimizedSrc;
        }
      });
    }
  });
};

// Preload critical images
export const preloadCriticalImages = (imageUrls) => {
  imageUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
};

/** Compress image file to a data URL for JSON payloads (e.g. crop insurance). Keeps request small. */
export const compressImageFileToDataUrl = (file, maxWidth = 600, quality = 0.6) => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      let { width, height } = img;
      if (width > maxWidth || height > maxWidth) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxWidth) / height);
          height = maxWidth;
        }
      }
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(dataUrl);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    };
    img.src = url;
  });
};

/** Compress image for profile uploads (small file, fast upload). Returns a File. */
export const compressImageForProfile = (file, maxWidth = 400, quality = 0.75) => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      let { width, height } = img;
      if (width > maxWidth || height > maxWidth) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxWidth) / height);
          height = maxWidth;
        }
      }
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          const out = new File([blob], file.name.replace(/\.[^/.]+$/, '.jpg') || 'profile.jpg', {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(out);
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
};

// Image compression utility for user uploads
export const compressImageFile = (file, quality = IMAGE_CONFIG.quality.medium) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      const { width, height } = getOptimalDimensions(img.width, img.height);
      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          });
          resolve(compressedFile);
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
};

// Convert image to WebP format
export const convertToWebP = (file) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const webpFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.webp'), {
              type: 'image/webp',
              lastModified: Date.now()
            });
            resolve(webpFile);
          } else {
            resolve(file);
          }
        },
        'image/webp',
        IMAGE_CONFIG.quality.high
      );
    };
    
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
};

// Initialize image optimization
export const initImageOptimization = () => {
  // Add CSS for progressive loading
  if (!document.getElementById('progressive-image-styles')) {
    const styles = document.createElement('style');
    styles.id = 'progressive-image-styles';
    styles.textContent = `
      .progressive-image {
        transition: opacity 0.3s ease, filter 0.3s ease;
        will-change: opacity, filter;
      }
      .progressive-image.loading {
        opacity: 0.7;
        filter: blur(2px);
      }
      .progressive-image.loaded {
        opacity: 1;
        filter: none;
      }
      .progressive-image.error {
        opacity: 0.5;
        filter: grayscale(100%);
      }
    `;
    document.head.appendChild(styles);
  }
  
  // Optimize existing images
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', optimizeExistingImages);
  } else {
    optimizeExistingImages();
  }
  
  // Watch for new images
  if ('MutationObserver' in window) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            if (node.tagName === 'IMG') {
              const img = node;
              if (img.dataset.src && !img.dataset.optimized) {
                const imageObserver = getImageObserver();
                if (imageObserver) {
                  imageObserver.observe(img);
                } else {
                  loadImage(img);
                }
              }
            } else {
              // Check for img elements in added subtree
              const images = node.querySelectorAll?.('img[data-src]:not([data-optimized])');
              images?.forEach(img => {
                const imageObserver = getImageObserver();
                if (imageObserver) {
                  imageObserver.observe(img);
                } else {
                  loadImage(img);
                }
              });
            }
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
};

export default {
  createProgressiveImage,
  optimizeExistingImages,
  preloadCriticalImages,
  compressImageFile,
  convertToWebP,
  initImageOptimization
};