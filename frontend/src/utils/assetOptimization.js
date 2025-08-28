// Asset management and optimization utilities

// Asset optimization configuration
const ASSET_CONFIG = {
  criticalCssThreshold: 50 * 1024, // 50KB
  fontDisplaySwap: true,
  preloadFonts: ['inter', 'roboto'], // Common fonts to preload
  assetCacheTimeout: 7 * 24 * 60 * 60 * 1000, // 7 days
  compressibleTypes: ['text/css', 'text/javascript', 'application/javascript'],
};

// Font optimization
export const optimizeFonts = () => {
  // Add font-display: swap to all font faces
  const styleSheets = Array.from(document.styleSheets);
  
  styleSheets.forEach(sheet => {
    try {
      const rules = sheet.cssRules || sheet.rules;
      if (rules) {
        Array.from(rules).forEach(rule => {
          if (rule.type === CSSRule.FONT_FACE_RULE) {
            if (!rule.style.fontDisplay) {
              rule.style.fontDisplay = 'swap';
            }
          }
        });
      }
    } catch {
      // Cross-origin stylesheets might throw errors
      console.warn('Cannot access stylesheet');
    }
  });
};

// Preload critical fonts
export const preloadCriticalFonts = () => {
  // Only preload fonts that actually exist
  // In development, we'll skip this to avoid 404 warnings
  if (!import.meta.env?.PROD) {
    console.log('Font preloading skipped in development');
    return;
  }
  
  const fontsToPreload = [
    // Add your actual font paths here when you have them
    // '/fonts/inter-var.woff2',
    // '/fonts/roboto-regular.woff2',
  ];
  
  fontsToPreload.forEach(fontUrl => {
    const existingPreload = document.querySelector(`link[href="${fontUrl}"]`);
    if (!existingPreload) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = fontUrl;
      document.head.appendChild(link);
    }
  });
};

// Critical CSS extraction and inlining
export const inlineCriticalCSS = () => {
  const criticalCSS = `
    /* Critical above-the-fold styles */
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
    
    /* Loading states */
    .skeleton {
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
    }
    
    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    
    /* Critical layout */
    .min-h-screen { min-height: 100vh; }
    .flex { display: flex; }
    .items-center { align-items: center; }
    .justify-center { justify-content: center; }
    .text-center { text-align: center; }
    .animate-spin { animation: spin 1s linear infinite; }
    
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `;
  
  if (!document.getElementById('critical-css')) {
    const style = document.createElement('style');
    style.id = 'critical-css';
    style.textContent = criticalCSS;
    document.head.insertBefore(style, document.head.firstChild);
  }
};

// Lazy load non-critical CSS
export const lazyLoadCSS = (href, media = 'all') => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.media = 'print'; // Initially set to print to avoid blocking
  link.onload = () => {
    link.media = media; // Change to actual media after load
  };
  document.head.appendChild(link);
  
  // Fallback for browsers that don't support onload
  setTimeout(() => {
    if (link.media === 'print') {
      link.media = media;
    }
  }, 3000);
};

// Resource hints for better performance
export const addResourceHints = () => {
  const hints = [
    { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: '//fonts.gstatic.com' },
    { rel: 'preconnect', href: '//fonts.googleapis.com', crossOrigin: true },
    { rel: 'preconnect', href: '//fonts.gstatic.com', crossOrigin: true },
  ];
  
  hints.forEach(hint => {
    const existing = document.querySelector(`link[rel="${hint.rel}"][href="${hint.href}"]`);
    if (!existing) {
      const link = document.createElement('link');
      link.rel = hint.rel;
      link.href = hint.href;
      if (hint.crossOrigin) link.crossOrigin = hint.crossOrigin;
      document.head.appendChild(link);
    }
  });
};

// Service Worker registration for asset caching
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/agri-chain/sw.js');
      console.log('ServiceWorker registered:', registration);
      
      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New update available
            showUpdateNotification();
          }
        });
      });
      
      return registration;
    } catch (error) {
      console.warn('ServiceWorker registration failed:', error);
    }
  }
  return null;
};

// Show update notification
const showUpdateNotification = () => {
  const notification = document.createElement('div');
  notification.innerHTML = `
    <div style="position: fixed; top: 20px; right: 20px; background: #4CAF50; color: white; padding: 16px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 9999; max-width: 300px;">
      <div style="font-weight: 600; margin-bottom: 8px;">App Updated!</div>
      <div style="font-size: 14px; margin-bottom: 12px;">A new version is available.</div>
      <button onclick="window.location.reload()" style="background: white; color: #4CAF50; border: none; padding: 8px 16px; border-radius: 4px; font-weight: 600; cursor: pointer;">
        Reload
      </button>
      <button onclick="this.parentElement.remove()" style="background: transparent; color: white; border: 1px solid white; padding: 8px 16px; border-radius: 4px; margin-left: 8px; cursor: pointer;">
        Later
      </button>
    </div>
  `;
  document.body.appendChild(notification);
  
  // Auto remove after 10 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 10000);
};

// Lazy load JavaScript modules
export const lazyLoadScript = (src, type = 'module') => {
  return new Promise((resolve, reject) => {
    const existingScript = document.querySelector(`script[src="${src}"]`);
    if (existingScript) {
      resolve(existingScript);
      return;
    }
    
    const script = document.createElement('script');
    script.src = src;
    script.type = type;
    script.onload = () => resolve(script);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// Optimize third-party scripts
export const optimizeThirdPartyScripts = () => {
  // Delay non-critical third-party scripts
  const delayedScripts = [
    // Add any analytics or non-critical scripts here
    // '//www.google-analytics.com/analytics.js',
    // Note: Removed Facebook pixel to prevent 'fbq is not defined' error
  ];
  
  const loadDelayedScripts = () => {
    delayedScripts.forEach(src => {
      if (!document.querySelector(`script[src="${src}"]`)) {
        lazyLoadScript(src, 'text/javascript');
      }
    });
  };
  
  // Only load if there are scripts to load
  if (delayedScripts.length === 0) {
    return;
  }
  
  // Load after user interaction or after a delay
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  const loadOnce = () => {
    loadDelayedScripts();
    events.forEach(event => {
      document.removeEventListener(event, loadOnce, { passive: true });
    });
  };
  
  events.forEach(event => {
    document.addEventListener(event, loadOnce, { passive: true });
  });
  
  // Fallback: load after 5 seconds
  setTimeout(loadDelayedScripts, 5000);
};

// Asset compression check
export const checkAssetCompression = () => {
  // Only check in production to reduce development console noise
  if (!import.meta.env?.PROD) {
    return;
  }
  
  // Check if assets are being served compressed
  const testUrls = [
    '/assets/app.css',
    '/assets/app.js',
  ];
  
  testUrls.forEach(async (url) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const encoding = response.headers.get('content-encoding');
      if (!encoding) {
        console.warn(`Asset ${url} is not compressed. Consider enabling gzip/brotli compression.`);
      }
    } catch {
      // Asset might not exist, ignore
    }
  });
};

// Bundle analysis helper
export const analyzeBundleSize = () => {
  if (import.meta.env?.DEV) {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    
    // Only log once to reduce noise
    if (!window.__bundleAnalyzed) {
      console.group('Bundle Analysis');
      console.log('Scripts:', scripts.length);
      console.log('Stylesheets:', styles.length);
      
      // Estimate bundle sizes (rough calculation)
      let totalScriptSize = 0;
      let totalStyleSize = 0;
      
      scripts.forEach(script => {
        if (script.src.includes('/assets/')) {
          totalScriptSize += 200; // Rough estimate in KB
        }
      });
      
      styles.forEach(style => {
        if (style.href.includes('/assets/')) {
          totalStyleSize += 50; // Rough estimate in KB
        }
      });
      
      console.log(`Estimated JS bundle size: ${totalScriptSize}KB`);
      console.log(`Estimated CSS bundle size: ${totalStyleSize}KB`);
      console.groupEnd();
      
      window.__bundleAnalyzed = true;
    }
  }
};

// Performance monitoring
export const monitorAssetPerformance = () => {
  if ('PerformanceObserver' in window && import.meta.env?.PROD) {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.initiatorType === 'link' || entry.initiatorType === 'script') {
          const loadTime = entry.responseEnd - entry.startTime;
          if (loadTime > 2000) { // Only warn for really slow assets (2+ seconds)
            console.warn(`Slow asset load: ${entry.name} took ${loadTime.toFixed(2)}ms`);
          }
        }
      });
    });
    
    observer.observe({ entryTypes: ['resource'] });
  }
};

// Initialize all asset optimizations
export const initAssetOptimization = () => {
  // Critical CSS first
  inlineCriticalCSS();
  
  // Resource hints
  addResourceHints();
  
  // Font optimization
  optimizeFonts();
  preloadCriticalFonts();
  
  // Service worker
  registerServiceWorker();
  
  // Third-party script optimization
  optimizeThirdPartyScripts();
  
  // Performance monitoring
  monitorAssetPerformance();
  
  // Development helpers (less verbose)
  if (import.meta.env?.DEV) {
    setTimeout(() => {
      checkAssetCompression();
      analyzeBundleSize();
    }, 2000); // Delay to avoid startup noise
  }
  
  console.log('✅ Asset optimization initialized');
};

export default {
  optimizeFonts,
  preloadCriticalFonts,
  inlineCriticalCSS,
  lazyLoadCSS,
  addResourceHints,
  registerServiceWorker,
  lazyLoadScript,
  optimizeThirdPartyScripts,
  initAssetOptimization
};