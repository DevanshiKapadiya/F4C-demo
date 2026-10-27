// project import
import MiniDrawer from 'components/MiniDrawer';
import React, { useEffect, useRef, useState } from 'react';
import { Box, Collapse, List, ListItem, ListItemIcon, ListItemText, Popover, Tooltip, Typography } from '@mui/material';
import { CaretDownFilled, CaretUpFilled, SettingOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import { Link } from 'react-router-dom';
// ==============================|| PROFILE - USER ||============================== //

function getPathIndex(pathname) {
  let selectedTab = 0;
  switch (pathname) {
    case '/cms-pages/home':
      selectedTab = 0;
      break;
    case '/cms-pages/about':
      selectedTab = 1;
      break;
    case '/cms-pages/affordable-for-all':
      selectedTab = 2;
      break;
    case '/cms-pages/benefits-of-counselling':
      selectedTab = 3;
      break;
    case '/cms-pages/become-a-counselor':
      selectedTab = 4;
      break;
    case '/cms-pages/benefits-of-counselling/why-you-need-counselling':
      selectedTab = 5;
      break;
    case '/cms-pages/benefits-of-counselling/benefits-of-engaging-in-counselling':
      selectedTab = 6;
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
  const [selectedIndex, setSelectedIndex] = useState(getPathIndex(pathname == '/cms-pages' ? '/cms-pages/home' : pathname));
  const inputRef = useRef(null);
  const [openSettings, setOpenSettings] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const [isPopupHovered, setIsPopupHovered] = useState(false);
  const [isTriggerHovered, setIsTriggerHovered] = useState(false);

  const CMSSubPages = [
    '/cms-pages/benefits-of-counselling',
    '/cms-pages/benefits-of-counselling/why-you-need-counselling',
    '/cms-pages/benefits-of-counselling/benefits-of-engaging-in-counselling'
  ];

  // Function to check if the popup should remain open
  const handleClosePopup = () => {
    if (!isTriggerHovered) {
      setAnchorEl(null);
    }
  };
  const open = Boolean(anchorEl);
  const id = open ? 'hover-popup' : undefined;
  let breadcrumbHeading = 'CMS Pages';

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
    if (pathname == '/cms-pages') {
      navigate('/cms-pages/home');
    }

    const index = getPathIndex(pathname);
    setSelectedIndex(index);
    setOpenSettings(CMSSubPages.includes(pathname));
  }, [pathname]);

  let breadcrumbLinks = [
    { title: 'Home', to: '/' },
    { title: 'CMS Pages', to: '/cms-pages/home' }
  ];
  if (selectedIndex == 0) {
    breadcrumbHeading = 'Home Page';
    breadcrumbLinks = [{ title: 'Home', to: '/' }, { title: 'CMS Pages' }, { title: 'Home Page' }];
  }
  if (selectedIndex == 1) {
    breadcrumbHeading = 'About Page';
    breadcrumbLinks = [{ title: 'Home', to: '/' }, { title: 'CMS Pages' }, { title: 'About Page' }];
  }
  if (selectedIndex == 2) {
    breadcrumbHeading = 'Affordable 4 All Page';
    breadcrumbLinks = [{ title: 'Home', to: '/' }, { title: 'CMS Pages' }, { title: 'Affordable 4 All Page' }];
  }
  if (selectedIndex == 3) {
    breadcrumbHeading = 'Benefits Of Counselling';
    breadcrumbLinks = [{ title: 'Home', to: '/' }, { title: 'CMS Pages' }, { title: 'Benefits Of Counselling Page' }];
  }
  if (selectedIndex == 4) {
    breadcrumbHeading = 'Become a counselor Page';
    breadcrumbLinks = [{ title: 'Home', to: '/' }, { title: 'CMS Pages' }, { title: 'Become a counselor Page' }];
  }
  if (selectedIndex == 5) {
    breadcrumbHeading = 'Why you need Counselling';
    breadcrumbLinks = [
      { title: 'Home', to: '/' },
      { title: 'CMS Pages' },
      { title: 'Benefits Of Counselling Page' },
      { title: 'Why you need Counselling' }
    ];
  }
  if (selectedIndex == 6) {
    breadcrumbHeading = 'Benefits Of Engaging In Counselling';
    breadcrumbLinks = [
      { title: 'Home', to: '/' },
      { title: 'CMS Pages' },
      { title: 'Benefits Of Counselling Page' },
      { title: 'Benefits Of Engaging In Counselling' }
    ];
  }

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };
  return (
    <>
      <Breadcrumbs custom heading={breadcrumbHeading} links={breadcrumbLinks} />
      <MiniDrawer isOpen={isOpen} toggleDrawer={toggleDrawer} inputRef={inputRef} title="Pages Settings">
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
          <ListItem button selected={selectedIndex === 0} onClick={(e) => handleListItemClick(0, '/cms-pages/home', e)}>
            <ListItemIcon>
              <Tooltip title="Home Page">
                <SettingOutlined />
              </Tooltip>
            </ListItemIcon>
            {isOpen && <ListItemText primary="Home Page" />}
          </ListItem>
          <ListItem button selected={selectedIndex === 1} onClick={(e) => handleListItemClick(1, '/cms-pages/about', e)}>
            <ListItemIcon>
              <Tooltip title="About Page">
                <SettingOutlined />
              </Tooltip>
            </ListItemIcon>
            {isOpen && <ListItemText primary="About Page" />}
          </ListItem>
          <ListItem button selected={selectedIndex === 2} onClick={(e) => handleListItemClick(2, '/cms-pages/affordable-for-all', e)}>
            <ListItemIcon>
              <Tooltip title="Affordable 4 All Page">
                <SettingOutlined />
              </Tooltip>
            </ListItemIcon>
            {isOpen && <ListItemText primary="Affordable 4 All Page" />}
          </ListItem>
          <ListItem button selected={selectedIndex === 4} onClick={(e) => handleListItemClick(4, '/cms-pages/become-a-counselor', e)}>
            <ListItemIcon>
              <Tooltip title="Become a counselor Page">
                <SettingOutlined />
              </Tooltip>
            </ListItemIcon>
            {isOpen && <ListItemText primary="Become a counselor Page" />}
          </ListItem>
          {isOpen ? (
            <>
              <ListItem
                button
                selected={selectedIndex === 3 || selectedIndex === 5 || selectedIndex === 6}
                onClick={() => {
                  setOpenSettings(!openSettings);
                }}
              >
                <ListItemIcon>
                  <Tooltip title="Benefits Of Counselling Page">
                    <SettingOutlined />
                  </Tooltip>
                </ListItemIcon>
                {isOpen && <ListItemText primary="Benefits Of Counselling Page" />}
                {isOpen ? openSettings ? <CaretUpFilled /> : <CaretDownFilled /> : null}
              </ListItem>
              {/* Submenu Items */}
              <Collapse in={openSettings} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <ListItem
                    button
                    selected={selectedIndex === 3}
                    onClick={(e) => handleListItemClick(3, '/cms-pages/benefits-of-counselling', e)}
                    sx={{ pl: 4 }}
                  >
                    <ListItemIcon>
                      <Tooltip title="Benefits Of Counselling">
                        <SettingOutlined />
                      </Tooltip>
                    </ListItemIcon>
                    {isOpen && <ListItemText primary="Benefits Of Counselling" />}
                  </ListItem>
                  <ListItem
                    button
                    selected={selectedIndex === 5}
                    onClick={(e) => handleListItemClick(5, '/cms-pages/benefits-of-counselling/why-you-need-counselling', e)}
                    sx={{ pl: 4 }}
                  >
                    <ListItemIcon>
                      <Tooltip title="Why You Need Counselling">
                        <SettingOutlined />
                      </Tooltip>
                    </ListItemIcon>
                    {isOpen && <ListItemText primary="Why You Need Counselling" />}
                  </ListItem>
                  <ListItem
                    button
                    selected={selectedIndex === 6}
                    onClick={(e) => handleListItemClick(6, '/cms-pages/benefits-of-counselling/benefits-of-engaging-in-counselling', e)}
                    sx={{ pl: 4 }}
                  >
                    <ListItemIcon>
                      <Tooltip title="Benefits Of Engaging In Counselling">
                        <SettingOutlined />
                      </Tooltip>
                    </ListItemIcon>
                    {isOpen && <ListItemText primary="Benefits Of Engaging In Counselling" />}
                  </ListItem>
                </List>
              </Collapse>
            </>
          ) : (
            <>
              <ListItem
                button
                aria-owns={open ? 'hover-popup' : undefined}
                selected={selectedIndex == 3 || selectedIndex == 5 || selectedIndex == 6}
                onMouseEnter={(e) => {
                  setIsTriggerHovered(true);
                  setAnchorEl(e.currentTarget);
                }}
                onMouseLeave={() => {
                  setIsTriggerHovered(false);
                  setTimeout(handleClosePopup, 200);
                }}
                aria-describedby={id}
                sx={{
                  cursor: 'pointer !important',
                  color: selectedIndex == 3 || selectedIndex == 5 || selectedIndex == 6 ? 'primary.main' : 'inherit'
                }}
              >
                <Tooltip title="Benefits Of Counselling Page Settings">
                  <SettingOutlined />
                </Tooltip>
              </ListItem>
              {/* Popup Box */}
              <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'bottom'
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'bottom'
                }}
                PaperProps={{
                  onMouseEnter: () => {
                    setIsPopupHovered(true);
                  },
                  onMouseLeave: () => {
                    setIsPopupHovered(false);
                    setTimeout(handleClosePopup(), 200);
                  }
                }}
                disableRestoreFocus
              >
                <Box sx={{ p: 2, width: '250px', overflow: 'visible' }}>
                  <List component="div" disablePadding>
                    <ListItem
                      button
                      selected={selectedIndex === 3}
                      onClick={(e) => handleListItemClick(3, '/cms-pages/benefits-of-counselling', e)}
                      sx={{ pl: 4 }}
                    >
                      <ListItemIcon>
                        <SettingOutlined />
                      </ListItemIcon>
                      <ListItemText primary="Setting Benefits Of Counseling" />
                    </ListItem>
                    <ListItem
                      button
                      selected={selectedIndex === 5}
                      onClick={(e) => handleListItemClick(5, '/cms-pages/benefits-of-counselling/why-you-need-counselling', e)}
                      sx={{ pl: 4 }}
                    >
                      <ListItemIcon>
                        <SettingOutlined />
                      </ListItemIcon>
                      <ListItemText primary="Why You Need Counselling" />
                    </ListItem>
                    <ListItem
                      button
                      selected={selectedIndex === 6}
                      onClick={(e) => handleListItemClick(6, '/cms-pages/benefits-of-counselling/benefits-of-engaging-in-counselling', e)}
                      sx={{ pl: 4 }}
                    >
                      <ListItemIcon>
                        <SettingOutlined />
                      </ListItemIcon>
                      <ListItemText primary="Benefits Of Engaging In Counselling" />
                    </ListItem>
                  </List>
                </Box>
              </Popover>
            </>
          )}
        </List>
      </MiniDrawer>
    </>
  );
}
