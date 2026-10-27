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
import { Alert, FormControl, FormHelperText, MenuItem, OutlinedInput, Select, Snackbar, FormLabel } from '@mui/material';
import LoadingButton from 'components/@extended/LoadingButton';
import { LoadingOutlined } from '@ant-design/icons';

/* constant */
const getInitialValues = (article) => {
  const newArticle = {
    image: '',
    title: '',
    short_description: '',
    description: '',
    reading_time: '',
    tags: [],
    status: '1'
  };

  if (article) {
    const initialTags = Array.isArray(article.tags) ? article.tags : article.tags.split(','); /* Convert to array if needed */
    return _.merge({}, newArticle, { ...article, tags: initialTags });
  }

  return newArticle;
};

/* ==============================|| ARTICLE ADD / EDIT - FORM ||============================== */

export default function FormArticleAdd({ article, closeModal, isSucess }) {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [apiResponseError, setApiResponseError] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [selectedImage, setSelectedImage] = useState(undefined);
  const [avatar, setAvatar] = useState([]);
  const [tagsList, setTagsList] = useState([]);
  const [data, setData] = useState(article?.description);
  const [tags, setTags] = useState(article?.tags || []);
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
      setApiResponseError(response.data.message);
    }
  };

  useEffect(() => {
    setEditor1Error('');
    setApiResponseError('');
    getTagsList();
    setAvatar(article ? article.image : defaultImages);

    if (article?.tags) {
      const initialTags = Array.isArray(article.tags) ? article.tags : article.tags.split(','); /* Convert to array if needed */
      setTags(initialTags);
    } else {
      setTags([]);
    }

    setLoading(false);
  }, []);

  const handleChange = (event) => {
    const { value } = event.target;

    const selectedValues = typeof value === 'string' ? value.split(',') : value; /* Ensure it's an array */
    const tagsArray = selectedValues.map(String); /* Convert all values to string */

    setTags(tagsArray);
    formik.setFieldValue('tags', tagsArray);
  };

  const ArticleSchema = Yup.object().shape({
    title: Yup.string().required('Title is required'),
    short_description: Yup.string().required('Short description is required'),
    reading_time: Yup.number().required('Reading time is required'),
    tags: Yup.array().min(1, 'At least one tag is required'),
    status: Yup.string().oneOf(['0', '1'], 'Invalid status').required('Status is required')
  });

  const formik = useFormik({
    initialValues: getInitialValues(article),
    validationSchema: ArticleSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        let newArticle = values;
        newArticle.image = selectedImage ? selectedImage : '';
        newArticle.tags = Array.isArray(newArticle.tags)
          ? newArticle.tags.join(',')
          : newArticle.tags; /* Ensure tags is an array before joining */
        const admin = JSON?.parse(window?.localStorage?.getItem('users'));
        let article_description = data;
        if (editorRef.current) {
          article_description = editorRef.current.getData();
          setData(article_description);
          if (article_description == '' || !article_description) {
            setEditor1Error('Description is required');
            setSubmitting(false);
            return;
          }
        }
        const payload = {
          image: newArticle.image,
          title: newArticle.title,
          short_description: newArticle.short_description,
          description: article_description,
          reading_time: newArticle.reading_time,
          tags: newArticle.tags,
          status: String(newArticle.status),
          admin_id: admin.admin_id
        };

        let response;
        if (article) {
          payload.article_id = String(newArticle.article_id);
          response = await AuthService.axiosPrivateFormdataPost('/updateArticle', payload);
        } else {
          response = await AuthService.axiosPrivateFormdataPost('/addArticle', payload);
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
            <DialogTitle>{article ? 'Edit Article' : 'New Article'}</DialogTitle>
            <Divider />
            <DialogContent sx={{ p: 2.5 }}>
              <Grid spacing={3} mt={3}>
                <Grid item xs={12} md={12} justifyContent="center" sx={{ ml: 5, mr: 5 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={3} lg={4} sx={{ pt: { xs: 2, sm: '0 !important' } }}>
                      <InputLabel sx={{ textAlign: { xs: 'left', sm: 'right' } }}>Image :</InputLabel>
                    </Grid>
                    <Grid item xs={12} sm={9} lg={6}>
                      <Stack spacing={2.5} alignItems="baseline">
                        <FormLabel
                          htmlFor="change-article-image"
                          sx={{
                            position: 'relative',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            '&:hover .MuiBox-root': { opacity: 1 },
                            cursor: 'pointer'
                          }}
                        >
                          <Avatar alt="Article Image" src={avatar} sx={{ width: 124, height: 124, border: '1px dashed' }} />
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
                        <FormControl fullWidth>
                          <TextField
                            type="file"
                            id="change-article-image"
                            placeholder="Outlined"
                            variant="outlined"
                            sx={{ display: 'none' }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                formik.setFieldValue('image', file.name);
                                setSelectedImage(file);
                                setAvatar(URL.createObjectURL(file));
                              }
                            }}
                          />
                        </FormControl>
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="article-title">Title</InputLabel>
                        <TextField
                          id="outlined-multiline-static"
                          fullWidth
                          placeholder="Enter article title"
                          {...getFieldProps('title')}
                          error={Boolean(touched.title && errors.title)}
                          helperText={touched.title && errors.title}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="article-short-description">Short Description</InputLabel>
                        <TextField
                          id="outlined-multiline-static"
                          fullWidth
                          multiline
                          className="muiTextArea"
                          placeholder="Enter article short description"
                          {...getFieldProps('short_description')}
                          error={Boolean(touched.short_description && errors.short_description)}
                          helperText={touched.short_description && errors.short_description}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="article-description">Description</InputLabel>
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
                    <Grid item xs={12}>
                      <Stack spacing={1}>
                        <InputLabel htmlFor="article-reading-time">Reading Time (Minutes)</InputLabel>
                        <TextField
                          type="number"
                          id="article-reading-time"
                          fullWidth
                          placeholder="Enter reading time"
                          {...getFieldProps('reading_time')}
                          error={Boolean(touched.reading_time && errors.reading_time)}
                          helperText={touched.reading_time && errors.reading_time}
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12}>
                      <Stack spacing={1}>
                        <InputLabel>Tags</InputLabel>
                        <FormControl fullWidth error={formik.touched.tags && Boolean(formik.errors.tags)}>
                          <Select
                            multiple
                            value={tags}
                            onChange={handleChange}
                            input={<OutlinedInput />}
                            displayEmpty
                            renderValue={(selected) => {
                              if (selected.length === 0) {
                                return 'Select Tags'; /* Display placeholder text when no tags are selected */
                              }
                              return selected
                                .map(
                                  (id) => tagsList.find((item) => String(item.counselling_area_id) === String(id))?.counselling_area || ''
                                )
                                .filter(Boolean)
                                .join(', ');
                            }}
                          >
                            <MenuItem disabled value="">
                              Select Tags {/* Placeholder inside dropdown */}
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
                        <InputLabel htmlFor="article-Status">Status</InputLabel>
                        <RadioGroup
                          row
                          aria-label="payment-card"
                          {...getFieldProps('status')}
                          value={formik.values.status}
                          onChange={handleChange}
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

FormArticleAdd.propTypes = { article: PropTypes.any, closeModal: PropTypes.func };
