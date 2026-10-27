// material-ui
import Button from '@mui/material/Button';
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
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import { Link } from 'react-router-dom';
import { LoadingOutlined } from '@ant-design/icons';
import LoadingButton from 'components/@extended/LoadingButton';

const getInitialValues = (settings) => {
  const newSettings = {
    benefits_of_counselling_description: '',
    is_counselling_right_for_you_description: ''
  };

  if (settings) {
    return _.merge({}, newSettings, settings);
  }

  return newSettings;
};

// ==============================|| LAYOUTS - STICKY ACTIONBAR ||============================== //

export default function BenefitsOfCounselling() {
  const theme = useTheme();
  const { menuOrientation } = useConfig();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiResponseError, setApiResponseError] = useState('');

  useEffect(() => {
    setApiResponseError('');
    setLoading(false);
    getSettings();
  }, []);

  const getSettings = async () => {
    setLoading(true);
    const response = await AuthService.axiosPrivatePost('/getCMSBenefitsOfCounselling');
    setLoading(false);
    if (response.data.status) {
      setData(response.data.data);
    }
  };

  const UpdateSettingsSchema = Yup.object().shape({
    benefits_of_counselling_description: Yup.string().required('Field is required'),
    is_counselling_right_for_you_description: Yup.string().required('Field is required')
  });

  const formik = useFormik({
    initialValues: getInitialValues(data),
    validationSchema: UpdateSettingsSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        let newSettings = values;
        try {
          const response = await AuthService.axiosPrivateFormdataPost('/updateCMSBenefitsOfCounselling', newSettings);
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
      {/* <Grid item xs={12}>
        <Grid item className="customBreadcrumb">
          <Link className="homeClass" to="/" aria-label="breadcrumb">
            Home
          </Link>
          <span className="seprator" aria-label="breadcrumb">
            /
          </span>
          <span className="activeClass" aria-label="breadcrumb">
            Benefits Of Counselling
          </span>
        </Grid>
        <Grid item sx={{ mt: 0.25 }}>
          <Typography variant="h2">Benefits Of Counselling</Typography>
        </Grid>
      </Grid> */}
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
                      Benefits Of Counselling Page Settings:
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
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            Benefits of counselling description :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            multiline
                            className="muiTextArea"
                            rows={6}
                            placeholder="Enter benefits of counselling description"
                            id="admin-benefits_of_counselling_description"
                            {...getFieldProps('benefits_of_counselling_description')}
                            error={Boolean(touched.benefits_of_counselling_description && errors.benefits_of_counselling_description)}
                            helperText={touched.benefits_of_counselling_description && errors.benefits_of_counselling_description}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            Is counselling right for you description :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            multiline
                            className="muiTextArea"
                            rows={6}
                            placeholder="Enter is counselling right for you description"
                            id="admin-is_counselling_right_for_you_description"
                            {...getFieldProps('is_counselling_right_for_you_description')}
                            error={Boolean(
                              touched.is_counselling_right_for_you_description && errors.is_counselling_right_for_you_description
                            )}
                            helperText={touched.is_counselling_right_for_you_description && errors.is_counselling_right_for_you_description}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </CardContent>
                <Divider />
                <CardActions>
                  <Stack direction="row" spacing={1} justifyContent="center" sx={{ width: 1, px: 1.5, py: 0.75 }}>
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
                </CardActions>
              </MainCard>
            </Form>
          </FormikProvider>
        )}
      </Grid>
    </Grid>
  );
}
