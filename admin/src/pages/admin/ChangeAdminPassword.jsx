import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

/* material-ui */
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';

/* third-party */
import _ from 'lodash';
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';

/* project imports */
import CircularWithPath from 'components/@extended/progress/CircularWithPath';

import { openSnackbar } from 'api/snackbar';

/* assets */
import { AuthService } from 'services';
import { Alert, FormHelperText, IconButton, InputAdornment, OutlinedInput, Snackbar } from '@mui/material';
import { EyeInvisibleOutlined, EyeOutlined, LoadingOutlined } from '@ant-design/icons';
import LoadingButton from 'components/@extended/LoadingButton';

/* constant */
const getInitialValues = (admin) => {
  const newAdmin = {
    current_password: '',
    new_password: '',
    confirm_new_password: ''
  };

  if (admin) {
    return _.merge({}, newAdmin, admin);
  }

  return newAdmin;
};

/* ==============================|| CUSTOMER ADD / EDIT - FORM ||============================== */

export default function FormChangeAdminPassword({ admin, closeModal, isSucess }) {
  const [loading, setLoading] = useState(true);
  const [apiResponseError, setApiResponseError] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfPassword, setShowConfPassword] = useState(false);

  useEffect(() => {
    setApiResponseError('');
    setLoading(false);
  }, []);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleClickShowConfPassword = () => {
    setShowConfPassword(!showConfPassword);
  };

  const handleMouseDownConfPassword = (event) => {
    event.preventDefault();
  };

  const handleClickShowOldPassword = () => {
    setShowOldPassword(!showOldPassword);
  };

  const handleMouseDownOldPassword = (event) => {
    event.preventDefault();
  };

  const AddAdminSchema = Yup.object().shape({
    current_password: Yup.string().max(255).required('Field is required'),
    new_password: Yup.string().max(255).required('Field is required'),
    confirm_new_password: Yup.string()
      .oneOf([Yup.ref('new_password'), null], 'Passwords must match')
      .required('Field is required')
  });

  const formik = useFormik({
    initialValues: getInitialValues(admin),
    validationSchema: AddAdminSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        let newAdmin = values;
        try {
          const payload = {
            admin_id: String(newAdmin.admin_id),
            current_password: newAdmin.current_password,
            new_password: newAdmin.new_password
          };
          const response = await AuthService.axiosPrivatePost('/changePasswordAdmin', payload);

          if (response.data.status) {
            openSnackbar({
              open: true,
              message: response.data.message,
              variant: 'alert',

              alert: {
                color: 'success'
              }
            });
            setSubmitting(false);
            isSucess();
          } else {
            setApiResponseError(response.data.message);
            setShowSnackbar(true);
          }
        } catch (error) {}
      } catch (error) {
        console.log(error);
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
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
            <DialogTitle>Change Password</DialogTitle>
            <Divider />
            <DialogContent sx={{ p: 2.5 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={12} justifyContent="center" sx={{ ml: 5, mr: 5 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="admin-current_password">Current password</InputLabel>
                        <OutlinedInput
                          fullWidth
                          id="admin-current_password"
                          error={Boolean(touched.current_password && errors.current_password)}
                          type={showOldPassword ? 'text' : 'password'}
                          {...getFieldProps('current_password')}
                          name="current_password"
                          helperText={touched.current_password && errors.current_password}
                          onBlur={handleBlur}
                          onChange={handleChange}
                          endAdornment={
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowOldPassword}
                                onMouseDown={handleMouseDownOldPassword}
                                edge="end"
                                color="secondary"
                              >
                                {showOldPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                              </IconButton>
                            </InputAdornment>
                          }
                          placeholder="Enter current password"
                        />
                      </Stack>
                      {touched.current_password && errors.current_password && (
                        <FormHelperText error id="standard-weight-helper-text-current_password-login">
                          {errors.current_password}
                        </FormHelperText>
                      )}
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="admin-new_password">New password</InputLabel>
                        <OutlinedInput
                          fullWidth
                          id="admin-new_password"
                          type={showPassword ? 'text' : 'password'}
                          {...getFieldProps('new_password')}
                          name="new_password"
                          onBlur={handleBlur}
                          onChange={handleChange}
                          error={Boolean(touched.new_password && errors.new_password)}
                          helperText={touched.new_password && errors.new_password}
                          endAdornment={
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowPassword}
                                onMouseDown={handleMouseDownPassword}
                                edge="end"
                                color="secondary"
                              >
                                {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                              </IconButton>
                            </InputAdornment>
                          }
                          placeholder="Enter new password"
                        />
                      </Stack>
                      {touched.new_password && errors.new_password && (
                        <FormHelperText error id="standard-weight-helper-text-new_password-login">
                          {errors.new_password}
                        </FormHelperText>
                      )}
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="admin-confirm_new_password">Confirm new password</InputLabel>
                        <OutlinedInput
                          fullWidth
                          id="admin-confirm_new_password"
                          error={Boolean(touched.confirm_new_password && errors.confirm_new_password)}
                          type={showConfPassword ? 'text' : 'password'}
                          {...getFieldProps('confirm_new_password')}
                          name="confirm_new_password"
                          helperText={touched.confirm_new_password && errors.confirm_new_password}
                          onBlur={handleBlur}
                          onChange={handleChange}
                          endAdornment={
                            <InputAdornment position="end">
                              <IconButton
                                aria-label="toggle password visibility"
                                onClick={handleClickShowConfPassword}
                                onMouseDown={handleMouseDownConfPassword}
                                edge="end"
                                color="secondary"
                              >
                                {showConfPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                              </IconButton>
                            </InputAdornment>
                          }
                          placeholder="Enter confirm password"
                        />
                      </Stack>
                      {touched.confirm_new_password && errors.confirm_new_password && (
                        <FormHelperText error id="standard-weight-helper-text-confirm_new_password-login">
                          {errors.confirm_new_password}
                        </FormHelperText>
                      )}
                    </Grid>
                  </Grid>
                  <Snackbar
                    open={showSnackbar && apiResponseError}
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
                <Grid item></Grid>
                <Grid item>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Button color="error" onClick={closeModal}>
                      Cancel
                    </Button>
                    <LoadingButton endIcon={isSubmitting && <LoadingOutlined />} type="submit" variant="contained" disabled={isSubmitting}>
                      Save
                    </LoadingButton>
                  </Stack>
                </Grid>
              </Grid>
            </DialogActions>
          </Form>
        </LocalizationProvider>
      </FormikProvider>
    </>
  );
}

FormChangeAdminPassword.propTypes = { admin: PropTypes.any, closeModal: PropTypes.func };
