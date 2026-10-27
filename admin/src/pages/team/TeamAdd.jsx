import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

/* material-ui */
import { Alert, Avatar, Box, FormLabel, Snackbar } from '@mui/material';
import Button from '@mui/material/Button';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import { FormControl, FormHelperText } from '@mui/material';
import defaultImages from 'assets/images/users/avatar-1.png';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';

/* third-party */
import _ from 'lodash';
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';

/* project imports */
import CircularWithPath from 'components/@extended/progress/CircularWithPath';
import CameraOutlined from '@ant-design/icons/CameraOutlined';
import Typography from '@mui/material/Typography';
import { Status } from 'config';
import { openSnackbar } from 'api/snackbar';

/* assets */
import { AuthService } from 'services';
import { useTheme } from '@mui/material/styles';
import LoadingButton from 'components/@extended/LoadingButton';
import { LoadingOutlined } from '@ant-design/icons';
import useFileCheck from 'hooks/useFileCheck';
/* constant */
const getInitialValues = (team) => {
  const newTeam = {
    profile_pic: '',
    name: '',
    description: '',
    designation: '',
    status: '1'
  };

  if (team) {
    return _.merge({}, newTeam, team);
  }

  return newTeam;
};

/* ==============================|| CUSTOMER ADD / EDIT - FORM ||============================== */

export default function FormTeamAdd({ team, closeModal, isSucess }) {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [apiResponseError, setApiResponseError] = useState('');
  const [avatar, setAvatar] = useState(defaultImages);
  const [selectedImage, setSelectedImage] = useState();
  const [showSnackbar, setShowSnackbar] = useState(false);

  useEffect(() => {
    setApiResponseError('');
    setAvatar(team ? team.profile_pic : defaultImages);
    setLoading(false);
  }, []);

  const TeamSchema = Yup.object().shape({
    profile_pic: Yup.string().required('Profile pic is required'),
    name: Yup.string().max(255).required('Name is required'),
    designation: Yup.string().max(255).required('Designation is required'),
    description: Yup.string().max(255).required('Description is required'),
    status: Yup.string().oneOf(['0', '1'], 'Invalid status').required('Status is required')
  });

  const formik = useFormik({
    initialValues: getInitialValues(team),
    validationSchema: TeamSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        let newTeam = values;
        newTeam.profile_pic = selectedImage ? selectedImage : '';
        if (team) {
          try {
            const payload = {
              team_id: String(newTeam.team_id),
              name: newTeam.name,
              profile_pic: newTeam.profile_pic,
              status: String(newTeam.status),
              description: newTeam.description,
              designation: newTeam.designation
            };
            const response = await AuthService.axiosPrivateFormdataPost('/updateTeam', payload);
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
              setApiResponseError(response.data.message);
              setShowSnackbar(true);
            }
          } catch (error) {}
        } else {
          try {
            const payload = {
              name: newTeam.name,
              profile_pic: newTeam.profile_pic,
              description: newTeam.description,
              designation: newTeam.designation,
              status: String(newTeam.status)
            };
            const response = await AuthService.axiosPrivateFormdataPost('/addTeam', payload);

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
              setApiResponseError(response.data.message);
              setShowSnackbar(true);
            }
          } catch (error) {}
        }
      } catch (error) {
        console.log(error);
      }
    }
  });
  const { errors, touched, handleSubmit, isSubmitting, getFieldProps, setFieldValue } = formik;
  if (loading)
    return (
      <Box sx={{ p: 5 }}>
        <Stack direction="row" justifyContent="center">
          <CircularWithPath />
        </Stack>
      </Box>
    );

  return (
    <>
      <FormikProvider value={formik}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <Form autoComplete="off" noValidate onSubmit={handleSubmit}>
            <DialogTitle>{team ? 'Edit Team member' : 'New Team member'}</DialogTitle>
            <Divider />
            <DialogContent sx={{ p: 2.5 }}>
              <Grid container spacing={3} mt={3}>
                <Grid item xs={12} md={12} justifyContent="center" sx={{ ml: 5, mr: 5 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                      <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' } }}>Profile picture :</InputLabel>
                    </Grid>
                    <Grid item xs={12} sm={9} lg={6}>
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
                          <Avatar alt="Avatar" src={avatar} sx={{ width: 124, height: 124, border: '1px dashed' }} />
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              background: theme.palette.mode === theme.palette.mode.DARK ? 'rgba(255, 255, 255, .75)' : 'rgba(0,0,0,.65)',
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
                        <FormControl fullWidth error={formik.touched.profile_pic && Boolean(formik.errors.profile_pic)}>
                          <TextField
                            type="file"
                            id="change-avtar-footerlogo"
                            placeholder="Outlined"
                            variant="outlined"
                            sx={{ display: 'none' }}
                            onChange={(e) => {
                              if (useFileCheck(e)) {
                                delete formik.errors.profile_pic;
                                formik.setFieldValue('profile_pic', e.target.files?.[0].name);
                                setSelectedImage(e.target.files?.[0]);
                                setAvatar(URL.createObjectURL(e.target.files?.[0]));
                              }
                            }}
                          />
                          {formik.touched.profile_pic && formik.errors.profile_pic && (
                            <FormHelperText>{formik.errors.profile_pic}</FormHelperText>
                          )}
                        </FormControl>
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="team-name">Name</InputLabel>
                        <TextField
                          id="outlined-multiline-static"
                          fullWidth
                          placeholder="Enter team member name"
                          {...getFieldProps('name')}
                          error={Boolean(touched.name && errors.name)}
                          helperText={touched.name && errors.name}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="team-designation">Designation</InputLabel>
                        <TextField
                          id="outlined-multiline-static"
                          fullWidth
                          placeholder="Enter team member designation"
                          {...getFieldProps('designation')}
                          error={Boolean(touched.designation && errors.designation)}
                          helperText={touched.designation && errors.designation}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="team-description">Description</InputLabel>
                        <TextField
                          id="outlined-multiline-static"
                          fullWidth
                          multiline
                          className="muiTextArea"
                          placeholder="Enter description"
                          {...getFieldProps('description')}
                          error={Boolean(touched.description && errors.description)}
                          helperText={touched.description && errors.description}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="team-Status">Status</InputLabel>
                        <RadioGroup
                          row
                          aria-label="payment-card"
                          {...getFieldProps('status')}
                          value={formik.values.status}
                          onChange={formik.handleChange}
                          error={Boolean(touched.status && errors.status)}
                          helperText={touched.status && errors.status}
                        >
                          <FormControlLabel control={<Radio value="1" />} label={Status.ACTIVE} />
                          <FormControlLabel control={<Radio value="0" />} label={Status.INACTIVE} />
                        </RadioGroup>
                        {touched.status && errors.status && <FormHelperText error>{errors.status}</FormHelperText>}
                      </Stack>
                    </Grid>
                  </Grid>

                  <Snackbar
                    open={showSnackbar && apiResponseError}
                    autoHideDuration={2500}
                    onClose={() => setShowSnackbar(false)}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                  >
                    <Alert onClose={() => setShowSnackbar(false)} variant="filled" severity="error">
                      {apiResponseError}
                    </Alert>
                  </Snackbar>
                </Grid>
              </Grid>
            </DialogContent>
            <Divider />
            <DialogActions sx={{ p: 2.5 }}>
              <Grid container justifyContent="space-between" alignItems="center">
                <Grid item></Grid>
                <Grid item>
                  <Stack direction="row" spacing={2} alignItems="center">
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
        </LocalizationProvider>
      </FormikProvider>
    </>
  );
}

FormTeamAdd.propTypes = { team: PropTypes.any, closeModal: PropTypes.func };
