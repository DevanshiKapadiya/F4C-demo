// contexts/SettingsContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { AuthService } from 'services';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSettings = async () => {
    try {
      const response = await AuthService.axiosPost('/getAdminSiteSettings');
      setSettings(response.data?.data);
      applyGlobalSettings(response.data?.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyGlobalSettings = (settings) => {
    // Update favicon
    const favicon = document.querySelector("link[rel*='icon']");
    if (favicon) favicon.href = settings.favicon;

    // Update document title
    document.title = settings.website_title || 'First 4 Counselling';

    // Store in localStorage for initial load on subsequent visits
    localStorage.setItem('siteSettings', JSON.stringify(settings));
  };

  useEffect(() => {
    // Check cache first
    const cachedSettings = localStorage.getItem('siteSettings');
    if (cachedSettings) {
      const parsed = JSON.parse(cachedSettings);
      setSettings(parsed);
      applyGlobalSettings(parsed);
      setLoading(false);
    } else {
      fetchSettings();
    }
  }, []);

  return <SettingsContext.Provider value={{ settings, loading, error }}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
