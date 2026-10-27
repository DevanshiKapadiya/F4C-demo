import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

// material-ui
import OutlinedInput from '@mui/material/OutlinedInput';

// assets
import SearchOutlined from '@ant-design/icons/SearchOutlined';

// ==============================|| FILTER - INPUT ||============================== //

export default function DebouncedInput({
  value: initialValue,
  onFilterChange,
  debounce = 700,
  size,
  startAdornment = <SearchOutlined />,
  ...props
}) {
  const [value, setValue] = useState(initialValue);

  const handleInputChange = (event) => setValue(event.target.value);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onFilterChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line
  }, [value]);

  return (
    <OutlinedInput
      {...props}
      value={value}
      onChange={handleInputChange}
      sx={{ minWidth: 100 }}
      {...(startAdornment && { startAdornment })}
      {...(size && { size })}
    />
  );
}

DebouncedInput.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onFilterChange: PropTypes.func,
  debounce: PropTypes.number,
  size: PropTypes.any,
  startAdornment: PropTypes.any,
  SearchOutlined: PropTypes.any,
  props: PropTypes.any
};
