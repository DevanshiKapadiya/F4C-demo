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
    become_a_counsellor_banner_image: '',
    become_a_counsellor_banner_title: '',
    become_a_counsellor_banner_description: '',
    why_join_f4c_description: '',
    why_join_f4c_title1: '',
    why_join_f4c_short_description1: '',
    why_join_f4c_title2: '',
    why_join_f4c_short_description2: '',
    why_join_f4c_title3: '',
    why_join_f4c_short_description3: '',
    why_join_f4c_title4: '',
    why_join_f4c_short_description4: '',
    apply_to_be_counselor_description: '',
    individual_description: '',
    organization_description: '',
    how_it_works_description: '',
    how_it_works_title1: '',
    how_it_works_short_description1: '',
    how_it_works_title2: '',
    how_it_works_short_description2: '',
    how_it_works_title3: '',
    how_it_works_short_description3: '',
    how_it_works_title4: '',
    how_it_works_short_description4: '',
    begin_your_journey_now_description: ''
  };

  if (settings) {
    return _.merge({}, newSettings, settings);
  }

  return newSettings;
};

// ==============================|| LAYOUTS - STICKY ACTIONBAR ||============================== //

export default function BecomeACounselor() {
  const theme = useTheme();
  const { menuOrientation } = useConfig();
  const [data, setData] = useState([]);
  const [editorData, setEditorData] = useState([]);
  const [editorData2, setEditorData2] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBannerImg, setSelectedBannerImg] = useState(undefined);
  const [avatar, setAvatar] = useState(defaultImages);
  const [editor1Error, setEditor1Error] = useState('');
  const [editor2Error, setEditor2Error] = useState('');
  const editorRef1 = useRef();
  const editorRef2 = useRef();

  useEffect(() => {
    setEditor1Error('');
    setEditor2Error('');
    setLoading(false);
    getSettings();
  }, []);

  const getSettings = async () => {
    setLoading(true);
    const response = await AuthService.axiosPrivatePost('/getCMSBecomeACounselor');
    setLoading(false);
    if (response.data.status) {
      setData(response.data.data);
      setEditorData(response.data.data?.individual_description);
      setEditorData2(response.data.data?.organization_description);
      setAvatar(response.data.data.become_a_counsellor_banner_image);
    }
  };

  const UpdateSettingsSchema = Yup.object().shape({
    become_a_counsellor_banner_title: Yup.string().required('Field is required'),
    become_a_counsellor_banner_description: Yup.string().required('Field is required'),
    why_join_f4c_description: Yup.string().required('Field is required'),
    why_join_f4c_title1: Yup.string().required('Field is required'),
    why_join_f4c_short_description1: Yup.string().required('Field is required'),
    why_join_f4c_title2: Yup.string().required('Field is required'),
    why_join_f4c_short_description2: Yup.string().required('Field is required'),
    why_join_f4c_title3: Yup.string().required('Field is required'),
    why_join_f4c_short_description3: Yup.string().required('Field is required'),
    why_join_f4c_title4: Yup.string().required('Field is required'),
    why_join_f4c_short_description4: Yup.string().required('Field is required'),
    apply_to_be_counselor_description: Yup.string().required('Field is required'),
    how_it_works_description: Yup.string().required('Field is required'),
    how_it_works_title1: Yup.string().required('Field is required'),
    how_it_works_short_description1: Yup.string().required('Field is required'),
    how_it_works_title2: Yup.string().required('Field is required'),
    how_it_works_short_description2: Yup.string().required('Field is required'),
    how_it_works_title3: Yup.string().required('Field is required'),
    how_it_works_short_description3: Yup.string().required('Field is required'),
    how_it_works_title4: Yup.string().required('Field is required'),
    how_it_works_short_description4: Yup.string().required('Field is required'),
    begin_your_journey_now_description: Yup.string().required('Field is required')
  });

  const formik = useFormik({
    initialValues: getInitialValues(data),
    validationSchema: UpdateSettingsSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        let newSettings = values;
        newSettings.become_a_counsellor_banner_image = selectedBannerImg ? selectedBannerImg : '';
        newSettings.individual_description = editorData;
        newSettings.organization_description = editorData2;
        if (editorRef1.current) {
          newSettings.individual_description = editorRef1.current.getData();
          setEditorData(newSettings.individual_description);
          if (newSettings.individual_description == '' || !newSettings.individual_description) {
            setEditor1Error('Description is required');
            setSubmitting(false);
            return;
          }
        }
        if (editorRef2.current) {
          newSettings.organization_description = editorRef2.current.getData();
          setEditorData2(newSettings.organization_description);
          if (newSettings.organization_description == '' || !newSettings.organization_description) {
            setEditor2Error('Description is required');
            setSubmitting(false);
            return;
          }
        }
        try {
          const response = await AuthService.axiosPrivateFormdataPost('/updateCMSBecomeACounselor', newSettings);
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
                      Become a counselor page settings:
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
                                Banner settings
                              </Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item xs={12}>
                          <Divider />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>Banner Image :</InputLabel>
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
                            id="admin-become_a_counsellor_banner_title"
                            {...getFieldProps('become_a_counsellor_banner_title')}
                            error={Boolean(touched.become_a_counsellor_banner_title && errors.become_a_counsellor_banner_title)}
                            helperText={touched.become_a_counsellor_banner_title && errors.become_a_counsellor_banner_title}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>Banner description :</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            multiline
                            className="muiTextArea"
                            placeholder="Enter banner description"
                            id="admin-become_a_counsellor_banner_description"
                            {...getFieldProps('become_a_counsellor_banner_description')}
                            error={Boolean(touched.become_a_counsellor_banner_description && errors.become_a_counsellor_banner_description)}
                            helperText={touched.become_a_counsellor_banner_description && errors.become_a_counsellor_banner_description}
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
                                Why join us section settings
                              </Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item xs={12}>
                          <Divider />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            Why join f4c description :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            multiline
                            className="muiTextArea"
                            maxRows={4}
                            placeholder="Enter why join f4c description"
                            id="admin-why_join_f4c_description"
                            {...getFieldProps('why_join_f4c_description')}
                            error={Boolean(touched.why_join_f4c_description && errors.why_join_f4c_description)}
                            helperText={touched.why_join_f4c_description && errors.why_join_f4c_description}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>Why join f4c title-1 :</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            placeholder="Enter why join f4c title1"
                            id="admin-why_join_f4c_title1"
                            {...getFieldProps('why_join_f4c_title1')}
                            error={Boolean(touched.why_join_f4c_title1 && errors.why_join_f4c_title1)}
                            helperText={touched.why_join_f4c_title1 && errors.why_join_f4c_title1}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            Why join f4c description-1 :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            multiline
                            className="muiTextArea"
                            placeholder="Enter why join f4c short description 1"
                            id="admin-why_join_f4c_short_description1"
                            {...getFieldProps('why_join_f4c_short_description1')}
                            error={Boolean(touched.why_join_f4c_short_description1 && errors.why_join_f4c_short_description1)}
                            helperText={touched.why_join_f4c_short_description1 && errors.why_join_f4c_short_description1}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>Why join f4c title-2 :</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            placeholder="Enter why join f4c title2"
                            id="admin-why_join_f4c_title2"
                            {...getFieldProps('why_join_f4c_title2')}
                            error={Boolean(touched.why_join_f4c_title2 && errors.why_join_f4c_title2)}
                            helperText={touched.why_join_f4c_title2 && errors.why_join_f4c_title2}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            Why join f4c description-2 :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            multiline
                            className="muiTextArea"
                            placeholder="Enter why join f4c short description 2"
                            id="admin-why_join_f4c_short_description2"
                            {...getFieldProps('why_join_f4c_short_description2')}
                            error={Boolean(touched.why_join_f4c_short_description2 && errors.why_join_f4c_short_description2)}
                            helperText={touched.why_join_f4c_short_description2 && errors.why_join_f4c_short_description2}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>Why join f4c title-3 :</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            placeholder="Enter why join f4c title3"
                            id="admin-why_join_f4c_title3"
                            {...getFieldProps('why_join_f4c_title3')}
                            error={Boolean(touched.why_join_f4c_title3 && errors.why_join_f4c_title3)}
                            helperText={touched.why_join_f4c_title3 && errors.why_join_f4c_title3}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            Why join f4c description-3 :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            multiline
                            className="muiTextArea"
                            placeholder="Enter why join f4c short description 3"
                            id="admin-why_join_f4c_short_description3"
                            {...getFieldProps('why_join_f4c_short_description3')}
                            error={Boolean(touched.why_join_f4c_short_description3 && errors.why_join_f4c_short_description3)}
                            helperText={touched.why_join_f4c_short_description3 && errors.why_join_f4c_short_description3}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>Why join f4c title-4 :</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            placeholder="Enter why join f4c title4"
                            id="admin-why_join_f4c_title4"
                            {...getFieldProps('why_join_f4c_title4')}
                            error={Boolean(touched.why_join_f4c_title4 && errors.why_join_f4c_title4)}
                            helperText={touched.why_join_f4c_title4 && errors.why_join_f4c_title4}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            Why join f4c description-4 :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            multiline
                            className="muiTextArea"
                            placeholder="Enter why join f4c short description 4"
                            id="admin-why_join_f4c_short_description4"
                            {...getFieldProps('why_join_f4c_short_description4')}
                            error={Boolean(touched.why_join_f4c_short_description4 && errors.why_join_f4c_short_description4)}
                            helperText={touched.why_join_f4c_short_description4 && errors.why_join_f4c_short_description4}
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
                                Apply to be a counselor section settings
                              </Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item xs={12}>
                          <Divider />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            Apply to be counselor description :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            multiline
                            className="muiTextArea"
                            placeholder="Enter apply to be counselor description"
                            id="admin-apply_to_be_counselor_description"
                            {...getFieldProps('apply_to_be_counselor_description')}
                            error={Boolean(touched.apply_to_be_counselor_description && errors.apply_to_be_counselor_description)}
                            helperText={touched.apply_to_be_counselor_description && errors.apply_to_be_counselor_description}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            Individual description :
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
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            Organization description :
                          </InputLabel>
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
                                How it work section settings
                              </Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item xs={12}>
                          <Divider />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            How it works description :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            multiline
                            className="muiTextArea"
                            placeholder="Enter how it works description"
                            id="admin-how_it_works_description"
                            {...getFieldProps('how_it_works_description')}
                            error={Boolean(touched.how_it_works_description && errors.how_it_works_description)}
                            helperText={touched.how_it_works_description && errors.how_it_works_description}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>How it works title-1 :</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            placeholder="Enter how it works title-1"
                            id="admin-how_it_works_title1"
                            {...getFieldProps('how_it_works_title1')}
                            error={Boolean(touched.how_it_works_title1 && errors.how_it_works_title1)}
                            helperText={touched.how_it_works_title1 && errors.how_it_works_title1}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            How it works short description-1 :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            multiline
                            className="muiTextArea"
                            placeholder="Enter how it works short description-1"
                            id="admin-how_it_works_short_description1"
                            {...getFieldProps('how_it_works_short_description1')}
                            error={Boolean(touched.how_it_works_short_description1 && errors.how_it_works_short_description1)}
                            helperText={touched.how_it_works_short_description1 && errors.how_it_works_short_description1}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>How it works title-2 :</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            placeholder="Enter how it works title-2"
                            id="admin-how_it_works_title2"
                            {...getFieldProps('how_it_works_title2')}
                            error={Boolean(touched.how_it_works_title2 && errors.how_it_works_title2)}
                            helperText={touched.how_it_works_title2 && errors.how_it_works_title2}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            How it works short description-2 :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            multiline
                            className="muiTextArea"
                            placeholder="Enter how it works short description-2"
                            id="admin-how_it_works_short_description2"
                            {...getFieldProps('how_it_works_short_description2')}
                            error={Boolean(touched.how_it_works_short_description2 && errors.how_it_works_short_description2)}
                            helperText={touched.how_it_works_short_description2 && errors.how_it_works_short_description2}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>How it works title-3 :</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            placeholder="Enter how it works title-3"
                            id="admin-how_it_works_title3"
                            {...getFieldProps('how_it_works_title3')}
                            error={Boolean(touched.how_it_works_title3 && errors.how_it_works_title3)}
                            helperText={touched.how_it_works_title3 && errors.how_it_works_title3}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            How it works short description-3 :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            multiline
                            className="muiTextArea"
                            placeholder="Enter how it works short description-3"
                            id="admin-how_it_works_short_description3"
                            {...getFieldProps('how_it_works_short_description3')}
                            error={Boolean(touched.how_it_works_short_description3 && errors.how_it_works_short_description3)}
                            helperText={touched.how_it_works_short_description3 && errors.how_it_works_short_description3}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>How it works title-4 :</InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            placeholder="Enter how it works title-4"
                            id="admin-how_it_works_title4"
                            {...getFieldProps('how_it_works_title4')}
                            error={Boolean(touched.how_it_works_title4 && errors.how_it_works_title4)}
                            helperText={touched.how_it_works_title4 && errors.how_it_works_title4}
                          />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            How it works short description-4 :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            multiline
                            className="muiTextArea"
                            placeholder="Enter how it works short description-4"
                            id="admin-how_it_works_short_description4"
                            {...getFieldProps('how_it_works_short_description4')}
                            error={Boolean(touched.how_it_works_short_description4 && errors.how_it_works_short_description4)}
                            helperText={touched.how_it_works_short_description4 && errors.how_it_works_short_description4}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Divider />
                        </Grid>
                        <Grid item xs={12} sm={3} lg={3} sx={{ mt: { xs: 2, sm: '0 !important' } }}>
                          <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' }, textWrap: 'auto' }}>
                            Begin your journey now description :
                          </InputLabel>
                        </Grid>
                        <Grid item xs={12} sm={9} lg={8}>
                          <TextField
                            fullWidth
                            multiline
                            className="muiTextArea"
                            placeholder="Enter begin your journey now description"
                            id="admin-begin_your_journey_now_description"
                            {...getFieldProps('begin_your_journey_now_description')}
                            error={Boolean(touched.begin_your_journey_now_description && errors.begin_your_journey_now_description)}
                            helperText={touched.begin_your_journey_now_description && errors.begin_your_journey_now_description}
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
