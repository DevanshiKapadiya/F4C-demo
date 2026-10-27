import PropTypes from 'prop-types';
// material-ui
import Chip from '@mui/material/Chip';

// ==============================|| ROW SELECTION - PREVIEW ||============================== //

export default function RowSelection({ selected }) {
  return (
    <>
      {selected > 0 && (
        <Chip
          size="small"
          label={`${selected} row(s) selected`}
          color="secondary"
          variant="light"
          sx={{ position: 'absolute', right: -1, top: -1, borderRadius: '0 4px 0 4px' }}
        />
      )}
    </>
  );
}

RowSelection.propTypes = { selected: PropTypes.number };
