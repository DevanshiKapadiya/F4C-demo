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
import { LoadingOutlined } from '@ant-design/icons';
import LoadingButton from 'components/@extended/LoadingButton';
import useFileCheck from 'hooks/useFileCheck';

const getInitialValues = (settings) => {
  const newSettings = {
    about_us: '',
    who_we_are: '',
    who_we_are_image: '',
    our_mission: '',
    our_mission_image: '',
    what_make_us_different_image_one: '',
    what_make_us_different_title_one: '',
    what_make_us_different_description_one: '',
    what_make_us_different_image_two: '',
    what_make_us_different_title_two: '',
    what_make_us_different_description_two: '',
    what_make_us_different_image_three: '',
    what_make_us_different_title_three: '',
    what_make_us_different_description_three: '',
    what_make_us_different_image_four: '',
    what_make_us_different_title_four: '',
    what_make_us_different_description_four: '',
    why_choose_first4counselling: '',
    get_started_today: ''
  };

  if (settings) {
    return _.merge({}, newSettings, settings);
  }

  return newSettings;
};

// ==============================|| LAYOUTS - STICKY ACTIONBAR ||============================== //

export default function AboutSetting() {
  const theme = useTheme();
  const { menuOrientation } = useConfig();
  const [data, setData] = useState([]);
  const [who_we_are_Data, setWho_we_are_Data] = useState([]);
  const [our_mission_Data, setOur_mission_Data] = useState([]);
  const [why_choose_first4counselling_Data, setWhy_choose_first4counselling_Data] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMissionImg, setSelectedMissionImg] = useState(undefined);
  const [selectedWhoImg, setSelectedWhoImg] = useState(undefined);
  const [selectedWhatMakeOneImg, setSelectedWhatMakeOneImg] = useState(undefined);
  const [selectedWhatMakeTwoImg, setSelectedWhatMakeTwoImg] = useState(undefined);
  const [selectedWhatMakeThreeImg, setSelectedWhatMakeThreeImg] = useState(undefined);
  const [selectedWhatMakeFourImg, setSelectedWhatMakeFourImg] = useState(undefined);
  const [avatar, setAvatar] = useState(defaultImages);
  const [avatar2, setAvatar2] = useState(defaultImages);
  const [avatarThree, setAvatarThree] = useState(defaultImages);
  const [avatarFour, setAvatarFour] = useState(defaultImages);
  const [avatarFive, setAvatarFive] = useState(defaultImages);
  const [avatarSix, setAvatarSix] = useState(defaultImages);
  const [editor1Error, setEditor1Error] = useState('');
  const [editor2Error, setEditor2Error] = useState('');
  const [editor3Error, setEditor3Error] = useState('');

  const editorRef1 = useRef();
  const editorRef2 = useRef();
  const editorRef3 = useRef();

  useEffect(() => {
    setLoading(false);
    getSettings();
  }, []);

  const getSettings = async () => {
    setLoading(true);
    const response = await AuthService.axiosPrivatePost('/getCMSAbout');
    setLoading(false);
    if (response.data.status) {
      setData(response.data.data);
      setWho_we_are_Data(response.data.data?.who_we_are);
      setOur_mission_Data(response.data.data?.our_mission);
      setWhy_choose_first4counselling_Data(response.data.data?.why_choose_first4counselling);
      setAvatar(response.data.data.who_we_are_image);
      setAvatar2(response.data.data.our_mission_image);
      setAvatarThree(response.data.data.what_make_us_different_image_one);
      setAvatarFour(response.data.data.what_make_us_different_image_two);
      setAvatarFive(response.data.data.what_make_us_different_image_three);
      setAvatarSix(response.data.data.what_make_us_different_image_four);
    }
  };

  const UpdateSettingsSchema = Yup.object().shape({
    about_us: Yup.string().required('Field is required'),
    // who_we_are: Yup.string().max(255).required('Field is required'),
    // our_mission: Yup.string().required('Field is required'),
    what_make_us_different_title_one: Yup.string().required('Field is required'),
    what_make_us_different_description_one: Yup.string().required('Field is required'),
    what_make_us_different_title_two: Yup.string().required('Field is required'),
    what_make_us_different_description_two: Yup.string().required('Field is required'),
    what_make_us_different_title_three: Yup.string().required('Field is required'),
    what_make_us_different_description_three: Yup.string().required('Field is required'),
    what_make_us_different_title_four: Yup.string().required('Field is required'),
    what_make_us_different_description_four: Yup.string().required('Field is required'),
    // why_choose_first4counselling: Yup.string().required('Field is required'),
    get_started_today: Yup.string().required('Field is required')
  });

  const formik = useFormik({
    initialValues: getInitialValues(data),
    validationSchema: UpdateSettingsSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        let newSettings = values;
        if (editorRef1.current) {
          newSettings.who_we_are = editorRef1.current.getData();
          setWho_we_are_Data(newSettings.who_we_are);
          if (newSettings.who_we_are == '' || !newSettings.who_we_are) {
            setEditor1Error('Description is required');
            setSubmitting(false);
            return;
          }
        }
        if (editorRef2.current) {
          newSettings.our_mission = editorRef2.current.getData();
          setOur_mission_Data(newSettings.our_mission);
          if (newSettings.our_mission == '' || !newSettings.our_mission) {
            setEditor2Error('Description is required');
            setSubmitting(false);
            return;
          }
        }
        if (editorRef3.current) {
          newSettings.why_choose_first4counselling = editorRef3.current.getData();
          setWhy_choose_first4counselling_Data(newSettings.why_choose_first4counselling);
          if (newSettings.why_choose_first4counselling == '' || !newSettings.why_choose_first4counselling) {
            setEditor3Error('Description is required');
            setSubmitting(false);
            return;
          }
        }

        newSettings.who_we_are = who_we_are_Data;
        newSettings.our_mission = our_mission_Data;
        newSettings.why_choose_first4counselling = why_choose_first4counselling_Data;

        newSettings.our_mission_image = selectedMissionImg;
        newSettings.who_we_are_image = selectedWhoImg;
        newSettings.what_make_us_different_image_one = selectedWhatMakeOneImg;
        newSettings.what_make_us_different_image_two = selectedWhatMakeTwoImg;
        newSettings.what_make_us_different_image_three = selectedWhatMakeThreeImg;
        newSettings.what_make_us_different_image_four = selectedWhatMakeFourImg;

        try {
          const response = await AuthService.axiosPrivateFormdataPost('/updateCMSAbout', newSettings);
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
                      About page settings:
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
                                About us settings
                              </Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item xs={12}>
                          <Divider />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>About us description :</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            multiline
                            className="muiTextArea"
                            maxRows={4}
                            placeholder="Enter about us"
                            id="admin-about_us"
                            {...getFieldProps('about_us')}
                            error={Boolean(touched.about_us && errors.about_us)}
                            helperText={touched.about_us && errors.about_us}
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
                              htmlFor="change-avtar-favicon-who"
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
                              id="change-avtar-favicon-who"
                              placeholder="Outlined"
                              variant="outlined"
                              sx={{ display: 'none' }}
                              onChange={(e) => {
                                if (useFileCheck(e)) {
                                  setSelectedWhoImg(e.target.files?.[0]);
                                  setAvatar(URL.createObjectURL(e.target.files?.[0]));
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
                            InitialData={who_we_are_Data}
                            setData={(val) => {
                              setWho_we_are_Data(val);
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
                                Our mission section settings
                              </Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item xs={12}>
                          <Divider />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>Our mission image :</InputLabel>
                        </Grid>
                        <Grid item xs={6} sm={9} lg={8}>
                          <Stack spacing={2.5} alignItems="baseline">
                            <FormLabel
                              htmlFor="change-avtar-logo-mis"
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
                              id="change-avtar-logo-mis"
                              placeholder="Outlined"
                              variant="outlined"
                              sx={{ display: 'none' }}
                              onChange={(e) => {
                                if (useFileCheck(e)) {
                                  setSelectedMissionImg(e.target.files?.[0]);
                                  setAvatar2(URL.createObjectURL(e.target.files?.[0]));
                                }
                              }}
                            />
                          </Stack>
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            Our mission description :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <Ckeditor
                            InitialData={our_mission_Data}
                            setData={(val) => {
                              setOur_mission_Data(val);
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
                                What make us different section settings
                              </Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item xs={12}>
                          <Divider />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            What make us different image one :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={6} sm={9} lg={8}>
                          <Stack spacing={2.5} alignItems="baseline">
                            <FormLabel
                              htmlFor="change-avtar-logo-one"
                              sx={{
                                position: 'relative',
                                // borderRadius: '50%',
                                overflow: 'hidden',
                                '&:hover .MuiBox-root': { opacity: 1 },
                                cursor: 'pointer'
                              }}
                            >
                              <img
                                alt="Avatar 3"
                                src={avatarThree}
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
                              id="change-avtar-logo-one"
                              placeholder="Outlined"
                              variant="outlined"
                              sx={{ display: 'none' }}
                              onChange={(e) => {
                                if (useFileCheck(e)) {
                                  setSelectedWhatMakeOneImg(e.target.files?.[0]);
                                  setAvatarThree(URL.createObjectURL(e.target.files?.[0]));
                                }
                              }}
                            />
                          </Stack>
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            What make us different title one :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            placeholder="Enter make us different title one"
                            id="admin-what_make_us_different_title_one"
                            {...getFieldProps('what_make_us_different_title_one')}
                            error={Boolean(touched.what_make_us_different_title_one && errors.what_make_us_different_title_one)}
                            helperText={touched.what_make_us_different_title_one && errors.what_make_us_different_title_one}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            What make us different description one :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            multiline
                            className="muiTextArea"
                            maxRows={4}
                            placeholder="Enter make us different description one"
                            id="admin-what_make_us_different_description_one"
                            {...getFieldProps('what_make_us_different_description_one')}
                            error={Boolean(touched.what_make_us_different_description_one && errors.what_make_us_different_description_one)}
                            helperText={touched.what_make_us_different_description_one && errors.what_make_us_different_description_one}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Divider />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            What make us different image two :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={6} sm={9} lg={8}>
                          <Stack spacing={2.5} alignItems="baseline">
                            <FormLabel
                              htmlFor="change-avtar-logo-two"
                              sx={{
                                position: 'relative',
                                // borderRadius: '50%',
                                overflow: 'hidden',
                                '&:hover .MuiBox-root': { opacity: 1 },
                                cursor: 'pointer'
                              }}
                            >
                              <img
                                alt="Avatar 4"
                                src={avatarFour}
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
                              id="change-avtar-logo-two"
                              placeholder="Outlined"
                              variant="outlined"
                              sx={{ display: 'none' }}
                              onChange={(e) => {
                                if (useFileCheck(e)) {
                                  setSelectedWhatMakeTwoImg(e.target.files?.[0]);
                                  setAvatarFour(URL.createObjectURL(e.target.files?.[0]));
                                }
                              }}
                            />
                          </Stack>
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            What make us different title two :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            placeholder="Enter make us different title two"
                            id="admin-what_make_us_different_title_two"
                            {...getFieldProps('what_make_us_different_title_two')}
                            error={Boolean(touched.what_make_us_different_title_two && errors.what_make_us_different_title_two)}
                            helperText={touched.what_make_us_different_title_two && errors.what_make_us_different_title_two}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            What make us different description two :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            multiline
                            className="muiTextArea"
                            maxRows={4}
                            placeholder="Enter make us different description two"
                            id="admin-what_make_us_different_description_two"
                            {...getFieldProps('what_make_us_different_description_two')}
                            error={Boolean(touched.what_make_us_different_description_two && errors.what_make_us_different_description_two)}
                            helperText={touched.what_make_us_different_description_two && errors.what_make_us_different_description_two}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Divider />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            What make us different image three :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={6} sm={9} lg={8}>
                          <Stack spacing={2.5} alignItems="baseline">
                            <FormLabel
                              htmlFor="change-avtar-logo-three"
                              sx={{
                                position: 'relative',
                                // borderRadius: '50%',
                                overflow: 'hidden',
                                '&:hover .MuiBox-root': { opacity: 1 },
                                cursor: 'pointer'
                              }}
                            >
                              <img
                                alt="Avatar 3"
                                src={avatarFive}
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
                              id="change-avtar-logo-three"
                              placeholder="Outlined"
                              variant="outlined"
                              sx={{ display: 'none' }}
                              onChange={(e) => {
                                if (useFileCheck(e)) {
                                  setSelectedWhatMakeThreeImg(e.target.files?.[0]);
                                  setAvatarFive(URL.createObjectURL(e.target.files?.[0]));
                                }
                              }}
                            />
                          </Stack>
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            What make us different title three :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            placeholder="Enter make us different title three"
                            id="admin-what_make_us_different_title_three"
                            {...getFieldProps('what_make_us_different_title_three')}
                            error={Boolean(touched.what_make_us_different_title_three && errors.what_make_us_different_title_three)}
                            helperText={touched.what_make_us_different_title_three && errors.what_make_us_different_title_three}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            What make us different description three :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            multiline
                            className="muiTextArea"
                            maxRows={4}
                            placeholder="Enter make us different description three"
                            id="admin-what_make_us_different_description_three"
                            {...getFieldProps('what_make_us_different_description_three')}
                            error={Boolean(
                              touched.what_make_us_different_description_three && errors.what_make_us_different_description_three
                            )}
                            helperText={touched.what_make_us_different_description_three && errors.what_make_us_different_description_three}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Divider />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            What make us different image four :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={6} sm={9} lg={8}>
                          <Stack spacing={2.5} alignItems="baseline">
                            <FormLabel
                              htmlFor="change-avtar-logo-four"
                              sx={{
                                position: 'relative',
                                // borderRadius: '50%',
                                overflow: 'hidden',
                                '&:hover .MuiBox-root': { opacity: 1 },
                                cursor: 'pointer'
                              }}
                            >
                              <img
                                alt="Avatar 4"
                                src={avatarSix}
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
                              id="change-avtar-logo-four"
                              placeholder="Outlined"
                              variant="outlined"
                              sx={{ display: 'none' }}
                              onChange={(e) => {
                                if (useFileCheck(e)) {
                                  setSelectedWhatMakeFourImg(e.target.files?.[0]);
                                  setAvatarSix(URL.createObjectURL(e.target.files?.[0]));
                                }
                              }}
                            />
                          </Stack>
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            What make us different title four :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            placeholder="Enter make us different title four"
                            id="admin-what_make_us_different_title_four"
                            {...getFieldProps('what_make_us_different_title_four')}
                            error={Boolean(touched.what_make_us_different_title_four && errors.what_make_us_different_title_four)}
                            helperText={touched.what_make_us_different_title_four && errors.what_make_us_different_title_four}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            What make us different description four :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            multiline
                            className="muiTextArea"
                            maxRows={4}
                            placeholder="Enter make us different description four"
                            id="admin-what_make_us_different_description_four"
                            {...getFieldProps('what_make_us_different_description_four')}
                            error={Boolean(
                              touched.what_make_us_different_description_four && errors.what_make_us_different_description_four
                            )}
                            helperText={touched.what_make_us_different_description_four && errors.what_make_us_different_description_four}
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
                                Why choose first4counseling section settings
                              </Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item xs={12}>
                          <Divider />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            Why choose first4counseling description :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <Ckeditor
                            InitialData={why_choose_first4counselling_Data}
                            setData={(val) => {
                              setWhy_choose_first4counselling_Data(val);
                              setEditor3Error('');
                            }}
                            editorRef={editorRef3}
                          />
                          <FormHelperText error>{editor3Error}</FormHelperText>
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            Get started today description :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            multiline
                            className="muiTextArea"
                            maxRows={4}
                            placeholder="Enter get started today"
                            id="admin-get_started_today"
                            {...getFieldProps('get_started_today')}
                            error={Boolean(touched.get_started_today && errors.get_started_today)}
                            helperText={touched.get_started_today && errors.get_started_today}
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
