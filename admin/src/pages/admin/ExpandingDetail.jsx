import PropTypes from 'prop-types';
import useMediaQuery from '@mui/material/useMediaQuery';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
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

// ==============================|| EXPANDING TABLE - USER DETAILS ||============================== //

export default function ExpandingDetail({ data }) {
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));

  return (
    <Grid container spacing={2.5}>
      <Grid item xs={6} sm={5} md={4} xl={3.5}>
        <MainCard>
          <Chip
            label={data.status == 1 ? 'Active' : 'Inactive'}
            size="small"
            sx={{
              position: 'absolute',
              right: -1,
              top: -1,
              borderRadius: '0 4px 0 4px'
            }}
          />
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Stack spacing={2.5} alignItems="center">
                <Avatar alt="Avatar 1" size="xl">
                  {Array.from(data.name)[0]}
                </Avatar>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item md={12} xs={12}>
              <List component="nav" aria-label="main mailbox folders" sx={{ '& .MuiListItem-root': { p: 0 } }}>
                <Grid container md={12} lg={12}>
                  <Grid item xs={12} md={5}>
                    <ListItem>
                      <ListItemIcon>
                        <MailOutlined />
                      </ListItemIcon>
                      <ListItemText primary={<Typography color="secondary">Email :</Typography>} />
                    </ListItem>
                  </Grid>
                  <Grid item xs={12} md={7}>
                    <ListItemText
                      primary={
                        <Typography align="right" style={{ overflowWrap: 'break-word' }}>
                          {data.email}
                        </Typography>
                      }
                    />
                  </Grid>
                </Grid>
              </List>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>
      <Grid item xs={12} sm={7} md={8} xl={8.5}>
        <Stack spacing={2.5}>
          <MainCard title="Personal Details">
            <List sx={{ py: 0 }}>
              <Grid container>
                <Grid item xs={12} md={6}>
                  <ListItem divider={!downMD}>
                    <Stack spacing={0.5}>
                      <Typography color="secondary">Name</Typography>
                      <Typography>{data.name}</Typography>
                    </Stack>
                  </ListItem>
                </Grid>
                <Grid item xs={12} md={6}>
                  <ListItem divider={!downMD}>
                    <Stack spacing={0.5}>
                      <Typography color="secondary">User Name</Typography>
                      <Typography>{data.username}</Typography>
                    </Stack>
                  </ListItem>
                </Grid>
              </Grid>
              <ListItem>
                <Stack spacing={0.5}>
                  <Typography color="secondary">Status</Typography>
                  <Typography>{data.status == 1 ? 'Active' : 'Inactive'}</Typography>
                </Stack>
              </ListItem>
            </List>
          </MainCard>
        </Stack>
      </Grid>
    </Grid>
  );
}

ExpandingDetail.propTypes = { data: PropTypes.any };
