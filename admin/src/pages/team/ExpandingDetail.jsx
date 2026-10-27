import PropTypes from 'prop-types';
import useMediaQuery from '@mui/material/useMediaQuery';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// third-party
import { PatternFormat } from 'react-number-format';

// project import
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';
import { getImageUrl, ImagePath } from 'utils/getImageUrl';

// assets
import EnvironmentOutlined from '@ant-design/icons/EnvironmentOutlined';
import LinkOutlined from '@ant-design/icons/LinkOutlined';
import MailOutlined from '@ant-design/icons/MailOutlined';
import PhoneOutlined from '@ant-design/icons/PhoneOutlined';

const allStatus = [
  { value: 3, label: 'Rejected' },
  { value: 1, label: 'Verified' },
  { value: 2, label: 'Pending' }
];

// ==============================|| EXPANDING TABLE - USER DETAILS ||============================== //

export default function ExpandingDetail({ data }) {
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));

  const selectedStatus = allStatus.filter((item) => item.value === Number(data.status));
  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12} sm={5} md={4} xl={3.5}>
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
                <Avatar alt="Avatar 1" size="xl" src={data.profile_pic} style={{ width: '100%', height: '100%', maxWidth: '255px' }} />
              </Stack>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>
      <Grid item xs={12} sm={7} md={8} xl={8.5}>
        <Stack spacing={2.5}>
          <MainCard title="Personal Details">
            <List sx={{ py: 0 }}>
              <ListItem divider={!downMD}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={0.5}>
                      <Typography color="secondary">Name</Typography>
                      <Typography>{data.name}</Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={0.5}>
                      <Typography color="secondary">Designation</Typography>
                      <Typography>{data.designation}</Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Stack spacing={0.5}>
                  <Typography color="secondary">Status</Typography>
                  <Typography>{data.status == 1 ? 'Active' : 'Inactive'}</Typography>
                </Stack>
              </ListItem>
              <ListItem>
                <Stack spacing={0.5}>
                  <Typography color="secondary">Description</Typography>
                  <Typography>{data.description}</Typography>
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
