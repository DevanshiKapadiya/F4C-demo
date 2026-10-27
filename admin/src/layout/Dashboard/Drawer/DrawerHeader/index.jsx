import PropTypes from 'prop-types';
// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// project import
import DrawerHeaderStyled from './DrawerHeaderStyled';

import useConfig from 'hooks/useConfig';
import { MenuOrientation } from 'config';
import { useSiteSettings } from 'hooks/useSettings';

// ==============================|| DRAWER HEADER ||============================== //

export default function DrawerHeader({ open }) {
  const theme = useTheme();
  const downLG = useMediaQuery(theme.breakpoints.down('lg'));
  const { logo } = useSiteSettings();
  const { menuOrientation } = useConfig();
  const isHorizontal = menuOrientation === MenuOrientation.HORIZONTAL && !downLG;

  return (
    <DrawerHeaderStyled
      theme={theme}
      open={open}
      sx={{
        minHeight: isHorizontal ? 'unset' : '60px',
        width: isHorizontal ? { xs: '100%', lg: '424px' } : 'initial',
        paddingTop: isHorizontal ? { xs: '10px', lg: '0' } : '10px',
        paddingBottom: isHorizontal ? { xs: '18px', lg: '0' } : '10px',
        paddingLeft: isHorizontal ? { xs: '24px', lg: '0' } : open ? '34px' : '8px'
      }}
    >
      <img src={logo} alt="logo" style={{ width: open ? 'auto' : 45, height: !open ? 'auto' : 45 }} />
      {/* <Logo isIcon={!open} sx={{ width: open ? 'auto' : 35, height: 35 }} /> */}
    </DrawerHeaderStyled>
  );
}

DrawerHeader.propTypes = { open: PropTypes.bool };
