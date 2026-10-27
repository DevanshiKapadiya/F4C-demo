import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import {
  Box,
  FormLabel,
  FormHelperText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Switch,
  Tooltip,
  Rating,
  Autocomplete
} from '@mui/material';

/* project imports */
import MainCard from 'components/MainCard';
import useConfig from 'hooks/useConfig';
import { MenuOrientation } from 'config';
import CameraOutlined from '@ant-design/icons/CameraOutlined';
import _ from 'lodash';
import * as Yup from 'yup';
import { useFormik, Form, FormikProvider, FastField } from 'formik';
import { openSnackbar } from 'api/snackbar';
import { useEffect, useState, useRef, useMemo } from 'react';
import { AuthService } from 'services';
import CircularWithPath from 'components/@extended/progress/CircularWithPath';
import { useTheme, styled } from '@mui/material/styles';
import { InfoCircleOutlined, VideoCameraOutlined } from '@ant-design/icons';
import LoadingButton from 'components/@extended/LoadingButton';
// import useFileCheck, { useVideoFileCheck } from 'hooks/useFileCheck';
import Avatar from 'components/@extended/Avatar';
import section1SS from '../../public/screens/istockphoto-1331428155-612x612.jpg';
import section2SS from '../../public/screens/istockphoto-1331428155-612x612.jpg';
import section3SS from '../../public/screens/istockphoto-1331428155-612x612.jpg';
import section4SS from '../../public/screens/istockphoto-1331428155-612x612.jpg';
import section5SS from '../../public/screens/istockphoto-1331428155-612x612.jpg';
import section6SS from '../../public/screens/istockphoto-1331428155-612x612.jpg';
import section7SS from '../../public/screens/istockphoto-1331428155-612x612.jpg';
import section8SS from '../../public/screens/istockphoto-1331428155-612x612.jpg';
import section9SS from '../../public/screens/istockphoto-1331428155-612x612.jpg';
import section10SS from '../../public/screens/istockphoto-1331428155-612x612.jpg';
import section11SS from '../../public/screens/istockphoto-1331428155-612x612.jpg';
import section12SS from '../../public/screens/istockphoto-1331428155-612x612.jpg';
import section13SS from '../../public/screens/istockphoto-1331428155-612x612.jpg';
import section14SS from '../../public/screens/istockphoto-1331428155-612x612.jpg';
import section15SS from '../../public/screens/istockphoto-1331428155-612x612.jpg';
import section16SS from '../../public/screens/istockphoto-1331428155-612x612.jpg';
import section17SS from '../../public/screens/istockphoto-1331428155-612x612.jpg';
import Ckeditor from 'components/Ckeditor';

const getInitialValues = (homePageData) => {
  const newSettings = {
    home_banner_video: '',
    home_banner_image: '',
    home_hide_show_home_banner_video: '',
    home_hide_show_home_banner_image: '',
    home_hide_show_home_banner_gradient_bg: '',
    home_section2_box1_icon: '',
    home_section2_box1_title: '',
    home_section2_box1_description: '',
    home_section2_box1_button_text: '',
    home_section2_box1_button_link: '',
    home_section2_box2_icon: '',
    home_section2_box2_title: '',
    home_section2_box2_description: '',
    home_section2_box2_button_text: '',
    home_section2_box2_button_link: '',
    home_section2_box3_icon: '',
    home_section2_box3_title: '',
    home_section2_box3_description: '',
    home_section2_box3_button_text: '',
    home_section2_box3_button_link: '',
    home_section3_title: '',
    home_section3_subtitle: '',
    home_section3_box1_icon: '',
    home_section3_box1_title: '',
    home_section3_box2_icon: '',
    home_section3_box2_title: '',
    home_section3_box3_icon: '',
    home_section3_box3_title: '',
    home_section3_box4_icon: '',
    home_section3_box4_title: '',
    home_section3_box5_icon: '',
    home_section3_box5_title: '',
    home_section3_box6_icon: '',
    home_section3_box6_title: '',
    home_section4_title: '',
    home_section4_subtitle: '',
    home_section4_fetch_data_from_live_local: '',
    home_total_hours_of_support_delivered_by_fcs: '',
    home_average_time_to_assign_support: '',
    home_hours_of_support_delivered_each_year: '',
    home_clients_actively_engaged_in_ongoing_support: '',
    home_average_response_time_to_needs_assessors: '',
    home_client_satisfaction_and_rising: '',
    home_section4_image: '',
    home_facebook_rating: '',
    home_facebook_review: '',
    home_google_rating: '',
    home_google_review: '',
    home_glassdoor_rating: '',
    home_glassdoor_review: '',
    home_indeed_rating: '',
    home_indeed_review: '',
    home_section5_title: '',
    home_section5_subtitle: '',
    home_section5_image: '',
    home_section5_description: '',
    home_section5_sub_title1: '',
    home_section5_sub_description1: '',
    home_section5_sub_title2: '',
    home_section5_sub_description2: '',
    home_section5_description2: '',
    home_section5_bottom_description: '',
    home_section6_title: '',
    home_section6_subtitle: '',
    home_section6_box1_title: '',
    home_section6_box1_description: '',
    home_section6_box1_freddie_description: '',
    home_section6_box2_title: '',
    home_section6_box2_description: '',
    home_section6_box2_freddie_description: '',
    home_section6_box3_title: '',
    home_section6_box3_description: '',
    home_section6_box3_freddie_description: '',
    home_section6_box4_title: '',
    home_section6_box4_description: '',
    home_section6_box4_freddie_description: '',
    home_section6_box5_title: '',
    home_section6_box5_description: '',
    home_section6_box5_freddie_description: '',
    home_section6_box6_title: '',
    home_section6_box6_description: '',
    home_section6_box6_freddie_description: '',
    home_section6_box7_title: '',
    home_section6_box7_description: '',
    home_section6_box7_freddie_description: '',
    home_section6_box8_title: '',
    home_section6_box8_description: '',
    home_section6_box8_freddie_description: '',
    home_section6_box9_title: '',
    home_section6_box9_description: '',
    home_section6_box9_freddie_description: '',
    home_section7_title: '',
    home_section7_subtitle: '',
    home_section7_box1_image: '',
    home_section7_box1_title: '',
    home_section7_box1_description: '',
    home_section7_box1_button_text: '',
    home_section7_box1_button_link: '',
    home_section7_box2_image: '',
    home_section7_box2_title: '',
    home_section7_box2_description: '',
    home_section7_box2_button_text: '',
    home_section7_box2_button_link: '',
    home_section7_box3_image: '',
    home_section7_box3_title: '',
    home_section7_box3_description: '',
    home_section7_box3_button_text: '',
    home_section7_box3_button_link: '',
    home_section7_box4_image: '',
    home_section7_box4_title: '',
    home_section7_box4_description: '',
    home_section7_box4_button_text: '',
    home_section7_box4_button_link: '',
    home_section8_title: '',
    home_section8_subtitle: '',
    home_section8_team_members: '',
    home_section8_card_title: '',
    home_section8_card_description: '',
    home_section8_card_button_text: '',
    home_section8_card_button_link: '',
    home_section9_title: '',
    home_section9_subtitle: '',
    home_section9_email: '',
    home_section9_phone: '',
    home_section9_whatsapp: '',
    home_section9_button_text: '',
    home_section9_button_link: '',
    home_section9_image: '',
    home_section10_title: '',
    home_section10_subtitle: '',
    home_section10_bottom_right_text: '',
    home_section11_title: '',
    home_section11_subtitle: '',
    home_section11_box1_icon: '',
    home_section11_box1_title: '',
    home_section11_box1_description: '',
    home_section11_box2_icon: '',
    home_section11_box2_title: '',
    home_section11_box2_description: '',
    home_section11_box3_icon: '',
    home_section11_box3_title: '',
    home_section11_box3_description: '',
    home_section11_box4_icon: '',
    home_section11_box4_title: '',
    home_section11_box4_description: '',
    home_section12_title: '',
    home_section12_subtitle: '',
    home_section12_bottom_description: '',
    home_section13_title: '',
    home_section13_subtitle: '',
    home_section13_description: '',
    home_section13_bottom_title: '',
    home_section14_title: '',
    home_section14_subtitle: '',
    home_section14_fetch_data_from_live_local: '',
    home_section14_active_support_workers: '',
    home_section14_open_roles_across_the_uk: '',
    home_section14_registered_support_staff: '',
    home_section14_rate_per_hour: '',
    home_section14_button_text: '',
    home_section14_button_link: '',
    home_section14_image: '',
    home_section15_title: '',
    home_section15_subtitle: '',
    home_section16_title: '',
    home_section16_subtitle: '',
    home_section16_box1_icon: '',
    home_section16_box1_title: '',
    home_section16_box1_description: '',
    home_section16_box1_button_text: '',
    home_section16_box1_button_link: '',
    home_section16_box2_icon: '',
    home_section16_box2_title: '',
    home_section16_box2_description: '',
    home_section16_box2_button_text: '',
    home_section16_box2_button_link: '',
    home_section16_box3_icon: '',
    home_section16_box3_title: '',
    home_section16_box3_description: '',
    home_section16_box3_button_text: '',
    home_section16_box3_button_link: '',
    home_section16_box4_icon: '',
    home_section16_box4_title: '',
    home_section16_box4_description: '',
    home_section16_box4_button_text: '',
    home_section16_box4_button_link: '',
    home_section17_title: '',
    home_section17_subtitle: ''
  };

  if (homePageData) {
    return _.merge({}, newSettings, homePageData);
  }

  return newSettings;
};

/* Section-scoped initial values */
const getSection1InitialValues = (homePageData) => ({
  home_banner_video: homePageData?.home_banner_video || '',
  home_banner_image: homePageData?.home_banner_image || '',
  home_hide_show_home_banner_video: !!Number(homePageData?.home_hide_show_home_banner_video),
  home_hide_show_home_banner_image: !!Number(homePageData?.home_hide_show_home_banner_image),
  home_hide_show_home_banner_gradient_bg: !!Number(homePageData?.home_hide_show_home_banner_gradient_bg)
});

const getSection2InitialValues = (homePageData) => ({
  home_section2_box1_title: homePageData?.home_section2_box1_title || '',
  home_section2_box1_description: homePageData?.home_section2_box1_description || '',
  home_section2_box1_button_text: homePageData?.home_section2_box1_button_text || '',
  home_section2_box1_button_link: homePageData?.home_section2_box1_button_link || '',

  home_section2_box2_title: homePageData?.home_section2_box2_title || '',
  home_section2_box2_description: homePageData?.home_section2_box2_description || '',
  home_section2_box2_button_text: homePageData?.home_section2_box2_button_text || '',
  home_section2_box2_button_link: homePageData?.home_section2_box2_button_link || '',

  home_section2_box3_title: homePageData?.home_section2_box3_title || '',
  home_section2_box3_description: homePageData?.home_section2_box3_description || '',
  home_section2_box3_button_text: homePageData?.home_section2_box3_button_text || '',
  home_section2_box3_button_link: homePageData?.home_section2_box3_button_link || ''
});

const getSection3InitialValues = (homePageData) => ({
  home_section3_title: homePageData?.home_section3_title || '',
  home_section3_subtitle: homePageData?.home_section3_subtitle || '',
  home_section3_box1_icon: homePageData?.home_section3_box1_icon || '',
  home_section3_box1_title: homePageData?.home_section3_box1_title || '',
  home_section3_box2_icon: homePageData?.home_section3_box2_icon || '',
  home_section3_box2_title: homePageData?.home_section3_box2_title || '',
  home_section3_box3_icon: homePageData?.home_section3_box3_icon || '',
  home_section3_box3_title: homePageData?.home_section3_box3_title || '',
  home_section3_box4_icon: homePageData?.home_section3_box4_icon || '',
  home_section3_box4_title: homePageData?.home_section3_box4_title || '',
  home_section3_box5_icon: homePageData?.home_section3_box5_icon || '',
  home_section3_box5_title: homePageData?.home_section3_box5_title || '',
  home_section3_box6_icon: homePageData?.home_section3_box6_icon || '',
  home_section3_box6_title: homePageData?.home_section3_box6_title || ''
});

const getSection5InitialValues = (homePageData) => ({
  home_section5_title: homePageData?.home_section5_title || '',
  home_section5_subtitle: homePageData?.home_section5_subtitle || '',
  home_section5_image: homePageData?.home_section5_image || '',
  home_section5_description: homePageData?.home_section5_description || '',
  home_section5_sub_title1: homePageData?.home_section5_sub_title1 || '',
  home_section5_sub_description1: homePageData?.home_section5_sub_description1 || '',
  home_section5_sub_title2: homePageData?.home_section5_sub_title2 || '',
  home_section5_sub_description2: homePageData?.home_section5_sub_description2 || '',
  home_section5_description2: homePageData?.home_section5_description2 || '',
  home_section5_bottom_description: homePageData?.home_section5_bottom_description || ''
});

const getSection6InitialValues = (homePageData) => ({
  home_section6_title: homePageData?.home_section6_title || '',
  home_section6_subtitle: homePageData?.home_section6_subtitle || '',
  home_section6_box1_title: homePageData?.home_section6_box1_title || '',
  home_section6_box1_description: homePageData?.home_section6_box1_description || '',
  home_section6_box1_freddie_description: homePageData?.home_section6_box1_freddie_description || '',
  home_section6_box2_title: homePageData?.home_section6_box2_title || '',
  home_section6_box2_description: homePageData?.home_section6_box2_description || '',
  home_section6_box2_freddie_description: homePageData?.home_section6_box2_freddie_description || '',
  home_section6_box3_title: homePageData?.home_section6_box3_title || '',
  home_section6_box3_description: homePageData?.home_section6_box3_description || '',
  home_section6_box3_freddie_description: homePageData?.home_section6_box3_freddie_description || '',
  home_section6_box4_title: homePageData?.home_section6_box4_title || '',
  home_section6_box4_description: homePageData?.home_section6_box4_description || '',
  home_section6_box4_freddie_description: homePageData?.home_section6_box4_freddie_description || '',
  home_section6_box5_title: homePageData?.home_section6_box5_title || '',
  home_section6_box5_description: homePageData?.home_section6_box5_description || '',
  home_section6_box5_freddie_description: homePageData?.home_section6_box5_freddie_description || '',
  home_section6_box6_title: homePageData?.home_section6_box6_title || '',
  home_section6_box6_description: homePageData?.home_section6_box6_description || '',
  home_section6_box6_freddie_description: homePageData?.home_section6_box6_freddie_description || '',
  home_section6_box7_title: homePageData?.home_section6_box7_title || '',
  home_section6_box7_description: homePageData?.home_section6_box7_description || '',
  home_section6_box7_freddie_description: homePageData?.home_section6_box7_freddie_description || '',
  home_section6_box8_title: homePageData?.home_section6_box8_title || '',
  home_section6_box8_description: homePageData?.home_section6_box8_description || '',
  home_section6_box8_freddie_description: homePageData?.home_section6_box8_freddie_description || '',
  home_section6_box9_title: homePageData?.home_section6_box9_title || '',
  home_section6_box9_description: homePageData?.home_section6_box9_description || '',
  home_section6_box9_freddie_description: homePageData?.home_section6_box9_freddie_description || ''
});

const getSection7InitialValues = (homePageData) => ({
  home_section7_title: homePageData?.home_section7_title || '',
  home_section7_subtitle: homePageData?.home_section7_subtitle || '',
  home_section7_box1_image: homePageData?.home_section7_box1_image || '',
  home_section7_box1_title: homePageData?.home_section7_box1_title || '',
  home_section7_box1_description: homePageData?.home_section7_box1_description || '',
  home_section7_box1_button_text: homePageData?.home_section7_box1_button_text || '',
  home_section7_box1_button_link: homePageData?.home_section7_box1_button_link || '',
  home_section7_box2_image: homePageData?.home_section7_box2_image || '',
  home_section7_box2_title: homePageData?.home_section7_box2_title || '',
  home_section7_box2_description: homePageData?.home_section7_box2_description || '',
  home_section7_box2_button_text: homePageData?.home_section7_box2_button_text || '',
  home_section7_box2_button_link: homePageData?.home_section7_box2_button_link || '',
  home_section7_box3_image: homePageData?.home_section7_box3_image || '',
  home_section7_box3_title: homePageData?.home_section7_box3_title || '',
  home_section7_box3_description: homePageData?.home_section7_box3_description || '',
  home_section7_box3_button_text: homePageData?.home_section7_box3_button_text || '',
  home_section7_box3_button_link: homePageData?.home_section7_box3_button_link || '',
  home_section7_box4_image: homePageData?.home_section7_box4_image || '',
  home_section7_box4_title: homePageData?.home_section7_box4_title || '',
  home_section7_box4_description: homePageData?.home_section7_box4_description || '',
  home_section7_box4_button_text: homePageData?.home_section7_box4_button_text || '',
  home_section7_box4_button_link: homePageData?.home_section7_box4_button_link || ''
});

const parseTeamMembersValue = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
};

const getSection8InitialValues = (homePageData) => ({
  home_section8_title: homePageData?.home_section8_title || '',
  home_section8_subtitle: homePageData?.home_section8_subtitle || '',
  home_section8_team_members: parseTeamMembersValue(homePageData?.home_section8_team_members),
  home_section8_card_title: homePageData?.home_section8_card_title || '',
  home_section8_card_description: homePageData?.home_section8_card_description || '',
  home_section8_card_button_text: homePageData?.home_section8_card_button_text || '',
  home_section8_card_button_link: homePageData?.home_section8_card_button_link || ''
});

const getSection9InitialValues = (homePageData) => ({
  home_section9_title: homePageData?.home_section9_title || '',
  home_section9_subtitle: homePageData?.home_section9_subtitle || '',
  home_section9_email: homePageData?.home_section9_email || '',
  home_section9_phone: homePageData?.home_section9_phone || '',
  home_section9_whatsapp: homePageData?.home_section9_whatsapp || '',
  home_section9_button_text: homePageData?.home_section9_button_text || '',
  home_section9_button_link: homePageData?.home_section9_button_link || '',
  home_section9_image: homePageData?.home_section9_image || ''
});

const getSection10InitialValues = (homePageData) => ({
  home_section10_title: homePageData?.home_section10_title || '',
  home_section10_subtitle: homePageData?.home_section10_subtitle || '',
  home_section10_bottom_right_text: homePageData?.home_section10_bottom_right_text || ''
});

const getSection11InitialValues = (homePageData) => ({
  home_section11_title: homePageData?.home_section11_title || '',
  home_section11_subtitle: homePageData?.home_section11_subtitle || '',
  home_section11_box1_icon: homePageData?.home_section11_box1_icon || '',
  home_section11_box1_title: homePageData?.home_section11_box1_title || '',
  home_section11_box1_description: homePageData?.home_section11_box1_description || '',
  home_section11_box2_icon: homePageData?.home_section11_box2_icon || '',
  home_section11_box2_title: homePageData?.home_section11_box2_title || '',
  home_section11_box2_description: homePageData?.home_section11_box2_description || '',
  home_section11_box3_icon: homePageData?.home_section11_box3_icon || '',
  home_section11_box3_title: homePageData?.home_section11_box3_title || '',
  home_section11_box3_description: homePageData?.home_section11_box3_description || '',
  home_section11_box4_icon: homePageData?.home_section11_box4_icon || '',
  home_section11_box4_title: homePageData?.home_section11_box4_title || '',
  home_section11_box4_description: homePageData?.home_section11_box4_description || ''
});

const getSection12InitialValues = (homePageData) => ({
  home_section12_title: homePageData?.home_section12_title || '',
  home_section12_subtitle: homePageData?.home_section12_subtitle || '',
  home_section12_bottom_description: homePageData?.home_section12_bottom_description || ''
});

const getSection13InitialValues = (homePageData) => ({
  home_section13_title: homePageData?.home_section13_title || '',
  home_section13_subtitle: homePageData?.home_section13_subtitle || '',
  home_section13_description: homePageData?.home_section13_description || '',
  home_section13_bottom_title: homePageData?.home_section13_bottom_title || ''
});

const getSection14InitialValues = (homePageData) => ({
  home_section14_title: homePageData?.home_section14_title || '',
  home_section14_subtitle: homePageData?.home_section14_subtitle || '',
  home_section14_fetch_data_from_live_local: !!Number(homePageData?.home_section14_fetch_data_from_live_local),
  home_section14_active_support_workers: homePageData?.home_section14_active_support_workers || '',
  home_section14_open_roles_across_the_uk: homePageData?.home_section14_open_roles_across_the_uk || '',
  home_section14_registered_support_staff: homePageData?.home_section14_registered_support_staff || '',
  home_section14_rate_per_hour: homePageData?.home_section14_rate_per_hour || '',
  home_section14_button_text: homePageData?.home_section14_button_text || '',
  home_section14_button_link: homePageData?.home_section14_button_link || '',
  home_section14_image: homePageData?.home_section14_image || ''
});

const getSection15InitialValues = (homePageData) => ({
  home_section15_title: homePageData?.home_section15_title || '',
  home_section15_subtitle: homePageData?.home_section15_subtitle || ''
});

const getSection16InitialValues = (homePageData) => ({
  home_section16_title: homePageData?.home_section16_title || '',
  home_section16_subtitle: homePageData?.home_section16_subtitle || '',
  home_section16_box1_icon: homePageData?.home_section16_box1_icon || '',
  home_section16_box1_title: homePageData?.home_section16_box1_title || '',
  home_section16_box1_description: homePageData?.home_section16_box1_description || '',
  home_section16_box1_button_text: homePageData?.home_section16_box1_button_text || '',
  home_section16_box1_button_link: homePageData?.home_section16_box1_button_link || '',
  home_section16_box2_icon: homePageData?.home_section16_box2_icon || '',
  home_section16_box2_title: homePageData?.home_section16_box2_title || '',
  home_section16_box2_description: homePageData?.home_section16_box2_description || '',
  home_section16_box2_button_text: homePageData?.home_section16_box2_button_text || '',
  home_section16_box2_button_link: homePageData?.home_section16_box2_button_link || '',
  home_section16_box3_icon: homePageData?.home_section16_box3_icon || '',
  home_section16_box3_title: homePageData?.home_section16_box3_title || '',
  home_section16_box3_description: homePageData?.home_section16_box3_description || '',
  home_section16_box3_button_text: homePageData?.home_section16_box3_button_text || '',
  home_section16_box3_button_link: homePageData?.home_section16_box3_button_link || '',
  home_section16_box4_icon: homePageData?.home_section16_box4_icon || '',
  home_section16_box4_title: homePageData?.home_section16_box4_title || '',
  home_section16_box4_description: homePageData?.home_section16_box4_description || '',
  home_section16_box4_button_text: homePageData?.home_section16_box4_button_text || '',
  home_section16_box4_button_link: homePageData?.home_section16_box4_button_link || ''
});

const getSection4InitialValues = (homePageData) => ({
  home_section4_title: homePageData?.home_section4_title || '',
  home_section4_subtitle: homePageData?.home_section4_subtitle || '',
  home_section4_fetch_data_from_live_local: !!Number(homePageData?.home_section4_fetch_data_from_live_local),
  home_total_hours_of_support_delivered_by_fcs: homePageData?.home_total_hours_of_support_delivered_by_fcs || '',
  home_hours_of_support_delivered_each_year: homePageData?.home_hours_of_support_delivered_each_year || '',
  home_average_response_time_to_needs_assessors: homePageData?.home_average_response_time_to_needs_assessors || '',
  home_section4_image: homePageData?.home_section4_image || '',
  home_average_time_to_assign_support: homePageData?.home_average_time_to_assign_support || '',
  home_clients_actively_engaged_in_ongoing_support: homePageData?.home_clients_actively_engaged_in_ongoing_support || '',
  home_client_satisfaction_and_rising: homePageData?.home_client_satisfaction_and_rising || '',
  home_facebook_rating: homePageData?.home_facebook_rating || '',
  home_facebook_review: homePageData?.home_facebook_review || '',
  home_google_rating: homePageData?.home_google_rating || '',
  home_google_review: homePageData?.home_google_review || '',
  home_glassdoor_rating: homePageData?.home_glassdoor_rating || '',
  home_glassdoor_review: homePageData?.home_glassdoor_review || '',
  home_indeed_rating: homePageData?.home_indeed_rating || '',
  home_indeed_review: homePageData?.home_indeed_review || ''
});

/* ==============================|| LAYOUTS - STICKY ACTIONBAR ||============================== */

export default function Home() {
  const theme = useTheme();
  const { menuOrientation } = useConfig();
  const [data, setData] = useState([]);
  const [teamList, setTeamList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBannerVideo, setSelectedBannerVideo] = useState(undefined);
  const [bannerVideoPreview, setBannerVideoPreview] = useState('');
  const [selectedBannerImage, setSelectedBannerImage] = useState(undefined);
  const [bannerImagePreview, setBannerImagePreview] = useState('');
  const [apiResponseError, setApiResponseError] = useState('');
  const [whyMostPeopleChooseFcsImage, setWhyMostPeopleChooseFcsImage] = useState(undefined);
  const section5Description1Ref = useRef();
  const section13Description1Ref = useRef();
  const quoteTextRef = useRef();
  const [expanded, setExpanded] = useState('section1');

  const [section2icon1, setSection2Icon1] = useState(null);
  const [section2icon2, setSection2Icon2] = useState(null);
  const [section2icon3, setSection2Icon3] = useState(null);

  const [home_section2_box1_title, setHome_section2_box1_title] = useState('');

  const [section3icon1, setSection3Icon1] = useState(null);
  const [section3icon2, setSection3Icon2] = useState(null);
  const [section3icon3, setSection3Icon3] = useState(null);
  const [section3icon4, setSection3Icon4] = useState(null);
  const [section3icon5, setSection3Icon5] = useState(null);
  const [section3icon6, setSection3Icon6] = useState(null);

  const [section4Image, setSection4Image] = useState(null);
  const [section5Image, setSection5Image] = useState(null);

  const [section7Image1, setSection7Image1] = useState(null);
  const [section7Image2, setSection7Image2] = useState(null);
  const [section7Image3, setSection7Image3] = useState(null);
  const [section7Image4, setSection7Image4] = useState(null);

  const [section9Image, setSection9Image] = useState(null);

  const [section11icon1, setSection11Icon1] = useState(null);
  const [section11icon2, setSection11Icon2] = useState(null);
  const [section11icon3, setSection11Icon3] = useState(null);
  const [section11icon4, setSection11Icon4] = useState(null);

  const [section14Image, setSection14Image] = useState(null);

  const [section16icon1, setSection16Icon1] = useState(null);
  const [section16icon2, setSection16Icon2] = useState(null);
  const [section16icon3, setSection16Icon3] = useState(null);
  const [section16icon4, setSection16Icon4] = useState(null);

  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };

  useEffect(() => {
    setApiResponseError('');
    getHomeData();
    getTeamList();
  }, []);

  useEffect(() => {
    if (data?.home_section5_image) {
      setSection5Image(data.home_section5_image);
    }
  }, [data]);

  useEffect(() => {
    if (data?.home_section7_box1_image) setSection7Image1(data.home_section7_box1_image);
    if (data?.home_section7_box2_image) setSection7Image2(data.home_section7_box2_image);
    if (data?.home_section7_box3_image) setSection7Image3(data.home_section7_box3_image);
    if (data?.home_section7_box4_image) setSection7Image4(data.home_section7_box4_image);
  }, [data]);

  useEffect(() => {
    if (data?.home_section11_box1_icon) setSection11Icon1(data.home_section11_box1_icon);
    if (data?.home_section11_box2_icon) setSection11Icon2(data.home_section11_box2_icon);
    if (data?.home_section11_box3_icon) setSection11Icon3(data.home_section11_box3_icon);
    if (data?.home_section11_box4_icon) setSection11Icon4(data.home_section11_box4_icon);
  }, [data]);

  useEffect(() => {
    if (data?.home_section14_image) setSection14Image(data.home_section14_image);
  }, [data]);

  useEffect(() => {
    if (data?.home_section16_box1_icon) setSection16Icon1(data.home_section16_box1_icon);
    if (data?.home_section16_box2_icon) setSection16Icon2(data.home_section16_box2_icon);
    if (data?.home_section16_box3_icon) setSection16Icon3(data.home_section16_box3_icon);
    if (data?.home_section16_box4_icon) setSection16Icon4(data.home_section16_box4_icon);
  }, [data]);

  const getHomeData = async () => {
    setLoading(true);
    try {
      const response = await AuthService.axiosPrivatePost('/getHomePageCMS');
      if (response.data.status) {
        const siteData = response.data.data;
        setData(siteData);
        setBannerImagePreview(response.data.data.why_most_people_choose_fcs_image);
        if (siteData.home_banner_video) {
          setBannerVideoPreview(siteData.home_banner_video);
        }
        if (siteData.home_banner_image) {
          setBannerImagePreview(siteData.home_banner_image);
        }
      }
    } catch (error) {
      console.error('Error loading cms:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTeamList = async () => {
    setLoading(true);
    try {
      const response = await AuthService.axiosPrivatePost('/activeTeamList');
      if (response.data.status) {
        const teamData = response.data.data;
        setTeamList(teamData);
      }
    } catch (error) {
      console.error('Error loading cms:', error);
    } finally {
      setLoading(false);
    }
  };

  /* Section 1 form */
  const section1Formik = useFormik({
    initialValues: getSection1InitialValues(data),
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: Yup.object({
      home_banner_video: Yup.string().required('Banner video is required'),
      home_banner_image: Yup.string().required('Banner image is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          ...values,
          section: 'section1',
          home_banner_video: selectedBannerVideo || values.home_banner_video || '',
          home_banner_image: selectedBannerImage || values.home_banner_image || ''
        };

        const response = await AuthService.axiosPrivateFormdataPost('/updateHomePageCMS', payload);

        if (response.data.status) {
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: { color: 'success' }
          });
          await getHomeData();
          /* setSelectedBannerVideo(undefined); */
        } else {
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: { color: 'warning' }
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setSubmitting(false);
      }
    }
  });

  // Section 2 form
  const section2Formik = useFormik({
    initialValues: getSection2InitialValues(data),
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: Yup.object({
      home_section2_box1_title: Yup.string().required('Box 1 title is required'),
      home_section2_box1_description: Yup.string().required('Box 1 description is required'),
      home_section2_box1_button_text: Yup.string().required('Box 1 button text is required'),
      home_section2_box1_button_link: Yup.string().url('Enter a valid URL').required('Box 1 button link is required'),
      home_section2_box1_icon: Yup.string().required('Box 1 icon is required'),
      home_section2_box2_title: Yup.string().required('Box 2 title is required'),
      home_section2_box2_description: Yup.string().required('Box 2 description is required'),
      home_section2_box2_button_text: Yup.string().required('Box 2 button text is required'),
      home_section2_box2_button_link: Yup.string().url('Enter a valid URL').required('Box 2 button link is required'),
      home_section2_box2_icon: Yup.string().required('Box 2 icon is required'),
      home_section2_box3_title: Yup.string().required('Box 3 title is required'),
      home_section2_box3_description: Yup.string().required('Box 3 description is required'),
      home_section2_box3_button_text: Yup.string().required('Box 3 button text is required'),
      home_section2_box3_button_link: Yup.string().url('Enter a valid URL').required('Box 3 button link is required'),
      home_section2_box3_icon: Yup.string().required('Box 3 icon is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await AuthService.axiosPrivateFormdataPost('/updateHomePageCMS', values);

        if (response.data.status) {
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: { color: 'success' }
          });
          await getHomeData();
        } else {
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: { color: 'warning' }
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setSubmitting(false);
      }
    }
  });

  // Section 3 form
  const section3Formik = useFormik({
    initialValues: getSection3InitialValues(data),
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: Yup.object({
      home_section3_title: Yup.string().required('Section title is required'),
      home_section3_subtitle: Yup.string().required('Section subtitle is required'),
      home_section3_box1_icon: Yup.string().required('Box 1 icon is required'),
      home_section3_box1_title: Yup.string().required('Box 1 title is required'),
      home_section3_box2_icon: Yup.string().required('Box 2 icon is required'),
      home_section3_box2_title: Yup.string().required('Box 2 title is required'),
      home_section3_box3_icon: Yup.string().required('Box 3 icon is required'),
      home_section3_box3_title: Yup.string().required('Box 3 title is required'),
      home_section3_box4_icon: Yup.string().required('Box 4 icon is required'),
      home_section3_box4_title: Yup.string().required('Box 4 title is required'),
      home_section3_box5_icon: Yup.string().required('Box 5 icon is required'),
      home_section3_box5_title: Yup.string().required('Box 5 title is required'),
      home_section3_box6_icon: Yup.string().required('Box 6 icon is required'),
      home_section3_box6_title: Yup.string().required('Box 6 title is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await AuthService.axiosPrivateFormdataPost('/updateHomePageCMS', values);

        if (response.data.status) {
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: { color: 'success' }
          });
          await getHomeData();
        } else {
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: { color: 'warning' }
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setSubmitting(false);
      }
    }
  });

  // Section 4 form
  const section4Formik = useFormik({
    initialValues: getSection4InitialValues(data),
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: Yup.object({
      home_section4_title: Yup.string().required('Section title is required'),
      home_section4_subtitle: Yup.string().required('Section subtitle is required'),
      home_section4_image: Yup.string().required('Image is required'),
      home_total_hours_of_support_delivered_by_fcs: Yup.number().typeError('Enter a valid number').required('Total hours is required'),
      home_hours_of_support_delivered_each_year: Yup.number().typeError('Enter a valid number').required('Hours each year is required'),
      home_average_response_time_to_needs_assessors: Yup.number()
        .typeError('Enter a valid number')
        .required('Avg response time is required'),
      home_average_time_to_assign_support: Yup.number()
        .typeError('Enter a valid number')
        .required('Avg time to assign support is required'),
      home_clients_actively_engaged_in_ongoing_support: Yup.number()
        .typeError('Enter a valid number')
        .required('Clients engaged is required'),
      home_client_satisfaction_and_rising: Yup.number().typeError('Enter a valid number').required('Client satisfaction is required'),
      home_facebook_rating: Yup.number().typeError('Enter a valid rating').required('Facebook rating is required'),
      home_facebook_review: Yup.number().typeError('Enter a valid number').required('Facebook reviews required'),
      home_google_rating: Yup.number().typeError('Enter a valid rating').required('Google rating is required'),
      home_google_review: Yup.number().typeError('Enter a valid number').required('Google reviews required'),
      home_glassdoor_rating: Yup.number().typeError('Enter a valid rating').required('Glassdoor rating is required'),
      home_glassdoor_review: Yup.number().typeError('Enter a valid number').required('Glassdoor reviews required'),
      home_indeed_rating: Yup.number().typeError('Enter a valid rating').required('Indeed rating is required'),
      home_indeed_review: Yup.number().typeError('Enter a valid number').required('Indeed reviews required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await AuthService.axiosPrivateFormdataPost('/updateHomePageCMS', values);

        if (response.data.status) {
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: { color: 'success' }
          });
          await getHomeData();
        } else {
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: { color: 'warning' }
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setSubmitting(false);
      }
    }
  });

  // Section 5 form
  const section5Formik = useFormik({
    initialValues: getSection5InitialValues(data),
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: Yup.object({
      home_section5_title: Yup.string().required('Section title is required'),
      home_section5_subtitle: Yup.string().required('Section subtitle is required'),
      home_section5_image: Yup.mixed().required('Image is required'),
      home_section5_description: Yup.string().required('Description is required'),
      home_section5_sub_title1: Yup.string().required('Sub title 1 is required'),
      home_section5_sub_description1: Yup.string().required('Sub description 1 is required'),
      home_section5_sub_title2: Yup.string().required('Sub title 2 is required'),
      home_section5_sub_description2: Yup.string().required('Sub description 2 is required'),
      home_section5_description2: Yup.string().required('Description 2 is required'),
      home_section5_bottom_description: Yup.string().required('Bottom description is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          ...values,
          section: 'section5',
          home_section5_image: values.home_section5_image
        };

        const response = await AuthService.axiosPrivateFormdataPost('/updateHomePageCMS', payload);

        if (response.data.status) {
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: { color: 'success' }
          });
          await getHomeData();
        } else {
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: { color: 'warning' }
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setSubmitting(false);
      }
    }
  });

  // Section 6 form
  const section6Formik = useFormik({
    initialValues: getSection6InitialValues(data),
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: Yup.object({
      home_section6_title: Yup.string().required('Section title is required'),
      home_section6_subtitle: Yup.string().required('Section subtitle is required'),
      home_section6_box1_title: Yup.string().required('Box 1 title is required'),
      home_section6_box1_description: Yup.string().required('Box 1 description is required'),
      home_section6_box1_freddie_description: Yup.string().required('Box 1 freddie text is required'),
      home_section6_box2_title: Yup.string().required('Box 2 title is required'),
      home_section6_box2_description: Yup.string().required('Box 2 description is required'),
      home_section6_box2_freddie_description: Yup.string().required('Box 2 freddie text is required'),
      home_section6_box3_title: Yup.string().required('Box 3 title is required'),
      home_section6_box3_description: Yup.string().required('Box 3 description is required'),
      home_section6_box3_freddie_description: Yup.string().required('Box 3 freddie text is required'),
      home_section6_box4_title: Yup.string().required('Box 4 title is required'),
      home_section6_box4_description: Yup.string().required('Box 4 description is required'),
      home_section6_box4_freddie_description: Yup.string().required('Box 4 freddie text is required'),
      home_section6_box5_title: Yup.string().required('Box 5 title is required'),
      home_section6_box5_description: Yup.string().required('Box 5 description is required'),
      home_section6_box5_freddie_description: Yup.string().required('Box 5 freddie text is required'),
      home_section6_box6_title: Yup.string().required('Box 6 title is required'),
      home_section6_box6_description: Yup.string().required('Box 6 description is required'),
      home_section6_box6_freddie_description: Yup.string().required('Box 6 freddie text is required'),
      home_section6_box7_title: Yup.string().required('Box 7 title is required'),
      home_section6_box7_description: Yup.string().required('Box 7 description is required'),
      home_section6_box7_freddie_description: Yup.string().required('Box 7 freddie text is required'),
      home_section6_box8_title: Yup.string().required('Box 8 title is required'),
      home_section6_box8_description: Yup.string().required('Box 8 description is required'),
      home_section6_box8_freddie_description: Yup.string().required('Box 8 freddie text is required'),
      home_section6_box9_title: Yup.string().required('Box 9 title is required'),
      home_section6_box9_description: Yup.string().required('Box 9 description is required'),
      home_section6_box9_freddie_description: Yup.string().required('Box 9 freddie text is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          ...values,
          section: 'section6'
        };

        const response = await AuthService.axiosPrivateFormdataPost('/updateHomePageCMS', payload);

        if (response.data.status) {
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: { color: 'success' }
          });
          await getHomeData();
        } else {
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: { color: 'warning' }
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setSubmitting(false);
      }
    }
  });

  // Section 7 form
  const section7Formik = useFormik({
    initialValues: getSection7InitialValues(data),
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: Yup.object({
      home_section7_title: Yup.string().required('Section title is required'),
      home_section7_subtitle: Yup.string().required('Section subtitle is required'),
      home_section7_box1_image: Yup.mixed().required('Box 1 image is required'),
      home_section7_box1_title: Yup.string().required('Box 1 title is required'),
      home_section7_box1_description: Yup.string().required('Box 1 description is required'),
      home_section7_box1_button_text: Yup.string().required('Box 1 button text is required'),
      home_section7_box1_button_link: Yup.string().url('Enter a valid URL').required('Box 1 button link is required'),

      home_section7_box2_image: Yup.mixed().required('Box 2 image is required'),
      home_section7_box2_title: Yup.string().required('Box 2 title is required'),
      home_section7_box2_description: Yup.string().required('Box 2 description is required'),
      home_section7_box2_button_text: Yup.string().required('Box 2 button text is required'),
      home_section7_box2_button_link: Yup.string().url('Enter a valid URL').required('Box 2 button link is required'),

      home_section7_box3_image: Yup.mixed().required('Box 3 image is required'),
      home_section7_box3_title: Yup.string().required('Box 3 title is required'),
      home_section7_box3_description: Yup.string().required('Box 3 description is required'),
      home_section7_box3_button_text: Yup.string().required('Box 3 button text is required'),
      home_section7_box3_button_link: Yup.string().url('Enter a valid URL').required('Box 3 button link is required'),

      home_section7_box4_image: Yup.mixed().required('Box 4 image is required'),
      home_section7_box4_title: Yup.string().required('Box 4 title is required'),
      home_section7_box4_description: Yup.string().required('Box 4 description is required'),
      home_section7_box4_button_text: Yup.string().required('Box 4 button text is required'),
      home_section7_box4_button_link: Yup.string().url('Enter a valid URL').required('Box 4 button link is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          ...values,
          section: 'section7'
        };

        const response = await AuthService.axiosPrivateFormdataPost('/updateHomePageCMS', payload);

        if (response.data.status) {
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: { color: 'success' }
          });
          await getHomeData();
        } else {
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: { color: 'warning' }
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setSubmitting(false);
      }
    }
  });

  // Section 8 form
  const section8Formik = useFormik({
    initialValues: getSection8InitialValues(data),
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: Yup.object({
      home_section8_title: Yup.string().required('Section title is required'),
      home_section8_subtitle: Yup.string().required('Section subtitle is required'),
      home_section8_team_members: Yup.array().min(1, 'Select at least one team member'),
      home_section8_card_title: Yup.string().required('Card title is required'),
      home_section8_card_description: Yup.string().required('Card description is required'),
      home_section8_card_button_text: Yup.string().required('Button text is required'),
      home_section8_card_button_link: Yup.string().url('Enter a valid URL').required('Button link is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          ...values,
          section: 'section8',
          home_section8_team_members: (values.home_section8_team_members || []).join(',')
        };

        const response = await AuthService.axiosPrivateFormdataPost('/updateHomePageCMS', payload);

        if (response.data.status) {
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: { color: 'success' }
          });
          await getHomeData();
        } else {
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: { color: 'warning' }
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setSubmitting(false);
      }
    }
  });

  // Section 9 form
  const section9Formik = useFormik({
    initialValues: getSection9InitialValues(data),
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: Yup.object({
      home_section9_title: Yup.string().required('Section title is required'),
      home_section9_subtitle: Yup.string().required('Section subtitle is required'),
      home_section9_email: Yup.string().email('Enter a valid email').required('Email is required'),
      home_section9_phone: Yup.string().required('Phone number is required'),
      home_section9_whatsapp: Yup.string().required('WhatsApp number is required'),
      home_section9_button_text: Yup.string().required('Button text is required'),
      home_section9_button_link: Yup.string().url('Enter a valid URL').required('Button link is required'),
      home_section9_image: Yup.mixed().required('Image is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          ...values,
          section: 'section9'
        };

        const response = await AuthService.axiosPrivateFormdataPost('/updateHomePageCMS', payload);

        if (response.data.status) {
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: { color: 'success' }
          });
          await getHomeData();
        } else {
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: { color: 'warning' }
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setSubmitting(false);
      }
    }
  });

  // Section 10 form
  const section10Formik = useFormik({
    initialValues: getSection10InitialValues(data),
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: Yup.object({
      home_section10_title: Yup.string().required('Section title is required'),
      home_section10_subtitle: Yup.string().required('Section subtitle is required'),
      home_section10_bottom_right_text: Yup.string().required('Bottom right text is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          ...values,
          section: 'section10'
        };

        const response = await AuthService.axiosPrivateFormdataPost('/updateHomePageCMS', payload);

        if (response.data.status) {
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: { color: 'success' }
          });
          await getHomeData();
        } else {
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: { color: 'warning' }
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setSubmitting(false);
      }
    }
  });

  // Section 11 form
  const section11Formik = useFormik({
    initialValues: getSection11InitialValues(data),
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: Yup.object({
      home_section11_title: Yup.string().required('Section title is required'),
      home_section11_subtitle: Yup.string().required('Section subtitle is required'),
      home_section11_box1_icon: Yup.mixed().required('Box 1 icon is required'),
      home_section11_box1_title: Yup.string().required('Box 1 title is required'),
      home_section11_box1_description: Yup.string().required('Box 1 description is required'),
      home_section11_box2_icon: Yup.mixed().required('Box 2 icon is required'),
      home_section11_box2_title: Yup.string().required('Box 2 title is required'),
      home_section11_box2_description: Yup.string().required('Box 2 description is required'),
      home_section11_box3_icon: Yup.mixed().required('Box 3 icon is required'),
      home_section11_box3_title: Yup.string().required('Box 3 title is required'),
      home_section11_box3_description: Yup.string().required('Box 3 description is required'),
      home_section11_box4_icon: Yup.mixed().required('Box 4 icon is required'),
      home_section11_box4_title: Yup.string().required('Box 4 title is required'),
      home_section11_box4_description: Yup.string().required('Box 4 description is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          ...values,
          section: 'section11'
        };

        const response = await AuthService.axiosPrivateFormdataPost('/updateHomePageCMS', payload);

        if (response.data.status) {
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: { color: 'success' }
          });
          await getHomeData();
        } else {
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: { color: 'warning' }
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setSubmitting(false);
      }
    }
  });

  // Section 12 form
  const section12Formik = useFormik({
    initialValues: getSection12InitialValues(data),
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: Yup.object({
      home_section12_title: Yup.string().required('Section title is required'),
      home_section12_subtitle: Yup.string().required('Section subtitle is required'),
      home_section12_bottom_description: Yup.string().required('Bottom description is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          ...values,
          section: 'section12'
        };

        const response = await AuthService.axiosPrivateFormdataPost('/updateHomePageCMS', payload);

        if (response.data.status) {
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: { color: 'success' }
          });
          await getHomeData();
        } else {
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: { color: 'warning' }
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setSubmitting(false);
      }
    }
  });

  // Section 13 form
  const section13Formik = useFormik({
    initialValues: getSection13InitialValues(data),
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: Yup.object({
      home_section13_title: Yup.string().required('Section title is required'),
      home_section13_subtitle: Yup.string().required('Section subtitle is required'),
      home_section13_description: Yup.string().required('Description is required'),
      home_section13_bottom_title: Yup.string().required('Bottom title is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          ...values,
          section: 'section13'
        };

        const response = await AuthService.axiosPrivateFormdataPost('/updateHomePageCMS', payload);

        if (response.data.status) {
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: { color: 'success' }
          });
          await getHomeData();
        } else {
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: { color: 'warning' }
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setSubmitting(false);
      }
    }
  });

  // Section 14 form
  const section14Formik = useFormik({
    initialValues: getSection14InitialValues(data),
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: Yup.object({
      home_section14_title: Yup.string().required('Section title is required'),
      home_section14_subtitle: Yup.string().required('Section subtitle is required'),
      home_section14_active_support_workers: Yup.number().typeError('Enter a valid number').required('Active support workers is required'),
      home_section14_open_roles_across_the_uk: Yup.number().typeError('Enter a valid number').required('Open roles is required'),
      home_section14_registered_support_staff: Yup.number().typeError('Enter a valid number').required('Registered staff is required'),
      home_section14_rate_per_hour: Yup.number().typeError('Enter a valid number').required('Rate per hour is required'),
      home_section14_button_text: Yup.string().required('Button text is required'),
      home_section14_button_link: Yup.string().url('Enter a valid URL').required('Button link is required'),
      home_section14_image: Yup.mixed().required('Image is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          ...values,
          section: 'section14'
        };

        const response = await AuthService.axiosPrivateFormdataPost('/updateHomePageCMS', payload);

        if (response.data.status) {
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: { color: 'success' }
          });
          await getHomeData();
        } else {
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: { color: 'warning' }
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setSubmitting(false);
      }
    }
  });

  // Section 15 form
  const section15Formik = useFormik({
    initialValues: getSection15InitialValues(data),
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: Yup.object({
      home_section15_title: Yup.string().required('Section title is required'),
      home_section15_subtitle: Yup.string().required('Section subtitle is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          ...values,
          section: 'section15'
        };

        const response = await AuthService.axiosPrivateFormdataPost('/updateHomePageCMS', payload);

        if (response.data.status) {
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: { color: 'success' }
          });
          await getHomeData();
        } else {
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: { color: 'warning' }
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setSubmitting(false);
      }
    }
  });

  // Section 16 form
  const section16Formik = useFormik({
    initialValues: getSection16InitialValues(data),
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: false,
    validationSchema: Yup.object({
      home_section16_title: Yup.string().required('Section title is required'),
      home_section16_subtitle: Yup.string().required('Section subtitle is required'),
      home_section16_box1_icon: Yup.mixed().required('Box 1 icon is required'),
      home_section16_box1_title: Yup.string().required('Box 1 title is required'),
      home_section16_box1_description: Yup.string().required('Box 1 description is required'),
      home_section16_box1_button_text: Yup.string().required('Box 1 button text is required'),
      home_section16_box1_button_link: Yup.string().url('Enter a valid URL').required('Box 1 button link is required'),
      home_section16_box2_icon: Yup.mixed().required('Box 2 icon is required'),
      home_section16_box2_title: Yup.string().required('Box 2 title is required'),
      home_section16_box2_description: Yup.string().required('Box 2 description is required'),
      home_section16_box2_button_text: Yup.string().required('Box 2 button text is required'),
      home_section16_box2_button_link: Yup.string().url('Enter a valid URL').required('Box 2 button link is required'),
      home_section16_box3_icon: Yup.mixed().required('Box 3 icon is required'),
      home_section16_box3_title: Yup.string().required('Box 3 title is required'),
      home_section16_box3_description: Yup.string().required('Box 3 description is required'),
      home_section16_box3_button_text: Yup.string().required('Box 3 button text is required'),
      home_section16_box3_button_link: Yup.string().url('Enter a valid URL').required('Box 3 button link is required'),
      home_section16_box4_icon: Yup.mixed().required('Box 4 icon is required'),
      home_section16_box4_title: Yup.string().required('Box 4 title is required'),
      home_section16_box4_description: Yup.string().required('Box 4 description is required'),
      home_section16_box4_button_text: Yup.string().required('Box 4 button text is required'),
      home_section16_box4_button_link: Yup.string().url('Enter a valid URL').required('Box 4 button link is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = {
          ...values,
          section: 'section16'
        };

        const response = await AuthService.axiosPrivateFormdataPost('/updateHomePageCMS', payload);

        if (response.data.status) {
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: { color: 'success' }
          });
          await getHomeData();
        } else {
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: { color: 'warning' }
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setSubmitting(false);
      }
    }
  });

  const initialValues = useMemo(() => getInitialValues(data), []);

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: false
    /* onSubmit: async (values, { setSubmitting }) => {
      try {
        const newSettings = {
          ...values,
          home_banner_video: selectedBannerVideo || '',
          why_most_people_choose_fcs_image: whyMostPeopleChooseFcsImage ? whyMostPeopleChooseFcsImage : ''
        };

        const response = await AuthService.axiosPrivateFormdataPost('/updateHomePageCMS', newSettings);

        if (response.data.status) {
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: { color: 'success' }
          });
          await getHomeData();
          setSelectedBannerVideo(undefined);
          setSubmitting(false);
        } else {
          openSnackbar({
            open: true,
            message: response.data.message,
            variant: 'alert',
            alert: { color: 'warning' }
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setSubmitting(false);
      }
    } */
  });

  const { errors, touched, handleSubmit, isSubmitting, getFieldProps, values, setErrors, setTouched, setSubmitting } = formik;

  const getFieldError = (formikBag, name) => {
    if (!name) return '';
    const show = formikBag.touched[name] || formikBag.submitCount > 0;
    return show && formikBag.errors[name] ? formikBag.errors[name] : '';
  };

  // Build a section to field map so we can validate and save section-wise
  const buildSectionFieldMap = () => {
    const allKeys = Object.keys(initialValues);
    const manualMap = {
      section1: [
        'home_banner_video',
        'home_banner_image',
        'home_hide_show_home_banner_video',
        'home_hide_show_home_banner_image',
        'home_hide_show_home_banner_gradient_bg'
      ],
      section4: [
        'home_total_hours_of_support_delivered_by_fcs',
        'home_average_time_to_assign_support',
        'home_hours_of_support_delivered_each_year',
        'home_clients_actively_engaged_in_ongoing_support',
        'home_average_response_time_to_needs_assessors',
        'home_client_satisfaction_and_rising',
        'home_facebook_rating',
        'home_facebook_review',
        'home_google_rating',
        'home_google_review',
        'home_glassdoor_rating',
        'home_glassdoor_review',
        'home_indeed_rating',
        'home_indeed_review'
      ]
    };

    const nonPrefixedMap = {
      home_banner_video: 'section1',
      home_banner_image: 'section1',
      home_hide_show_home_banner_video: 'section1',
      home_hide_show_home_banner_image: 'section1',
      home_hide_show_home_banner_gradient_bg: 'section1',
      home_total_hours_of_support_delivered_by_fcs: 'section4',
      home_average_time_to_assign_support: 'section4',
      home_hours_of_support_delivered_each_year: 'section4',
      home_clients_actively_engaged_in_ongoing_support: 'section4',
      home_average_response_time_to_needs_assessors: 'section4',
      home_client_satisfaction_and_rising: 'section4',
      home_facebook_rating: 'section4',
      home_facebook_review: 'section4',
      home_google_rating: 'section4',
      home_google_review: 'section4',
      home_glassdoor_rating: 'section4',
      home_glassdoor_review: 'section4',
      home_indeed_rating: 'section4',
      home_indeed_review: 'section4'
    };

    const map = {
      section1: [...manualMap.section1],
      section4: [...manualMap.section4]
    };

    allKeys.forEach((key) => {
      const match = key.match(/^home_section(\d+)_/);
      if (match && match[1]) {
        const sectionKey = `section${match[1]}`;
        if (!map[sectionKey]) map[sectionKey] = [];
        map[sectionKey].push(key);
        return;
      }

      if (nonPrefixedMap[key]) {
        const sectionKey = nonPrefixedMap[key];
        if (!map[sectionKey]) map[sectionKey] = [];
        map[sectionKey].push(key);
      }
    });

    return map;
  };

  const sectionFields = useRef(buildSectionFieldMap());

  // Schemas for sections we want strict validation on
  const sectionSchemas = useRef({
    section1: Yup.object({
      home_banner_video: Yup.string().required('Banner video is required.'),
      home_banner_image: Yup.string().required('Banner image is required.'),
      home_hide_show_home_banner_video: Yup.string().required('Hide show home banner video.'),
      home_hide_show_home_banner_image: Yup.string().required('Hide show home banner image.'),
      home_hide_show_home_banner_gradient_bg: Yup.string().required('Hide show home banner gradient background.')
    }),
    section2: Yup.object({
      home_section2_box1_title: Yup.string().required('Box 1 title is required'),
      home_section2_box1_description: Yup.string().required('Box 1 description is required'),
      home_section2_box1_button_text: Yup.string().required('Box 1 button text is required'),
      home_section2_box1_button_link: Yup.string().url('Enter a valid URL').required('Box 1 button link is required'),

      home_section2_box2_title: Yup.string().required('Box 2 title is required'),
      home_section2_box2_description: Yup.string().required('Box 2 description is required'),
      home_section2_box2_button_text: Yup.string().required('Box 2 button text is required'),
      home_section2_box2_button_link: Yup.string().url('Enter a valid URL').required('Box 2 button link is required'),

      home_section2_box3_title: Yup.string().required('Box 3 title is required'),
      home_section2_box3_description: Yup.string().required('Box 3 description is required'),
      home_section2_box3_button_text: Yup.string().required('Box 3 button text is required'),
      home_section2_box3_button_link: Yup.string().url('Enter a valid URL').required('Box 3 button link is required')
    })
  });

  const validateSection = (sectionKey) => {
    const fields = sectionFields.current[sectionKey] || [];
    const schema = sectionSchemas.current[sectionKey];

    if (schema) {
      try {
        schema.validateSync(_.pick(values, fields), { abortEarly: false });
        return {};
      } catch (err) {
        if (err.inner) {
          return err.inner.reduce((acc, e) => {
            if (e.path) acc[e.path] = e.message;
            return acc;
          }, {});
        }
      }
    }

    // Fallback simple required check for sections without a schema yet
    const sectionErrors = {};
    fields.forEach((field) => {
      const value = values[field];
      const isString = typeof value === 'string';
      const isEmptyString = isString && value.trim() === '';
      const isUndefined = value === undefined || value === null;
      if (isEmptyString || isUndefined) {
        sectionErrors[field] = 'This field is required';
      }
    });
    return sectionErrors;
  };

  const handleSectionSave = async (sectionKey) => {
    setSubmitting(true);
    const fields = sectionFields.current[sectionKey] || [];
    const sectionErrors = validateSection(sectionKey);

    if (Object.keys(sectionErrors).length) {
      const touchedFields = fields.reduce((acc, field) => ({ ...acc, [field]: true }), {});
      setErrors((prev) => ({ ...prev, ...sectionErrors }));
      setTouched((prev) => ({ ...prev, ...touchedFields }));
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        ...values,
        home_banner_video: selectedBannerVideo || '',
        why_most_people_choose_fcs_image: whyMostPeopleChooseFcsImage ? whyMostPeopleChooseFcsImage : ''
      };

      const response = await AuthService.axiosPrivateFormdataPost('/updateHomePageCMS', payload);

      if (response.data.status) {
        openSnackbar({
          open: true,
          message: response.data.message,
          variant: 'alert',
          alert: { color: 'success' }
        });
        await getHomeData();
        setSelectedBannerVideo(undefined);
      } else {
        openSnackbar({
          open: true,
          message: response.data.message,
          variant: 'alert',
          alert: { color: 'warning' }
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  /* const Switch = styled(Switch)(({ theme }) => ({
    width: 50,
    height: 26,
    padding: 0,
    display: 'flex',
    '&:active': {
      '& .MuiSwitch-thumb': {
        width: 15
      },
      '& .MuiSwitch-switchBase.Mui-checked': {
        transform: 'translateX(9px)'
      }
    },
    '& .MuiSwitch-switchBase': {
      padding: 2,
      '&.Mui-checked': {
        transform: 'translateX(24px)',
        color: '#fff',
        '& + .MuiSwitch-track': {
          opacity: 1,
          background: theme.palette.mode === 'dark' ? '#177ddc' : '#1890ff'
        }
      }
    },
    '& .MuiSwitch-thumb': {
      boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
      width: 22,
      height: 22,
      borderRadius: 10,
      transition: theme.transitions.create(['width'], {
        duration: 200
      })
    },
    '& .MuiSwitch-track': {
      borderRadius: 26 / 2,
      opacity: 1,
      background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,.35)' : 'rgba(0,0,0,.25)',
      boxSizing: 'border-box'
    }
  }));
  Switch.displayName = 'Switch'; */

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        {loading ? (
          <Stack direction="row" justifyContent="center">
            <CircularWithPath />
          </Stack>
        ) : (
          <MainCard title="Home Page CMS">
            <Box
              sx={{
                marginTop: '20px',
                '& .MuiAccordion-root': {
                  borderColor: 'divider',
                  '& .MuiAccordionSummary-root': {
                    bgcolor: 'transparent',
                    flexDirection: 'row',
                    '&:focus-visible': {
                      bgcolor: 'primary.lighter'
                    }
                  },
                  '& .MuiAccordionDetails-root': {
                    borderColor: 'divider'
                  },
                  '& .Mui-expanded': {
                    color: 'primary.main'
                  }
                }
              }}
            >
              <Accordion expanded={expanded === 'section12'} onChange={handleChange('section12')}>
                <AccordionSummary aria-controls="section12-content" id="section12-header">
                  <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="h5"> Section 12 </Typography>
                      <Tooltip
                        placement="right"
                        arrow
                        title={
                          <Box sx={{ p: 1, maxWidth: 300 }}>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                              Section 12 Guide
                            </Typography>
                            <img
                              src={section12SS}
                              alt="banner-preview"
                              style={{
                                width: '100%',
                                height: 'auto',
                                borderRadius: 6,
                                border: '1px solid #ddd'
                              }}
                            />
                          </Box>
                        }
                      >
                        <InfoCircleOutlined sx={{ color: 'primary.main', cursor: 'pointer' }} />
                      </Tooltip>
                    </Stack>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          boxShadow: '0 1px 6px rgba(0,0,0,0.04)'
                        }}
                      >
                        <Stack spacing={2}>
                          <TextField
                            fullWidth
                            label="Section Title"
                            variant="outlined"
                            name="home_section12_title"
                            id="home_section12_title"
                            {...section12Formik.getFieldProps('home_section12_title')}
                            error={Boolean(getFieldError(section12Formik, 'home_section12_title'))}
                            helperText={getFieldError(section12Formik, 'home_section12_title')}
                          />
                          <TextField
                            fullWidth
                            label="Section Sub Title"
                            variant="outlined"
                            multiline
                            rows={2}
                            name="home_section12_subtitle"
                            id="home_section12_subtitle"
                            {...section12Formik.getFieldProps('home_section12_subtitle')}
                            error={Boolean(getFieldError(section12Formik, 'home_section12_subtitle'))}
                            helperText={getFieldError(section12Formik, 'home_section12_subtitle')}
                          />
                          <TextField
                            fullWidth
                            label="Section Bottom Description"
                            variant="outlined"
                            multiline
                            rows={4}
                            name="home_section12_bottom_description"
                            id="home_section12_bottom_description"
                            {...section12Formik.getFieldProps('home_section12_bottom_description')}
                            error={Boolean(getFieldError(section12Formik, 'home_section12_bottom_description'))}
                            helperText={getFieldError(section12Formik, 'home_section12_bottom_description')}
                          />
                        </Stack>
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
                      <LoadingButton
                        variant="contained"
                        loading={section12Formik.isSubmitting}
                        onClick={section12Formik.handleSubmit}
                        color="primary"
                      >
                        Save
                      </LoadingButton>
                    </Stack>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Box>
            <Box
              sx={{
                marginTop: '20px',
                '& .MuiAccordion-root': {
                  borderColor: 'divider',
                  '& .MuiAccordionSummary-root': {
                    bgcolor: 'transparent',
                    flexDirection: 'row',
                    '&:focus-visible': {
                      bgcolor: 'primary.lighter'
                    }
                  },
                  '& .MuiAccordionDetails-root': {
                    borderColor: 'divider'
                  },
                  '& .Mui-expanded': {
                    color: 'primary.main'
                  }
                }
              }}
            >
              <Accordion expanded={expanded === 'section13'} onChange={handleChange('section13')}>
                <AccordionSummary aria-controls="section13-content" id="section13-header">
                  <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="h5"> Section 13 </Typography>
                      <Tooltip
                        placement="right"
                        arrow
                        title={
                          <Box sx={{ p: 1, maxWidth: 300 }}>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                              Section 13 Guide
                            </Typography>
                            <img
                              src={section13SS}
                              alt="banner-preview"
                              style={{
                                width: '100%',
                                height: 'auto',
                                borderRadius: 6,
                                border: '1px solid #ddd'
                              }}
                            />
                          </Box>
                        }
                      >
                        <InfoCircleOutlined sx={{ color: 'primary.main', cursor: 'pointer' }} />
                      </Tooltip>
                    </Stack>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          boxShadow: '0 1px 6px rgba(0,0,0,0.04)'
                        }}
                      >
                        <Stack spacing={2}>
                          <TextField
                            fullWidth
                            label="Section Title"
                            variant="outlined"
                            name="home_section13_title"
                            id="home_section13_title"
                            {...section13Formik.getFieldProps('home_section13_title')}
                            error={Boolean(getFieldError(section13Formik, 'home_section13_title'))}
                            helperText={getFieldError(section13Formik, 'home_section13_title')}
                          />
                          <TextField
                            fullWidth
                            label="Section Sub Title"
                            variant="outlined"
                            multiline
                            rows={2}
                            name="home_section13_subtitle"
                            id="home_section13_subtitle"
                            {...section13Formik.getFieldProps('home_section13_subtitle')}
                            error={Boolean(getFieldError(section13Formik, 'home_section13_subtitle'))}
                            helperText={getFieldError(section13Formik, 'home_section13_subtitle')}
                          />
                          <Box>
                            <Typography variant="h6" sx={{ mb: 1 }}>
                              Description
                            </Typography>
                            <Ckeditor
                              id="home_section13_description"
                              name="home_section13_description"
                              InitialData={section13Formik.values.home_section13_description}
                              setData={(val) => {
                                section13Formik.setFieldValue('home_section13_description', val);
                              }}
                              onBlur={() => section13Formik.setFieldTouched('home_section13_description', true)}
                              section13Description1Ref={section13Description1Ref}
                            />
                            {getFieldError(section13Formik, 'home_section13_description') && (
                              <FormHelperText error sx={{ mt: 0.5 }}>
                                {getFieldError(section13Formik, 'home_section13_description')}
                              </FormHelperText>
                            )}
                          </Box>
                          <TextField
                            fullWidth
                            label="Section Bottom Title"
                            variant="outlined"
                            name="home_section13_bottom_title"
                            id="home_section13_bottom_title"
                            {...section13Formik.getFieldProps('home_section13_bottom_title')}
                            error={Boolean(getFieldError(section13Formik, 'home_section13_bottom_title'))}
                            helperText={getFieldError(section13Formik, 'home_section13_bottom_title')}
                          />
                        </Stack>
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
                      <LoadingButton
                        variant="contained"
                        loading={section13Formik.isSubmitting}
                        onClick={section13Formik.handleSubmit}
                        color="primary"
                      >
                        Save
                      </LoadingButton>
                    </Stack>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Box>
            <Box
              sx={{
                marginTop: '20px',
                '& .MuiAccordion-root': {
                  borderColor: 'divider',
                  '& .MuiAccordionSummary-root': {
                    bgcolor: 'transparent',
                    flexDirection: 'row',
                    '&:focus-visible': {
                      bgcolor: 'primary.lighter'
                    }
                  },
                  '& .MuiAccordionDetails-root': {
                    borderColor: 'divider'
                  },
                  '& .Mui-expanded': {
                    color: 'primary.main'
                  }
                }
              }}
            >
              <Accordion expanded={expanded === 'section14'} onChange={handleChange('section14')}>
                <AccordionSummary aria-controls="section14-content" id="section14-header">
                  <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="h5"> Section 14 </Typography>
                      <Tooltip
                        placement="right"
                        arrow
                        title={
                          <Box sx={{ p: 1, maxWidth: 300 }}>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                              Section 14 Guide
                            </Typography>
                            <img
                              src={section14SS}
                              alt="banner-preview"
                              style={{
                                width: '100%',
                                height: 'auto',
                                borderRadius: 6,
                                border: '1px solid #ddd'
                              }}
                            />
                          </Box>
                        }
                      >
                        <InfoCircleOutlined sx={{ color: 'primary.main', cursor: 'pointer' }} />
                      </Tooltip>
                    </Stack>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={9}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          boxShadow: '0 1px 6px rgba(0,0,0,0.04)'
                        }}
                      >
                        <Stack spacing={2}>
                          <TextField
                            fullWidth
                            label="Section Title"
                            variant="outlined"
                            name="home_section14_title"
                            id="home_section14_title"
                            {...section14Formik.getFieldProps('home_section14_title')}
                            error={Boolean(getFieldError(section14Formik, 'home_section14_title'))}
                            helperText={getFieldError(section14Formik, 'home_section14_title')}
                          />
                          <TextField
                            fullWidth
                            label="Section Sub Title"
                            variant="outlined"
                            multiline
                            rows={2}
                            name="home_section14_subtitle"
                            id="home_section14_subtitle"
                            {...section14Formik.getFieldProps('home_section14_subtitle')}
                            error={Boolean(getFieldError(section14Formik, 'home_section14_subtitle'))}
                            helperText={getFieldError(section14Formik, 'home_section14_subtitle')}
                          />
                          <Grid item xs={12}>
                            <Box
                              sx={{
                                p: 2,
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'divider',
                                boxShadow: '0 1px 6px rgba(0,0,0,0.04)'
                              }}
                            >
                              <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                  <Typography variant="description1" sx={{ mb: 1 }}>
                                    Fetch Data From Live / Local
                                  </Typography>
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <Typography>Local</Typography>
                                    <Switch
                                      id="home_section14_fetch_data_from_live_local"
                                      name="home_section14_fetch_data_from_live_local"
                                      checked={Boolean(section14Formik.values.home_section14_fetch_data_from_live_local)}
                                      onChange={(e) =>
                                        section14Formik.setFieldValue('home_section14_fetch_data_from_live_local', e.target.checked)
                                      }
                                    />
                                    <Typography>Live</Typography>
                                  </Stack>
                                </Grid>
                              </Grid>
                            </Box>
                          </Grid>
                          <Box>
                            <Grid item xs={12}>
                              <Grid container spacing={2}>
                                <Grid item xs={12} md={3}>
                                  <Stack spacing={2}>
                                    <TextField
                                      fullWidth
                                      label="No. of Active support workers"
                                      variant="outlined"
                                      name="home_section14_active_support_workers"
                                      id="home_section14_active_support_workers"
                                      {...section14Formik.getFieldProps('home_section14_active_support_workers')}
                                      error={Boolean(getFieldError(section14Formik, 'home_section14_active_support_workers'))}
                                      helperText={getFieldError(section14Formik, 'home_section14_active_support_workers')}
                                    />
                                  </Stack>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                  <Stack spacing={2}>
                                    <TextField
                                      fullWidth
                                      label="No. of Open roles across the UK"
                                      variant="outlined"
                                      name="home_section14_open_roles_across_the_uk"
                                      id="home_section14_open_roles_across_the_uk"
                                      {...section14Formik.getFieldProps('home_section14_open_roles_across_the_uk')}
                                      error={Boolean(getFieldError(section14Formik, 'home_section14_open_roles_across_the_uk'))}
                                      helperText={getFieldError(section14Formik, 'home_section14_open_roles_across_the_uk')}
                                    />
                                  </Stack>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                  <Stack spacing={2}>
                                    <TextField
                                      fullWidth
                                      label="No. of Registered support staff"
                                      variant="outlined"
                                      name="home_section14_registered_support_staff"
                                      id="home_section14_registered_support_staff"
                                      {...section14Formik.getFieldProps('home_section14_registered_support_staff')}
                                      error={Boolean(getFieldError(section14Formik, 'home_section14_registered_support_staff'))}
                                      helperText={getFieldError(section14Formik, 'home_section14_registered_support_staff')}
                                    />
                                  </Stack>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                  <Stack spacing={2}>
                                    <TextField
                                      fullWidth
                                      label="Rate Per Hour"
                                      variant="outlined"
                                      name="home_section14_rate_per_hour"
                                      id="home_section14_rate_per_hour"
                                      {...section14Formik.getFieldProps('home_section14_rate_per_hour')}
                                      error={Boolean(getFieldError(section14Formik, 'home_section14_rate_per_hour'))}
                                      helperText={getFieldError(section14Formik, 'home_section14_rate_per_hour')}
                                    />
                                  </Stack>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Stack spacing={2}>
                                    <TextField
                                      fullWidth
                                      label="Button Text"
                                      variant="outlined"
                                      name="home_section14_button_text"
                                      id="home_section14_button_text"
                                      {...section14Formik.getFieldProps('home_section14_button_text')}
                                      error={Boolean(getFieldError(section14Formik, 'home_section14_button_text'))}
                                      helperText={getFieldError(section14Formik, 'home_section14_button_text')}
                                    />
                                  </Stack>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                  <Stack spacing={2}>
                                    <TextField
                                      fullWidth
                                      label="Button Link"
                                      variant="outlined"
                                      name="home_section14_button_link"
                                      id="home_section14_button_link"
                                      {...section14Formik.getFieldProps('home_section14_button_link')}
                                      error={Boolean(getFieldError(section14Formik, 'home_section14_button_link'))}
                                      helperText={getFieldError(section14Formik, 'home_section14_button_link')}
                                    />
                                  </Stack>
                                </Grid>
                              </Grid>
                            </Grid>
                          </Box>
                        </Stack>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                          background: '#fff'
                        }}
                      >
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          Image
                        </Typography>
                        <FormLabel
                          htmlFor="change-section14-image"
                          sx={{
                            position: 'relative',
                            width: '100%',
                            height: 310,
                            borderRadius: 2,
                            overflow: 'hidden',
                            cursor: 'pointer',
                            border: '1px dashed #ccc',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            '&:hover .hover-overlay': { opacity: 1 }
                          }}
                        >
                          {section14Image ? (
                            <Avatar
                              alt="section14-image"
                              src={section14Image}
                              sx={{
                                width: '100%',
                                height: 310,
                                objectFit: 'cover',
                                borderRadius: 0
                              }}
                            />
                          ) : (
                            <Stack spacing={1} alignItems="center">
                              <CameraOutlined style={{ fontSize: 30, color: '#999' }} />
                              <Typography color="text.secondary">Upload Image</Typography>
                            </Stack>
                          )}

                          <Box
                            className="hover-overlay"
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '100%',
                              height: '100%',
                              background: 'rgba(0,0,0,0.45)',
                              opacity: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: '0.3s'
                            }}
                          >
                            <Stack spacing={1} alignItems="center">
                              <CameraOutlined style={{ fontSize: 32, color: '#fff' }} />
                              <Typography sx={{ color: '#fff' }}>Change Image</Typography>
                            </Stack>
                          </Box>
                        </FormLabel>
                        <TextField
                          type="file"
                          id="change-section14-image"
                          name="home_section14_image"
                          sx={{ display: 'none' }}
                          onChange={(e) => {
                            // if (useFileCheck(e)) {
                            setSection14Image(URL.createObjectURL(e.target.files?.[0]));
                            section14Formik.setFieldValue('home_section14_image', e.target.files?.[0] || '');
                            section14Formik.setFieldTouched('home_section14_image', true);
                            // }
                          }}
                        />
                        {getFieldError(section14Formik, 'home_section14_image') && (
                          <FormHelperText error sx={{ mt: 0.5 }}>
                            {getFieldError(section14Formik, 'home_section14_image')}
                          </FormHelperText>
                        )}
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
                      <LoadingButton
                        variant="contained"
                        loading={section14Formik.isSubmitting}
                        onClick={section14Formik.handleSubmit}
                        color="primary"
                      >
                        Save
                      </LoadingButton>
                    </Stack>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Box>
            <Box
              sx={{
                marginTop: '20px',
                '& .MuiAccordion-root': {
                  borderColor: 'divider',
                  '& .MuiAccordionSummary-root': {
                    bgcolor: 'transparent',
                    flexDirection: 'row',
                    '&:focus-visible': {
                      bgcolor: 'primary.lighter'
                    }
                  },
                  '& .MuiAccordionDetails-root': {
                    borderColor: 'divider'
                  },
                  '& .Mui-expanded': {
                    color: 'primary.main'
                  }
                }
              }}
            >
              <Accordion expanded={expanded === 'section15'} onChange={handleChange('section15')}>
                <AccordionSummary aria-controls="section15-content" id="section15-header">
                  <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="h5"> Section 15 </Typography>
                      <Tooltip
                        placement="right"
                        arrow
                        title={
                          <Box sx={{ p: 1, maxWidth: 300 }}>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                              Section 15 Guide
                            </Typography>
                            <img
                              src={section15SS}
                              alt="banner-preview"
                              style={{
                                width: '100%',
                                height: 'auto',
                                borderRadius: 6,
                                border: '1px solid #ddd'
                              }}
                            />
                          </Box>
                        }
                      >
                        <InfoCircleOutlined sx={{ color: 'primary.main', cursor: 'pointer' }} />
                      </Tooltip>
                    </Stack>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={12}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          boxShadow: '0 1px 6px rgba(0,0,0,0.04)'
                        }}
                      >
                        <Stack spacing={2}>
                          <TextField
                            fullWidth
                            label="Section Title"
                            variant="outlined"
                            name="home_section15_title"
                            id="home_section15_title"
                            {...section15Formik.getFieldProps('home_section15_title')}
                            error={Boolean(getFieldError(section15Formik, 'home_section15_title'))}
                            helperText={getFieldError(section15Formik, 'home_section15_title')}
                          />
                          <TextField
                            fullWidth
                            label="Section Sub Title"
                            variant="outlined"
                            multiline
                            rows={2}
                            name="home_section15_subtitle"
                            id="home_section15_subtitle"
                            {...section15Formik.getFieldProps('home_section15_subtitle')}
                            error={Boolean(getFieldError(section15Formik, 'home_section15_subtitle'))}
                            helperText={getFieldError(section15Formik, 'home_section15_subtitle')}
                          />
                        </Stack>
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
                      <LoadingButton
                        variant="contained"
                        loading={section15Formik.isSubmitting}
                        onClick={section15Formik.handleSubmit}
                        color="primary"
                      >
                        Save
                      </LoadingButton>
                    </Stack>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Box>
            <Box
              sx={{
                marginTop: '20px',
                '& .MuiAccordion-root': {
                  borderColor: 'divider',
                  '& .MuiAccordionSummary-root': {
                    bgcolor: 'transparent',
                    flexDirection: 'row',
                    '&:focus-visible': {
                      bgcolor: 'primary.lighter'
                    }
                  },
                  '& .MuiAccordionDetails-root': {
                    borderColor: 'divider'
                  },
                  '& .Mui-expanded': {
                    color: 'primary.main'
                  }
                }
              }}
            >
              <Accordion expanded={expanded === 'section16'} onChange={handleChange('section16')}>
                <AccordionSummary aria-controls="section16-content" id="section16-header">
                  <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="h5"> Section 16 </Typography>
                      <Tooltip
                        placement="right"
                        arrow
                        title={
                          <Box sx={{ p: 1, maxWidth: 300 }}>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                              Section 16 Guide
                            </Typography>
                            <img
                              src={section16SS}
                              alt="banner-preview"
                              style={{
                                width: '100%',
                                height: 'auto',
                                borderRadius: 6,
                                border: '1px solid #ddd'
                              }}
                            />
                          </Box>
                        }
                      >
                        <InfoCircleOutlined sx={{ color: 'primary.main', cursor: 'pointer' }} />
                      </Tooltip>
                    </Stack>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={12}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          boxShadow: '0 1px 6px rgba(0,0,0,0.04)'
                        }}
                      >
                        <Stack spacing={2}>
                          <TextField
                            fullWidth
                            label="Section Title"
                            variant="outlined"
                            name="home_section16_title"
                            id="home_section16_title"
                            {...section16Formik.getFieldProps('home_section16_title')}
                            error={Boolean(getFieldError(section16Formik, 'home_section16_title'))}
                            helperText={getFieldError(section16Formik, 'home_section16_title')}
                          />
                          <TextField
                            fullWidth
                            label="Section Sub Title"
                            variant="outlined"
                            multiline
                            rows={2}
                            name="home_section16_subtitle"
                            id="home_section16_subtitle"
                            {...section16Formik.getFieldProps('home_section16_subtitle')}
                            error={Boolean(getFieldError(section16Formik, 'home_section16_subtitle'))}
                            helperText={getFieldError(section16Formik, 'home_section16_subtitle')}
                          />
                        </Stack>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                          background: '#fff'
                        }}
                      >
                        <Stack spacing={2}>
                          <Typography variant="h6" sx={{ mb: 1 }}>
                            Box 1 Icon
                          </Typography>
                          <FormLabel
                            htmlFor="change-section16icon1"
                            sx={{
                              position: 'relative',
                              width: '100%',
                              height: 100,
                              borderRadius: 2,
                              overflow: 'hidden',
                              cursor: 'pointer',
                              border: '1px dashed #ccc',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              '&:hover .hover-overlay': { opacity: 1 }
                            }}
                          >
                            {section16icon1 ? (
                              <Avatar
                                alt="section16icon1"
                                src={section16icon1}
                                sx={{
                                  width: '100%',
                                  height: 100,
                                  objectFit: 'cover',
                                  borderRadius: 0
                                }}
                              />
                            ) : (
                              <Stack spacing={1} alignItems="center">
                                <CameraOutlined style={{ fontSize: 30, color: '#999' }} />
                                <Typography color="text.secondary">Upload Icon</Typography>
                              </Stack>
                            )}

                            <Box
                              className="hover-overlay"
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                background: 'rgba(0,0,0,0.45)',
                                opacity: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: '0.3s'
                              }}
                            >
                              <Stack spacing={1} alignItems="center">
                                <CameraOutlined style={{ fontSize: 32, color: '#fff' }} />
                                <Typography sx={{ color: '#fff' }}>Change Icon</Typography>
                              </Stack>
                            </Box>
                          </FormLabel>
                          <TextField
                            type="file"
                            id="change-section16icon1"
                            name="home_section16_box1_icon"
                            sx={{ display: 'none' }}
                            onChange={(e) => {
                              // if (useFileCheck(e)) {
                              setSection16Icon1(URL.createObjectURL(e.target.files?.[0]));
                              section16Formik.setFieldValue('home_section16_box1_icon', e.target.files?.[0] || '');
                              section16Formik.setFieldTouched('home_section16_box1_icon', true);
                              // }
                            }}
                          />
                          {getFieldError(section16Formik, 'home_section16_box1_icon') && (
                            <FormHelperText error sx={{ mt: 0.5 }}>
                              {getFieldError(section16Formik, 'home_section16_box1_icon')}
                            </FormHelperText>
                          )}
                          <TextField
                            fullWidth
                            label="Box 1 Title"
                            variant="outlined"
                            name="home_section16_box1_title"
                            id="home_section16_box1_title"
                            {...section16Formik.getFieldProps('home_section16_box1_title')}
                            error={Boolean(getFieldError(section16Formik, 'home_section16_box1_title'))}
                            helperText={getFieldError(section16Formik, 'home_section16_box1_title')}
                          />
                          <TextField
                            fullWidth
                            label="Box 1 Description"
                            variant="outlined"
                            multiline
                            rows={2}
                            name="home_section16_box1_description"
                            id="home_section16_box1_description"
                            {...section16Formik.getFieldProps('home_section16_box1_description')}
                            error={Boolean(getFieldError(section16Formik, 'home_section16_box1_description'))}
                            helperText={getFieldError(section16Formik, 'home_section16_box1_description')}
                          />
                          <TextField
                            fullWidth
                            label="Box 1 Button Text"
                            variant="outlined"
                            name="home_section16_box1_button_text"
                            id="home_section16_box1_button_text"
                            {...section16Formik.getFieldProps('home_section16_box1_button_text')}
                            error={Boolean(getFieldError(section16Formik, 'home_section16_box1_button_text'))}
                            helperText={getFieldError(section16Formik, 'home_section16_box1_button_text')}
                          />
                          <TextField
                            fullWidth
                            label="Box 1 Button Link"
                            variant="outlined"
                            name="home_section16_box1_button_link"
                            id="home_section16_box1_button_link"
                            {...section16Formik.getFieldProps('home_section16_box1_button_link')}
                            error={Boolean(getFieldError(section16Formik, 'home_section16_box1_button_link'))}
                            helperText={getFieldError(section16Formik, 'home_section16_box1_button_link')}
                          />
                        </Stack>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                          background: '#fff'
                        }}
                      >
                        <Stack spacing={2}>
                          <Typography variant="h6" sx={{ mb: 1 }}>
                            Box 2 Icon
                          </Typography>
                          <FormLabel
                            htmlFor="change-section16icon2"
                            sx={{
                              position: 'relative',
                              width: '100%',
                              height: 100,
                              borderRadius: 2,
                              overflow: 'hidden',
                              cursor: 'pointer',
                              border: '1px dashed #ccc',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              '&:hover .hover-overlay': { opacity: 1 }
                            }}
                          >
                            {section16icon2 ? (
                              <Avatar
                                alt="section16icon2"
                                src={section16icon2}
                                sx={{
                                  width: '100%',
                                  height: 100,
                                  objectFit: 'cover',
                                  borderRadius: 0
                                }}
                              />
                            ) : (
                              <Stack spacing={1} alignItems="center">
                                <CameraOutlined style={{ fontSize: 30, color: '#999' }} />
                                <Typography color="text.secondary">Upload Icon</Typography>
                              </Stack>
                            )}
                            <Box
                              className="hover-overlay"
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                background: 'rgba(0,0,0,0.45)',
                                opacity: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: '0.3s'
                              }}
                            >
                              <Stack spacing={1} alignItems="center">
                                <CameraOutlined style={{ fontSize: 32, color: '#fff' }} />
                                <Typography sx={{ color: '#fff' }}>Change Icon</Typography>
                              </Stack>
                            </Box>
                          </FormLabel>
                          <TextField
                            type="file"
                            id="change-section16icon2"
                            name="home_section16_box2_icon"
                            sx={{ display: 'none' }}
                            onChange={(e) => {
                              // if (useFileCheck(e)) {
                              setSection16Icon2(URL.createObjectURL(e.target.files?.[0]));
                              section16Formik.setFieldValue('home_section16_box2_icon', e.target.files?.[0] || '');
                              section16Formik.setFieldTouched('home_section16_box2_icon', true);
                              // }
                            }}
                          />
                          {getFieldError(section16Formik, 'home_section16_box2_icon') && (
                            <FormHelperText error sx={{ mt: 0.5 }}>
                              {getFieldError(section16Formik, 'home_section16_box2_icon')}
                            </FormHelperText>
                          )}
                          <TextField
                            fullWidth
                            label="Box 2 Title"
                            variant="outlined"
                            name="home_section16_box2_title"
                            id="home_section16_box2_title"
                            {...section16Formik.getFieldProps('home_section16_box2_title')}
                            error={Boolean(getFieldError(section16Formik, 'home_section16_box2_title'))}
                            helperText={getFieldError(section16Formik, 'home_section16_box2_title')}
                          />
                          <TextField
                            fullWidth
                            label="Box 2 Description"
                            variant="outlined"
                            multiline
                            rows={2}
                            name="home_section16_box2_description"
                            id="home_section16_box2_description"
                            {...section16Formik.getFieldProps('home_section16_box2_description')}
                            error={Boolean(getFieldError(section16Formik, 'home_section16_box2_description'))}
                            helperText={getFieldError(section16Formik, 'home_section16_box2_description')}
                          />
                          <TextField
                            fullWidth
                            label="Box 2 Button Text"
                            variant="outlined"
                            name="home_section16_box2_button_text"
                            id="home_section16_box2_button_text"
                            {...section16Formik.getFieldProps('home_section16_box2_button_text')}
                            error={Boolean(getFieldError(section16Formik, 'home_section16_box2_button_text'))}
                            helperText={getFieldError(section16Formik, 'home_section16_box2_button_text')}
                          />
                          <TextField
                            fullWidth
                            label="Box 2 Button Link"
                            variant="outlined"
                            name="home_section16_box2_button_link"
                            id="home_section16_box2_button_link"
                            {...section16Formik.getFieldProps('home_section16_box2_button_link')}
                            error={Boolean(getFieldError(section16Formik, 'home_section16_box2_button_link'))}
                            helperText={getFieldError(section16Formik, 'home_section16_box2_button_link')}
                          />
                        </Stack>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                          background: '#fff'
                        }}
                      >
                        <Stack spacing={2}>
                          <Typography variant="h6" sx={{ mb: 1 }}>
                            Box 3 Icon
                          </Typography>
                          <FormLabel
                            htmlFor="change-section16icon3"
                            sx={{
                              position: 'relative',
                              width: '100%',
                              height: 100,
                              borderRadius: 2,
                              overflow: 'hidden',
                              cursor: 'pointer',
                              border: '1px dashed #ccc',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              '&:hover .hover-overlay': { opacity: 1 }
                            }}
                          >
                            {section16icon3 ? (
                              <Avatar
                                alt="section16icon3"
                                src={section16icon3}
                                sx={{
                                  width: '100%',
                                  height: 100,
                                  objectFit: 'cover',
                                  borderRadius: 0
                                }}
                              />
                            ) : (
                              <Stack spacing={1} alignItems="center">
                                <CameraOutlined style={{ fontSize: 30, color: '#999' }} />
                                <Typography color="text.secondary">Upload Icon</Typography>
                              </Stack>
                            )}
                            <Box
                              className="hover-overlay"
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                background: 'rgba(0,0,0,0.45)',
                                opacity: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: '0.3s'
                              }}
                            >
                              <Stack spacing={1} alignItems="center">
                                <CameraOutlined style={{ fontSize: 32, color: '#fff' }} />
                                <Typography sx={{ color: '#fff' }}>Change Icon</Typography>
                              </Stack>
                            </Box>
                          </FormLabel>
                          <TextField
                            type="file"
                            id="change-section16icon3"
                            name="home_section16_box3_icon"
                            sx={{ display: 'none' }}
                            onChange={(e) => {
                              // if (useFileCheck(e)) {
                              setSection16Icon3(URL.createObjectURL(e.target.files?.[0]));
                              section16Formik.setFieldValue('home_section16_box3_icon', e.target.files?.[0] || '');
                              section16Formik.setFieldTouched('home_section16_box3_icon', true);
                              // }
                            }}
                          />
                          {getFieldError(section16Formik, 'home_section16_box3_icon') && (
                            <FormHelperText error sx={{ mt: 0.5 }}>
                              {getFieldError(section16Formik, 'home_section16_box3_icon')}
                            </FormHelperText>
                          )}
                          <TextField
                            fullWidth
                            label="Box 3 Title"
                            variant="outlined"
                            name="home_section16_box3_title"
                            id="home_section16_box3_title"
                            {...section16Formik.getFieldProps('home_section16_box3_title')}
                            error={Boolean(getFieldError(section16Formik, 'home_section16_box3_title'))}
                            helperText={getFieldError(section16Formik, 'home_section16_box3_title')}
                          />
                          <TextField
                            fullWidth
                            label="Box 3 Description"
                            variant="outlined"
                            multiline
                            rows={2}
                            name="home_section16_box3_description"
                            id="home_section16_box3_description"
                            {...section16Formik.getFieldProps('home_section16_box3_description')}
                            error={Boolean(getFieldError(section16Formik, 'home_section16_box3_description'))}
                            helperText={getFieldError(section16Formik, 'home_section16_box3_description')}
                          />
                          <TextField
                            fullWidth
                            label="Box 3 Button Text"
                            variant="outlined"
                            name="home_section16_box3_button_text"
                            id="home_section16_box3_button_text"
                            {...section16Formik.getFieldProps('home_section16_box3_button_text')}
                            error={Boolean(getFieldError(section16Formik, 'home_section16_box3_button_text'))}
                            helperText={getFieldError(section16Formik, 'home_section16_box3_button_text')}
                          />
                          <TextField
                            fullWidth
                            label="Box 3 Button Link"
                            variant="outlined"
                            name="home_section16_box3_button_link"
                            id="home_section16_box3_button_link"
                            {...section16Formik.getFieldProps('home_section16_box3_button_link')}
                            error={Boolean(getFieldError(section16Formik, 'home_section16_box3_button_link'))}
                            helperText={getFieldError(section16Formik, 'home_section16_box3_button_link')}
                          />
                        </Stack>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                          background: '#fff'
                        }}
                      >
                        <Stack spacing={2}>
                          <Typography variant="h6" sx={{ mb: 1 }}>
                            Box 4 Icon
                          </Typography>
                          <FormLabel
                            htmlFor="change-section16icon4"
                            sx={{
                              position: 'relative',
                              width: '100%',
                              height: 100,
                              borderRadius: 2,
                              overflow: 'hidden',
                              cursor: 'pointer',
                              border: '1px dashed #ccc',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              '&:hover .hover-overlay': { opacity: 1 }
                            }}
                          >
                            {section16icon4 ? (
                              <Avatar
                                alt="section16icon4"
                                src={section16icon4}
                                sx={{
                                  width: '100%',
                                  height: 100,
                                  objectFit: 'cover',
                                  borderRadius: 0
                                }}
                              />
                            ) : (
                              <Stack spacing={1} alignItems="center">
                                <CameraOutlined style={{ fontSize: 30, color: '#999' }} />
                                <Typography color="text.secondary">Upload Icon</Typography>
                              </Stack>
                            )}
                            <Box
                              className="hover-overlay"
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                background: 'rgba(0,0,0,0.45)',
                                opacity: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: '0.3s'
                              }}
                            >
                              <Stack spacing={1} alignItems="center">
                                <CameraOutlined style={{ fontSize: 32, color: '#fff' }} />
                                <Typography sx={{ color: '#fff' }}>Change Icon</Typography>
                              </Stack>
                            </Box>
                          </FormLabel>
                          <TextField
                            type="file"
                            id="change-section16icon4"
                            name="home_section16_box4_icon"
                            sx={{ display: 'none' }}
                            onChange={(e) => {
                              // if (useFileCheck(e)) {
                              setSection16Icon4(URL.createObjectURL(e.target.files?.[0]));
                              section16Formik.setFieldValue('home_section16_box4_icon', e.target.files?.[0] || '');
                              section16Formik.setFieldTouched('home_section16_box4_icon', true);
                              // }
                            }}
                          />
                          {getFieldError(section16Formik, 'home_section16_box4_icon') && (
                            <FormHelperText error sx={{ mt: 0.5 }}>
                              {getFieldError(section16Formik, 'home_section16_box4_icon')}
                            </FormHelperText>
                          )}
                          <TextField
                            fullWidth
                            label="Box 4 Title"
                            variant="outlined"
                            name="home_section16_box4_title"
                            id="home_section16_box4_title"
                            {...section16Formik.getFieldProps('home_section16_box4_title')}
                            error={Boolean(getFieldError(section16Formik, 'home_section16_box4_title'))}
                            helperText={getFieldError(section16Formik, 'home_section16_box4_title')}
                          />
                          <TextField
                            fullWidth
                            label="Box 4 Description"
                            variant="outlined"
                            multiline
                            rows={2}
                            name="home_section16_box4_description"
                            id="home_section16_box4_description"
                            {...section16Formik.getFieldProps('home_section16_box4_description')}
                            error={Boolean(getFieldError(section16Formik, 'home_section16_box4_description'))}
                            helperText={getFieldError(section16Formik, 'home_section16_box4_description')}
                          />
                          <TextField
                            fullWidth
                            label="Box 4 Button Text"
                            variant="outlined"
                            name="home_section16_box4_button_text"
                            id="home_section16_box4_button_text"
                            {...section16Formik.getFieldProps('home_section16_box4_button_text')}
                            error={Boolean(getFieldError(section16Formik, 'home_section16_box4_button_text'))}
                            helperText={getFieldError(section16Formik, 'home_section16_box4_button_text')}
                          />
                          <TextField
                            fullWidth
                            label="Box 4 Button Link"
                            variant="outlined"
                            name="home_section16_box4_button_link"
                            id="home_section16_box4_button_link"
                            {...section16Formik.getFieldProps('home_section16_box4_button_link')}
                            error={Boolean(getFieldError(section16Formik, 'home_section16_box4_button_link'))}
                            helperText={getFieldError(section16Formik, 'home_section16_box4_button_link')}
                          />
                        </Stack>
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
                      <LoadingButton
                        variant="contained"
                        loading={section16Formik.isSubmitting}
                        onClick={section16Formik.handleSubmit}
                        color="primary"
                      >
                        Save
                      </LoadingButton>
                    </Stack>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Box>
            <Box
              sx={{
                marginTop: '20px',
                '& .MuiAccordion-root': {
                  borderColor: 'divider',
                  '& .MuiAccordionSummary-root': {
                    bgcolor: 'transparent',
                    flexDirection: 'row',
                    '&:focus-visible': {
                      bgcolor: 'primary.lighter'
                    }
                  },
                  '& .MuiAccordionDetails-root': {
                    borderColor: 'divider'
                  },
                  '& .Mui-expanded': {
                    color: 'primary.main'
                  }
                }
              }}
            >
              <Accordion expanded={expanded === 'section17'} onChange={handleChange('section17')}>
                <AccordionSummary aria-controls="section17-content" id="section17-header">
                  <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="h5"> Section 17 </Typography>
                      <Tooltip
                        placement="right"
                        arrow
                        title={
                          <Box sx={{ p: 1, maxWidth: 300 }}>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                              Section 17 Guide
                            </Typography>
                            <img
                              src={section17SS}
                              alt="banner-preview"
                              style={{
                                width: '100%',
                                height: 'auto',
                                borderRadius: 6,
                                border: '1px solid #ddd'
                              }}
                            />
                          </Box>
                        }
                      >
                        <InfoCircleOutlined sx={{ color: 'primary.main', cursor: 'pointer' }} />
                      </Tooltip>
                    </Stack>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={12}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          boxShadow: '0 1px 6px rgba(0,0,0,0.04)'
                        }}
                      >
                        <Stack spacing={2}>
                          <TextField
                            fullWidth
                            label="Section Title"
                            variant="outlined"
                            name="home_section17_title"
                            id="home_section17_title"
                            {...getFieldProps('home_section17_title')}
                          />
                          <TextField
                            fullWidth
                            label="Section Sub Title"
                            variant="outlined"
                            multiline
                            rows={2}
                            name="home_section17_subtitle"
                            id="home_section17_subtitle"
                            {...getFieldProps('home_section17_subtitle')}
                          />
                        </Stack>
                      </Box>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
                      <LoadingButton
                        variant="contained"
                        loading={isSubmitting}
                        onClick={() => handleSectionSave('section17')}
                        color="primary"
                      >
                        Save
                      </LoadingButton>
                    </Stack>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Box>
          </MainCard>
        )}
      </Grid>
    </Grid>
  );
}
