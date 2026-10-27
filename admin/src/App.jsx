import { RouterProvider } from 'react-router-dom';

// project import
import router from 'routes';
import ThemeCustomization from 'themes';

import Locales from 'components/Locales';
// import RTLLayout from 'components/RTLLayout';
import ScrollTop from 'components/ScrollTop';
import Snackbar from 'components/@extended/Snackbar';
import Notistack from 'components/third-party/Notistack';
import 'App.css';
// auth-provider
import { JWTProvider as AuthProvider } from 'contexts/JWTContext';
import { SettingsProvider } from 'contexts/SettingsContext';
import DynamicFavicon from 'components/DynamicFavicon';
// ==============================|| APP - THEME, ROUTER, LOCAL ||============================== //

export default function App() {
  return (
    <ThemeCustomization>
      <SettingsProvider>
        <DynamicFavicon />
        <Locales>
          <ScrollTop>
            <AuthProvider>
              <Notistack>
                <RouterProvider router={router} />
                <Snackbar />
              </Notistack>
            </AuthProvider>
          </ScrollTop>
        </Locales>
      </SettingsProvider>
    </ThemeCustomization>
  );
}
