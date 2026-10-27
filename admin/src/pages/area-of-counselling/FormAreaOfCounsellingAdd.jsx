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
import { Alert, Snackbar, Switch } from '@mui/material';
import LoadingButton from 'components/@extended/LoadingButton';
import { LoadingOutlined } from '@ant-design/icons';

// constant
const getInitialValues = (areaOfCounselling) => {
  const newAreaOfCounselling = {
    counselling_area: '',
    info_text: '',
    is_disabled: 0,
    status: '1'
  };

  if (areaOfCounselling) {
    return _.merge({}, newAreaOfCounselling, areaOfCounselling);
  }

  return newAreaOfCounselling;
};

// ==============================|| CUSTOMER ADD / EDIT - FORM ||============================== //

export default function FormAreaOfCounsellingAdd({ areaOfCounselling, closeModal, isSucess }) {
  const [loading, setLoading] = useState(true);
  const [apiResponseError, setApiResponseError] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [checked, setChecked] = useState(areaOfCounselling?.is_disabled);

  const handleToggle = (elem) => {
    setChecked(elem.target.checked ? '1' : '0');
  };

  useEffect(() => {
    setApiResponseError('');
    setLoading(false);
  }, []);

  const AreaOfCounsellingSchema = Yup.object().shape({
    counselling_area: Yup.string().max(255).required('Area Of Counselling is required'),
    status: Yup.string().oneOf(['0', '1'], 'Invalid status').required('Status is required')
  });

  const formik = useFormik({
    initialValues: getInitialValues(areaOfCounselling),
    validationSchema: AreaOfCounsellingSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        let newAreaOfCounselling = values;
        newAreaOfCounselling.counselling_area = newAreaOfCounselling.counselling_area;
        if (areaOfCounselling) {
          try {
            const payload = {
              counselling_area_id: String(newAreaOfCounselling.counselling_area_id),
              counselling_area: newAreaOfCounselling.counselling_area,
              info_text: newAreaOfCounselling.info_text,
              is_disabled: String(checked),
              status: String(newAreaOfCounselling.status)
            };
            const response = await AuthService.axiosPrivatePost('/updateCounsellingArea', payload);
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
              counselling_area: newAreaOfCounselling.counselling_area,
              info_text: newAreaOfCounselling.info_text,
              is_disabled: String(checked),
              status: String(newAreaOfCounselling.status)
            };
            const response = await AuthService.axiosPrivatePost('/addCounsellingArea', payload);

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
            <DialogTitle>{areaOfCounselling ? 'Edit counseling area' : 'New counseling area'}</DialogTitle>
            <Divider />
            <DialogContent sx={{ p: 2.5 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={12} justifyContent="center" sx={{ ml: 5, mr: 5 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="areaOfCounselling-counselling_area">Counseling Area</InputLabel>
                        <TextField
                          fullWidth
                          id="areaOfCounselling-counselling_area"
                          placeholder="Enter counseling area"
                          {...getFieldProps('counselling_area')}
                          error={Boolean(touched.counselling_area && errors.counselling_area)}
                          helperText={touched.counselling_area && errors.counselling_area}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="areaOfCounselling-info_text">Info Text</InputLabel>
                        <TextField
                          fullWidth
                          id="areaOfCounselling-info_text"
                          placeholder="Enter info text"
                          multiline
                          className="muiTextArea"
                          rows={3}
                          {...getFieldProps('info_text')}
                          error={Boolean(touched.info_text && errors.info_text)}
                          helperText={touched.info_text && errors.info_text}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="areaOfCounselling-Status">Status</InputLabel>
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
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="areaOfCounselling-Status">Is Disabled?</InputLabel>
                        <Switch edge="start" onChange={(val) => handleToggle(val)} checked={checked == 1 ? true : false} />
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

FormAreaOfCounsellingAdd.propTypes = { areaOfCounselling: PropTypes.any, closeModal: PropTypes.func };
