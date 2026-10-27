import React, { useEffect, useRef, useState } from 'react';

// Material UI imports
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

// Project imports
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import Transitions from 'components/@extended/Transitions';
import { ThemeMode } from 'config';
import { AuthService } from 'services';

// Icons
import BellOutlined from '@ant-design/icons/BellOutlined';
import CheckCircleOutlined from '@ant-design/icons/CheckCircleOutlined';
import MessageOutlined from '@ant-design/icons/MessageOutlined';
// import { useSocket } from 'contexts/socketContext';
// ==============================|| HEADER CONTENT - NOTIFICATION ||============================== //

export default function Notification() {
  const theme = useTheme();
  // const socket = useSocket();
  // const socketRef = useRef(null);
  const matchesXs = useMediaQuery(theme.breakpoints.down('md'));
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState(0);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  // useEffect(() => {
  //   if (!socket) return;
  //   socketRef.current = socket;

  //   const handleReceive = (msg) => {
  //     if (msg.is_read) {
  //       setMessages((prev) => [...prev, msg]);
  //     }
  //     setRead(read + 1);
  //   };

  //   socket.on('admin-notification', handleReceive);

  //   return () => socket.off('admin-notification', handleReceive);
  // }, [socket]);

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const getNotification = async () => {
    setLoading(true);
    try {
      const response = await AuthService.axiosPrivatePost('/getNotification');
      if (response.data.status) {
        setData(response.data.data);
        setRead(response.data.data.length); // Set the unread count directly
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false); // Always reset loading state
    }
  };
  useEffect(() => {
    getNotification();
    const intervalId = setInterval(() => {
      getNotification();
    }, 120000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const iconBackColorOpen = theme.palette.mode === ThemeMode.DARK ? 'background.default' : 'grey.100';

  const readAllNotification = (ids) => {
    let notIdsString = '';
    if (ids === 'all') {
      const notIds = data.map((item) => item.notification_id);
      notIdsString = notIds.join(', ');
    } else {
      notIdsString = String(ids);
    }

    AuthService.axiosPrivatePost('/readNotification', { notification_ids: notIdsString }).then((response) => {
      if (response.data.status) {
        setOpen(false);
        // getNotification();
      }
    });
  };

  const GoTOChat = (obj) => {
    const url = `https://dashboard.tawk.to/#/monitoring`;
    window.open(url, '_blank');
  };
  return (
    <Box sx={{ flexShrink: 0, ml: 0.75 }}>
      <IconButton
        color="secondary"
        variant="light"
        sx={{ color: 'text.primary', bgcolor: open ? iconBackColorOpen : 'transparent' }}
        aria-label="open notifications"
        ref={anchorRef}
        aria-controls={open ? 'notification-popover' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
      >
        <Badge badgeContent={read} color="primary">
          <BellOutlined />
        </Badge>
      </IconButton>

      {!loading && (
        <Popper
          placement={matchesXs ? 'bottom' : 'bottom-end'}
          open={open}
          anchorEl={anchorRef.current}
          role={undefined}
          transition
          disablePortal
          popperOptions={{ modifiers: [{ name: 'offset', options: { offset: [matchesXs ? -5 : 0, 9] } }] }}
        >
          {({ TransitionProps }) => (
            <Transitions type="grow" position={matchesXs ? 'top' : 'top-right'} in={open} {...TransitionProps}>
              <Paper sx={{ boxShadow: theme.customShadows.z1, width: '100%', minWidth: 285, maxWidth: { xs: 285, md: 420 } }}>
                <ClickAwayListener onClickAway={handleClose}>
                  <MainCard
                    title="Notification"
                    elevation={0}
                    border={false}
                    content={false}
                    secondary={
                      <>
                        {read > 0 && (
                          <Tooltip title="Mark as all read">
                            <IconButton color="success" size="small" onClick={() => readAllNotification('all')}>
                              <CheckCircleOutlined style={{ fontSize: '1.15rem' }} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </>
                    }
                  >
                    <List component="nav" sx={{ p: 0 }} className="notificationPaper">
                      {data.length ? (
                        data.map((res, index) => {
                          let notificationData = JSON.parse(res?.data);
                          const dateTimeStr = notificationData?.time;
                          const dateObj = new Date(dateTimeStr);
                          const date = dateObj.toLocaleDateString();
                          const time = dateObj.toLocaleTimeString();

                          return (
                            <React.Fragment key={index}>
                              <ListItemButton
                                onClick={() => {
                                  readAllNotification(res?.notification_id);
                                  GoTOChat(notificationData);
                                }}
                              >
                                <ListItemAvatar>
                                  <Avatar sx={{ color: 'primary.main', bgcolor: 'primary.lighter' }}>
                                    <MessageOutlined />
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                  className="notificationText"
                                  primary={
                                    <Typography variant="h6">
                                      <Typography component="span" variant="subtitle1">
                                        {notificationData?.visitor?.name}
                                      </Typography>{' '}
                                      started chat.
                                    </Typography>
                                  }
                                  secondary={date}
                                />
                                <ListItemSecondaryAction>
                                  <Typography variant="caption" noWrap>
                                    {time}
                                  </Typography>
                                </ListItemSecondaryAction>
                              </ListItemButton>
                              <Divider />
                            </React.Fragment>
                          );
                        })
                      ) : (
                        <ListItemButton>
                          <ListItemAvatar />
                          <ListItemText primary={<Typography variant="h6">No new notification</Typography>} />
                        </ListItemButton>
                      )}
                    </List>
                  </MainCard>
                </ClickAwayListener>
              </Paper>
            </Transitions>
          )}
        </Popper>
      )}
    </Box>
  );
}
