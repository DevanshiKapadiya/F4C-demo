/* material-ui */
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

/* project imports */
import MainCard from 'components/MainCard';
import useConfig from 'hooks/useConfig';
import { MenuOrientation } from 'config';
import CameraOutlined from '@ant-design/icons/CameraOutlined';
import _ from 'lodash';
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';
import { openSnackbar } from 'api/snackbar';
import { useEffect, useState } from 'react';
import { AuthService } from 'services';
import CircularWithPath from 'components/@extended/progress/CircularWithPath';
import { Box, FormLabel } from '@mui/material';
import Avatar from 'components/@extended/Avatar';
import { useTheme } from '@mui/material/styles';
import defaultImages from 'assets/images/users/avatar-1.png';
import { LoadingOutlined } from '@ant-design/icons';
import LoadingButton from 'components/@extended/LoadingButton';
import useFileCheck from 'hooks/useFileCheck';

const getInitialValues = (settings) => {
  const newSettings = {
    logo: '',
    favicon: '',
    website_title: '',
    email_receiver: '',
    email_sender: '',
    free_plan_duration_in_month: '',
    footer_logo: '',
    address: '',
    complaints_policy: '',
    copyright_text: '',
    facebook: '',
    footer_description: '',
    footer_email: '',
    instagram: '',
    linkedin: '',
    phone: '',
    terms_and_conditions: '',
    twitter: '',
    youtube: ''
  };

  if (settings) {
    return _.merge({}, newSettings, settings);
  }

  return newSettings;
};

/* ==============================|| LAYOUTS - STICKY ACTIONBAR ||============================== */

export default function GeneralSettings() {
  const theme = useTheme();
  const { menuOrientation } = useConfig();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLogo, setSelectedLogo] = useState(undefined);
  const [selectedFavIcon, setSelectedFavIcon] = useState(undefined);
  const [selectedFooterLogo, setSelectedFooterLogo] = useState(undefined);
  const [avatar, setAvatar] = useState(defaultImages);
  const [avatar2, setAvatar2] = useState(defaultImages);
  const [avatar3, setAvatar3] = useState(defaultImages);
  const [apiResponseError, setApiResponseError] = useState('');

  useEffect(() => {
    setApiResponseError('');
    setLoading(false);
    getSettings();
  }, []);

  const getSettings = async () => {
    setLoading(true);
    const response = await AuthService.axiosPrivatePost('/getSiteSettings');
    setLoading(false);
    if (response.data.status) {
      setData(response.data.data);
      setAvatar(response.data.data.logo);
      setAvatar2(response.data.data.favicon);
      setAvatar3(response.data.data.footer_logo);
    }
  };

  const UpdateSettingsSchema = Yup.object().shape({
    /* logo: Yup.string().required('Logo is required'),
    favicon: Yup.string().required('Favicon is required'),
    footer_logo: Yup.string().required('Footer logo is required'), */
    website_title: Yup.string().max(255).required('Website title is required'),
    free_plan_duration_in_month: Yup.number()
      .required('Free plan duration in month is required')
      .typeError('Please enter month in Number only'),
    email_sender: Yup.string().required('Email sender is required').email('Must be a valid email'),
    email_receiver: Yup.string().required('Email receiver is required').email('Must be a valid email'),
    footer_email: Yup.string().required('Footer email is required'),
    footer_description: Yup.string().required('Footer description is required'),
    address: Yup.string().required('Address is required'),
    phone: Yup.string().required('Phone is required'),
    copyright_text: Yup.string().required('Copyright text is required')
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: getInitialValues(data),
    validationSchema: UpdateSettingsSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        let newSettings = values;
        newSettings.logo = selectedLogo ? selectedLogo : '';
        newSettings.favicon = selectedFavIcon ? selectedFavIcon : '';
        newSettings.footer_logo = selectedFooterLogo ? selectedFooterLogo : '';
        try {
          const response = await AuthService.axiosPrivateFormdataPost('/updateSiteSettings', newSettings);
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
                      General Site settings:
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
                        {/* Start */}
                        <Grid item xs={12}>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={3} lg={4} sx={{ mt: { xs: 2, sm: '0 !important' } }}></Grid>
                            <Grid item xs={12} sm={9} lg={6}>
                              <Typography variant="h3" sx={{ mb: 0 }}>
                                General site settings
                              </Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item xs={12}>
                          <Divider />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>Logo :</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={2}>
                          <Stack spacing={2.5} alignItems="baseline">
                            <FormLabel
                              htmlFor="change-avtar-logo"
                              sx={{
                                position: 'relative',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                '&:hover .MuiBox-root': { opacity: 1 },
                                cursor: 'pointer'
                              }}
                            >
                              <Avatar alt="Avatar 1" src={avatar} sx={{ width: 124, height: 124, border: '1px dashed' }} />
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  background:
                                    theme.palette.mode === theme.palette.mode.DARK ? 'rgba(255, 255, 255, .75)' : 'rgba(0,0,0,.65)',
                                  width: '100%',
                                  height: '100%',
                                  opacity: 0,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <Stack spacing={0.5} alignItems="center">
                                  <CameraOutlined style={{ color: theme.palette.secondary.lighter, fontSize: '2rem' }} />
                                  <Typography sx={{ color: 'secondary.lighter' }}>Upload</Typography>
                                </Stack>
                              </Box>
                            </FormLabel>
                            <TextField
                              type="file"
                              id="change-avtar-logo"
                              placeholder="Outlined"
                              variant="outlined"
                              sx={{ display: 'none' }}
                              onChange={(e) => {
                                if (useFileCheck(e)) {
                                  setSelectedLogo(e.target.files?.[0]);
                                  setAvatar(URL.createObjectURL(e.target.files?.[0]));
                                }
                              }}
                            />
                          </Stack>
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>Favicon :</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={2}>
                          <Stack spacing={2.5} alignItems="baseline">
                            <FormLabel
                              htmlFor="change-avtar-favicon"
                              sx={{
                                position: 'relative',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                '&:hover .MuiBox-root': { opacity: 1 },
                                cursor: 'pointer'
                              }}
                            >
                              <Avatar alt="Avatar 2" src={avatar2} sx={{ width: 124, height: 124, border: '1px dashed' }} />
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  background:
                                    theme.palette.mode === theme.palette.mode.DARK ? 'rgba(255, 255, 255, .75)' : 'rgba(0,0,0,.65)',
                                  width: '100%',
                                  height: '100%',
                                  opacity: 0,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <Stack spacing={0.5} alignItems="center">
                                  <CameraOutlined style={{ color: theme.palette.secondary.lighter, fontSize: '2rem' }} />
                                  <Typography sx={{ color: 'secondary.lighter' }}>Upload</Typography>
                                </Stack>
                              </Box>
                            </FormLabel>
                            <TextField
                              type="file"
                              id="change-avtar-favicon"
                              placeholder="Outlined"
                              variant="outlined"
                              sx={{ display: 'none' }}
                              onChange={(e) => {
                                if (useFileCheck(e)) {
                                  setSelectedFavIcon(e.target.files?.[0]);
                                  setAvatar2(URL.createObjectURL(e.target.files?.[0]));
                                }
                              }}
                            />
                          </Stack>
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>Website title :</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            placeholder="Enter website tItle"
                            id="admin-website_title"
                            {...getFieldProps('website_title')}
                            error={Boolean(touched.website_title && errors.website_title)}
                            helperText={touched.website_title && errors.website_title}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>Email sender :</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            placeholder="Enter email sender"
                            id="admin-email_sender"
                            {...getFieldProps('email_sender')}
                            error={Boolean(touched.email_sender && errors.email_sender)}
                            helperText={touched.email_sender && errors.email_sender}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>Email receiver :</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            placeholder="Enter email receiver"
                            id="admin-email_receiver"
                            {...getFieldProps('email_receiver')}
                            error={Boolean(touched.email_receiver && errors.email_receiver)}
                            helperText={touched.email_receiver && errors.email_receiver}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>Copyright text :</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            placeholder="Enter copyright text"
                            id="admin-copyright_text"
                            {...getFieldProps('copyright_text')}
                            error={Boolean(touched.copyright_text && errors.copyright_text)}
                            helperText={touched.copyright_text && errors.copyright_text}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            Free plan duration (months) :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            type="number"
                            placeholder="Enter free plan duration ex. 12"
                            id="admin-free_plan_duration_in_month"
                            {...getFieldProps('free_plan_duration_in_month')}
                            error={Boolean(touched.free_plan_duration_in_month && errors.free_plan_duration_in_month)}
                            helperText={touched.free_plan_duration_in_month && errors.free_plan_duration_in_month}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Divider />
                        </Grid>
                        <Grid item xs={12}>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={3} lg={4} sx={{ mt: { xs: 2, sm: '0 !important' } }}></Grid>
                            <Grid item xs={12} sm={9} lg={6}>
                              <Typography variant="h3" sx={{ mb: 0 }}>
                                Footer settings
                              </Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item xs={12}>
                          <Divider />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>Footer logo :</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <Stack spacing={2.5} alignItems="baseline">
                            <FormLabel
                              htmlFor="change-avtar-footerlogo"
                              sx={{
                                position: 'relative',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                '&:hover .MuiBox-root': { opacity: 1 },
                                cursor: 'pointer'
                              }}
                            >
                              <Avatar alt="Avatar 3" src={avatar3} sx={{ width: 124, height: 124, border: '1px dashed' }} />
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  background:
                                    theme.palette.mode === theme.palette.mode.DARK ? 'rgba(255, 255, 255, .75)' : 'rgba(0,0,0,.65)',
                                  width: '100%',
                                  height: '100%',
                                  opacity: 0,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <Stack spacing={0.5} alignItems="center">
                                  <CameraOutlined style={{ color: theme.palette.secondary.lighter, fontSize: '2rem' }} />
                                  <Typography sx={{ color: 'secondary.lighter' }}>Upload</Typography>
                                </Stack>
                              </Box>
                            </FormLabel>
                            <TextField
                              type="file"
                              id="change-avtar-footerlogo"
                              placeholder="Outlined"
                              variant="outlined"
                              sx={{ display: 'none' }}
                              onChange={(e) => {
                                if (useFileCheck(e)) {
                                  setSelectedFooterLogo(e.target.files?.[0]);
                                  setAvatar3(URL.createObjectURL(e.target.files?.[0]));
                                }
                              }}
                            />
                          </Stack>
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>Footer email :</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            placeholder="Enter footer email"
                            id="admin-footer_email"
                            {...getFieldProps('footer_email')}
                            error={Boolean(touched.footer_email && errors.footer_email)}
                            helperText={touched.footer_email && errors.footer_email}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>Phone :</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            placeholder="Enter phone"
                            id="admin-phone"
                            {...getFieldProps('phone')}
                            error={Boolean(touched.phone && errors.phone)}
                            helperText={touched.phone && errors.phone}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>Footer description :</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            multiline
                            className="muiTextArea"
                            maxRows={4}
                            placeholder="Enter footer description"
                            id="admin-footer_description"
                            {...getFieldProps('footer_description')}
                            error={Boolean(touched.footer_description && errors.footer_description)}
                            helperText={touched.footer_description && errors.footer_description}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>Address :</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            multiline
                            className="muiTextArea"
                            maxRows={4}
                            placeholder="Enter address"
                            id="admin-address"
                            {...getFieldProps('address')}
                            error={Boolean(touched.address && errors.address)}
                            helperText={touched.address && errors.address}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Divider />
                        </Grid>
                        <Grid item xs={12}>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={3} lg={4} sx={{ mt: { xs: 2, sm: '0 !important' } }}></Grid>
                            <Grid item xs={12} sm={9} lg={6}>
                              <Typography variant="h3" sx={{ mb: 0 }}>
                                Social settings
                              </Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item xs={12}>
                          <Divider />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>Facebook :</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            placeholder="Enter facebook"
                            id="admin-facebook"
                            {...getFieldProps('facebook')}
                            error={Boolean(touched.facebook && errors.facebook)}
                            helperText={touched.facebook && errors.facebook}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>Linkedin :</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            placeholder="Enter linkedin"
                            id="admin-linkedin"
                            {...getFieldProps('linkedin')}
                            error={Boolean(touched.linkedin && errors.linkedin)}
                            helperText={touched.linkedin && errors.linkedin}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>Youtube :</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            placeholder="Enter youtube"
                            id="admin-youtube"
                            {...getFieldProps('youtube')}
                            error={Boolean(touched.youtube && errors.youtube)}
                            helperText={touched.youtube && errors.youtube}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>Twitter:</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            placeholder="Enter twitter"
                            id="admin-twitter"
                            {...getFieldProps('twitter')}
                            error={Boolean(touched.twitter && errors.twitter)}
                            helperText={touched.twitter && errors.twitter}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>Instagram :</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            placeholder="Enter instagram"
                            id="admin-instagram"
                            {...getFieldProps('instagram')}
                            error={Boolean(touched.instagram && errors.instagram)}
                            helperText={touched.instagram && errors.instagram}
                          />
                        </Grid>
                        {/* Over */}
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
