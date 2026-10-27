// components/DynamicFavicon.jsx
import { useEffect } from 'react';
import { useSiteSettings } from '../hooks/useSettings';

const DynamicFavicon = () => {
  const { favicon } = useSiteSettings();

  useEffect(() => {
    const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = favicon;
    document.head.appendChild(link);
  }, [favicon]);

  return null;
};

export default DynamicFavicon;
