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
import LoadingButton from 'components/@extended/LoadingButton';
import { EyeInvisibleOutlined, EyeOutlined, LoadingOutlined } from '@ant-design/icons';
import { InputAdornment, OutlinedInput, FormHelperText } from '@mui/material';
import IconButton from 'components/@extended/IconButton';

const getInitialValues = (settings) => {
  const newSettings = {
    smtp_email: '',
    smtp_password: '',
    smtp_host: '',
    smtp_port: ''
  };

  if (settings) {
    return _.merge({}, newSettings, settings);
  }

  return newSettings;
};

// ==============================|| LAYOUTS - STICKY ACTIONBAR ||============================== //

export default function SmtpSettings() {
  const { menuOrientation } = useConfig();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiResponseError, setApiResponseError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setApiResponseError('');
    setLoading(false);
    getSettings();
  }, []);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const getSettings = async () => {
    setLoading(true);
    const response = await AuthService.axiosPrivatePost('/getSMTPSettings');
    setLoading(false);
    if (response.data.status) {
      setData(response.data.data);
    }
  };

  const UpdateSettingsSchema = Yup.object().shape({
    smtp_email: Yup.string().required('SMTP email is required').email('Must be a valid email'),
    smtp_password: Yup.string().max(255).required('SMTP password is required'),
    smtp_host: Yup.string().max(255).required('SMTP host is required'),
    smtp_port: Yup.number().required('SMTP port is required').typeError('Please enter Number only')
  });

  const formik = useFormik({
    initialValues: getInitialValues(data),
    validationSchema: UpdateSettingsSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        let newSettings = values;
        try {
          const response = await AuthService.axiosPrivateFormdataPost('/updateSMTPSettings', newSettings);
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
  const { errors, touched, handleSubmit, isSubmitting, getFieldProps, handleBlur, handleChange } = formik;
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
                      SMTP settings:
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
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' } }}>SMTP Email :</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={6}>
                          <TextField
                            fullWidth
                            placeholder="Enter SMTP email"
                            id="admin-smtp_email"
                            {...getFieldProps('smtp_email')}
                            error={Boolean(touched.smtp_email && errors.smtp_email)}
                            helperText={touched.smtp_email && errors.smtp_email}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={4} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' } }}>SMTP Password :</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={6}>
                          <OutlinedInput
                            fullWidth
                            id="admin-smtp_password"
                            type={showPassword ? 'text' : 'password'}
                            {...getFieldProps('smtp_password')}
                            name="smtp_password"
                            onBlur={handleBlur}
                            onChange={handleChange}
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
                            error={Boolean(touched.smtp_password && errors.smtp_password)}
                            helperText={touched.smtp_password && errors.smtp_password}
                            placeholder="Enter password"
                          />
                          {touched.smtp_password && errors.smtp_password && (
                            <FormHelperText error id="standard-weight-helper-text-smtp_password-login">
                              {errors.smtp_password}
                            </FormHelperText>
                          )}
                        </Grid>
                        <Grid item xs={12} sm={3} lg={4} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' } }}>SMTP Host :</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={6}>
                          <TextField
                            fullWidth
                            placeholder="Enter SMTP Host"
                            id="admin-smtp_host"
                            {...getFieldProps('smtp_host')}
                            error={Boolean(touched.smtp_host && errors.smtp_host)}
                            helperText={touched.smtp_host && errors.smtp_host}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={4} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' } }}>SMTP Port :</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={6}>
                          <TextField
                            fullWidth
                            type="number"
                            placeholder="Enter SMTP Port"
                            id="admin-smtp_port"
                            {...getFieldProps('smtp_port')}
                            error={Boolean(touched.smtp_port && errors.smtp_port)}
                            helperText={touched.smtp_port && errors.smtp_port}
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
