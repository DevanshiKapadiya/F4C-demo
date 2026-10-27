import PropTypes from 'prop-types';
// material-ui
import Checkbox from '@mui/material/Checkbox';

// ==============================|| ROW SELECTION - CHECKBOX ||============================== //

export default function IndeterminateCheckbox({ indeterminate, ...rest }) {
  return <Checkbox {...rest} indeterminate={typeof indeterminate === 'boolean' && !rest.checked && indeterminate} />;
}

IndeterminateCheckbox.propTypes = { indeterminate: PropTypes.bool };
