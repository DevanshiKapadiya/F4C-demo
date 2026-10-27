import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

/* material-ui */
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

/* third-party */
import _ from 'lodash';
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';

/* project imports */
import CircularWithPath from 'components/@extended/progress/CircularWithPath';

import { Status } from 'config';
import { openSnackbar } from 'api/snackbar';

/* assets */
import { AuthService } from 'services';
import { Alert, FormControl, FormHelperText, MenuItem, OutlinedInput, Select, Snackbar, Switch } from '@mui/material';
import LoadingButton from 'components/@extended/LoadingButton';
import { LoadingOutlined } from '@ant-design/icons';

/* constant */
const getInitialValues = (therapy) => {
  const newTherapyCategory = {
    therapy: '',
    info_text: '',
    is_disabled: 0,
    status: '1',
    therapy_category_id: ''
  };

  if (therapy) {
    return _.merge({}, newTherapyCategory, therapy);
  }

  return newTherapyCategory;
};

/* ==============================|| THERAPY ADD / EDIT - FORM ||============================== */

export default function FormTherapyCategoryAdd({ therapy, closeModal, isSucess }) {
  const [loading, setLoading] = useState(true);
  const [apiResponseError, setApiResponseError] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [therapyList, setTherapyCategoryList] = useState([]);
  const [therapyCategory, setTherapyCategory] = useState(therapy?.therapy_category_id || '');

  /* Formik validation schema */
  const TherapyCategorySchema = Yup.object().shape({
    therapy_category_id: Yup.string().required('Therapy Category is required'),
    therapy: Yup.string().max(255).required('Therapy is required'),
    status: Yup.string().oneOf(['0', '1'], 'Invalid status').required('Status is required'),
    info_text: Yup.string().optional() /* Assuming info_text is optional */
  });

  const formik = useFormik({
    initialValues: getInitialValues(therapy),
    validationSchema: TherapyCategorySchema,
    enableReinitialize: true,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        /* Explicitly mark fields as touched on submit to show validation errors */
        formik.setTouched({
          therapy_category_id: true,
          therapy: true,
          status: true,
          info_text: true
        });

        if (!formik.isValid) {
          return; /* Prevent submission if form is invalid */
        }

        let newTherapyCategory = values;
        newTherapyCategory.therapy_category_id = therapyCategory;

        const payload = {
          therapy_category_id: String(newTherapyCategory.therapy_category_id),
          therapy: newTherapyCategory.therapy,
          info_text: newTherapyCategory.info_text,
          is_disabled: String(newTherapyCategory.is_disabled),
          status: String(newTherapyCategory.status)
        };

        let response;
        if (therapy) {
          try {
            /* Update existing therapy */
            response = await AuthService.axiosPrivatePost('/updateTherapy', { ...payload, therapy_id: String(therapy.therapy_id) });
          } catch (error) {
            console.error('Error updating therapy:', error);
            setApiResponseError(response.data.message);
            setShowSnackbar(true);
            return;
          }
        } else {
          try {
            /* Add new therapy */
            response = await AuthService.axiosPrivatePost('/addTherapy', payload);
          } catch (error) {
            console.error('Error adding therapy:', error);
            setApiResponseError(response.data.message);
            setShowSnackbar(true);
            return;
          }
        }

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
        }
      } catch (error) {
        console.error('Error during form submission:', error);
        setApiResponseError(response.data.message);
        setShowSnackbar(true);
      }
    }
  });

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps, setFieldValue } = formik;

  const getTherapyCategory = async () => {
    setLoading(true);
    setApiResponseError('');
    try {
      const response = await AuthService.axiosPrivatePost('/therapyCategoryListForTherapy');
      setLoading(false);
      if (response.data.status) {
        setTherapyCategoryList(response?.data?.data);
      } else {
        setApiResponseError(response.data.message);
      }
    } catch (error) {
      setLoading(false);
      setApiResponseError('An error occurred while fetching therapy categories.');
    }
  };

  useEffect(() => {
    getTherapyCategory();
    setApiResponseError('');
  }, []);

  const handleChange = (event) => {
    setTherapyCategory(event.target.value);
    formik.setFieldValue('therapy_category_id', event.target.value);
  };

  const handleToggle = (event) => {
    setFieldValue('is_disabled', event.target.checked ? '1' : '0');
  };

  if (loading) {
    return (
      <Box sx={{ p: 5 }}>
        <Stack direction="row" justifyContent="center">
          <CircularWithPath />
        </Stack>
      </Box>
    );
  }

  return (
    <>
      <FormikProvider value={formik}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Form autoComplete="off" noValidate onSubmit={formik.handleSubmit}>
            <DialogTitle>{therapy ? 'Edit therapy' : 'New therapy'}</DialogTitle>
            <Divider />
            <DialogContent sx={{ p: 2.5 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={12} justifyContent="center" sx={{ ml: 5, mr: 5 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Stack spacing={1}>
                        <FormControl fullWidth error={formik.touched.therapy_category_id && Boolean(formik.errors.therapy_category_id)}>
                          <Select
                            displayEmpty
                            value={formik.values.therapy_category_id}
                            onChange={handleChange}
                            onBlur={formik.handleBlur}
                            input={<OutlinedInput />}
                            name="therapy_category_id"
                            renderValue={(selected) => {
                              if (!selected) {
                                return 'Select Therapy Category';
                              }
                              return therapyList.find((item) => item.therapy_category_id === selected)?.therapy_category || '';
                            }}
                          >
                            <MenuItem disabled value="">
                              Select Therapy Category
                            </MenuItem>
                            {therapyList.map((item, index) => (
                              <MenuItem value={item.therapy_category_id} key={index}>
                                {item.therapy_category}
                              </MenuItem>
                            ))}
                          </Select>
                          {formik.touched.therapy_category_id && formik.errors.therapy_category_id && (
                            <FormHelperText>{formik.errors.therapy_category_id}</FormHelperText>
                          )}
                        </FormControl>
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="therapy-therapy">Therapy</InputLabel>
                        <TextField
                          fullWidth
                          id="therapy-therapy"
                          placeholder="Enter therapy"
                          {...getFieldProps('therapy')}
                          error={Boolean(touched.therapy && errors.therapy)}
                          helperText={touched.therapy && errors.therapy}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="therapy-info_text">Info Text</InputLabel>
                        <TextField
                          fullWidth
                          id="therapy-info_text"
                          placeholder="Enter info text"
                          multiline
                          rows={3}
                          {...getFieldProps('info_text')}
                          error={Boolean(touched.info_text && errors.info_text)}
                          helperText={touched.info_text && errors.info_text}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="therapy-Status">Status</InputLabel>
                        <RadioGroup
                          row
                          aria-label="payment-card"
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
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="therapy-Status">Is Disabled?</InputLabel>
                        <Switch edge="start" onChange={handleToggle} checked={formik.values.is_disabled == '1'} />
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

FormTherapyCategoryAdd.propTypes = {
  therapy: PropTypes.any,
  closeModal: PropTypes.func,
  isSucess: PropTypes.func
};
