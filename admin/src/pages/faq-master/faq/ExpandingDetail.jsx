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
import { QuestionCircleOutlined, QuestionOutlined, FileTextOutlined, FolderOutlined, CheckCircleOutlined } from '@ant-design/icons';

// ==============================|| FAQ – EXPANDING ROW DETAIL ||============================== //

export default function ExpandingDetail({ data }) {
  const downMD = useMediaQuery((theme) => theme.breakpoints.down('md'));
  const isActive = Number(data.status) === 1;
  const categoryTitle = data.category_title || 'General';

  return (
    <Grid container spacing={2.5}>
      {/* Left Summary Card */}
      <Grid item xs={12} sm={5} md={4} xl={3.5}>
        <MainCard>
          <Chip
            label={isActive ? 'Active' : 'Inactive'}
            color={isActive ? 'success' : 'error'}
            size="small"
            sx={{ position: 'absolute', right: -1, top: -1, borderRadius: '0 4px 0 4px' }}
          />
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Stack spacing={2.5} alignItems="center">
                <Avatar
                  alt="FAQ"
                  size="xl"
                  sx={{
                    width: 72,
                    height: 72,
                    bgcolor: 'primary.lighter',
                    color: 'primary.main',
                    fontSize: '1.75rem'
                  }}
                >
                  <QuestionOutlined />
                </Avatar>
                <Typography variant="h5" align="center" sx={{ overflowWrap: 'anywhere' }}>
                  {categoryTitle}
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
                    <FolderOutlined />
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography style={{ overflowWrap: 'break-word', fontSize: '0.85rem' }}>{categoryTitle}</Typography>}
                  />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>

      {/* Details Card */}
      <Grid item xs={12} sm={7} md={8} xl={8.5}>
        <Stack spacing={2.5}>
          <MainCard title="FAQ Details">
            <List sx={{ py: 0 }}>
              <Grid container>
                <Grid item xs={12}>
                  <ListItem divider={!downMD}>
                    <Stack spacing={0.5}>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <QuestionCircleOutlined style={{ fontSize: 12, color: '#8c8c8c' }} />
                        <Typography color="secondary" variant="caption">
                          Question
                        </Typography>
                      </Stack>
                      <Typography variant="subtitle1" sx={{ overflowWrap: 'anywhere' }}>
                        {data.question || '—'}
                      </Typography>
                    </Stack>
                  </ListItem>
                </Grid>
                <Grid item xs={12}>
                  <ListItem divider={!downMD}>
                    <Stack spacing={0.5}>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <FileTextOutlined style={{ fontSize: 12, color: '#8c8c8c' }} />
                        <Typography color="secondary" variant="caption">
                          Answer
                        </Typography>
                      </Stack>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                        {data.answer || '—'}
                      </Typography>
                    </Stack>
                  </ListItem>
                </Grid>
                <Grid item xs={12} md={6}>
                  <ListItem divider={!downMD}>
                    <Stack spacing={0.5}>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <FolderOutlined style={{ fontSize: 12, color: '#8c8c8c' }} />
                        <Typography color="secondary" variant="caption">
                          Category
                        </Typography>
                      </Stack>
                      <Chip label={categoryTitle} color="primary" size="small" variant="light" sx={{ width: 'fit-content' }} />
                    </Stack>
                  </ListItem>
                </Grid>
                <Grid item xs={12} md={6}>
                  <ListItem>
                    <Stack spacing={0.5}>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <CheckCircleOutlined style={{ fontSize: 12, color: '#8c8c8c' }} />
                        <Typography color="secondary" variant="caption">
                          Status
                        </Typography>
                      </Stack>
                      <Chip
                        label={isActive ? 'Active' : 'Inactive'}
                        color={isActive ? 'success' : 'error'}
                        size="small"
                        variant="light"
                        sx={{ width: 'fit-content' }}
                      />
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
