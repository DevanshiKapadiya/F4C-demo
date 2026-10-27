// material-ui
import { Typography } from '@mui/material';

// project import
import MainCard from 'components/MainCard';
import useAuth from 'hooks/useAuth';
import { useSiteSettings } from 'hooks/useSettings';

// ==============================|| SAMPLE PAGE ||============================== //

const Dashboard = () => {
  const { user } = useAuth();
  const { siteTitle } = useSiteSettings();
  return (
    <MainCard title={`Dashboard Card - ${user?.name}`}>
      <Typography variant="body2">Welcome to {siteTitle}</Typography>
    </MainCard>
  );
};

export default Dashboard;
