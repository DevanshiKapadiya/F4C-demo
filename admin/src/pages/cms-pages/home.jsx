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
import { useEffect, useRef, useState } from 'react';
import { AuthService } from 'services';
import CircularWithPath from 'components/@extended/progress/CircularWithPath';
import { Box, FormHelperText, FormLabel } from '@mui/material';
import Ckeditor from 'components/Ckeditor';
import { useTheme } from '@mui/material/styles';
import defaultImages from 'assets/images/users/avatar-1.png';
import LoadingButton from 'components/@extended/LoadingButton';
import { LoadingOutlined } from '@ant-design/icons';
import useFileCheck from 'hooks/useFileCheck';
const getInitialValues = (settings) => {
  const newSettings = {
    banner_image: '',
    banner_title: '',
    banner_description: '',
    home_who_we_are_image: '',
    about_short_description: '',
    who_we_are_description: ''
  };

  if (settings) {
    return _.merge({}, newSettings, settings);
  }

  return newSettings;
};

// ==============================|| LAYOUTS - STICKY ACTIONBAR ||============================== //

export default function HomeSetting() {
  const theme = useTheme();
  const { menuOrientation } = useConfig();
  const [data, setData] = useState([]);
  const [editorData, setEditorData] = useState([]);
  const [editorData2, setEditorData2] = useState([]);
  const [editorData3, setEditorData3] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBannerImg, setSelectedBannerImg] = useState(undefined);
  const [selectedWhoImg, setSelectedWhoImg] = useState(undefined);
  const [home_affordable_for_all_image, setHome_affordable_for_all_image] = useState(undefined);
  const [avatar, setAvatar] = useState(defaultImages);
  const [avatar2, setAvatar2] = useState(defaultImages);
  const [avatar3, setAvatar3] = useState(defaultImages);
  const [editor1Error, setEditor1Error] = useState('');
  const [editor2Error, setEditor2Error] = useState('');
  const [editor3Error, setEditor3Error] = useState('');
  const editorRef1 = useRef();
  const editorRef2 = useRef();
  const editorRef3 = useRef();

  useEffect(() => {
    setEditor1Error('');
    setEditor2Error('');
    setEditor3Error('');
    setLoading(false);
    getSettings();
  }, []);

  const getSettings = async () => {
    setLoading(true);
    const response = await AuthService.axiosPrivatePost('/getCMSHome');
    setLoading(false);
    if (response.data.status) {
      setData(response.data.data);
      setEditorData(response.data.data?.who_we_are_description);
      setEditorData2(response.data.data?.banner_description);
      setEditorData3(response.data.data?.home_affordable_for_all_description);
      setAvatar(response.data.data.banner_image);
      setAvatar2(response.data.data.home_who_we_are_image);
      setAvatar3(response.data.data.home_affordable_for_all_image);
    }
  };

  const UpdateSettingsSchema = Yup.object().shape({
    banner_title: Yup.string().max(255).required('Title is required'),
    home_affordable_for_all_title: Yup.string().max(255).required('Title is required'),
    about_short_description: Yup.string().required('Short description is required')
    // banner_description: Yup.string().required('Banner description is required'),
    // who_we_are_description: Yup.string().required('Who we are description is required')
  });

  const formik = useFormik({
    initialValues: getInitialValues(data),
    validationSchema: UpdateSettingsSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        let newSettings = values;
        newSettings.banner_image = selectedBannerImg ? selectedBannerImg : '';
        newSettings.home_who_we_are_image = selectedWhoImg ? selectedWhoImg : '';
        newSettings.home_affordable_for_all_image = home_affordable_for_all_image ? home_affordable_for_all_image : '';
        newSettings.who_we_are_description = editorData;
        newSettings.banner_description = editorData2;
        newSettings.home_affordable_for_all_description = editorData3;
        if (editorRef1.current) {
          newSettings.who_we_are_description = editorRef1.current.getData();
          setEditorData(newSettings.who_we_are_description);
          if (newSettings.who_we_are_description == '' || !newSettings.who_we_are_description) {
            setEditor1Error('Description is required');
            setSubmitting(false);
            return;
          }
        }
        if (editorRef2.current) {
          newSettings.banner_description = editorRef2.current.getData();
          setEditorData2(newSettings.banner_description);
          if (newSettings.banner_description == '' || !newSettings.banner_description) {
            setEditor2Error('Description is required');
            setSubmitting(false);
            return;
          }
        }
        if (editorRef3.current) {
          newSettings.home_affordable_for_all_description = editorRef3.current.getData();
          setEditorData3(newSettings.home_affordable_for_all_description);
          if (newSettings.home_affordable_for_all_description == '' || !newSettings.home_affordable_for_all_description) {
            setEditor3Error('Description is required');
            setSubmitting(false);
            return;
          }
        }
        try {
          const response = await AuthService.axiosPrivateFormdataPost('/updateCMSHome', newSettings);
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
  const { errors, touched, handleSubmit, isSubmitting, getFieldProps } = formik;
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
                      Home page settings:
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ px: 1.5, py: 0.75 }}>
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
                                Banner settings
                              </Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item xs={12}>
                          <Divider />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>Banner image :</InputLabel>
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
                                alt="Avatar 1"
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
                                  setSelectedBannerImg(e.target.files?.[0]);
                                  setAvatar(URL.createObjectURL(e.target.files?.[0]));
                                }
                              }}
                            />
                          </Stack>
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>Banner title :</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            placeholder="Enter banner title"
                            id="admin-banner_title"
                            {...getFieldProps('banner_title')}
                            error={Boolean(touched.banner_title && errors.banner_title)}
                            helperText={touched.banner_title && errors.banner_title}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>Banner description :</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <Ckeditor
                            InitialData={editorData2}
                            setData={(val) => {
                              setEditorData2(val);
                              setEditor2Error('');
                            }}
                            editorRef={editorRef2}
                          />
                          <FormHelperText error>{editor2Error}</FormHelperText>
                        </Grid>
                        <Grid item xs={12}>
                          <Divider />
                        </Grid>
                        <Grid item xs={12}>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={3} lg={4} sx={{ mt: { xs: 2, sm: '0 !important' } }}></Grid>
                            <Grid item xs={12} sm={9} lg={6}>
                              <Typography variant="h3" sx={{ mb: 0 }}>
                                About us section settings
                              </Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item xs={12}>
                          <Divider />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' } }}>About short description :</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            multiline
                            className="muiTextArea"
                            maxRows={4}
                            placeholder="Enter about short description"
                            id="admin-about_short_description"
                            {...getFieldProps('about_short_description')}
                            error={Boolean(touched.about_short_description && errors.about_short_description)}
                            helperText={touched.about_short_description && errors.about_short_description}
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
                                Who we are section settings
                              </Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item xs={12}>
                          <Divider />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>Who we are image :</InputLabel>
                        </Grid>
                        <Grid item xs={6} sm={9} lg={8}>
                          <Stack spacing={2.5} alignItems="baseline">
                            <FormLabel
                              htmlFor="change-avtar-favicon"
                              sx={{
                                position: 'relative',
                                // borderRadius: '50%',
                                overflow: 'hidden',
                                '&:hover .MuiBox-root': { opacity: 1 },
                                cursor: 'pointer'
                              }}
                            >
                              <img
                                alt="Avatar 2"
                                src={avatar2}
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
                              id="change-avtar-favicon"
                              placeholder="Outlined"
                              variant="outlined"
                              sx={{ display: 'none' }}
                              onChange={(e) => {
                                if (useFileCheck(e)) {
                                  setSelectedWhoImg(e.target.files?.[0]);
                                  setAvatar2(URL.createObjectURL(e.target.files?.[0]));
                                }
                              }}
                            />
                          </Stack>
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            Who we are description :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <Ckeditor
                            InitialData={editorData}
                            setData={(val) => {
                              setEditorData(val);
                              setEditor1Error('');
                            }}
                            editorRef={editorRef1}
                          />
                          <FormHelperText error>{editor1Error}</FormHelperText>
                        </Grid>
                        <Grid item xs={12}>
                          <Divider />
                        </Grid>
                        <Grid item xs={12}>
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={3} lg={4} sx={{ mt: { xs: 2, sm: '0 !important' } }}></Grid>
                            <Grid item xs={12} sm={9} lg={6}>
                              <Typography variant="h3" sx={{ mb: 0 }}>
                                Affordable for all section settings
                              </Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item xs={12}>
                          <Divider />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            Home affordable for all image :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={6} sm={9} lg={8}>
                          <Stack spacing={2.5} alignItems="baseline">
                            <FormLabel
                              htmlFor="change-avtar-home_affordable_for_all_image"
                              sx={{
                                position: 'relative',
                                overflow: 'hidden',
                                '&:hover .MuiBox-root': { opacity: 1 },
                                cursor: 'pointer'
                              }}
                            >
                              <img
                                alt="Avatar 3"
                                src={avatar3}
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
                              id="change-avtar-home_affordable_for_all_image"
                              placeholder="Outlined"
                              variant="outlined"
                              sx={{ display: 'none' }}
                              onChange={(e) => {
                                if (useFileCheck(e)) {
                                  setHome_affordable_for_all_image(e.target.files?.[0]);
                                  setAvatar3(URL.createObjectURL(e.target.files?.[0]));
                                }
                              }}
                            />
                          </Stack>
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            Home affordable for all title :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            placeholder="Enter home affordable for all title"
                            id="admin-home_affordable_for_all_title"
                            {...getFieldProps('home_affordable_for_all_title')}
                            error={Boolean(touched.home_affordable_for_all_title && errors.home_affordable_for_all_title)}
                            helperText={touched.home_affordable_for_all_title && errors.home_affordable_for_all_title}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            Home affordable for all description :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <Ckeditor
                            InitialData={editorData3}
                            setData={(val) => {
                              setEditorData3(val);
                              setEditor3Error('');
                            }}
                            editorRef={editorRef3}
                          />
                          <FormHelperText error>{editor3Error}</FormHelperText>
                        </Grid>
                        {/* Over */}
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
