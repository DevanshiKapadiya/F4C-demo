import PropTypes from 'prop-types';

// material-ui
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
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

// third-party
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';

// project imports
import LoadingButton from 'components/@extended/LoadingButton';
import { LoadingOutlined } from '@ant-design/icons';
import { Status } from 'config';
import { openSnackbar } from 'api/snackbar';
import { AuthService } from 'services';

const CategorySchema = Yup.object().shape({
  title: Yup.string().trim().max(150, 'Title must be 150 characters or less').required('Title is required'),
  status: Yup.string().oneOf(['0', '1'], 'Invalid status').required('Status is required')
});

// ==============================|| FAQ CATEGORY - ADD / EDIT FORM ||============================== //

export default function FormFaqCategory({ category, closeModal, isSucess }) {
  const formik = useFormik({
    initialValues: {
      title: category?.title || '',
      status: category ? String(category.status) : '1'
    },
    validationSchema: CategorySchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = { title: values.title.trim(), status: String(values.status) };
        let response;
        if (category) {
          response = await AuthService.axiosPrivatePost('/updateFaqCategory', {
            ...payload,
            faq_category_id: String(category.faq_category_id)
          });
        } else {
          response = await AuthService.axiosPrivatePost('/createFaqCategory', payload);
        }

        openSnackbar({
          open: true,
          message: response.data.status ? (category ? 'FAQ category updated' : 'FAQ category added') : response.data.message,
          variant: 'alert',
          alert: { color: response.data.status ? 'success' : 'error' }
        });
        if (response.data.status) isSucess();
      } catch (error) {
        openSnackbar({
          open: true,
          message: error?.response?.data?.message || 'Unable to save FAQ category',
          variant: 'alert',
          alert: { color: 'error' }
        });
      } finally {
        setSubmitting(false);
      }
    }
  });

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps } = formik;

  return (
    <FormikProvider value={formik}>
      <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
        <DialogTitle sx={{ px: { xs: 2.5, sm: 3 }, py: 2, pr: 7 }}>{category ? 'Edit FAQ Category' : 'New FAQ Category'}</DialogTitle>
        <Divider />
        <DialogContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Stack spacing={2.5}>
            <Stack spacing={1}>
              <InputLabel htmlFor="faq-category-title">Title</InputLabel>
              <TextField
                fullWidth
                id="faq-category-title"
                placeholder="Enter category title"
                {...getFieldProps('title')}
                error={Boolean(touched.title && errors.title)}
                helperText={touched.title && errors.title}
              />
            </Stack>
            <Stack spacing={1}>
              <InputLabel>Status</InputLabel>
              <FormControl error={Boolean(touched.status && errors.status)}>
                <RadioGroup row name="status" value={formik.values.status} onChange={formik.handleChange}>
                  <FormControlLabel value="1" control={<Radio />} label={Status.ACTIVE} />
                  <FormControlLabel value="0" control={<Radio />} label={Status.INACTIVE} />
                </RadioGroup>
                {touched.status && errors.status && <FormHelperText>{errors.status}</FormHelperText>}
              </FormControl>
            </Stack>
          </Stack>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: { xs: 2.5, sm: 3 }, py: 2 }}>
          <Grid container justifyContent="space-between" alignItems="center">
            <Grid item />
            <Grid item>
              <Stack direction="row" spacing={1.5} alignItems="center">
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
    </FormikProvider>
  );
}

FormFaqCategory.propTypes = { category: PropTypes.any, closeModal: PropTypes.func, isSucess: PropTypes.func };
