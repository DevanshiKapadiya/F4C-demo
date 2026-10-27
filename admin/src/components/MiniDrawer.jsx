import { Drawer, IconButton } from '@mui/material';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Outlet } from 'react-router';
import useConfig from 'hooks/useConfig';
import { MenuOrientation } from 'config';

const MiniDrawer = ({ children, isOpen, toggleDrawer, inputRef, title }) => {
  const { menuOrientation } = useConfig();
  return (
    <div style={{ display: 'inline-table' }}>
      {/* Drawer */}
      <Drawer
        variant="permanent"
        anchor="left"
        style={{
          float: 'left',
          marginRight: '20px',
          border: '1px solid #e6ebf1',
          position: 'sticky',
          top: menuOrientation === MenuOrientation.VERTICAL ? 60 : 120
        }}
        open={isOpen}
        sx={{
          '& .MuiDrawer-paper': {
            width: isOpen ? 240 : 50,
            borderRadius: '4px',
            height: 'auto',
            zIndex: 1,
            transition: 'width 0.3s',
            overflowX: 'hidden',
            position: 'relative'
          }
        }}
      >
        {/* Toggle Button */}
        <div
          style={{
            display: 'flex',
            justifyContent: isOpen ? 'space-around' : 'center',
            alignItems: 'center',
            padding: '5px'
          }}
        >
          {isOpen ? <h2>{title}</h2> : null}
          <IconButton onClick={toggleDrawer}>{isOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}</IconButton>
        </div>

        {/* Links */}
        {children}
      </Drawer>

      {/* Content */}
      <Outlet context={inputRef} />
    </div>
  );
};

export default MiniDrawer;
