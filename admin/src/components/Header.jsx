// components/Header.jsx
import { useSiteSettings } from '../hooks/useSettings';

const Header = () => {
  const { logo, siteTitle } = useSiteSettings();

  return (
    <header>
      <img src={logo} alt={siteTitle} className="logo" />
      <h1>{siteTitle}</h1>
    </header>
  );
};
