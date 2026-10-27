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
import Tooltip from '@mui/material/Tooltip';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';

// third-party
import _ from 'lodash';
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';

// project imports
import IconButton from 'components/@extended/IconButton';
import CircularWithPath from 'components/@extended/progress/CircularWithPath';

import { Status } from 'config';
import { openSnackbar } from 'api/snackbar';

// assets
import { AuthService } from 'services';

// constant
const getInitialValues = (faq) => {
  const newFaq = {
    title: '',
    description: '',
    status: '1'
  };

  if (faq) {
    return _.merge({}, newFaq, faq);
  }

  return newFaq;
};

// ==============================|| CUSTOMER ADD / EDIT - FORM ||============================== //

export default function FormFaqAdd({ faq, closeModal, isSucess }) {
  const [loading, setLoading] = useState(true);
  const [apiResponseError, setApiResponseError] = useState('');

  useEffect(() => {
    setApiResponseError('');
    setLoading(false);
  }, []);

  const FaqSchema = Yup.object().shape({
    title: Yup.string().max(255).required('Field is required'),
    description: Yup.string().max(255).required('Field is required'),
    status: Yup.string().oneOf(['0', '1'], 'Invalid status').required('Status is required')
  });

  const [openAlert, setOpenAlert] = useState(false);

  const handleAlertClose = () => {
    setOpenAlert(!openAlert);
    closeModal();
  };
  const formik = useFormik({
    initialValues: getInitialValues(faq),
    validationSchema: FaqSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        let newFaq = values;
        newFaq.description = newFaq.description;
        if (faq) {
          try {
            const payload = {
              benefits_of_engaging_in_counselling_id: String(newFaq.benefits_of_engaging_in_counselling_id),
              description: newFaq.description,
              title: newFaq.title,
              status: String(newFaq.status)
            };
            const response = await AuthService.axiosPrivatePost('/updateBenefitsOfEngagingInCounselling', payload);
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
              description: newFaq.description,
              title: newFaq.title,
              status: String(newFaq.status)
            };
            const response = await AuthService.axiosPrivatePost('/addBenefitsOfEngagingInCounselling', payload);

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
  const handleSucess = () => {
    isSucess();
    closeModal();
  };
  return (
    <>
      <FormikProvider value={formik}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
            <DialogTitle>{faq ? 'Edit Benefits Of Engaging In Counselling' : 'New Benefits Of Engaging In Counselling'}</DialogTitle>
            <Divider />
            <DialogContent sx={{ p: 2.5 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={12} justifyContent="center" sx={{ ml: 5, mr: 5 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="faq-title">Title</InputLabel>
                        <TextField
                          fullWidth
                          id="faq-title"
                          placeholder="Enter title"
                          {...getFieldProps('title')}
                          error={Boolean(touched.title && errors.title)}
                          helperText={touched.title && errors.title}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="faq-description">Description</InputLabel>
                        <TextField
                          id="outlined-multiline-static"
                          fullWidth
                          multiline
                          className="muiTextArea"
                          rows={5}
                          placeholder="Enter description"
                          {...getFieldProps('description')}
                          error={Boolean(touched.description && errors.description)}
                          helperText={touched.description && errors.description}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="faq-Status">Status</InputLabel>
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

FormFaqAdd.propTypes = { faq: PropTypes.any, closeModal: PropTypes.func };
