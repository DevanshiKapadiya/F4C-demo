// project import
import MiniDrawer from 'components/MiniDrawer';
import React, { useEffect, useRef, useState } from 'react';
import { List, ListItem, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import {
  AimOutlined,
  BulbOutlined,
  CloudOutlined,
  CommentOutlined,
  MailOutlined,
  ProductOutlined,
  SettingOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
// ==============================|| PROFILE - USER ||============================== //

function getPathIndex(pathname) {
  let selectedTab = 0;
  switch (pathname) {
    case '/site-settings/general-settings':
      selectedTab = 0;
      break;
    case '/site-settings/smtp-settings':
      selectedTab = 1;
      break;

    default:
      selectedTab = 0;
  }
  return selectedTab;
}

export default function Index() {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [selectedIndex, setSelectedIndex] = useState(
    getPathIndex(pathname == '/site-settings' ? '/site-settings/general-settings' : pathname)
  );
  const inputRef = useRef(null);
  let breadcrumbHeading = 'General Settings';

  const handleListItemClick = (index, route, event) => {
    if (event.ctrlKey || event.metaKey) {
      /* If Ctrl or Cmd key is pressed, open in new tab */
      window.open(route, '_blank');
    } else {
      /* Normal click behavior */
      setSelectedIndex(index);
      navigate(route);
    }
  };

  useEffect(() => {
    if (pathname == '/site-settings') {
      navigate('/site-settings/general-settings');
    }
    setSelectedIndex(getPathIndex(pathname));
  }, [pathname]);

  let breadcrumbLinks = [
    { title: 'Home', to: '/' },
    { title: 'General Settings', to: '/site-settings/general-settings' }
  ];
  if (selectedIndex == 0) {
    breadcrumbHeading = 'General Settings';
    breadcrumbLinks = [{ title: 'Home', to: '/' }, { title: 'General Settings' }];
  }
  if (selectedIndex == 1) {
    breadcrumbHeading = 'SMTP Settings';
    breadcrumbLinks = [{ title: 'Home', to: '/' }, { title: 'SMTP Settings' }];
  }

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };
  return (
    <>
      <Breadcrumbs custom heading={breadcrumbHeading} links={breadcrumbLinks} />
      <MiniDrawer isOpen={isOpen} toggleDrawer={toggleDrawer} inputRef={inputRef} title="Settings">
        <List
          style={{
            display: 'flex',
            gap: !isOpen ? '20px' : '10px',
            flexDirection: 'column',
            padding: '10px 0px',
            maxHeight: 'calc(75vh - 10px)',
            overflowY: 'auto'
          }}
        >
          <ListItem button selected={selectedIndex === 0} onClick={(e) => handleListItemClick(0, '/site-settings/general-settings', e)}>
            <ListItemIcon>
              <Tooltip title="General Settings">
                <SettingOutlined />
              </Tooltip>
            </ListItemIcon>
            {isOpen && <ListItemText primary="General Settings" />}
          </ListItem>
          <ListItem button selected={selectedIndex === 1} onClick={(e) => handleListItemClick(2, '/site-settings/smtp-settings', e)}>
            <ListItemIcon>
              <Tooltip title="SMTP Settings">
                <MailOutlined />
              </Tooltip>
            </ListItemIcon>
            {isOpen && <ListItemText primary="SMTP Settings" />}
          </ListItem>
        </List>
      </MiniDrawer>
    </>
  );
}
