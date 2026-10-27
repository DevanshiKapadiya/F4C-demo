import PropTypes from 'prop-types';
import useMediaQuery from '@mui/material/useMediaQuery';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project import
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';

// assets
import MailOutlined from '@ant-design/icons/MailOutlined';
import { EnvironmentOutlined, CalendarOutlined, UserOutlined, VideoCameraOutlined } from '@ant-design/icons';

// ==============================|| USER – EXPANDING ROW DETAIL ||============================== //

const sessionTypeLabel = (val) => {
  switch (val) {
    case 'online':
      return { label: 'Online', color: 'primary' };
    case 'in-person':
      return { label: 'In-Person', color: 'success' };
    case 'either':
      return { label: 'Either', color: 'warning' };
    default:
      return { label: 'Not Set', color: 'default' };
  }
};

export default function ExpandingDetail({ data }) {
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const session = sessionTypeLabel(data.preferred_session_type);
  const fullName = data.name || `${data.fname || ''} ${data.lname || ''}`.trim() || '—';
  const location = [data.city_town, data.country_name].filter(Boolean).join(', ') || '—';
  const regDate = data.created_at
    ? new Date(data.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  return (
    <Grid container spacing={2.5}>
      {/* Avatar card */}
      <Grid item xs={12} sm={5} md={4} xl={3.5}>
        <MainCard>
          <Chip
            label={data.status == 1 ? 'Active' : 'Inactive'}
            color={data.status == 1 ? 'success' : 'error'}
            size="small"
            sx={{ position: 'absolute', right: -1, top: -1, borderRadius: '0 4px 0 4px' }}
          />
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Stack spacing={2.5} alignItems="center">
                <Avatar alt={fullName} size="xl">
                  {fullName.charAt(0).toUpperCase()}
                </Avatar>
                <Typography variant="h5" align="center">
                  {fullName}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12}>
              <List component="nav" sx={{ '& .MuiListItem-root': { p: 0 } }}>
                <ListItem>
                  <ListItemIcon>
                    <MailOutlined />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography style={{ overflowWrap: 'break-word', fontSize: '0.85rem' }}>{data.email}</Typography>}
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>

      {/* Details card */}
      <Grid item xs={12} sm={7} md={8} xl={8.5}>
        <Stack spacing={2.5}>
          <MainCard title="User Details">
            <List sx={{ py: 0 }}>
              <Grid container>
                <Grid item xs={12} md={6}>
                  <ListItem divider={!downMD}>
                    <Stack spacing={0.5}>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <UserOutlined style={{ fontSize: 12, color: '#8c8c8c' }} />
                        <Typography color="secondary" variant="caption">
                          Full Name
                        </Typography>
                      </Stack>
                      <Typography>{fullName}</Typography>
                    </Stack>
                  </ListItem>
                </Grid>
                <Grid item xs={12} md={6}>
                  <ListItem divider={!downMD}>
                    <Stack spacing={0.5}>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <MailOutlined style={{ fontSize: 12, color: '#8c8c8c' }} />
                        <Typography color="secondary" variant="caption">
                          Email
                        </Typography>
                      </Stack>
                      <Typography style={{ overflowWrap: 'break-word' }}>{data.email}</Typography>
                    </Stack>
                  </ListItem>
                </Grid>
                <Grid item xs={12} md={6}>
                  <ListItem divider={!downMD}>
                    <Stack spacing={0.5}>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <VideoCameraOutlined style={{ fontSize: 12, color: '#8c8c8c' }} />
                        <Typography color="secondary" variant="caption">
                          Preferred Session
                        </Typography>
                      </Stack>
                      <Chip label={session.label} color={session.color} size="small" variant="light" sx={{ width: 'fit-content' }} />
                    </Stack>
                  </ListItem>
                </Grid>
                <Grid item xs={12} md={6}>
                  <ListItem divider={!downMD}>
                    <Stack spacing={0.5}>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <EnvironmentOutlined style={{ fontSize: 12, color: '#8c8c8c' }} />
                        <Typography color="secondary" variant="caption">
                          Location
                        </Typography>
                      </Stack>
                      <Typography>{location}</Typography>
                    </Stack>
                  </ListItem>
                </Grid>
                <Grid item xs={12} md={6}>
                  <ListItem>
                    <Stack spacing={0.5}>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <CalendarOutlined style={{ fontSize: 12, color: '#8c8c8c' }} />
                        <Typography color="secondary" variant="caption">
                          Registration Date
                        </Typography>
                      </Stack>
                      <Typography>{regDate}</Typography>
                    </Stack>
                  </ListItem>
                </Grid>
                <Grid item xs={12} md={6}>
                  <ListItem>
                    <Stack spacing={0.5}>
                      <Typography color="secondary" variant="caption">
                        Status
                      </Typography>
                      <Typography>{data.status == 1 ? 'Active' : 'Inactive'}</Typography>
                    </Stack>
                  </ListItem>
                </Grid>
              </Grid>
            </List>
          </MainCard>
        </Stack>
      </Grid>
    </Grid>
  );
}

ExpandingDetail.propTypes = { data: PropTypes.any };
