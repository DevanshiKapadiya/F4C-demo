import PropTypes from 'prop-types';
import { useState } from 'react';

// material-ui
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

// assets
import EditOutlined from '@ant-design/icons/EditOutlined';
import LogoutOutlined from '@ant-design/icons/LogoutOutlined';
import { KeyOutlined, LockOutlined } from '@ant-design/icons';
import AdminModal from 'pages/admin/AdminModal';

// ==============================|| HEADER PROFILE - PROFILE TAB ||============================== //

export default function ProfileTab({ handleLogout }) {
  const [selectedIndex, setSelectedIndex] = useState();
  const [adminModal, setAdminModal] = useState(false);
  const [isPasswordChange, setIsPasswordChange] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('users'));
  const handleListItemClick = (event, index) => {
    setSelectedIndex(index);
  };
  const handleEditProfile = () => {
    setAdminModal(true);
  };
  const handleChangePassword = () => {
    setIsPasswordChange(true);
    setAdminModal(true);
  };
  return (
    <>
      <ListItemButton
        selected={selectedIndex === 0}
        onClick={(event) => {
          handleListItemClick(event, 0);
          handleEditProfile();
        }}
      >
        <ListItemIcon>
          <EditOutlined onClick={handleEditProfile} />
        </ListItemIcon>
        <ListItemText primary="Edit Profile" onClick={handleEditProfile} />
      </ListItemButton>
      <ListItemButton
        selected={selectedIndex === 1}
        onClick={(event) => {
          handleListItemClick(event, 1);
          handleChangePassword();
        }}
      >
        <ListItemIcon>
          <LockOutlined onClick={handleChangePassword} />
        </ListItemIcon>
        <ListItemText primary="Change Password" onClick={handleChangePassword} />
      </ListItemButton>
      <ListItemButton selected={selectedIndex === 2} onClick={handleLogout}>
        <ListItemIcon>
          <LogoutOutlined />
        </ListItemIcon>
        <ListItemText primary="Logout" />
      </ListItemButton>
      {adminModal ? (
        <AdminModal
          open={adminModal}
          admin={currentUser}
          modalToggler={(val) => {
            setAdminModal(val);
            !val && setIsPasswordChange(false);
          }}
          isSucess={() => {
            setAdminModal(false);
            setIsPasswordChange(false);
          }}
          isPassword={isPasswordChange}
        />
      ) : null}
    </>
  );
}

ProfileTab.propTypes = { handleLogout: PropTypes.func };
