// project import
import MiniDrawer from 'components/MiniDrawer';
import React, { useEffect, useRef, useState } from 'react';
import { List, ListItem, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import { SettingOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
// ==============================|| PROFILE - USER ||============================== //

function getPathIndex(pathname) {
  let selectedTab = 0;
  switch (pathname) {
    case '/manage-policy/complaintsPolicy':
      selectedTab = 0;
      break;
    case '/manage-policy/termsAndConditions':
      selectedTab = 1;
      break;
    case '/manage-policy/policy':
      selectedTab = 2;
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
    getPathIndex(pathname == '/manage-policy' ? '/manage-policy/complaintsPolicy' : pathname)
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
    if (pathname == '/manage-policy') {
      navigate('/manage-policy/complaintsPolicy');
    }
    setSelectedIndex(getPathIndex(pathname));
  }, [pathname]);

  let breadcrumbLinks = [
    { title: 'Home', to: '/' },
    { title: 'Complaints Policy', to: '/manage-policy/complaintsPolicy' }
  ];
  if (selectedIndex == 0) {
    breadcrumbHeading = 'Complaints Policy';
    breadcrumbLinks = [{ title: 'Home', to: '/' }, { title: 'Complaints Policy' }];
  }
  if (selectedIndex == 1) {
    breadcrumbHeading = 'Terms And Conditions';
    breadcrumbLinks = [{ title: 'Home', to: '/' }, { title: 'Terms And Conditions' }];
  }
   if (selectedIndex == 2) {
    breadcrumbHeading = 'Policy';
    breadcrumbLinks = [{ title: 'Home', to: '/' }, { title: 'Policy' }];
  }

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };
  return (
    <>
      <Breadcrumbs custom heading={breadcrumbHeading} links={breadcrumbLinks} />
      <MiniDrawer isOpen={isOpen} toggleDrawer={toggleDrawer} inputRef={inputRef} title="Policy Master">
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
          <ListItem button selected={selectedIndex === 0} onClick={(e) => handleListItemClick(0, '/manage-policy/complaintsPolicy', e)}>
            <ListItemIcon>
              <Tooltip title="Complaints Policy">
                <SettingOutlined />
              </Tooltip>
            </ListItemIcon>
            {isOpen && <ListItemText primary="Complaints Policy" />}
          </ListItem>
          <ListItem button selected={selectedIndex === 1} onClick={(e) => handleListItemClick(1, '/manage-policy/termsAndConditions', e)}>
            <ListItemIcon>
              <Tooltip title="Terms And Conditions">
                <SettingOutlined />
              </Tooltip>
            </ListItemIcon>
            {isOpen && <ListItemText primary="Terms And Conditions" />}
          </ListItem>
           <ListItem button selected={selectedIndex === 2} onClick={(e) => handleListItemClick(2, '/manage-policy/policy', e)}>
            <ListItemIcon>
              <Tooltip title="Policy">
                <SettingOutlined />
              </Tooltip>
            </ListItemIcon>
            {isOpen && <ListItemText primary="Policy" />}
          </ListItem>
        </List>
      </MiniDrawer>
    </>
  );
}
