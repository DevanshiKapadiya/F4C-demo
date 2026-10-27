import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useSiteSettings } from 'hooks/useSettings';

export default function Footer() {
  const { copyright_text } = useSiteSettings();
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ p: '24px 16px 0px', mt: 'auto' }}>
      <Typography variant="caption">{copyright_text}</Typography>
      <Stack spacing={1.5} direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="caption">Version: 1.0.0</Typography>
      </Stack>
    </Stack>
  );
}
