import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// third-party
import { Chance } from 'chance';

// project imports
import UserAvatar from './UserAvatar';
import Dot from 'components/@extended/Dot';
// import { useGetUsers } from 'api/chat';

// assets
import CheckOutlined from '@ant-design/icons/CheckOutlined';

const chance = new Chance();

// ==============================|| CHAT - USER LIST  ||============================== //

export default function UserList({ setUser, search, selectedUser, users }) {
  const theme = useTheme();
  const [data, setData] = useState([]);
  // const { usersLoading, users } = useGetUsers();

  useEffect(() => {
    // if (!usersLoading) {
    let result = users;
    if (search) {
      result = users.filter((row) => {
        let matches = true;

        const properties = ['name'];
        let containsQuery = false;

        properties.forEach((property) => {
          if (row[property].toString().toLowerCase().includes(search.toString().toLowerCase())) {
            containsQuery = true;
          }
        });

        if (!containsQuery) {
          matches = false;
        }
        return matches;
      });
      // }
      setData(result);
    }
  }, [search]);

  // if (usersLoading)
  //   return (
  //     <List>
  //       {[1, 2, 3, 4, 5].map((index) => (
  //         <ListItem key={index} divider>
  //           <ListItemAvatar>
  //             <Skeleton variant="circular" width={40} height={40} />
  //           </ListItemAvatar>
  //           <ListItemText
  //             primary={<Skeleton animation="wave" height={24} />}
  //             secondary={<Skeleton animation="wave" height={16} width="60%" />}
  //           />
  //         </ListItem>
  //       ))}
  //     </List>
  //   );

  return (
    <List component="nav">
      {data.map((user) => (
        <ListItemButton
          key={user.id}
          sx={{ pl: 1 }}
          onClick={() => {
            setUser(user);
          }}
          divider
          selected={user.id === selectedUser}
        >
          <ListItemAvatar>
            <UserAvatar user={user} />
          </ListItemAvatar>
          <ListItemText
            primary={
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                <Typography
                  variant="h5"
                  color="text.primary"
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {user.name}
                </Typography>
                <Typography color="text.secondary" variant="caption">
                  {user.lastMessage}
                </Typography>
              </Stack>
            }
            secondary={
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <>{user.status}</>
                <>
                  {user.unReadChatCount ? (
                    <Dot color="primary" />
                  ) : (
                    // chance.bool() - use for last send msg was read or unread
                    <CheckOutlined style={{ color: chance.bool() ? theme.palette.grey[400] : theme.palette.primary.main }} />
                  )}
                </>
              </Typography>
            }
          />
        </ListItemButton>
      ))}
    </List>
  );
}

UserList.propTypes = {
  setUser: PropTypes.func,
  search: PropTypes.string,
  selectedUser: PropTypes.oneOfType([PropTypes.any, PropTypes.string])
};
