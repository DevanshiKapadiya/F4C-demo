const express = require('express');
const multer = require('multer');
const path = require('path');
const authentication = require('../middleware/auth');
const router = express.Router();

const adminAPI = require('../controllers/adminAPI');
const userManagement = require('../controllers/userManagement');
const faqMasterManagement = require('../controllers/faqMasterManagement');
const generateRandomNumber = () => {
  return Math.floor(100000 + Math.random() * 900000); // 6-digit random number
};

const currentDateTime = () => {
  const currentDate = new Date();
  const day = currentDate.getDate();
  const month = currentDate.getMonth() + 1;
  const year = currentDate.getFullYear();
  const hours = currentDate.getHours();
  const minutes = currentDate.getMinutes();
  const seconds = currentDate.getSeconds();
  const dateTime = `${year}${month}${day}${hours}${minutes}${seconds}`;
  return dateTime;
};

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/; // Allowed extensions
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase()); // Check extension
  const mimetype = allowedTypes.test(file.mimetype); // Check MIME type

  if (extname && mimetype) {
    return cb(null, true); // Accept the file
  } else {
    cb('Only PNG, JPG, and JPEG files are allowed.', false); // Reject the file
  }
};

const storage = (fileUploadPath) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, fileUploadPath);
    },
    filename: (req, file, cb) => {
      cb(null, currentDateTime() + generateRandomNumber() + path.extname(file.originalname)); /* Rename to avoid conflicts */
    }
  });

const upload = multer();
const uploadSettingsImage = multer({
  storage: storage('uploads/'),
  fileFilter
});
const professionalBodyImage = multer({
  storage: storage('uploads/professional_body/'),
  fileFilter
});
const uploadCMSPageImage = multer({
  storage: storage('uploads/cms_page/'),
  fileFilter
});
const teamImage = multer({
  storage: storage('uploads/team/'),
  fileFilter
});
const WhyYouNeedCounsellingImage = multer({
  storage: storage('uploads/why_you_need_counselling_images/'),
  fileFilter
});
const ArticleImage = multer({
  storage: storage('uploads/article_images/'),
  fileFilter
});
const ResourceImage = multer({
  storage: storage('uploads/resource_images/'),
  fileFilter
});

const resourceManagement = require('../controllers/resourceManagement');

/* Start route for admin */
router.get('/', (req, res) => {
  res.send('Welcome to First 4 Counseling Admin API routes');
});

router.post('/login', upload.none(), adminAPI.login);
router.post('/createAdmin', upload.none(), authentication.authenticateAdminToken, adminAPI.createAdmin);
router.post('/adminsList', upload.none(), authentication.authenticateAdminToken, adminAPI.adminsList);
/* router.post(
  "/adminDetails",
  upload.none(),
  authentication.authenticateAdminToken,
  adminAPI.adminDetails
); */
router.post('/updateAdmin', upload.none(), authentication.authenticateAdminToken, adminAPI.updateAdmin);
router.post('/deleteAdmin', upload.none(), authentication.authenticateAdminToken, adminAPI.deleteAdmin);
router.post('/activeAdmin', upload.none(), authentication.authenticateAdminToken, adminAPI.activeAdmin);
router.post('/inactiveAdmin', upload.none(), authentication.authenticateAdminToken, adminAPI.inactiveAdmin);
router.post('/changePasswordAdmin', upload.none(), authentication.authenticateAdminToken, adminAPI.changePasswordAdmin);
/* End route for admin */

/* Start route for FAQ Master (FAQ Category + FAQ) */
const faqRoutes = [
  ['faqCategoryList', 'faqCategoryList'],
  ['faqCategoryOptions', 'faqCategoryOptions'],
  ['createFaqCategory', 'createFaqCategory'],
  ['updateFaqCategory', 'updateFaqCategory'],
  ['deleteFaqCategory', 'deleteFaqCategory'],
  ['activeFaqCategory', 'activeFaqCategory'],
  ['inactiveFaqCategory', 'inactiveFaqCategory'],
  ['updateFaqCategoryPosition', 'updateFaqCategoryPosition'],
  ['faqList', 'faqList'],
  ['createFaq', 'createFaq'],
  ['updateFaq', 'updateFaq'],
  ['deleteFaq', 'deleteFaq'],
  ['activeFaq', 'activeFaq'],
  ['inactiveFaq', 'inactiveFaq'],
  ['updateFaqPosition', 'updateFaqPosition']
];
faqRoutes.forEach(([path, handler]) => {
  router.post('/' + path, upload.none(), authentication.authenticateAdminToken, faqMasterManagement[handler]);
});
/* End route for FAQ */


/* Start route for Language */
router.post('/addLanguage', upload.none(), authentication.authenticateAdminToken, adminAPI.addLanguage);
router.post('/languageList', upload.none(), authentication.authenticateAdminToken, adminAPI.languageList);
router.post('/updateLanguage', upload.none(), authentication.authenticateAdminToken, adminAPI.updateLanguage);
router.post('/deleteLanguage', upload.none(), authentication.authenticateAdminToken, adminAPI.deleteLanguage);
router.post('/activeLanguage', upload.none(), authentication.authenticateAdminToken, adminAPI.activeLanguage);
router.post('/inactiveLanguage', upload.none(), authentication.authenticateAdminToken, adminAPI.inactiveLanguage);
router.post('/updateLanguagePosition', upload.none(), authentication.authenticateAdminToken, adminAPI.updateLanguagePosition);
/* End route for Language */

/* Start route for Client Type */
router.post('/addClientType', upload.none(), authentication.authenticateAdminToken, adminAPI.addClientType);
router.post('/clientTypeList', upload.none(), authentication.authenticateAdminToken, adminAPI.clientTypeList);
router.post('/updateClientType', upload.none(), authentication.authenticateAdminToken, adminAPI.updateClientType);
router.post('/deleteClientType', upload.none(), authentication.authenticateAdminToken, adminAPI.deleteClientType);
router.post('/activeClientType', upload.none(), authentication.authenticateAdminToken, adminAPI.activeClientType);
router.post('/inactiveClientType', upload.none(), authentication.authenticateAdminToken, adminAPI.inactiveClientType);
router.post('/updateClientTypePosition', upload.none(), authentication.authenticateAdminToken, adminAPI.updateClientTypePosition);
/* End route for Client Type */

/* Start route for Online Platform */
router.post('/addOnlinePlatform', upload.none(), authentication.authenticateAdminToken, adminAPI.addOnlinePlatform);
router.post('/onlinePlatformList', upload.none(), authentication.authenticateAdminToken, adminAPI.onlinePlatformList);
router.post('/updateOnlinePlatform', upload.none(), authentication.authenticateAdminToken, adminAPI.updateOnlinePlatform);
router.post('/deleteOnlinePlatform', upload.none(), authentication.authenticateAdminToken, adminAPI.deleteOnlinePlatform);
router.post('/activeOnlinePlatform', upload.none(), authentication.authenticateAdminToken, adminAPI.activeOnlinePlatform);
router.post('/inactiveOnlinePlatform', upload.none(), authentication.authenticateAdminToken, adminAPI.inactiveOnlinePlatform);
router.post('/updateOnlinePlatformPosition', upload.none(), authentication.authenticateAdminToken, adminAPI.updateOnlinePlatformPosition);
/* End route for Online Platform */

/* Start route for website settings */
router.post(
  '/updateSiteSettings',
  uploadSettingsImage.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'favicon', maxCount: 1 },
    { name: 'footer_logo', maxCount: 1 }
  ]),
  authentication.authenticateAdminToken,
  adminAPI.updateSiteSettings
);
router.post('/getAdminSiteSettings', upload.none(), adminAPI.getSiteSettings);
router.post('/getSiteSettings', upload.none(), authentication.authenticateAdminToken, adminAPI.getSiteSettings);
router.post('/updateSMTPSettings', upload.none(), authentication.authenticateAdminToken, adminAPI.updateSMTPSettings);
router.post('/getSMTPSettings', upload.none(), authentication.authenticateAdminToken, adminAPI.getSMTPSettings);
/* End route for website settings */

/* Start route for complaints policy */
router.post('/updateComplaintsPolicy', upload.none(), authentication.authenticateAdminToken, adminAPI.updateComplaintsPolicy);
router.post('/getComplaintsPolicy', upload.none(), authentication.authenticateAdminToken, adminAPI.getComplaintsPolicy);
/* End route for complaints policy */

/* Start route for terms and condition */
router.post('/updateTermsAndConditions', upload.none(), authentication.authenticateAdminToken, adminAPI.updateTermsAndConditions);
router.post('/getTermsAndConditions', upload.none(), authentication.authenticateAdminToken, adminAPI.getTermsAndConditions);
/* End route for terms and condition */

/* Start route for terms and condition */
router.post('/updatePolicy', upload.none(), authentication.authenticateAdminToken, adminAPI.updatePolicy);
router.post('/getPolicy', upload.none(), authentication.authenticateAdminToken, adminAPI.getPolicy);
/* End route for terms and condition */

/* Start route for Professional Body */
router.post(
  '/addProfessionalBody',
  professionalBodyImage.fields([{ name: 'image', maxCount: 1 }]),
  authentication.authenticateAdminToken,
  adminAPI.addProfessionalBody
);
router.post('/professionalBodyList', upload.none(), authentication.authenticateAdminToken, adminAPI.professionalBodyList);
router.post(
  '/updateProfessionalBody',
  professionalBodyImage.fields([{ name: 'image', maxCount: 1 }]),
  authentication.authenticateAdminToken,
  adminAPI.updateProfessionalBody
);
router.post('/deleteProfessionalBody', upload.none(), authentication.authenticateAdminToken, adminAPI.deleteProfessionalBody);
router.post('/activeProfessionalBody', upload.none(), authentication.authenticateAdminToken, adminAPI.activeProfessionalBody);
router.post('/inactiveProfessionalBody', upload.none(), authentication.authenticateAdminToken, adminAPI.inactiveProfessionalBody);
router.post(
  '/updateProfessionalBodyPosition',
  upload.none(),
  authentication.authenticateAdminToken,
  adminAPI.updateProfessionalBodyPosition
);
/* End route for Professional Body */

/* Start route for Counselling Area */
router.post('/addCounsellingArea', upload.none(), authentication.authenticateAdminToken, adminAPI.addCounsellingArea);
router.post('/counsellingAreaList', upload.none(), authentication.authenticateAdminToken, adminAPI.counsellingAreaList);
router.post('/updateCounsellingArea', upload.none(), authentication.authenticateAdminToken, adminAPI.updateCounsellingArea);
router.post('/deleteCounsellingArea', upload.none(), authentication.authenticateAdminToken, adminAPI.deleteCounsellingArea);
router.post('/activeCounsellingArea', upload.none(), authentication.authenticateAdminToken, adminAPI.activeCounsellingArea);
router.post('/inactiveCounsellingArea', upload.none(), authentication.authenticateAdminToken, adminAPI.inactiveCounsellingArea);
router.post('/updateCounsellingAreaPosition', upload.none(), authentication.authenticateAdminToken, adminAPI.updateCounsellingAreaPosition);
/* End route for Counselling Area */

/* Start route for CMS Home */
router.post('/getCMSHome', upload.none(), authentication.authenticateAdminToken, adminAPI.getCMSHome);
router.post(
  '/updateCMSHome',
  uploadCMSPageImage.fields([
    { name: 'banner_image', maxCount: 1 },
    { name: 'home_who_we_are_image', maxCount: 1 },
    { name: 'home_affordable_for_all_image', maxCount: 1 }
  ]),
  authentication.authenticateAdminToken,
  adminAPI.updateCMSHome
);
/* End route for CMS Home */

/* Start route for CMS About */
router.post('/getCMSAbout', upload.none(), authentication.authenticateAdminToken, adminAPI.getCMSAbout);
router.post(
  '/updateCMSAbout',
  uploadCMSPageImage.fields([
    { name: 'who_we_are_image', maxCount: 1 },
    { name: 'our_mission_image', maxCount: 1 },
    { name: 'what_make_us_different_image_one', maxCount: 1 },
    { name: 'what_make_us_different_image_two', maxCount: 1 },
    { name: 'what_make_us_different_image_three', maxCount: 1 },
    { name: 'what_make_us_different_image_four', maxCount: 1 }
  ]),
  authentication.authenticateAdminToken,
  adminAPI.updateCMSAbout
);
/* End route for CMS About */

/* Start route for CMS Affordable 4 All */
router.post('/getCMSAffordable4All', upload.none(), authentication.authenticateAdminToken, adminAPI.getCMSAffordable4All);
router.post(
  '/updateCMSAffordable4All',
  uploadCMSPageImage.fields([{ name: 'why_choose_set_your_own_budget_image', maxCount: 1 }]),
  authentication.authenticateAdminToken,
  adminAPI.updateCMSAffordable4All
);
/* End route for CMS Affordable 4 All */

/* Start route for CMS Become a Counselor */
router.post('/getCMSBecomeACounselor', upload.none(), authentication.authenticateAdminToken, adminAPI.getCMSBecomeACounselor);
router.post(
  '/updateCMSBecomeACounselor',
  uploadCMSPageImage.fields([{ name: 'become_a_counsellor_banner_image', maxCount: 1 }]),
  authentication.authenticateAdminToken,
  adminAPI.updateCMSBecomeACounselor
);
/* End route for CMS Become a Counselor */

/* Start route for CMS Benefits of Counselling */
router.post('/getCMSBenefitsOfCounselling', upload.none(), authentication.authenticateAdminToken, adminAPI.getCMSBenefitsOfCounselling);
router.post(
  '/updateCMSBenefitsOfCounselling',
  upload.none(),
  authentication.authenticateAdminToken,
  adminAPI.updateCMSBenefitsOfCounselling
);

router.post(
  '/addWhyYouNeedCounselling',
  WhyYouNeedCounsellingImage.fields([{ name: 'image', maxCount: 1 }]),
  authentication.authenticateAdminToken,
  adminAPI.addWhyYouNeedCounselling
);
router.post('/whyYouNeedCounsellingList', upload.none(), authentication.authenticateAdminToken, adminAPI.whyYouNeedCounsellingList);
router.post(
  '/updateWhyYouNeedCounselling',
  WhyYouNeedCounsellingImage.fields([{ name: 'image', maxCount: 1 }]),
  authentication.authenticateAdminToken,
  adminAPI.updateWhyYouNeedCounselling
);
router.post('/deleteWhyYouNeedCounselling', upload.none(), authentication.authenticateAdminToken, adminAPI.deleteWhyYouNeedCounselling);
router.post('/activeWhyYouNeedCounselling', upload.none(), authentication.authenticateAdminToken, adminAPI.activeWhyYouNeedCounselling);
router.post('/inactiveWhyYouNeedCounselling', upload.none(), authentication.authenticateAdminToken, adminAPI.inactiveWhyYouNeedCounselling);
router.post(
  '/updateWhyYouNeedCounsellingPosition',
  upload.none(),
  authentication.authenticateAdminToken,
  adminAPI.updateWhyYouNeedCounsellingPosition
);

router.post(
  '/addBenefitsOfEngagingInCounselling',
  upload.none(),
  authentication.authenticateAdminToken,
  adminAPI.addBenefitsOfEngagingInCounselling
);
router.post(
  '/benefitsOfEngagingInCounsellingList',
  upload.none(),
  authentication.authenticateAdminToken,
  adminAPI.benefitsOfEngagingInCounsellingList
);
router.post(
  '/updateBenefitsOfEngagingInCounselling',
  upload.none(),
  authentication.authenticateAdminToken,
  adminAPI.updateBenefitsOfEngagingInCounselling
);
router.post(
  '/deleteBenefitsOfEngagingInCounselling',
  upload.none(),
  authentication.authenticateAdminToken,
  adminAPI.deleteBenefitsOfEngagingInCounselling
);
router.post(
  '/activeBenefitsOfEngagingInCounselling',
  upload.none(),
  authentication.authenticateAdminToken,
  adminAPI.activeBenefitsOfEngagingInCounselling
);
router.post(
  '/inactiveBenefitsOfEngagingInCounselling',
  upload.none(),
  authentication.authenticateAdminToken,
  adminAPI.inactiveBenefitsOfEngagingInCounselling
);
router.post(
  '/updateBenefitsOfEngagingInCounsellingPosition',
  upload.none(),
  authentication.authenticateAdminToken,
  adminAPI.updateBenefitsOfEngagingInCounsellingPosition
);
/* End route for CMS Benefits of Counselling */

/* Start route for Contact Enquiry */
router.post('/contactEnquiryList', upload.none(), authentication.authenticateAdminToken, adminAPI.contactEnquiryList);
router.post('/deleteContactEnquiry', upload.none(), authentication.authenticateAdminToken, adminAPI.deleteContactEnquiry);
router.post('/updateContactEnquiryPosition', upload.none(), authentication.authenticateAdminToken, adminAPI.updateContactEnquiryPosition);
/* End route for Contact Enquiry */

/* Start route for Team */
router.post('/addTeam', teamImage.fields([{ name: 'profile_pic', maxCount: 1 }]), authentication.authenticateAdminToken, adminAPI.addTeam);
router.post('/teamList', upload.none(), authentication.authenticateAdminToken, adminAPI.teamList);
router.post(
  '/updateTeam',
  teamImage.fields([{ name: 'profile_pic', maxCount: 1 }]),
  authentication.authenticateAdminToken,
  adminAPI.updateTeam
);
router.post('/deleteTeam', upload.none(), authentication.authenticateAdminToken, adminAPI.deleteTeam);
router.post('/activeTeam', upload.none(), authentication.authenticateAdminToken, adminAPI.activeTeam);
router.post('/inactiveTeam', upload.none(), authentication.authenticateAdminToken, adminAPI.inactiveTeam);
router.post('/updateTeamPosition', upload.none(), authentication.authenticateAdminToken, adminAPI.updateTeamPosition);
/* End route for Team */

/* Start route for Session Types */
router.post('/sessionTypesList', upload.none(), authentication.authenticateAdminToken, adminAPI.sessionTypesList);
router.post('/addSessionTypes', upload.none(), authentication.authenticateAdminToken, adminAPI.addSessionTypes);
router.post('/updateSessionTypes', upload.none(), authentication.authenticateAdminToken, adminAPI.updateSessionTypes);
router.post('/deleteSessionTypes', upload.none(), authentication.authenticateAdminToken, adminAPI.deleteSessionTypes);
router.post('/activeSessionTypes', upload.none(), authentication.authenticateAdminToken, adminAPI.activeSessionTypes);
router.post('/inactiveSessionTypes', upload.none(), authentication.authenticateAdminToken, adminAPI.inactiveSessionTypes);
router.post('/updateSessionTypesPosition', upload.none(), authentication.authenticateAdminToken, adminAPI.updateSessionTypesPosition);
/* End route for Session Types */

/* Start route for Profile Status */
router.post('/profileStatusList', upload.none(), authentication.authenticateAdminToken, adminAPI.profileStatusList);
router.post('/addProfileStatus', upload.none(), authentication.authenticateAdminToken, adminAPI.addProfileStatus);
router.post('/updateProfileStatus', upload.none(), authentication.authenticateAdminToken, adminAPI.updateProfileStatus);
router.post('/deleteProfileStatus', upload.none(), authentication.authenticateAdminToken, adminAPI.deleteProfileStatus);
router.post('/activeProfileStatus', upload.none(), authentication.authenticateAdminToken, adminAPI.activeProfileStatus);
router.post('/inactiveProfileStatus', upload.none(), authentication.authenticateAdminToken, adminAPI.inactiveProfileStatus);
router.post('/updateProfileStatusPosition', upload.none(), authentication.authenticateAdminToken, adminAPI.updateProfileStatusPosition);
/* End route for Profile Status */

/* Start route for Therapy Category */
router.post('/therapyCategoryList', upload.none(), authentication.authenticateAdminToken, adminAPI.therapyCategoryList);
router.post('/addTherapyCategory', upload.none(), authentication.authenticateAdminToken, adminAPI.addTherapyCategory);
router.post('/updateTherapyCategory', upload.none(), authentication.authenticateAdminToken, adminAPI.updateTherapyCategory);
router.post('/deleteTherapyCategory', upload.none(), authentication.authenticateAdminToken, adminAPI.deleteTherapyCategory);
router.post('/activeTherapyCategory', upload.none(), authentication.authenticateAdminToken, adminAPI.activeTherapyCategory);
router.post('/inactiveTherapyCategory', upload.none(), authentication.authenticateAdminToken, adminAPI.inactiveTherapyCategory);
router.post('/updateTherapyCategoryPosition', upload.none(), authentication.authenticateAdminToken, adminAPI.updateTherapyCategoryPosition);
/* End route for Therapy Category */

/* Start route for Therapy */
router.post('/therapyCategoryListForTherapy', upload.none(), authentication.authenticateAdminToken, adminAPI.therapyCategoryListForTherapy);
router.post('/therapyList', upload.none(), authentication.authenticateAdminToken, adminAPI.therapyList);
router.post('/addTherapy', upload.none(), authentication.authenticateAdminToken, adminAPI.addTherapy);
router.post('/updateTherapy', upload.none(), authentication.authenticateAdminToken, adminAPI.updateTherapy);
router.post('/deleteTherapy', upload.none(), authentication.authenticateAdminToken, adminAPI.deleteTherapy);
router.post('/activeTherapy', upload.none(), authentication.authenticateAdminToken, adminAPI.activeTherapy);
router.post('/inactiveTherapy', upload.none(), authentication.authenticateAdminToken, adminAPI.inactiveTherapy);
router.post('/updateTherapyPosition', upload.none(), authentication.authenticateAdminToken, adminAPI.updateTherapyPosition);
/* End route for Therapy */


/* Start route for Type of practitioner */
router.post('/typeOfPractitionerList', upload.none(), authentication.authenticateAdminToken, adminAPI.typeOfPractitionerList);
router.post('/addTypeOfPractitioner', upload.none(), authentication.authenticateAdminToken, adminAPI.addTypeOfPractitioner);
router.post('/updateTypeOfPractitioner', upload.none(), authentication.authenticateAdminToken, adminAPI.updateTypeOfPractitioner);
router.post('/deleteTypeOfPractitioner', upload.none(), authentication.authenticateAdminToken, adminAPI.deleteTypeOfPractitioner);
router.post('/activeTypeOfPractitioner', upload.none(), authentication.authenticateAdminToken, adminAPI.activeTypeOfPractitioner);
router.post('/inactiveTypeOfPractitioner', upload.none(), authentication.authenticateAdminToken, adminAPI.inactiveTypeOfPractitioner);
router.post(
  '/updateTypeOfPractitionerPosition',
  upload.none(),
  authentication.authenticateAdminToken,
  adminAPI.updateTypeOfPractitionerPosition
);
/* End route for Type of practitioner */

/* Start route for Concession */
router.post('/concessionList', upload.none(), authentication.authenticateAdminToken, adminAPI.concessionList);
router.post('/addConcession', upload.none(), authentication.authenticateAdminToken, adminAPI.addConcession);
router.post('/updateConcession', upload.none(), authentication.authenticateAdminToken, adminAPI.updateConcession);
router.post('/deleteConcession', upload.none(), authentication.authenticateAdminToken, adminAPI.deleteConcession);
router.post('/activeConcession', upload.none(), authentication.authenticateAdminToken, adminAPI.activeConcession);
router.post('/inactiveConcession', upload.none(), authentication.authenticateAdminToken, adminAPI.inactiveConcession);
router.post('/updateConcessionPosition', upload.none(), authentication.authenticateAdminToken, adminAPI.updateConcessionPosition);
/* End route for Concession */

/* Start route for Health Insurance */
router.post('/healthInsuranceList', upload.none(), authentication.authenticateAdminToken, adminAPI.healthInsuranceList);
router.post('/addHealthInsurance', upload.none(), authentication.authenticateAdminToken, adminAPI.addHealthInsurance);
router.post('/updateHealthInsurance', upload.none(), authentication.authenticateAdminToken, adminAPI.updateHealthInsurance);
router.post('/deleteHealthInsurance', upload.none(), authentication.authenticateAdminToken, adminAPI.deleteHealthInsurance);
router.post('/activeHealthInsurance', upload.none(), authentication.authenticateAdminToken, adminAPI.activeHealthInsurance);
router.post('/inactiveHealthInsurance', upload.none(), authentication.authenticateAdminToken, adminAPI.inactiveHealthInsurance);
router.post('/updateHealthInsurancePosition', upload.none(), authentication.authenticateAdminToken, adminAPI.updateHealthInsurancePosition);
/* End route for Health Insurance */

/* Start Routes Info Icon Text API */
router.post('/updateInfoIconText', upload.none(), authentication.authenticateAdminToken, adminAPI.updateInfoIconText);
router.post('/getInfoIconText', upload.none(), authentication.authenticateAdminToken, adminAPI.getInfoIconText);
/* End Routes Info Icon Text API */

/* Start Routes For Article API */
router.post('/counsellingAreaListForArticle', upload.none(), authentication.authenticateAdminToken, adminAPI.counsellingAreaListForArticle);
router.post('/articleList', upload.none(), authentication.authenticateAdminToken, adminAPI.articleList);
router.post(
  '/addArticle',
  ArticleImage.fields([{ name: 'image', maxCount: 1 }]),
  authentication.authenticateAdminToken,
  adminAPI.addArticle
);
router.post(
  '/updateArticle',
  ArticleImage.fields([{ name: 'image', maxCount: 1 }]),
  authentication.authenticateAdminToken,
  adminAPI.updateArticle
);
router.post('/deleteArticle', upload.none(), authentication.authenticateAdminToken, adminAPI.deleteArticle);
router.post('/activeArticle', upload.none(), authentication.authenticateAdminToken, adminAPI.activeArticle);
router.post('/inactiveArticle', upload.none(), authentication.authenticateAdminToken, adminAPI.inactiveArticle);
/* End Routes For Article API */

/* Start Routes For SEO API */
router.post('/getSEO', upload.none(), authentication.authenticateAdminToken, adminAPI.getSEO);
router.post('/updateSEO', upload.none(), authentication.authenticateAdminToken, adminAPI.updateSEO);
/* End Routes For SEO API */

/* Start Routes Tawk Chat Notification API */
router.post('/tawk-webhook', upload.none(), adminAPI.initTawkChat);
router.post('/getNotification', upload.none(), authentication.authenticateAdminToken, adminAPI.getNotification);
router.post('/readNotification', upload.none(), authentication.authenticateAdminToken, adminAPI.readNotification);
/* End Routes Tawk Chat Notification API */

/* Start User Management Routes */

router.post('/userList', upload.none(), authentication.authenticateAdminToken, userManagement.userList);
router.post('/userDetails', upload.none(), authentication.authenticateAdminToken, userManagement.userDetails);
router.post('/createUser', upload.none(), authentication.authenticateAdminToken, userManagement.createUser);
router.post('/updateUser', upload.none(), authentication.authenticateAdminToken, userManagement.updateUser);
router.post('/deleteUser', upload.none(), authentication.authenticateAdminToken, userManagement.deleteUser);
router.post('/activeUser', upload.none(), authentication.authenticateAdminToken, userManagement.activeUser);
router.post('/inactiveUser', upload.none(), authentication.authenticateAdminToken, userManagement.inactiveUser);
router.post('/countryList', upload.none(), authentication.authenticateAdminToken, userManagement.countryList);
router.post(
  '/updateUserPosition',
  upload.none(),
  authentication.authenticateAdminToken,
  userManagement.updateUserPosition
);
/* End User Management Routes */

/* Start Routes For Resources API */

router.post(
  '/resourceList',
  upload.none(),
  authentication.authenticateAdminToken,
  resourceManagement.resourceList
);

router.post(
  '/resourceDetails',
  upload.none(),
  authentication.authenticateAdminToken,
  resourceManagement.resourceDetails
);

router.post(
  '/addResource',
  ResourceImage.fields([{ name: 'image', maxCount: 1 }]),
  authentication.authenticateAdminToken,
  resourceManagement.addResource
);

router.post(
  '/updateResource',
  ResourceImage.fields([{ name: 'image', maxCount: 1 }]),
  authentication.authenticateAdminToken,
  resourceManagement.updateResource
);

router.post(
  '/deleteResource',
  upload.none(),
  authentication.authenticateAdminToken,
  resourceManagement.deleteResource
);

router.post(
  '/activeResource',
  upload.none(),
  authentication.authenticateAdminToken,
  resourceManagement.activeResource
);

router.post(
  '/inactiveResource',
  upload.none(),
  authentication.authenticateAdminToken,
  resourceManagement.inactiveResource
);

router.post(
  '/updateResourcePosition',
  upload.none(),
  authentication.authenticateAdminToken,
  resourceManagement.updateResourcePosition
);

/* End Routes For Resources API */

module.exports = router;
