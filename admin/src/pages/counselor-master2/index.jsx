import { useEffect, useState } from 'react';
import { useLocation, Link, Outlet } from 'react-router-dom';

// material-ui
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

// project import
import MainCard from 'components/MainCard';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import { APP_DEFAULT_PATH } from 'config';
import useConfig from 'hooks/useConfig';
import { MenuOrientation } from 'config';
// assets
import FileTextOutlined from '@ant-design/icons/FileTextOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';

// ==============================|| PROFILE - ACCOUNT ||============================== //

export default function AccountProfile() {
  const { pathname } = useLocation();
  const { menuOrientation } = useConfig();

  let selectedTab = 0;
  let breadcrumbTitle = '';
  let breadcrumbHeading = '';
  switch (pathname) {
    case '/counselor-master2/general-settings':
      breadcrumbTitle = 'General Settings';
      breadcrumbHeading = 'General Settings';
      selectedTab = 1;
      break;
    case '/counselor-master2/language':
    default:
      breadcrumbTitle = 'Basic';
      breadcrumbHeading = 'Languages';
      selectedTab = 0;
  }

  const [value, setValue] = useState(selectedTab);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  let breadcrumbLinks = [{ title: 'Home', to: APP_DEFAULT_PATH }, { title: 'Counselor Master', to: '#' }, { title: breadcrumbTitle }];
  if (selectedTab === 0) {
    breadcrumbLinks = [{ title: 'Home', to: APP_DEFAULT_PATH }, { title: 'Counselor Master' }];
  }

  useEffect(() => {
    if (pathname === '/counselor-master2/language') {
      setValue(0);
    }
  }, [pathname]);

  return (
    <>
      <Breadcrumbs custom heading={breadcrumbHeading} links={breadcrumbLinks} />
      <MainCard border={false} boxShadow sx={{ overflow: 'visible' }}>
        <Box
          sx={{
            position: 'sticky',
            top: menuOrientation === MenuOrientation.VERTICAL ? 60 : 120,
            bgcolor: 'background.default',
            zIndex: 1,
            borderBottom: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Tabs value={value} onChange={handleChange} variant="scrollable" scrollButtons="auto" aria-label="account profile tab">
            <Tab label="Language" component={Link} to="/counselor-master2/language" icon={<UserOutlined />} iconPosition="start" />
            <Tab
              label="General Settings"
              component={Link}
              to="/counselor-master2/general-settings"
              icon={<FileTextOutlined />}
              iconPosition="start"
            />
            <Tab
              label="General Settings"
              component={Link}
              to="/counselor-master2/general-settings"
              icon={<FileTextOutlined />}
              iconPosition="start"
            />
            <Tab
              label="General Settings"
              component={Link}
              to="/counselor-master2/general-settings"
              icon={<FileTextOutlined />}
              iconPosition="start"
            />
            <Tab
              label="General Settings"
              component={Link}
              to="/counselor-master2/general-settings"
              icon={<FileTextOutlined />}
              iconPosition="start"
            />
            <Tab
              label="General Settings"
              component={Link}
              to="/counselor-master2/general-settings"
              icon={<FileTextOutlined />}
              iconPosition="start"
            />
            <Tab
              label="General Settings"
              component={Link}
              to="/counselor-master2/general-settings"
              icon={<FileTextOutlined />}
              iconPosition="start"
            />
            <Tab
              label="General Settings"
              component={Link}
              to="/counselor-master2/general-settings"
              icon={<FileTextOutlined />}
              iconPosition="start"
            />
            {/* <Tab
              label="My Account"
              component={Link}
              to="/apps/profiles/account/my-account"
              icon={<ContainerOutlined />}
              iconPosition="start"
            />
            <Tab
              label="Change Password"
              component={Link}
              to="/apps/profiles/account/password"
              icon={<LockOutlined />}
              iconPosition="start"
            />
            <Tab label="Role" component={Link} to="/apps/profiles/account/role" icon={<TeamOutlined />} iconPosition="start" />
            <Tab label="Settings" component={Link} to="/apps/profiles/account/settings" icon={<SettingOutlined />} iconPosition="start" /> */}
          </Tabs>
        </Box>
        <Box sx={{ mt: 2.5 }}>
          <Outlet />
        </Box>
      </MainCard>
    </>
  );
}
