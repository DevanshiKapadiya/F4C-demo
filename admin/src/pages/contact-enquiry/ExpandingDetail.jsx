import PropTypes from 'prop-types';
import useMediaQuery from '@mui/material/useMediaQuery';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { format } from 'date-fns';

// project import
import MainCard from 'components/MainCard';

// ==============================|| CONTACT ENQUIRY - ROW DETAIL ||============================== //

const formatDateTime = (value) => (value ? format(new Date(value), 'dd/MM/yyyy hh:mm a') : '—');

export default function ExpandingDetail({ data }) {
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));

  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12}>
        <MainCard title="Enquiry Details">
          <List sx={{ py: 0 }}>
            <ListItem divider={!downMD}>
              <Stack spacing={0.5}>
                <Typography color="secondary">Sender Name</Typography>
                <Typography>{data.name}</Typography>
              </Stack>
            </ListItem>
            <ListItem divider={!downMD}>
              <Stack spacing={0.5}>
                <Typography color="secondary">Email</Typography>
                <Typography sx={{ overflowWrap: 'anywhere' }}>{data.email}</Typography>
              </Stack>
            </ListItem>
            <ListItem divider={!downMD}>
              <Stack spacing={0.5}>
                <Typography color="secondary">Phone</Typography>
                <Typography>{data.phone || '—'}</Typography>
              </Stack>
            </ListItem>
            <ListItem divider={!downMD}>
              <Stack spacing={0.5}>
                <Typography color="secondary">Enquiry Type</Typography>
                <Typography>{data.enquiry_type}</Typography>
              </Stack>
            </ListItem>
            <ListItem divider={!downMD}>
              <Stack spacing={0.5}>
                <Typography color="secondary">Subject</Typography>
                <Typography sx={{ overflowWrap: 'anywhere' }}>{data.subject}</Typography>
              </Stack>
            </ListItem>
            <ListItem divider={!downMD}>
              <Stack spacing={0.5}>
                <Typography color="secondary">Message</Typography>
                <Typography sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{data.message}</Typography>
              </Stack>
            </ListItem>
            <ListItem>
              <Stack spacing={0.5}>
                <Typography color="secondary">Submitted</Typography>
                <Typography>{formatDateTime(data.created_at)}</Typography>
              </Stack>
            </ListItem>
          </List>
        </MainCard>
      </Grid>
    </Grid>
  );
}

ExpandingDetail.propTypes = { data: PropTypes.any };
