// material-ui
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

// project imports
import MainCard from 'components/MainCard';
import useConfig from 'hooks/useConfig';
import { MenuOrientation } from 'config';
import _ from 'lodash';
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';
import { openSnackbar } from 'api/snackbar';
import { useEffect, useState } from 'react';
import { AuthService } from 'services';
import CircularWithPath from 'components/@extended/progress/CircularWithPath';
import { useTheme } from '@mui/material/styles';
import { LoadingOutlined } from '@ant-design/icons';
import LoadingButton from 'components/@extended/LoadingButton';

const getInitialValues = (seoData) => {
  const newSEOData = {
    home_meta_title: '',
    home_meta_keyword: '',
    home_meta_description: ''
  };

  if (seoData) {
    return _.merge({}, newSEOData, seoData);
  }

  return newSEOData;
};

// ==============================|| LAYOUTS - STICKY ACTIONBAR ||============================== //

export default function GeneralSettings() {
  const theme = useTheme();
  const { menuOrientation } = useConfig();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiResponseError, setApiResponseError] = useState('');

  useEffect(() => {
    setApiResponseError('');
    setLoading(false);
    getSEODataByPage();
  }, []);

  const getSEODataByPage = async () => {
    setLoading(true);
    const response = await AuthService.axiosPrivatePost('/getSEO', { page: 'home' });

    setLoading(false);
    if (response.data.status) {
      setData(response.data.data);
    }
  };

  const UpdateSEOSchema = Yup.object().shape({
    home_meta_title: Yup.string().required('Meta title is required'),
    home_meta_keyword: Yup.string().required('Meta keyword is required'),
    home_meta_description: Yup.string().required('Meta description is required')
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: getInitialValues(data),
    validationSchema: UpdateSEOSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        let newSEOData = values;

        const updatedData = {
          page: 'home',
          title: values.home_meta_title,
          keyword: values.home_meta_keyword,
          description: values.home_meta_description
        };

        try {
          const response = await AuthService.axiosPrivateFormdataPost('/updateSEO', updatedData);
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
          } else {
            openSnackbar({
              open: true,
              message: response.data.message,
              variant: 'alert',
              alert: {
                color: 'warning'
              }
            });
          }
        } catch (error) {}
      } catch (error) {
        console.log(error);
      }
    }
  });
  const { errors, touched, handleSubmit, isSubmitting, getFieldProps, setFieldValue } = formik;
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        {loading ? (
          <Stack direction="row" justifyContent="center">
            <CircularWithPath />
          </Stack>
        ) : (
          <FormikProvider value={formik}>
            <Form autoComplete="off" noValidate onSubmit={handleSubmit} disabled={isSubmitting}>
              <MainCard content={false} sx={{ overflow: 'visible' }}>
                <CardActions
                  sx={{
                    position: 'sticky',
                    top: menuOrientation === MenuOrientation.VERTICAL ? 60 : 120,
                    bgcolor: 'background.default',
                    zIndex: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: 1 }}>
                    <Typography variant="h5" sx={{ m: 0, pl: 1.5 }}>
                      Home page SEO settings:
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ px: 1.5, py: 0.75 }}>
                      {/* <Button color="error" size="small">
                        Cancel
                      </Button> */}
                      <LoadingButton
                        endIcon={isSubmitting && <LoadingOutlined />}
                        type="submit"
                        variant="contained"
                        size="small"
                        disabled={isSubmitting}
                      >
                        Save
                      </LoadingButton>
                    </Stack>
                  </Stack>
                </CardActions>
                <CardContent>
                  <Grid container spacing={0} alignItems="center">
                    <Grid item xs={12}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={3} lg={4} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' } }}>Title :</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={6}>
                          <TextField
                            fullWidth
                            placeholder="Enter SEO Title"
                            id="admin-home_meta_title"
                            {...getFieldProps('home_meta_title')}
                            error={Boolean(touched.home_meta_title && errors.home_meta_title)}
                            helperText={touched.home_meta_title && errors.home_meta_title}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={4} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' } }}>Keyword :</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={6}>
                          <TextField
                            fullWidth
                            placeholder="Enter SEO Keyword"
                            id="admin-home_meta_keyword"
                            {...getFieldProps('home_meta_keyword')}
                            error={Boolean(touched.home_meta_keyword && errors.home_meta_keyword)}
                            helperText={touched.home_meta_keyword && errors.home_meta_keyword}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={4} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' } }}>Description :</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={6}>
                          <TextField
                            fullWidth
                            multiline
                            className="muiTextArea"
                            maxRows={4}
                            placeholder="Enter SEO Description"
                            id="admin-home_meta_description"
                            {...getFieldProps('home_meta_description')}
                            error={Boolean(touched.home_meta_description && errors.home_meta_description)}
                            helperText={touched.home_meta_description && errors.home_meta_description}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </CardContent>
                <Divider />
                <CardActions>
                  <Stack direction="row" spacing={1} justifyContent="center" sx={{ width: 1, px: 1.5, py: 0.75 }}>
                    <LoadingButton
                      endIcon={isSubmitting && <LoadingOutlined />}
                      type="submit"
                      variant="contained"
                      size="small"
                      disabled={isSubmitting}
                    >
                      Save
                    </LoadingButton>
                  </Stack>
                </CardActions>
              </MainCard>
            </Form>
          </FormikProvider>
        )}
      </Grid>
    </Grid>
  );
}
