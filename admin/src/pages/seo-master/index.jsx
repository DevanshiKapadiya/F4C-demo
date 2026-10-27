// project import
import MiniDrawer from 'components/MiniDrawer';
import React, { useEffect, useRef, useState } from 'react';
import { List, ListItem, ListItemIcon, ListItemText, Tooltip } from '@mui/material';
import { CaretRightOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
// ==============================|| PROFILE - USER ||============================== //

function getPathIndex(pathname) {
  let selectedTab = 0;
  switch (pathname) {
    case '/seo-master/home-page':
      selectedTab = 0;
      break;
    case '/seo-master/about-page':
      selectedTab = 1;
      break;
    case '/seo-master/benefits-of-counselling':
      selectedTab = 2;
      break;
    case '/seo-master/complaints-policy':
      selectedTab = 3;
      break;
    case '/seo-master/terms-and-conditions':
      selectedTab = 4;
      break;
    case '/seo-master/contact-us':
      selectedTab = 5;
      break;
    case '/seo-master/become-a-counsellor':
      selectedTab = 6;
      break;
    case '/seo-master/affordable4all':
      selectedTab = 7;
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
  const [selectedIndex, setSelectedIndex] = useState(getPathIndex(pathname == '/seo-master' ? '/seo-master/home-page' : pathname));
  const inputRef = useRef(null);
  let breadcrumbHeading = 'Home Page';

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
    if (pathname == '/seo-master') {
      navigate('/seo-master/home-page');
    }
    setSelectedIndex(getPathIndex(pathname));
  }, [pathname]);

  let breadcrumbLinks = [
    { title: 'Home', to: '/' },
    { title: 'Home Page', to: '/seo-master/home-page' }
  ];
  if (selectedIndex == 0) {
    breadcrumbHeading = 'Home Page';
    breadcrumbLinks = [{ title: 'Home', to: '/' }, { title: 'Home Page' }];
  }
  if (selectedIndex == 1) {
    breadcrumbHeading = 'About Page';
    breadcrumbLinks = [{ title: 'Home', to: '/' }, { title: 'About Page' }];
  }
  if (selectedIndex == 2) {
    breadcrumbHeading = 'Benefits of Counselling Page';
    breadcrumbLinks = [{ title: 'Home', to: '/' }, { title: 'Benefits of Counselling Page' }];
  }
  if (selectedIndex == 3) {
    breadcrumbHeading = 'Complaints Policy Page';
    breadcrumbLinks = [{ title: 'Home', to: '/' }, { title: 'Complaints Policy Page' }];
  }
  if (selectedIndex == 4) {
    breadcrumbHeading = 'Terms & Conditions Page';
    breadcrumbLinks = [{ title: 'Home', to: '/' }, { title: 'Terms & Conditions Page' }];
  }
  if (selectedIndex == 5) {
    breadcrumbHeading = 'Contact Us Page';
    breadcrumbLinks = [{ title: 'Home', to: '/' }, { title: 'Contact Us Page' }];
  }
  if (selectedIndex == 6) {
    breadcrumbHeading = 'Become a Counsellor Page';
    breadcrumbLinks = [{ title: 'Home', to: '/' }, { title: 'Become a Counsellor Page' }];
  }
  if (selectedIndex == 7) {
    breadcrumbHeading = 'Affordable 4 All Page';
    breadcrumbLinks = [{ title: 'Home', to: '/' }, { title: 'Affordable 4 All Page' }];
  }

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };
  return (
    <>
      <Breadcrumbs custom heading={breadcrumbHeading} links={breadcrumbLinks} />
      <MiniDrawer isOpen={isOpen} toggleDrawer={toggleDrawer} inputRef={inputRef} title="SEO Settings">
        <List
          style={{
            display: 'flex',
            gap: !isOpen ? '20px' : '10px',
            flexDirection: 'column',
            padding: '10px 0px',
            maxHeight: 'calc(60vh - 10px)',
            overflowY: 'auto'
          }}
        >
          <ListItem button selected={selectedIndex === 0} onClick={(e) => handleListItemClick(0, '/seo-master/home-page', e)}>
            <ListItemIcon>
              <Tooltip title="Home Page">
                <CaretRightOutlined />
              </Tooltip>
            </ListItemIcon>
            {isOpen && <ListItemText primary="Home Page" />}
          </ListItem>
          <ListItem button selected={selectedIndex === 1} onClick={(e) => handleListItemClick(1, '/seo-master/about-page', e)}>
            <ListItemIcon>
              <Tooltip title="About Page">
                <CaretRightOutlined />
              </Tooltip>
            </ListItemIcon>
            {isOpen && <ListItemText primary="About Page" />}
          </ListItem>
          <ListItem button selected={selectedIndex === 2} onClick={(e) => handleListItemClick(2, '/seo-master/benefits-of-counselling', e)}>
            <ListItemIcon>
              <Tooltip title="Benefits of Counselling Page">
                <CaretRightOutlined />
              </Tooltip>
            </ListItemIcon>
            {isOpen && <ListItemText primary="Benefits of Counselling Page" />}
          </ListItem>
          <ListItem button selected={selectedIndex === 3} onClick={(e) => handleListItemClick(3, '/seo-master/complaints-policy', e)}>
            <ListItemIcon>
              <Tooltip title="Complaints Policy Page">
                <CaretRightOutlined />
              </Tooltip>
            </ListItemIcon>
            {isOpen && <ListItemText primary="Complaints Policy Page" />}
          </ListItem>
          <ListItem button selected={selectedIndex === 4} onClick={(e) => handleListItemClick(4, '/seo-master/terms-and-conditions', e)}>
            <ListItemIcon>
              <Tooltip title="Terms & Conditions Page">
                <CaretRightOutlined />
              </Tooltip>
            </ListItemIcon>
            {isOpen && <ListItemText primary="Terms & Conditions Page" />}
          </ListItem>
          <ListItem button selected={selectedIndex === 5} onClick={(e) => handleListItemClick(5, '/seo-master/contact-us', e)}>
            <ListItemIcon>
              <Tooltip title="Contact Us Page">
                <CaretRightOutlined />
              </Tooltip>
            </ListItemIcon>
            {isOpen && <ListItemText primary="Contact Us Page" />}
          </ListItem>
          <ListItem button selected={selectedIndex === 6} onClick={(e) => handleListItemClick(6, '/seo-master/become-a-counsellor', e)}>
            <ListItemIcon>
              <Tooltip title="Become a Counsellor Page">
                <CaretRightOutlined />
              </Tooltip>
            </ListItemIcon>
            {isOpen && <ListItemText primary="Become a Counsellor Page" />}
          </ListItem>
          <ListItem button selected={selectedIndex === 7} onClick={(e) => handleListItemClick(7, '/seo-master/affordable4all', e)}>
            <ListItemIcon>
              <Tooltip title="Affordable 4 All Page">
                <CaretRightOutlined />
              </Tooltip>
            </ListItemIcon>
            {isOpen && <ListItemText primary="Affordable 4 All Page" />}
          </ListItem>
        </List>
      </MiniDrawer>
    </>
  );
}
