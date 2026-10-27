// hooks/useSettings.js
import { useSettings } from '../contexts/SettingsContext';
import logo from '../components/logo/logo.svg';

export const useSiteSettings = () => {
  const { settings, loading, error } = useSettings();

  return {
    favicon: settings?.favicon_url || '/favicon.png',
    logo: settings?.logo || logo,
    siteTitle: settings?.site_title || 'First 4 Counselling',
    copyright_text: settings?.copyright_text || 'First 4 Counselling &copy; All rights reserved',
    loading,
    error
  };
};
