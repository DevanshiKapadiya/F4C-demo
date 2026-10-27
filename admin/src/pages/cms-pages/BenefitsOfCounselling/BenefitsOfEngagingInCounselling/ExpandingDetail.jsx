import PropTypes from 'prop-types';
import useMediaQuery from '@mui/material/useMediaQuery';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project import
import MainCard from 'components/MainCard';

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
    <Grid container spacing={2.5} sx={{ pl: { xs: 0, sm: 5, md: 6, lg: 10, xl: 12 } }}>
      <Grid item xs={12} sm={7} md={12} xl={12}>
        <Stack spacing={2.5}>
          <MainCard title="Details">
            <List sx={{ py: 0 }}>
              <ListItem divider={!downMD}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={0.5}>
                      <Typography color="secondary">Title</Typography>
                      <Typography>{data.title}</Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={0.5}>
                      <Typography color="secondary">Status</Typography>
                      <Typography>{data.status == 1 ? 'Active' : 'Inactive'}</Typography>
                    </Stack>
                  </Grid>
                </Grid>
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
