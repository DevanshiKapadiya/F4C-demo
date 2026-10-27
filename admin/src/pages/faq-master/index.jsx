import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { List, ListItem, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import AppstoreOutlined from '@ant-design/icons/AppstoreOutlined';
import QuestionCircleOutlined from '@ant-design/icons/QuestionCircleOutlined';

/* project import */
import MiniDrawer from 'components/MiniDrawer';
import Breadcrumbs from 'components/@extended/Breadcrumbs';

function getPathIndex(pathname) {
  let selectedTab = 0;
  if (pathname.includes('/faq-master/faq')) {
    selectedTab = 1;
  } else {
    selectedTab = 0;
  }
  return selectedTab;
}

export default function FaqMaster() {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [selectedIndex, setSelectedIndex] = useState(
    getPathIndex(pathname === '/faq-master' ? '/faq-master/category' : pathname)
  );
  const inputRef = useRef(null);

  const handleListItemClick = (index, route, event) => {
    if (event?.ctrlKey || event?.metaKey) {
      /* If Ctrl or Cmd key is pressed, open in new tab */
      window.open(route, '_blank');
    } else {
      /* Normal click behavior */
      setSelectedIndex(index);
      navigate(route);
    }
  };

  useEffect(() => {
    if (pathname === '/faq-master') {
      navigate('/faq-master/category');
    }
    setSelectedIndex(getPathIndex(pathname));
  }, [pathname, navigate]);

  let breadcrumbHeading = 'FAQ Category';
  let breadcrumbLinks = [
    { title: 'Home', to: '/' },
    { title: 'FAQ Master', to: '/faq-master/category' },
    { title: 'FAQ Category' }
  ];

  if (selectedIndex === 0) {
    breadcrumbHeading = 'FAQ Category';
    breadcrumbLinks = [
      { title: 'Home', to: '/' },
      { title: 'FAQ Master', to: '/faq-master/category' },
      { title: 'FAQ Category' }
    ];
  } else if (selectedIndex === 1) {
    breadcrumbHeading = 'FAQ';
    breadcrumbLinks = [
      { title: 'Home', to: '/' },
      { title: 'FAQ Master', to: '/faq-master/faq' },
      { title: 'FAQ' }
    ];
  }

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <Breadcrumbs custom heading={breadcrumbHeading} links={breadcrumbLinks} />
      <MiniDrawer isOpen={isOpen} toggleDrawer={toggleDrawer} inputRef={inputRef} title="FAQ Master">
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
          <ListItem
            button
            selected={selectedIndex === 0}
            onClick={(e) => handleListItemClick(0, '/faq-master/category', e)}
          >
            <ListItemIcon>
              <Tooltip title="FAQ Category">
                <AppstoreOutlined />
              </Tooltip>
            </ListItemIcon>
            {isOpen && <ListItemText primary="FAQ Category" />}
          </ListItem>
          <ListItem
            button
            selected={selectedIndex === 1}
            onClick={(e) => handleListItemClick(1, '/faq-master/faq', e)}
          >
            <ListItemIcon>
              <Tooltip title="FAQ">
                <QuestionCircleOutlined />
              </Tooltip>
            </ListItemIcon>
            {isOpen && <ListItemText primary="FAQ" />}
          </ListItem>
        </List>
      </MiniDrawer>
    </>
  );
}
