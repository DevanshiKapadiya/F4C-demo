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

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';

// third-party
import _ from 'lodash';
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';

// project imports
import CircularWithPath from 'components/@extended/progress/CircularWithPath';

import { Status } from 'config';
import { openSnackbar } from 'api/snackbar';

// assets
import { AuthService } from 'services';

// constant
const getInitialValues = (admin) => {
  const newAdmin = {
    name: '',
    email: '',
    status: '1',
    username: '',
    password: '',
    confirm_password: ''
  };

  if (admin) {
    return _.merge({}, newAdmin, admin);
  }

  return newAdmin;
};

// ==============================|| CUSTOMER ADD / EDIT - FORM ||============================== //

export default function FormAdminAdd({ admin, closeModal, isSucess }) {
  const [loading, setLoading] = useState(true);
  const [apiResponseError, setApiResponseError] = useState('');

  useEffect(() => {
    setApiResponseError('');
    setLoading(false);
  }, []);

  const AddAdminSchema = Yup.object().shape({
    name: Yup.string().max(255).required('Name is required'),
    username: Yup.string().max(255).required('User Name is required'),
    password: Yup.string().max(255).required('Password is required'),
    confirm_password: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm Password is required'),
    email: Yup.string().max(255).required('Email is required').email('Must be a valid email'),
    status: Yup.string().oneOf(['0', '1'], 'Invalid status').required('Status is required')
  });
  const UpdateAdminSchema = Yup.object().shape({
    name: Yup.string().max(255).required('Name is required'),
    username: Yup.string().max(255).required('User Name is required'),
    email: Yup.string().max(255).required('Email is required').email('Must be a valid email'),
    status: Yup.string().oneOf(['0', '1'], 'Invalid status').required('Status is required')
  });

  const formik = useFormik({
    initialValues: getInitialValues(admin),
    validationSchema: !admin ? AddAdminSchema : UpdateAdminSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        let newAdmin = values;
        newAdmin.name = newAdmin.name;
        if (admin) {
          try {
            const payload = {
              admin_id: String(newAdmin.admin_id),
              name: newAdmin.name,
              username: newAdmin.username,
              email: newAdmin.email,
              status: String(newAdmin.status)
            };
            const response = await AuthService.axiosPrivatePost('/updateAdmin', payload);
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
            }
          } catch (error) {}
        } else {
          try {
            const payload = {
              name: newAdmin.name,
              username: newAdmin.username,
              password: newAdmin.password,
              email: newAdmin.email,
              status: newAdmin.status,
              confirm_password: newAdmin.confirm_password
            };
            const response = await AuthService.axiosPrivatePost('/createAdmin', payload);

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
            }
          } catch (error) {}
        }
      } catch (error) {
        console.log(error);
      }
    }
  });
  const { errors, touched, handleSubmit, isSubmitting, getFieldProps, setFieldValue } = formik;
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
            <DialogTitle>{admin ? 'Edit Admin' : 'New Admin'}</DialogTitle>
            <Divider />
            <DialogContent sx={{ p: 2.5 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={12} justifyContent="center" sx={{ ml: 5, mr: 5 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="admin-name">Name</InputLabel>
                        <TextField
                          fullWidth
                          id="admin-name"
                          placeholder="Enter Name"
                          {...getFieldProps('name')}
                          error={Boolean(touched.name && errors.name)}
                          helperText={touched.name && errors.name}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="admin-username">User Name</InputLabel>
                        <TextField
                          fullWidth
                          id="admin-username"
                          placeholder="Enter User Name"
                          {...getFieldProps('username')}
                          error={Boolean(touched.username && errors.username)}
                          helperText={touched.username && errors.username}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="admin-email">Email</InputLabel>
                        <TextField
                          fullWidth
                          id="admin-email"
                          placeholder="Enter Admin Email"
                          {...getFieldProps('email')}
                          error={Boolean(touched.email && errors.email)}
                          helperText={touched.email && errors.email}
                        />
                      </Stack>
                    </Grid>
                    {!admin && (
                      <>
                        <Grid item xs={12} sm={6}>
                          <Stack spacing={1}>
                            <InputLabel htmlFor="admin-password">Password</InputLabel>
                            <TextField
                              fullWidth
                              id="admin-password"
                              placeholder="Enter Password"
                              {...getFieldProps('password')}
                              error={Boolean(touched.password && errors.password)}
                              helperText={touched.password && errors.password}
                            />
                          </Stack>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Stack spacing={1}>
                            <InputLabel htmlFor="admin-confirm_password">Confirm Password</InputLabel>
                            <TextField
                              fullWidth
                              id="admin-confirm_password"
                              placeholder="Enter Confirm Password"
                              {...getFieldProps('confirm_password')}
                              error={Boolean(touched.confirm_password && errors.confirm_password)}
                              helperText={touched.confirm_password && errors.confirm_password}
                            />
                          </Stack>
                        </Grid>
                      </>
                    )}
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="admin-Status">Status</InputLabel>
                        <RadioGroup
                          row
                          aria-label="payment-card"
                          {...getFieldProps('status')}
                          value={formik.values.status}
                          onChange={formik.handleChange}
                          error={Boolean(touched.status && errors.status)}
                          helperText={touched.status && errors.status}
                        >
                          <FormControlLabel control={<Radio value="1" />} label={Status.ACTIVE} />
                          <FormControlLabel control={<Radio value="0" />} label={Status.INACTIVE} />
                        </RadioGroup>
                        {touched.status && errors.status && <FormHelperText error>{errors.status}</FormHelperText>}
                      </Stack>
                    </Grid>
                  </Grid>
                  {apiResponseError && <p className="error">{apiResponseError}</p>}
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
                    <Button type="submit" variant="contained" disabled={isSubmitting}>
                      Save
                    </Button>
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

FormAdminAdd.propTypes = { admin: PropTypes.any, closeModal: PropTypes.func };
