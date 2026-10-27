// project import
import MiniDrawer from 'components/MiniDrawer';
import React, { useEffect, useRef, useState } from 'react';
import { Box, Collapse, List, ListItem, ListItemIcon, ListItemText, Popover, Tooltip } from '@mui/material';
import {
  AimOutlined,
  BulbOutlined,
  CaretDownFilled,
  CaretUpFilled,
  CloudOutlined,
  CommentOutlined,
  KeyOutlined,
  MutedOutlined,
  ProductOutlined,
  SafetyCertificateOutlined,
  UserAddOutlined,
  UserOutlined,
  UserSwitchOutlined
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
// ==============================|| PROFILE - USER ||============================== //

function getPathIndex(pathname) {
  let selectedTab = 0;
  switch (pathname) {
    case '/counselor-master/language':
      selectedTab = 0;
      break;
    case '/counselor-master/client-type':
      selectedTab = 1;
      break;
    case '/counselor-master/professional-bodies':
      selectedTab = 2;
      break;
    case '/counselor-master/online-platform':
      selectedTab = 3;
      break;
    case '/counselor-master/area-of-counseling':
      selectedTab = 4;
      break;
    case '/counselor-master/profile-status':
      selectedTab = 5;
      break;
    case '/counselor-master/session-type':
      selectedTab = 6;
      break;
    case '/counselor-master/type-of-practitioner':
      selectedTab = 7;
      break;
    case '/counselor-master/therapy-category':
      selectedTab = 8;
      break;
    case '/counselor-master/therapy':
      selectedTab = 9;
      break;
    case '/counselor-master/concession':
      selectedTab = 10;
      break;
    case '/counselor-master/health-insurance':
      selectedTab = 11;
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
    getPathIndex(pathname == '/counselor-master' ? '/counselor-master/language' : pathname)
  );
  const [openSettings, setOpenSettings] = useState(false);
  const [openSettingss, setOpenSettingss] = useState(false);

  const inputRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isPopupHovered, setIsPopupHovered] = useState(false);

  const [isTriggerHovered, setIsTriggerHovered] = useState(false);

  const counselorSubPages = ['/counselor-master/therapy-category', '/counselor-master/therapy'];

  // Function to check if the popup should remain open
  const handleClosePopup = () => {
    if (!isTriggerHovered) {
      setAnchorEl(null);
    }
  };
  const open = Boolean(anchorEl);
  const id = open ? 'hover-popup' : undefined;

  let breadcrumbHeading = 'Language';

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
    if (pathname == '/counselor-master') {
      navigate('/counselor-master/language');
    }

    const index = getPathIndex(pathname);
    setSelectedIndex(index);
    setOpenSettings(counselorSubPages.includes(pathname));
  }, [pathname]);

  let breadcrumbLinks = [
    { title: 'Home', to: '/' },
    { title: 'Language', to: '/counselor-master/language' }
  ];
  if (selectedIndex == 0) {
    breadcrumbHeading = 'Languages';
    breadcrumbLinks = [{ title: 'Home', to: '/' }, { title: 'Languages' }];
  }
  if (selectedIndex == 1) {
    breadcrumbHeading = 'Type of Clients';
    breadcrumbLinks = [{ title: 'Home', to: '/' }, { title: 'Type of Client' }];
  }
  if (selectedIndex == 2) {
    breadcrumbHeading = 'Professional Bodies';
    breadcrumbLinks = [{ title: 'Home', to: '/' }, { title: 'Professional Bodies' }];
  }
  if (selectedIndex == 3) {
    breadcrumbHeading = 'Online Platforms';
    breadcrumbLinks = [{ title: 'Home', to: '/' }, { title: 'Online Platforms' }];
  }
  if (selectedIndex == 4) {
    breadcrumbHeading = 'Area of Counselling';
    breadcrumbLinks = [{ title: 'Home', to: '/' }, { title: 'Area of Counselling' }];
  }
  if (selectedIndex == 5) {
    breadcrumbHeading = 'Profile Status';
    breadcrumbLinks = [{ title: 'Home', to: '/' }, { title: 'Profile Status' }];
  }
  if (selectedIndex == 6) {
    breadcrumbHeading = 'Session Types';
    breadcrumbLinks = [{ title: 'Home', to: '/' }, { title: 'Session Type' }];
  }
  if (selectedIndex == 7) {
    breadcrumbHeading = 'Type of Practitioners';
    breadcrumbLinks = [{ title: 'Home', to: '/' }, { title: 'Type of Practitioners' }];
  }
  if (selectedIndex == 8) {
    breadcrumbHeading = 'Therapy Category';
    breadcrumbLinks = [{ title: 'Home', to: '/' }, { title: 'Therapy Category' }];
  }
  if (selectedIndex == 9) {
    breadcrumbHeading = 'Therapy Sub-Category';
    breadcrumbLinks = [{ title: 'Home', to: '/' }, { title: 'Therapy Sub-Category' }];
  }
  if (selectedIndex == 10) {
    breadcrumbHeading = 'Concession';
    breadcrumbLinks = [{ title: 'Home', to: '/' }, { title: 'Concession' }];
  }
  if (selectedIndex == 11) {
    breadcrumbHeading = 'Types Of Health Insurances';
    breadcrumbLinks = [{ title: 'Home', to: '/' }, { title: 'Health Insurances' }];
  }


  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };
  return (
    <>
      <Breadcrumbs custom heading={breadcrumbHeading} links={breadcrumbLinks} />
      <MiniDrawer isOpen={isOpen} toggleDrawer={toggleDrawer} inputRef={inputRef} title="Counsellor Master">
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
          <ListItem button selected={selectedIndex === 0} onClick={(e) => handleListItemClick(0, '/counselor-master/language', e)}>
            <ListItemIcon>
              <Tooltip title="Languages">
                <CommentOutlined />
              </Tooltip>
            </ListItemIcon>
            {isOpen && <ListItemText primary="Languages" />}
          </ListItem>
          <ListItem button selected={selectedIndex === 1} onClick={(e) => handleListItemClick(1, '/counselor-master/client-type', e)}>
            <ListItemIcon>
              <Tooltip title="Type of Clients">
                <UserOutlined />
              </Tooltip>
            </ListItemIcon>
            {isOpen && <ListItemText primary="Type of Clients" />}
          </ListItem>
          <ListItem
            button
            selected={selectedIndex === 2}
            onClick={(e) => handleListItemClick(2, '/counselor-master/professional-bodies', e)}
          >
            <ListItemIcon>
              <Tooltip title="Professional Bodie">
                <ProductOutlined />
              </Tooltip>
            </ListItemIcon>
            {isOpen && <ListItemText primary="Professional Bodies" />}
          </ListItem>
          <ListItem button selected={selectedIndex === 3} onClick={(e) => handleListItemClick(3, '/counselor-master/online-platform', e)}>
            <ListItemIcon>
              <Tooltip title="Online Platform">
                <CloudOutlined />
              </Tooltip>
            </ListItemIcon>
            {isOpen && <ListItemText primary="Online Platforms" />}
          </ListItem>
          <ListItem
            button
            selected={selectedIndex === 4}
            onClick={(e) => handleListItemClick(4, '/counselor-master/area-of-counseling', e)}
          >
            <ListItemIcon>
              <Tooltip title="Area of Counselling">
                <AimOutlined />
              </Tooltip>
            </ListItemIcon>
            {isOpen && <ListItemText primary="Area of Counselling" />}
          </ListItem>
          <ListItem button selected={selectedIndex === 5} onClick={(e) => handleListItemClick(5, '/counselor-master/profile-status', e)}>
            <ListItemIcon>
              <Tooltip title="Profile Status">
                <UserSwitchOutlined />
              </Tooltip>
            </ListItemIcon>
            {isOpen && <ListItemText primary="Profile Status" />}
          </ListItem>
          <ListItem button selected={selectedIndex === 6} onClick={(e) => handleListItemClick(6, '/counselor-master/session-type', e)}>
            <ListItemIcon>
              <Tooltip title="Session Types">
                <BulbOutlined />
              </Tooltip>
            </ListItemIcon>
            {isOpen && <ListItemText primary="Session Types" />}
          </ListItem>
          <ListItem
            button
            selected={selectedIndex === 7}
            onClick={(e) => handleListItemClick(7, '/counselor-master/type-of-practitioner', e)}
          >
            <ListItemIcon>
              <Tooltip title="Type of Practitioner">
                <KeyOutlined />
              </Tooltip>
            </ListItemIcon>
            {isOpen && <ListItemText primary="Type of Practitioner" />}
          </ListItem>
          <ListItem button selected={selectedIndex === 10} onClick={(e) => handleListItemClick(10, '/counselor-master/concession', e)}>
            <ListItemIcon>
              <Tooltip title="Concession">
                <MutedOutlined />
              </Tooltip>
            </ListItemIcon>
            {isOpen && <ListItemText primary="Concession" />}
          </ListItem>
          {isOpen ? (
            <>
              <ListItem
                button
                selected={selectedIndex === 8 || selectedIndex === 9}
                onClick={() => {
                  setOpenSettings(!openSettings);
                }}
              >
                <ListItemIcon>
                  <Tooltip title="Manage Thearpy">
                    <UserAddOutlined />
                  </Tooltip>
                </ListItemIcon>
                {isOpen && <ListItemText primary="Manage Thearpy" />}
                {isOpen ? openSettings ? <CaretUpFilled /> : <CaretDownFilled /> : null}
              </ListItem>
              {/* Submenu Items */}
              <Collapse in={openSettings} timeout="auto" unmountOnExit style={{ minHeight: 'auto' }}>
                <List component="div" disablePadding>
                  <ListItem
                    button
                    selected={selectedIndex === 8}
                    onClick={(e) => handleListItemClick(8, '/counselor-master/therapy-category', e)}
                    sx={{ pl: 4 }}
                  >
                    <ListItemIcon>
                      <Tooltip title="Therapy Category">
                        <KeyOutlined />
                      </Tooltip>
                    </ListItemIcon>
                    {isOpen && <ListItemText primary="Therapy Category" />}
                  </ListItem>
                  <ListItem
                    button
                    selected={selectedIndex === 9}
                    sx={{ pl: 4 }}
                    onClick={(e) => handleListItemClick(9, '/counselor-master/therapy', e)}
                  >
                    <ListItemIcon>
                      <Tooltip title="Therapy Sub-category">
                        <KeyOutlined />
                      </Tooltip>
                    </ListItemIcon>
                    {isOpen && <ListItemText primary="Therapy Sub-Category" />}
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
                <Tooltip title="Therapy">
                  <UserAddOutlined />
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
                    setTimeout(handleClosePopup, 200);
                  }
                }}
                disableRestoreFocus
              >
                <Box sx={{ p: 2, width: '250px', overflow: 'visible' }}>
                  <List component="div" disablePadding>
                    <ListItem
                      button
                      selected={selectedIndex === 8}
                      onClick={() => handleListItemClick(8, '/counselor-master/therapy-category')}
                    >
                      <ListItemIcon>
                        <KeyOutlined />
                      </ListItemIcon>
                      <ListItemText primary="Therapy Category" />
                    </ListItem>
                    <ListItem button selected={selectedIndex === 9} onClick={() => handleListItemClick(9, '/counselor-master/therapy')}>
                      <ListItemIcon>
                        <KeyOutlined />
                      </ListItemIcon>
                      <ListItemText primary="Therapy" />
                    </ListItem>
                  </List>
                </Box>
              </Popover>
            </>
          )}
          <ListItem
            button
            selected={selectedIndex === 11}
            onClick={(e) => handleListItemClick(11, '/counselor-master/health-insurance', e)}
          >
            <ListItemIcon>
              <Tooltip title="Type of Health Insurances">
                <SafetyCertificateOutlined />
              </Tooltip>
            </ListItemIcon>
            {isOpen && <ListItemText primary="Type of Health Insurances" />}
          </ListItem>
        </List>
      </MiniDrawer>
    </>
  );
}
