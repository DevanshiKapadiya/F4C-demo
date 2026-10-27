import PropTypes from 'prop-types';
import useMediaQuery from '@mui/material/useMediaQuery';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project import
import MainCard from 'components/MainCard';
import Avatar from 'components/@extended/Avatar';

// ==============================|| RESOURCE – EXPANDING ROW DETAIL ||============================== //

export default function ExpandingDetail({ data }) {
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const topics = data.topic || '—';

  return (
    <Grid container spacing={2.5}>
      <Grid item xs={12} sm={5} md={4} xl={3.5}>
        <MainCard>
          <Chip
            label={data.status == 1 ? 'Active' : 'Inactive'}
            color={data.status == 1 ? 'success' : 'error'}
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
                <Avatar alt="Avatar 1" size="xl" src={data.image} style={{ width: '100%', height: '100%', maxWidth: '255px' }} />
              </Stack>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>
      <Grid item xs={12} sm={7} md={8} xl={8.5}>
        <Stack spacing={2.5}>
          <MainCard title="Resource Details">
            <List sx={{ py: 0 }}>
              <ListItem divider={!downMD}>
                <Stack spacing={0.5}>
                  <Typography color="secondary">Title</Typography>
                  <Typography>{data.title}</Typography>
                </Stack>
              </ListItem>
              <ListItem divider={!downMD}>
                <Stack spacing={0.5}>
                  <Typography color="secondary">Short Description</Typography>
                  <Typography style={{ whiteSpace: 'pre-wrap' }}>{data.short_description}</Typography>
                </Stack>
              </ListItem>
              <ListItem divider={!downMD}>
                <Stack spacing={0.5}>
                  <Typography color="secondary">Description</Typography>
                  <div dangerouslySetInnerHTML={{ __html: data.description }} style={{ overflowWrap: 'break-word' }} />
                </Stack>
              </ListItem>
              <ListItem divider={!downMD}>
                <Stack spacing={0.5}>
                  <Typography color="secondary">Reading Time</Typography>
                  <Typography>{data.reading_time} Minute(s)</Typography>
                </Stack>
              </ListItem>
              <ListItem>
                <Stack spacing={0.5}>
                  <Typography color="secondary">Topics</Typography>
                  <Typography>{topics}</Typography>
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
