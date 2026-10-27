import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

// third-party
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';

// project imports
import CircularWithPath from 'components/@extended/progress/CircularWithPath';
import LoadingButton from 'components/@extended/LoadingButton';
import { LoadingOutlined } from '@ant-design/icons';
import { Status } from 'config';
import { openSnackbar } from 'api/snackbar';
import { AuthService } from 'services';

const FaqSchema = Yup.object().shape({
  category_id: Yup.string().required('Please select a category'),
  question: Yup.string().trim().max(255, 'Question must be 255 characters or less').required('Question is required'),
  answer: Yup.string().trim().required('Answer is required'),
  status: Yup.string().oneOf(['0', '1'], 'Invalid status').required('Status is required')
});

// ==============================|| FAQ - ADD / EDIT FORM ||============================== //

export default function FormFaq({ faq, closeModal, isSucess, onSaved, defaultCategoryId }) {
  const [categories, setCategories] = useState(null);
  /* "Save & Add Another" keeps the form open with the same category selected */
  const addAnother = useRef(false);

  /* The category dropdown is loaded from the FAQ Category table */
  useEffect(() => {
    AuthService.axiosPrivatePost('/faqCategoryOptions')
      .then((response) => setCategories(response.data.status ? response.data.data : []))
      .catch(() => setCategories([]));
  }, []);

  const formik = useFormik({
    initialValues: {
      category_id: faq?.category_id ? String(faq.category_id) : defaultCategoryId ? String(defaultCategoryId) : '',
      question: faq?.question || '',
      answer: faq?.answer || '',
      status: faq ? String(faq.status) : '1'
    },
    validationSchema: FaqSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const payload = {
          category_id: String(values.category_id),
          question: values.question.trim(),
          answer: values.answer.trim(),
          status: String(values.status)
        };
        let response;
        if (faq) {
          response = await AuthService.axiosPrivatePost('/updateFaq', { ...payload, faq_id: String(faq.faq_id) });
        } else {
          response = await AuthService.axiosPrivatePost('/createFaq', payload);
        }

        openSnackbar({
          open: true,
          message: response.data.status ? (faq ? 'FAQ updated' : 'FAQ added') : response.data.message,
          variant: 'alert',
          alert: { color: response.data.status ? 'success' : 'error' }
        });
        if (response.data.status) {
          if (addAnother.current && !faq) {
            resetForm({ values: { category_id: values.category_id, question: '', answer: '', status: values.status } });
            onSaved?.();
          } else {
            isSucess();
          }
        }
      } catch (error) {
        openSnackbar({
          open: true,
          message: error?.response?.data?.message || 'Unable to save FAQ',
          variant: 'alert',
          alert: { color: 'error' }
        });
      } finally {
        setSubmitting(false);
      }
    }
  });

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps } = formik;

  if (categories === null) {
    return (
      <Box sx={{ p: 5 }}>
        <Stack direction="row" justifyContent="center">
          <CircularWithPath />
        </Stack>
      </Box>
    );
  }

  /* Inactive categories can't be picked for new FAQs, but the one already chosen stays visible */
  const selectable = categories.filter((item) => Number(item.status) === 1 || String(item.faq_category_id) === formik.values.category_id);

  /* Step 1 is choosing the category; the FAQ fields unlock once one is selected */
  const hasCategory = Boolean(formik.values.category_id);

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <DialogTitle>{faq ? 'Edit FAQ' : 'New FAQ'}</DialogTitle>
        <Divider />
        <DialogContent sx={{ p: 2.5 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12} justifyContent="center" sx={{ ml: { xs: 0, sm: 2, md: 5 }, mr: { xs: 0, sm: 2, md: 5 } }}>
              <Grid container spacing={3}>
                {/* Category */}
                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="faq-category">Category *</InputLabel>
                    <FormControl fullWidth error={Boolean(touched.category_id && errors.category_id)}>
                      <Select
                        id="faq-category"
                        displayEmpty
                        {...getFieldProps('category_id')}
                        renderValue={(selected) => {
                          if (!selected) return 'Select category';
                          const match = categories.find((item) => String(item.faq_category_id) === String(selected));
                          return match ? `${match.title} (${match.faq_count ?? 0})` : '';
                        }}
                      >
                        {selectable.length === 0 && (
                          <MenuItem disabled value="">
                            No category found. Add a FAQ Category first.
                          </MenuItem>
                        )}
                        {selectable.map((item) => (
                          <MenuItem key={item.faq_category_id} value={String(item.faq_category_id)}>
                            {`${item.title} (${item.faq_count ?? 0})`}
                            {Number(item.status) !== 1 ? ' (Inactive)' : ''}
                          </MenuItem>
                        ))}
                      </Select>
                      {touched.category_id && errors.category_id ? (
                        <FormHelperText>{errors.category_id}</FormHelperText>
                      ) : (
                        !hasCategory && <FormHelperText>Select a category first, then add the question and answer.</FormHelperText>
                      )}
                    </FormControl>
                  </Stack>
                </Grid>

                {/* Question */}
                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="faq-question">Question *</InputLabel>
                    <TextField
                      fullWidth
                      id="faq-question"
                      placeholder="Enter question"
                      disabled={!hasCategory}
                      {...getFieldProps('question')}
                      error={Boolean(touched.question && errors.question)}
                      helperText={touched.question && errors.question}
                    />
                  </Stack>
                </Grid>

                {/* Answer */}
                <Grid item xs={12}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="faq-answer">Answer *</InputLabel>
                    <TextField
                      id="faq-answer"
                      fullWidth
                      multiline
                      rows={5}
                      placeholder="Enter answer"
                      disabled={!hasCategory}
                      {...getFieldProps('answer')}
                      error={Boolean(touched.answer && errors.answer)}
                      helperText={touched.answer && errors.answer}
                    />
                  </Stack>
                </Grid>

                {/* Status */}
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <InputLabel htmlFor="faq-status">Status</InputLabel>
                    <FormControl error={Boolean(touched.status && errors.status)}>
                      <RadioGroup row name="status" value={formik.values.status} onChange={formik.handleChange}>
                        <FormControlLabel value="1" control={<Radio />} label={Status.ACTIVE} disabled={!hasCategory} />
                        <FormControlLabel value="0" control={<Radio />} label={Status.INACTIVE} disabled={!hasCategory} />
                      </RadioGroup>
                      {touched.status && errors.status && <FormHelperText>{errors.status}</FormHelperText>}
                    </FormControl>
                  </Stack>
                </Grid>
              </Grid>
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
                {!faq && (
                  <Button
                    variant="outlined"
                    disabled={isSubmitting || !hasCategory}
                    onClick={() => {
                      addAnother.current = true;
                      handleSubmit();
                    }}
                  >
                    Save &amp; Add Another
                  </Button>
                )}
                <LoadingButton
                  endIcon={isSubmitting && <LoadingOutlined />}
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting || !hasCategory}
                  onClick={() => {
                    addAnother.current = false;
                  }}
                >
                  {isSubmitting ? 'Saving…' : 'Save'}
                </LoadingButton>
              </Stack>
            </Grid>
          </Grid>
        </DialogActions>
      </Form>
    </FormikProvider>
  );
}

FormFaq.propTypes = {
  faq: PropTypes.any,
  closeModal: PropTypes.func,
  isSucess: PropTypes.func,
  onSaved: PropTypes.func,
  defaultCategoryId: PropTypes.any
};
