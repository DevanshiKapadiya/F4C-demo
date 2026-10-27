import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';

/* material-ui */
import Box from '@mui/material/Box';
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
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import defaultImages from 'assets/images/users/avatar-1.png';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { useTheme } from '@mui/material/styles';

/* third-party */
import _ from 'lodash';
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider } from 'formik';

/* project imports */
import CircularWithPath from 'components/@extended/progress/CircularWithPath';
import Avatar from 'components/@extended/Avatar';
import Ckeditor from 'components/Ckeditor';
import CameraOutlined from '@ant-design/icons/CameraOutlined';

import { Status } from 'config';
import { openSnackbar } from 'api/snackbar';

/* assets */
import { AuthService } from 'services';
import { Alert, Tooltip, FormControl, FormHelperText, MenuItem, OutlinedInput, Select, Snackbar, FormLabel } from '@mui/material';
import LoadingButton from 'components/@extended/LoadingButton';
import { LoadingOutlined } from '@ant-design/icons';

/* constant */
const getInitialValues = (resource) => {
  const newResource = {
    image: '',
    title: '',
    short_description: '',
    description: '',
    reading_time: '',
    tags: [],
    status: '1'
  };

  if (resource) {
    const initialTags = (Array.isArray(resource.tags) ? resource.tags : String(resource.tags || '').split(','))
      .filter(Boolean)
      .map(String); /* Convert to array if needed */
    return _.merge({}, newResource, {
      ...resource,
      tags: initialTags
    });
  }

  return newResource;
};

/* ==============================|| ARTICLE ADD / EDIT - FORM ||============================== */

export default function FormResourceAdd({ resource, closeModal, isSucess }) {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [apiResponseError, setApiResponseError] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [selectedImage, setSelectedImage] = useState(undefined);
  const [avatar, setAvatar] = useState(resource?.image || null);
  const [removeImage, setRemoveImage] = useState(false);
  const [tagsList, setTagsList] = useState([]);
  const [data, setData] = useState(resource?.description);
  const [tags, setTags] = useState([]);
  const [editor1Error, setEditor1Error] = useState('');
  const editorRef = useRef();

  const getTagsList = async () => {
    setLoading(true);
    setApiResponseError('');
    try {
      const response = await AuthService.axiosPrivatePost('/counsellingAreaListForArticle');
      setLoading(false);
      if (response.data.status) {
        setTagsList(response?.data?.data);
      } else {
        setApiResponseError(response.data.message);
      }
    } catch (error) {
      setLoading(false);
      setApiResponseError(error?.response?.data?.message || 'Unable to load tags');
    }
  };

  useEffect(() => {
    setEditor1Error('');
    setApiResponseError('');
    getTagsList();
    setAvatar(resource?.image || defaultImages);

    if (resource?.tags) {
      const initialTags = (Array.isArray(resource.tags) ? resource.tags : String(resource.tags || '').split(','))
        .filter(Boolean)
        .map(String); /* Convert to array if needed */
      setTags(initialTags);
      formik.setFieldValue('tags', initialTags);
    } else {
      setTags([]);
    }
  }, []);

  const handleChange = (event) => {
    const { value } = event.target;

    const selectedValues = typeof value === 'string' ? value.split(',') : value; /* Ensure it's an array */
    const tagsArray = selectedValues.map(String); /* Convert all values to string */

    setTags(tagsArray);
    formik.setFieldValue('tags', tagsArray);
  };

  const ResourceSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    short_description: Yup.string().required('Short description is required'),
    reading_time: Yup.number()
      .typeError('Reading time must be a number')
      .integer('Reading time must be a whole number')
      .positive('Reading time must be greater than 0')
      .required('Reading time is required'),
    tags: Yup.array().min(1, 'At least one topic is required'),
    status: Yup.string().oneOf(['0', '1'], 'Invalid status').required('Status is required')
  });

  const formik = useFormik({
    initialValues: getInitialValues(resource),
    validationSchema: ResourceSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        let newResource = values;
        newResource.tags = Array.isArray(newResource.tags)
          ? newResource.tags.join(',')
          : newResource.tags; /* Ensure tags is an array before joining */
        const admin = JSON.parse(window.localStorage.getItem('users') || 'null');
        let resource_description = data;
        if (editorRef.current) {
          resource_description = editorRef.current.getData();
          setData(resource_description);
          if (resource_description == '' || !resource_description) {
            setEditor1Error('Description is required');
            setSubmitting(false);
            return;
          }
        }
        const payload = {
          title: newResource.title,
          short_description: newResource.short_description,
          description: resource_description,
          reading_time: newResource.reading_time,
          tags: newResource.tags,
          status: String(newResource.status),
          admin_id: admin?.admin_id,
          alt_text: newResource.title || ''
        };

        if (selectedImage) {
          payload.image = selectedImage;
        } else if (resource?.image && !removeImage) {
          payload.image = resource.image;
        } else {
          payload.image = '';
          payload.remove_image = '1';
        }

        let response;
        if (resource) {
          payload.resource_id = String(newResource.resource_id);
          response = await AuthService.axiosPrivateFormdataPost('/updateResource', payload);
        } else {
          response = await AuthService.axiosPrivateFormdataPost('/addResource', payload);
        }

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
      } catch (error) {
        setApiResponseError(error?.response?.data?.message || 'Unable to save resource');
        setShowSnackbar(true);
        setSubmitting(false);
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
            <DialogTitle>{resource ? 'Edit Resource' : 'New Resource'}</DialogTitle>
            <Divider />
            <DialogContent sx={{ p: 2.5 }}>
              <Grid spacing={3} mt={3}>
                <Grid item xs={12} md={12} justifyContent="center" sx={{ ml: 5, mr: 5 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Stack spacing={1.5} alignItems="center">
                        <InputLabel>Image</InputLabel>
                        <Stack direction="column" spacing={1.5} alignItems="center">
                          <FormLabel
                            htmlFor="change-resource-image"
                            sx={{
                              position: 'relative',
                              borderRadius: '50%',
                              overflow: 'hidden',
                              '&:hover .MuiBox-root': { opacity: 1 },
                              cursor: 'pointer'
                            }}
                          >
                            <Avatar
                              alt={formik.values.title || 'Resource Image'}
                              src={avatar || undefined}
                              sx={{
                                width: 124,
                                height: 124,
                                border: '1px dashed',
                                bgcolor: avatar ? 'transparent' : 'primary.lighter',
                                color: 'primary.main',
                                fontSize: '2.5rem',
                                fontWeight: 700
                              }}
                            >
                              {!avatar &&
                                ((formik.values.title || '').trim().charAt(0).toUpperCase() || (
                                  <img src={defaultImages} alt="Default" style={{ width: '100%', height: '100%' }} />
                                ))}
                            </Avatar>
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

                          {(selectedImage || (resource?.image && !removeImage)) && (
                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              onClick={() => {
                                setSelectedImage(undefined);
                                setAvatar(null);
                                setRemoveImage(true);
                                formik.setFieldValue('image', '');
                              }}
                            >
                              Remove Image
                            </Button>
                          )}
                        </Stack>

                        <FormControl fullWidth>
                          <TextField
                            type="file"
                            id="change-resource-image"
                            placeholder="Outlined"
                            variant="outlined"
                            inputProps={{ accept: 'image/*' }}
                            sx={{ display: 'none' }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                formik.setFieldValue('image', file);
                                setSelectedImage(file);
                                setAvatar(URL.createObjectURL(file));
                                setRemoveImage(false);
                              }
                            }}
                          />
                        </FormControl>
                      </Stack>
                    </Grid>

                    <Grid item xs={12}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="resource-title">Title</InputLabel>
                        <TextField
                          id="resource-title"
                          fullWidth
                          placeholder="Enter resource title"
                          {...getFieldProps('title')}
                          error={Boolean(touched.title && errors.title)}
                          helperText={touched.title && errors.title}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="resource-short-description">Short Description</InputLabel>
                        <TextField
                          id="outlined-multiline-static"
                          fullWidth
                          multiline
                          className="muiTextArea"
                          placeholder="Enter resource short description"
                          {...getFieldProps('short_description')}
                          error={Boolean(touched.short_description && errors.short_description)}
                          helperText={touched.short_description && errors.short_description}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="resource-description">Body (Rich Text)</InputLabel>
                        <Ckeditor
                          InitialData={formik.values.description}
                          setData={(val) => {
                            setData(val);
                            setEditor1Error('');
                          }}
                          editorRef={editorRef}
                        />
                        <FormHelperText error>{editor1Error}</FormHelperText>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="resource-reading-time">Reading Time (Minutes)</InputLabel>
                        <TextField
                          type="number"
                          id="resource-reading-time"
                          fullWidth
                          placeholder="Enter reading time"
                          inputProps={{ min: 1, step: 1 }}
                          onKeyDown={(e) => {
                            if (['-', '+', 'e', 'E', '.'].includes(e.key)) e.preventDefault();
                          }}
                          {...getFieldProps('reading_time')}
                          error={Boolean(touched.reading_time && errors.reading_time)}
                          helperText={touched.reading_time && errors.reading_time}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1}>
                        <InputLabel>Topic</InputLabel>
                        <FormControl fullWidth error={formik.touched.tags && Boolean(formik.errors.tags)}>
                          <Select
                            multiple
                            value={tags}
                            onChange={handleChange}
                            input={<OutlinedInput />}
                            displayEmpty
                            renderValue={(selected) => {
                              if (selected.length === 0) {
                                return 'Select Topic'; /* Display placeholder text when no topic selected */
                              }
                              const names = selected
                                .map(
                                  (id) => tagsList.find((item) => String(item.counselling_area_id) === String(id))?.counselling_area || ''
                                )
                                .filter(Boolean);
                              const visible = names.slice(0, 2);
                              const extra = names.length - visible.length;
                              return (
                                <Tooltip title={names.join(', ')}>
                                  <Typography noWrap component="span" sx={{ display: 'block' }}>
                                    {visible.join(', ')}
                                    {extra > 0 && ` +${extra} more`}
                                  </Typography>
                                </Tooltip>
                              );
                            }}
                            MenuProps={{ PaperProps: { sx: { maxHeight: 320 } } }}
                          >
                            <MenuItem disabled value="">
                              Select Topic
                            </MenuItem>
                            {tagsList.map((item) => (
                              <MenuItem key={item.counselling_area_id} value={String(item.counselling_area_id)}>
                                <Checkbox checked={tags.includes(String(item.counselling_area_id))} />
                                {item.counselling_area}
                              </MenuItem>
                            ))}
                          </Select>
                          {formik.touched.tags && formik.errors.tags && <FormHelperText>{formik.errors.tags}</FormHelperText>}
                        </FormControl>
                      </Stack>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="resource-status">Status</InputLabel>

                        <FormControl fullWidth error={Boolean(touched.status && errors.status)}>
                          <RadioGroup
                            row
                            name="status"
                            value={String(formik.values.status)}
                            onChange={(event) => setFieldValue('status', event.target.value)}
                          >
                            <FormControlLabel value="1" control={<Radio />} label={Status.ACTIVE} />

                            <FormControlLabel value="0" control={<Radio />} label={Status.INACTIVE} />
                          </RadioGroup>

                          {touched.status && errors.status && <FormHelperText>{errors.status}</FormHelperText>}
                        </FormControl>
                      </Stack>
                    </Grid>
                  </Grid>

                  <Snackbar
                    open={Boolean(showSnackbar && apiResponseError)}
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

FormResourceAdd.propTypes = { resource: PropTypes.any, closeModal: PropTypes.func };
