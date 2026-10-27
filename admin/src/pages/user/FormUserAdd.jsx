import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import { Alert, InputAdornment, OutlinedInput, Snackbar } from '@mui/material';
import { EyeOutlined, EyeInvisibleOutlined, LoadingOutlined } from '@ant-design/icons';

// third-party
import _ from 'lodash';
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';

// project imports
import CircularWithPath from 'components/@extended/progress/CircularWithPath';
import { Status } from 'config';
import { openSnackbar } from 'api/snackbar';
import { AuthService } from 'services';
import IconButton from 'components/@extended/IconButton';
import LoadingButton from 'components/@extended/LoadingButton';

// ==============================|| USER – ADD / EDIT FORM ||============================== //

const SESSION_TYPE_OPTIONS = [
  { value: 'online', label: 'Online' },
  { value: 'in-person', label: 'In-Person' },
  { value: 'either', label: 'Either' }
];

const getInitialValues = (user) => {
  const defaults = {
    fname: '',
    lname: '',
    email: '',
    preferred_session_type: '',
    city_town: '',
    country: '',
    status: '1',
    password: '',
    confirm_password: ''
  };
  if (user) {
    return {
      ...defaults,
      ...user,
      country: user.country == null ? '' : String(user.country),
      status: String(user.status ?? 1)
    };
  }
  return defaults;
};

export default function FormUserAdd({ user, closeModal, isSucess }) {
  const [loading, setLoading] = useState(true);
  const [apiResponseError, setApiResponseError] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfPassword, setShowConfPassword] = useState(false);
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    setApiResponseError('');
    setLoading(false);
  }, []);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await AuthService.axiosPrivatePost('/countryList', {});

        //console.log('Country API response:', response.data);

        if (response.data?.status === true) {
          setCountries(Array.isArray(response.data.data) ? response.data.data : []);
        }
      } catch (error) {
        console.error('Contry API error:', error);
      }
    };
    fetchCountries();
  }, []);

  /* Yup schemas */
  const AddUserSchema = Yup.object().shape({
    fname: Yup.string().max(100).required('First name is required'),
    lname: Yup.string().max(100),
    email: Yup.string().max(255).required('Email is required').email('Must be a valid email'),
    preferred_session_type: Yup.string().oneOf(['online', 'in-person', 'either', ''], 'Select a valid session type'),
    city_town: Yup.string().max(255),
    country: Yup.number()
      .typeError('Please select a country')
      .integer('Invalid country')
      .positive('Invalid country')
      .required('Country is required'),
    status: Yup.string().oneOf(['0', '1']).required('Status is required'),
    password: Yup.string().min(6, 'Minimum 6 characters').max(255).required('Password is required'),
    confirm_password: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm Password is required')
  });

  const UpdateUserSchema = Yup.object().shape({
    fname: Yup.string().max(100).required('First name is required'),
    lname: Yup.string().max(100),
    email: Yup.string().max(255).required('Email is required').email('Must be a valid email'),
    preferred_session_type: Yup.string().oneOf(['online', 'in-person', 'either', ''], 'Select a valid session type'),
    city_town: Yup.string().max(255),
    country: Yup.number()
      .typeError('Please select a country')
      .integer('Invalid country')
      .positive('Invalid country')
      .required('Country is required'),
    status: Yup.string().oneOf(['0', '1']).required('Status is required')
  });

  const formik = useFormik({
    initialValues: getInitialValues(user),
    validationSchema: !user ? AddUserSchema : UpdateUserSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (user) {
          /* ---- EDIT ---- */
          const payload = {
            user_id: String(values.user_id),
            fname: values.fname.trim(),
            lname: (values.lname || '').trim(),
            email: values.email.trim(),
            preferred_session_type: values.preferred_session_type || null,
            city_town: (values.city_town || '').trim() || null,
            country: Number(values.country),
            status: String(values.status)
          };
          const response = await AuthService.axiosPrivatePost('/updateUser', payload);
          if (response.data.status) {
            openSnackbar({
              open: true,
              message: response.data.message,
              variant: 'alert',
              alert: { color: 'success' }
            });
            setSubmitting(false);
            isSucess();
          } else {
            setApiResponseError(response.data.message);
            setShowSnackbar(true);
            setSubmitting(false);
          }
        } else {
          /* ---- ADD ---- */
          const payload = {
            fname: values.fname.trim(),
            lname: (values.lname || '').trim(),
            email: values.email.trim(),
            preferred_session_type: values.preferred_session_type || null,
            city_town: (values.city_town || '').trim() || null,
            country: Number(values.country),
            status: String(values.status),
            password: values.password
          };
          const response = await AuthService.axiosPrivatePost('/createUser', payload);
          if (response.data.status) {
            openSnackbar({
              open: true,
              message: response.data.message,
              variant: 'alert',
              alert: { color: 'success' }
            });
            setSubmitting(false);
            isSucess();
          } else {
            setApiResponseError(response.data.message);
            setShowSnackbar(true);
            setSubmitting(false);
          }
        }
      } catch (error) {
        console.error(error);
        setApiResponseError('An unexpected error occurred. Please try again.');
        setShowSnackbar(true);
        setSubmitting(false);
      }
    }
  });

  const { errors, touched, handleSubmit, handleBlur, handleChange, isSubmitting, getFieldProps, setFieldValue } = formik;

  if (loading)
    return (
      <Box sx={{ p: 5 }}>
        <Stack direction="row" justifyContent="center">
          <CircularWithPath />
        </Stack>
      </Box>
    );

  return (
    <>
      <FormikProvider value={formik}>
        <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
          <DialogTitle>{user ? 'Edit User' : 'New User'}</DialogTitle>
          <Divider />
          <DialogContent sx={{ p: 2.5 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={12} justifyContent="center" sx={{ ml: 5, mr: 5 }}>
                <Grid container spacing={3}>
                  {/* First Name */}
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor="user-fname">First Name *</InputLabel>
                      <TextField
                        fullWidth
                        id="user-fname"
                        placeholder="Enter first name"
                        {...getFieldProps('fname')}
                        error={Boolean(touched.fname && errors.fname)}
                        helperText={touched.fname && errors.fname}
                      />
                    </Stack>
                  </Grid>

                  {/* Last Name */}
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor="user-lname">Last Name</InputLabel>
                      <TextField
                        fullWidth
                        id="user-lname"
                        placeholder="Enter last name"
                        {...getFieldProps('lname')}
                        error={Boolean(touched.lname && errors.lname)}
                        helperText={touched.lname && errors.lname}
                      />
                    </Stack>
                  </Grid>

                  {/* Email */}
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor="user-email">Email *</InputLabel>
                      <TextField
                        fullWidth
                        id="user-email"
                        placeholder="Enter email address"
                        {...getFieldProps('email')}
                        error={Boolean(touched.email && errors.email)}
                        helperText={touched.email && errors.email}
                      />
                    </Stack>
                  </Grid>

                  {/* Preferred Session Type */}
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor="user-session-type">Preferred Session Type</InputLabel>
                      <FormControl fullWidth error={Boolean(touched.preferred_session_type && errors.preferred_session_type)}>
                        <Select
                          id="user-session-type"
                          displayEmpty
                          value={formik.values.preferred_session_type || ''}
                          onChange={(e) => setFieldValue('preferred_session_type', e.target.value)}
                        >
                          <MenuItem value="">
                            <em>Select session type</em>
                          </MenuItem>
                          {SESSION_TYPE_OPTIONS.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </MenuItem>
                          ))}
                        </Select>
                        {touched.preferred_session_type && errors.preferred_session_type && (
                          <FormHelperText>{errors.preferred_session_type}</FormHelperText>
                        )}
                      </FormControl>
                    </Stack>
                  </Grid>

                  {/* Location */}
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor="user-city">Location (City / Town)</InputLabel>
                      <TextField
                        fullWidth
                        id="user-city"
                        placeholder="Enter city or town"
                        {...getFieldProps('city_town')}
                        error={Boolean(touched.city_town && errors.city_town)}
                        helperText={touched.city_town && errors.city_town}
                      />
                    </Stack>
                  </Grid>

                  {/* Country */}
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1}>
                      <InputLabel>Country *</InputLabel>

                      <FormControl fullWidth error={Boolean(touched.country && errors.country)}>
                        <Select
                          name="country"
                          displayEmpty
                          value={
                            countries.some((item) => String(item.id) === String(formik.values.country)) ? String(formik.values.country) : ''
                          }
                          onChange={(e) => setFieldValue('country', e.target.value)}
                          onBlur={() => formik.setFieldTouched('country', true)}
                        >
                          <MenuItem value="">
                            <em>Select Country</em>
                          </MenuItem>

                          {countries.map((item) => (
                            <MenuItem key={item.id} value={String(item.id)}>
                              {item.name}
                            </MenuItem>
                          ))}
                        </Select>
                        {touched.country && errors.country && <FormHelperText>{errors.country}</FormHelperText>}
                      </FormControl>
                    </Stack>
                  </Grid>

                  {/* Password fields — only on Add */}
                  {!user && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Stack spacing={1}>
                          <InputLabel htmlFor="user-password">Password *</InputLabel>
                          <OutlinedInput
                            fullWidth
                            id="user-password"
                            type={showPassword ? 'text' : 'password'}
                            {...getFieldProps('password')}
                            error={Boolean(touched.password && errors.password)}
                            onBlur={handleBlur}
                            onChange={handleChange}
                            endAdornment={
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label="toggle password visibility"
                                  onClick={() => setShowPassword(!showPassword)}
                                  onMouseDown={(e) => e.preventDefault()}
                                  edge="end"
                                  color="secondary"
                                >
                                  {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                                </IconButton>
                              </InputAdornment>
                            }
                            placeholder="Enter password"
                          />
                          {touched.password && errors.password && <FormHelperText error>{errors.password}</FormHelperText>}
                        </Stack>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Stack spacing={1}>
                          <InputLabel htmlFor="user-confirm-password">Confirm Password *</InputLabel>
                          <OutlinedInput
                            fullWidth
                            id="user-confirm-password"
                            type={showConfPassword ? 'text' : 'password'}
                            {...getFieldProps('confirm_password')}
                            error={Boolean(touched.confirm_password && errors.confirm_password)}
                            onBlur={handleBlur}
                            onChange={handleChange}
                            endAdornment={
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label="toggle confirm password visibility"
                                  onClick={() => setShowConfPassword(!showConfPassword)}
                                  onMouseDown={(e) => e.preventDefault()}
                                  edge="end"
                                  color="secondary"
                                >
                                  {showConfPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                                </IconButton>
                              </InputAdornment>
                            }
                            placeholder="Confirm password"
                          />
                          {touched.confirm_password && errors.confirm_password && (
                            <FormHelperText error>{errors.confirm_password}</FormHelperText>
                          )}
                        </Stack>
                      </Grid>
                    </>
                  )}

                  {/* Status */}
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={1}>
                      <InputLabel htmlFor="user-status">Status</InputLabel>
                      <RadioGroup
                        row
                        aria-label="user-status"
                        {...getFieldProps('status')}
                        value={formik.values.status}
                        onChange={formik.handleChange}
                      >
                        <FormControlLabel control={<Radio value="1" />} label={Status.ACTIVE} />
                        <FormControlLabel control={<Radio value="0" />} label={Status.INACTIVE} />
                      </RadioGroup>
                      {touched.status && errors.status && <FormHelperText error>{errors.status}</FormHelperText>}
                    </Stack>
                  </Grid>
                </Grid>

                {/* Error Snackbar */}
                <Snackbar
                  open={showSnackbar && !!apiResponseError}
                  autoHideDuration={2500}
                  onClose={() => setShowSnackbar(false)}
                  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                >
                  <Alert onClose={() => setShowSnackbar(false)} variant="filled" severity="error">
                    {apiResponseError}
                  </Alert>
                </Snackbar>
              </Grid>
            </Grid>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 2.5 }}>
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item />
              <Grid item>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Button color="error" onClick={closeModal}>
                    Cancel
                  </Button>
                  <LoadingButton endIcon={isSubmitting && <LoadingOutlined />} type="submit" variant="contained" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving…' : 'Save'}
                  </LoadingButton>
                </Stack>
              </Grid>
            </Grid>
          </DialogActions>
        </Form>
      </FormikProvider>
    </>
  );
}

FormUserAdd.propTypes = { user: PropTypes.any, closeModal: PropTypes.func, isSucess: PropTypes.func };
