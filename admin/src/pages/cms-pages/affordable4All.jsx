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
    counselling_thats_affordable_4_all_description: '',
    how_it_works_short_description: '',
    step1_title: '',
    step1_description: '',
    step2_title: '',
    step2_description: '',
    step3_title: '',
    step3_description: '',
    step4_title: '',
    step4_description: '',
    why_choose_set_your_own_budget_image: '',
    why_choose_set_your_own_budget_title1: '',
    why_choose_set_your_own_budget_description1: '',
    why_choose_set_your_own_budget_title2: '',
    why_choose_set_your_own_budget_description2: '',
    why_choose_set_your_own_budget_title3: '',
    why_choose_set_your_own_budget_description3: '',
    why_choose_set_your_own_budget_title4: '',
    why_choose_set_your_own_budget_description4: '',
    our_commitment_to_affordable_counselling_description: '',
    start_your_journey_today_description: ''
  };

  if (settings) {
    return _.merge({}, newSettings, settings);
  }

  return newSettings;
};

// ==============================|| LAYOUTS - STICKY ACTIONBAR ||============================== //

export default function Affordable4All() {
  const theme = useTheme();
  const { menuOrientation } = useConfig();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiResponseError, setApiResponseError] = useState('');
  const [selectedLogo, setSelectedLogo] = useState(undefined);
  const [avatar, setAvatar] = useState(defaultImages);

  useEffect(() => {
    setApiResponseError('');
    setLoading(false);
    getSettings();
  }, []);

  const getSettings = async () => {
    setLoading(true);
    const response = await AuthService.axiosPrivatePost('/getCMSAffordable4All');
    setLoading(false);
    if (response.data.status) {
      setAvatar(response.data.data.why_choose_set_your_own_budget_image);
      setData(response.data.data);
    }
  };

  const UpdateSettingsSchema = Yup.object().shape({
    counselling_thats_affordable_4_all_description: Yup.string().required('Field is required'),
    how_it_works_short_description: Yup.string().required('Field is required'),
    step1_title: Yup.string().required('Field is required'),
    step1_description: Yup.string().required('Field is required'),
    step2_title: Yup.string().required('Field is required'),
    step2_description: Yup.string().required('Field is required'),
    step3_title: Yup.string().required('Field is required'),
    step3_description: Yup.string().required('Field is required'),
    step4_title: Yup.string().required('Field is required'),
    step4_description: Yup.string().required('Field is required'),
    why_choose_set_your_own_budget_title1: Yup.string().required('Field is required'),
    why_choose_set_your_own_budget_description1: Yup.string().required('Field is required'),
    why_choose_set_your_own_budget_title2: Yup.string().required('Field is required'),
    why_choose_set_your_own_budget_description2: Yup.string().required('Field is required'),
    why_choose_set_your_own_budget_title3: Yup.string().required('Field is required'),
    why_choose_set_your_own_budget_description3: Yup.string().required('Field is required'),
    why_choose_set_your_own_budget_title4: Yup.string().required('Field is required'),
    why_choose_set_your_own_budget_description4: Yup.string().required('Field is required'),
    our_commitment_to_affordable_counselling_description: Yup.string().required('Field is required'),
    start_your_journey_today_description: Yup.string().required('Field is required')
  });
  const formik = useFormik({
    initialValues: getInitialValues(data),
    validationSchema: UpdateSettingsSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        let newSettings = values;
        newSettings.why_choose_set_your_own_budget_image = selectedLogo ? selectedLogo : '';
        try {
          const response = await AuthService.axiosPrivateFormdataPost('/updateCMSAffordable4All', newSettings);
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
                      Affordable 4 All Page Settings:
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
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            Counselling thats affordable 4 all description :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            multiline
                            className="muiTextArea"
                            maxRows={4}
                            placeholder="Enter counselling thats affordable 4 all description"
                            id="admin-counselling_thats_affordable_4_all_description"
                            {...getFieldProps('counselling_thats_affordable_4_all_description')}
                            error={Boolean(
                              touched.counselling_thats_affordable_4_all_description &&
                                errors.counselling_thats_affordable_4_all_description
                            )}
                            helperText={
                              touched.counselling_thats_affordable_4_all_description &&
                              errors.counselling_thats_affordable_4_all_description
                            }
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            How it works short description :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            multiline
                            className="muiTextArea"
                            maxRows={4}
                            placeholder="Enter how it works short description"
                            id="admin-how_it_works_short_description"
                            {...getFieldProps('how_it_works_short_description')}
                            error={Boolean(touched.how_it_works_short_description && errors.how_it_works_short_description)}
                            helperText={touched.how_it_works_short_description && errors.how_it_works_short_description}
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
                                Counselling steps setting
                              </Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item xs={12}>
                          <Divider />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' } }}>Step1 title :</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            placeholder="Enter step1 title"
                            id="admin-step1_title"
                            {...getFieldProps('step1_title')}
                            error={Boolean(touched.step1_title && errors.step1_title)}
                            helperText={touched.step1_title && errors.step1_title}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' } }}>Step1 description :</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            multiline
                            className="muiTextArea"
                            maxRows={4}
                            placeholder="Enter step1 description"
                            id="admin-step1_description"
                            {...getFieldProps('step1_description')}
                            error={Boolean(touched.step1_description && errors.step1_description)}
                            helperText={touched.step1_description && errors.step1_description}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' } }}>Step2 title :</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            placeholder="Enter step2 title"
                            id="admin-step2_title"
                            {...getFieldProps('step2_title')}
                            error={Boolean(touched.step2_title && errors.step2_title)}
                            helperText={touched.step2_title && errors.step2_title}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' } }}>Step2 description :</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            multiline
                            className="muiTextArea"
                            maxRows={4}
                            placeholder="Enter step2 description"
                            id="admin-step2_description"
                            {...getFieldProps('step2_description')}
                            error={Boolean(touched.step2_description && errors.step2_description)}
                            helperText={touched.step2_description && errors.step2_description}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' } }}>Step3 title :</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            placeholder="Enter step3 title"
                            id="admin-step3_title"
                            {...getFieldProps('step3_title')}
                            error={Boolean(touched.step3_title && errors.step3_title)}
                            helperText={touched.step3_title && errors.step3_title}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' } }}>Step3 description :</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            multiline
                            className="muiTextArea"
                            maxRows={4}
                            placeholder="Enter step3 description"
                            id="admin-step3_description"
                            {...getFieldProps('step3_description')}
                            error={Boolean(touched.step3_description && errors.step3_description)}
                            helperText={touched.step3_description && errors.step3_description}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' } }}>Step4 title :</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            placeholder="Enter step4 title"
                            id="admin-step4_title"
                            {...getFieldProps('step4_title')}
                            error={Boolean(touched.step4_title && errors.step4_title)}
                            helperText={touched.step4_title && errors.step4_title}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' } }}>Step4 description :</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            multiline
                            className="muiTextArea"
                            maxRows={4}
                            placeholder="Enter step4 description"
                            id="admin-step4_description"
                            {...getFieldProps('step4_description')}
                            error={Boolean(touched.step4_description && errors.step4_description)}
                            helperText={touched.step4_description && errors.step4_description}
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
                                Why choose section
                              </Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item xs={12}>
                          <Divider />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            Why choose set your own budget image :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={6} sm={9} lg={8}>
                          <Stack spacing={2.5} alignItems="baseline">
                            <FormLabel
                              htmlFor="change-avtar-logo"
                              sx={{
                                position: 'relative',
                                // borderRadius: '50%',
                                overflow: 'hidden',
                                '&:hover .MuiBox-root': { opacity: 1 },
                                cursor: 'pointer'
                              }}
                            >
                              <img
                                alt="Avatar"
                                src={avatar}
                                sx={{ width: 124, height: 124, border: '1px dashed' }}
                                height={220}
                                width={220}
                                style={{ objectFit: 'cover' }}
                              />
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
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            Why choose set your own budget title1 :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            placeholder="Enter why choose set your own budget title1"
                            id="admin-why_choose_set_your_own_budget_title1"
                            {...getFieldProps('why_choose_set_your_own_budget_title1')}
                            error={Boolean(touched.why_choose_set_your_own_budget_title1 && errors.why_choose_set_your_own_budget_title1)}
                            helperText={touched.why_choose_set_your_own_budget_title1 && errors.why_choose_set_your_own_budget_title1}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            Why choose set your own budget description1 :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            multiline
                            className="muiTextArea"
                            maxRows={4}
                            placeholder="Enter Why choose set your own budget description1"
                            id="admin-why_choose_set_your_own_budget_description1"
                            {...getFieldProps('why_choose_set_your_own_budget_description1')}
                            error={Boolean(
                              touched.why_choose_set_your_own_budget_description1 && errors.why_choose_set_your_own_budget_description1
                            )}
                            helperText={
                              touched.why_choose_set_your_own_budget_description1 && errors.why_choose_set_your_own_budget_description1
                            }
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            Why choose set your own budget title2 :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            placeholder="Enter why choose set your own budget title2"
                            id="admin-why_choose_set_your_own_budget_title2"
                            {...getFieldProps('why_choose_set_your_own_budget_title2')}
                            error={Boolean(touched.why_choose_set_your_own_budget_title2 && errors.why_choose_set_your_own_budget_title2)}
                            helperText={touched.why_choose_set_your_own_budget_title2 && errors.why_choose_set_your_own_budget_title2}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            Why choose set your own budget description2 :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            multiline
                            className="muiTextArea"
                            maxRows={4}
                            placeholder="Enter Why choose set your own budget description2"
                            id="admin-why_choose_set_your_own_budget_description2"
                            {...getFieldProps('why_choose_set_your_own_budget_description2')}
                            error={Boolean(
                              touched.why_choose_set_your_own_budget_description2 && errors.why_choose_set_your_own_budget_description2
                            )}
                            helperText={
                              touched.why_choose_set_your_own_budget_description2 && errors.why_choose_set_your_own_budget_description2
                            }
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            Why choose set your own budget title3 :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            placeholder="Enter why choose set your own budget title3"
                            id="admin-why_choose_set_your_own_budget_title3"
                            {...getFieldProps('why_choose_set_your_own_budget_title3')}
                            error={Boolean(touched.why_choose_set_your_own_budget_title3 && errors.why_choose_set_your_own_budget_title3)}
                            helperText={touched.why_choose_set_your_own_budget_title3 && errors.why_choose_set_your_own_budget_title3}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            Why choose set your own budget description3 :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            multiline
                            className="muiTextArea"
                            maxRows={4}
                            placeholder="Enter Why choose set your own budget description3"
                            id="admin-why_choose_set_your_own_budget_description3"
                            {...getFieldProps('why_choose_set_your_own_budget_description3')}
                            error={Boolean(
                              touched.why_choose_set_your_own_budget_description3 && errors.why_choose_set_your_own_budget_description3
                            )}
                            helperText={
                              touched.why_choose_set_your_own_budget_description3 && errors.why_choose_set_your_own_budget_description3
                            }
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            Why choose set your own budget title4 :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            placeholder="Enter why choose set your own budget title4"
                            id="admin-why_choose_set_your_own_budget_title4"
                            {...getFieldProps('why_choose_set_your_own_budget_title4')}
                            error={Boolean(touched.why_choose_set_your_own_budget_title4 && errors.why_choose_set_your_own_budget_title4)}
                            helperText={touched.why_choose_set_your_own_budget_title4 && errors.why_choose_set_your_own_budget_title4}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            Why choose set your own budget description4 :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            multiline
                            className="muiTextArea"
                            maxRows={4}
                            placeholder="Enter Why choose set your own budget description4"
                            id="admin-why_choose_set_your_own_budget_description4"
                            {...getFieldProps('why_choose_set_your_own_budget_description4')}
                            error={Boolean(
                              touched.why_choose_set_your_own_budget_description4 && errors.why_choose_set_your_own_budget_description4
                            )}
                            helperText={
                              touched.why_choose_set_your_own_budget_description4 && errors.why_choose_set_your_own_budget_description4
                            }
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Divider />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            Our commitment to affordable counselling description :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            multiline
                            className="muiTextArea"
                            maxRows={4}
                            placeholder="Enter our commitment to affordable counselling description"
                            id="admin-our_commitment_to_affordable_counselling_description"
                            {...getFieldProps('our_commitment_to_affordable_counselling_description')}
                            error={Boolean(
                              touched.our_commitment_to_affordable_counselling_description &&
                                errors.our_commitment_to_affordable_counselling_description
                            )}
                            helperText={
                              touched.our_commitment_to_affordable_counselling_description &&
                              errors.our_commitment_to_affordable_counselling_description
                            }
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            Start your journey today description :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            multiline
                            className="muiTextArea"
                            maxRows={4}
                            placeholder="Enter start your journey today description"
                            id="admin-start_your_journey_today_description"
                            {...getFieldProps('start_your_journey_today_description')}
                            error={Boolean(touched.start_your_journey_today_description && errors.start_your_journey_today_description)}
                            helperText={touched.start_your_journey_today_description && errors.start_your_journey_today_description}
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
