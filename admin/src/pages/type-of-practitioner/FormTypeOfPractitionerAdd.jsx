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
import { Alert, Snackbar } from '@mui/material';
import { LoadingOutlined } from '@ant-design/icons';
import LoadingButton from 'components/@extended/LoadingButton';

// constant
const getInitialValues = (typeOfPractitioner) => {
  const newTypeOfPractitioner = {
    type_of_practitioner: '',
    status: '1'
  };

  if (typeOfPractitioner) {
    return _.merge({}, newTypeOfPractitioner, typeOfPractitioner);
  }

  return newTypeOfPractitioner;
};

// ==============================|| CUSTOMER ADD / EDIT - FORM ||============================== //

export default function FormTypeOfPractitionerAdd({ typeOfPractitioner, closeModal, isSucess }) {
  const [loading, setLoading] = useState(true);
  const [apiResponseError, setApiResponseError] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);

  useEffect(() => {
    setApiResponseError('');
    setLoading(false);
  }, []);

  const TypeOfPractitionerSchema = Yup.object().shape({
    type_of_practitioner: Yup.string().max(255).required('Type of practitioner is required'),
    status: Yup.string().oneOf(['0', '1'], 'Invalid status').required('Status is required')
  });

  const formik = useFormik({
    initialValues: getInitialValues(typeOfPractitioner),
    validationSchema: TypeOfPractitionerSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        let newTypeOfPractitioner = values;
        newTypeOfPractitioner.type_of_practitioner = newTypeOfPractitioner.type_of_practitioner;
        if (typeOfPractitioner) {
          try {
            const payload = {
              type_of_practitioner_id: String(newTypeOfPractitioner.type_of_practitioner_id),
              type_of_practitioner: newTypeOfPractitioner.type_of_practitioner,
              status: String(newTypeOfPractitioner.status)
            };
            const response = await AuthService.axiosPrivatePost('/updateTypeOfPractitioner', payload);
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
        } else {
          try {
            const payload = {
              type_of_practitioner: newTypeOfPractitioner.type_of_practitioner,
              status: String(newTypeOfPractitioner.status)
            };
            const response = await AuthService.axiosPrivatePost('/addTypeOfPractitioner', payload);

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
            <DialogTitle>{typeOfPractitioner ? 'Edit Type Of Practitioner' : 'New Type Of Practitioner'}</DialogTitle>
            <Divider />
            <DialogContent sx={{ p: 2.5 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={12} justifyContent="center" sx={{ ml: 5, mr: 5 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="typeOfPractitioner-type_of_practitioner">Type of practitioner</InputLabel>
                        <TextField
                          fullWidth
                          id="typeOfPractitioner-type_of_practitioner"
                          placeholder="Enter type of practitioner"
                          {...getFieldProps('type_of_practitioner')}
                          error={Boolean(touched.type_of_practitioner && errors.type_of_practitioner)}
                          helperText={touched.type_of_practitioner && errors.type_of_practitioner}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="typeOfPractitioner-status">Status</InputLabel>
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

FormTypeOfPractitionerAdd.propTypes = { typeOfPractitioner: PropTypes.any, closeModal: PropTypes.func };
