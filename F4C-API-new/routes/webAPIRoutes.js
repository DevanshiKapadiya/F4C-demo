const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require('path');
const upload = multer();
const webAPI = require("../controllers/webAPI");
const authentication = require("../middleware/authUser");
const counsellorauthentication = require('../middleware/auth');

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

const updateProfileImage = multer({
  storage: storage('uploads/images'),
  fileFilter
});

router.get("/", (req, res) => {
  res.send("Welcome to First 4 Counseling Web API routes");
});

/* Start route for user signup */
router.post("/userSignup", upload.none(), webAPI.userSignup);
router.post("/resendUserSignupOTP", upload.none(), webAPI.resendUserSignupOTP);
router.post("/verifyUserSignupOTP", upload.none(), webAPI.verifyUserSignupOTP);
router.post("/userSignin", upload.none(), webAPI.userSignin);
router.post("/userForgotPassword", upload.none(), webAPI.userForgotPassword);
router.post(
  "/verifyUserForgotPasswordOTP",
  upload.none(),
  webAPI.verifyUserForgotPasswordOTP
);
router.post("/resetUserPassword", upload.none(), webAPI.resetUserPassword);
/* Start route for user signup */


/* Start route for user register */
router.post("/userRegister", upload.none(), webAPI.userRegister);
router.post("/resendUserSignupOTP1", upload.none(), webAPI.resendUserSignupOTP1);
router.post("/verifyUserSignupOTP1", upload.none(), webAPI.verifyUserSignupOTP1);
router.post("/userSignin1", upload.none(), webAPI.userSignin1);
router.post(
  '/updateProfileImage',
  authentication.authenticateUserToken,
  updateProfileImage.fields([{ name: 'image', maxCount: 1 }]),
  webAPI.updateProfileImage
);
router.post(
  "/updateProfile",
  authentication.authenticateUserToken,
  upload.none(),
  webAPI.updateProfile
);
router.post(
  "/changePassword",
  authentication.authenticateUserToken,
  upload.none(),
  webAPI.changePassword
);
router.get("/getCounsellingAreas", upload.none(), webAPI.getCounsellingAreas);

router.get("/getCounsellingAreas", upload.none(), webAPI.getCounsellingAreas);

router.get("/getCounsellorProfile/:id", upload.none(), webAPI.getCounsellorProfile);
router.get("/counsellorQualificationsshow/:id", updateProfileImage.none(), webAPI.counsellorQualificationsshow);

router.get(
  "/getBookedSlots/:c_id",
  authentication.authenticateUserToken,
  webAPI.getBookedSlots
);
router.get(
  "/getUserAppointments",
  authentication.authenticateUserToken,
  webAPI.getUserAppointments
);
router.delete(
  "/cancelAppointment/:id",
  authentication.authenticateUserToken,
  webAPI.cancelAppointment
);


/* End route for user register */

/*Start route for counsellor signup */
router.post("/counsellor", upload.none(), webAPI.counsellor);
router.post("/otpVerify", upload.none(), webAPI.otpVerification);
router.post("/resendOtpverify", upload.none(), webAPI.resendOtpverify);
router.post("/counsellorlogin", upload.none(), webAPI.counsellorlogin);
router.get("/getcounsellor/:c_id", upload.none(), counsellorauthentication.authenticatecounsellor, webAPI.getCounsellor);
router.get("/clientypes", upload.none(), webAPI.clientTypeList);
router.get("/profile", upload.none(), counsellorauthentication.authenticatecounsellor, webAPI.getprofile);
router.post("/editprofile", upload.none(), counsellorauthentication.authenticatecounsellor, webAPI.editprofile);
router.delete("/deleteAppointment/:id", webAPI.deleteAppointment);
router.post("/addarticle", upload.fields([{ name: "image", maxCount: 1 }]), counsellorauthentication.authenticatecounsellor, webAPI.addArticle);
router.post("/updatearticle", upload.fields([{ name: "image", maxCount: 1 }]), counsellorauthentication.authenticatecounsellor, webAPI.addArticle);
router.get("/articletag", upload.none(), webAPI.getCounsellingarea);
router.get("/getCounsellorAreas/:id", upload.none(), webAPI. getCounsellorAreas);

router.get("/articlelist", upload.none(), counsellorauthentication.authenticatecounsellor, webAPI.articlelist);
router.get("/getCounsellorClients", upload.none(), counsellorauthentication.authenticatecounsellor, webAPI.getCounsellorClients);
router.post(
  "/uploadProfileImage",
  counsellorauthentication.authenticatecounsellor,
  updateProfileImage.fields([
    { name: "uploadimage", maxCount: 1 },
    { name: "uploadvideo", maxCount: 1 },
  ]),
  webAPI.uploadProfileImage);
router.post(
  "/getCounsellorAppointments",
  counsellorauthentication.authenticatecounsellor,
  webAPI.getCounsellorAppointments
);
router.post("/classes", upload.single("video"), counsellorauthentication.authenticatecounsellor, webAPI.addclasses);
router.get("/getclasslist", upload.none(), counsellorauthentication.authenticatecounsellor, webAPI.classlist);
router.put("/editclass", upload.fields([
  { name: "video", maxCount: 1 }
]), counsellorauthentication.authenticatecounsellor, webAPI.updateClass);
router.delete("/deleteclass", counsellorauthentication.authenticatecounsellor, webAPI.deleteClass);

router.post("/qualification", updateProfileImage.single("certificate"), counsellorauthentication.authenticatecounsellor, webAPI.addQualification);

router.post("/qualificationlist", updateProfileImage.none(), counsellorauthentication.authenticatecounsellor, webAPI.qualificationList);
router.put("/updatequalification/:q_id", updateProfileImage.single("certificate"), counsellorauthentication.authenticatecounsellor, webAPI.updateQualification);

router.post("/sessiontype", upload.none(), counsellorauthentication.authenticatecounsellor, webAPI.sessionType);
router.post("/updatesessiontype", upload.none(), counsellorauthentication.authenticatecounsellor, webAPI.updatesessionType);
router.post("/searchProfessional", upload.none(), counsellorauthentication.authenticatecounsellor, webAPI.searchProfessional);
router.post("/searchCounselling", upload.none(), counsellorauthentication.authenticatecounsellor, webAPI.searchCounsellor);

router.get("/dbsListOnly", upload.none(), webAPI.dbsListOnly);

router.post("/updateAppointment", upload.none(), webAPI.updateAppointment);

router.post(
  "/dbslist", upload.none(),
  counsellorauthentication.authenticatecounsellor,
  webAPI.dbsList
);

router.post(
  "/updatedbsStatus", upload.none(),
  counsellorauthentication.authenticatecounsellor, webAPI.updateDBSStatus
);

router.get(
  "/getCounsellorTags", upload.none(),
  counsellorauthentication.authenticatecounsellor, webAPI.getCounsellorTags
);
/*Counsellor Dashboard */


router.post("/searchCounsellors", upload.none(), webAPI.searchCounsellors);

router.post(
  "/bookAppointment",
  authentication.authenticateUserToken,
  upload.none(),
  webAPI.bookAppointment
);
router.post(
  "/generateBookingId",
  authentication.authenticateUserToken,
  upload.none(),
  webAPI.generateBookingId
);

/*Start route for counsellor save */
router.post(
  "/saveBookmark",
  authentication.authenticateUserToken,
  upload.none(),
  webAPI.saveBookmark
);


router.post(
  "/removeBookmark",
  authentication.authenticateUserToken,
  upload.none(),
  webAPI.removeBookmark
);

router.get(
  "/getBookmarks",
  authentication.authenticateUserToken,
  webAPI.getBookmarks
);

router.post("/sendEmailToCounsellor", upload.none(), webAPI.sendEmailToCounsellor);


/*End route for counsellor save */


/* Start route for home page */
router.post("/homePage", upload.none(), webAPI.homePage);
/* End route for home page */

/* Start route for benifits of counselling page */
router.post(
  "/benefitsOfCounselling",
  upload.none(),
  webAPI.benefitsOfCounselling
);
/* End route for benifits of counselling page */

/* Start route for affordable 4 all page */
router.post("/affordable4All", upload.none(), webAPI.affordable4All);
/* End route for affordable 4 all page */

/* Start route for about page */
router.post("/aboutPage", upload.none(), webAPI.aboutPage);
/* End route for about page */

/* Start route for website settings */
router.post("/siteSettings", upload.none(), webAPI.siteSettings);
/* End route for website settings */

/* Start route for complaints policy */
router.post("/complaintsPolicy", upload.none(), webAPI.complaintsPolicy);
/* End route for complaints policy */

/* Start route for terms and condition */
router.post("/termsAndConditions", upload.none(), webAPI.termsAndConditions);
/* End route for terms and condition */

/* Start route for become a counselor */
router.post("/becomeACounselor", upload.none(), webAPI.becomeACounselor);
/* End route for become a counselor */

/* Start route for contact page */
router.post("/teamList", upload.none(), webAPI.teamList);
router.post(
  "/submitContactEnquiry",
  upload.none(),
  webAPI.submitContactEnquiry
);
/* End route for contact page */

/* Start route for get seo data by page name */
router.post("/getSEODataByPage", upload.none(), webAPI.getSEODataByPage);
/* End route for get seo data by page name */

module.exports = router;
