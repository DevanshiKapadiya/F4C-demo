const service = require('../common/service');
const db = require('../db/db');
const { _ } = require('lodash');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mailer = require('../common/email');
const errorMessages = require('../common/errorMessages');
const nodemailer = require("nodemailer");

// ================= OTP EMAIL =================
const sendOtpEmail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is ${otp}`,
  });

  console.log("OTP sent to:", email);
};

// ================= CONTACT EMAIL =================
const sendContactEmail = async ({
  to,
  counsellorName,
  name,
  phone,
  email,
  message,
  source,
}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.MAIL_USER,
    to: to,
    subject: "New Client Inquiry",
    html: `
      <h2>New Message for ${counsellorName}</h2>
      <p><b>Name:</b> ${name}</p>
      <p><b>Phone:</b> ${phone}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Message:</b> ${message}</p>
      <p><b>Source:</b> ${source}</p>
    `,
  });
};


var passwordRegEx = new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_])[a-zA-Z0-9!@#$%^&*()_]{8,16}$');

module.exports = {
  /* User signup API Start */
  userSignup: async (req, res) => {
    try {
      const params = await service.trimObject(
        _.pick(req.body, [
          'fname',
          'lname',
          'email',
          'password',
          'gender',
          'dob_date',
          'dob_month',
          'dob_year',
          'address_line_one',
          'address_line_two',
          'country',
          'city_town',
          'postal_code'
        ])
      );

      if (
        _.isEmpty(params.fname) ||
        _.isEmpty(params.lname) ||
        _.isEmpty(params.email) ||
        _.isEmpty(params.password) ||
        _.isEmpty(params.gender) ||
        _.isEmpty(params.dob_date) ||
        _.isEmpty(params.dob_month) ||
        _.isEmpty(params.dob_year) ||
        _.isEmpty(params.address_line_one) ||
        _.isEmpty(params.country) ||
        _.isEmpty(params.city_town) ||
        _.isEmpty(params.postal_code)
      ) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      if (!service.validateEmail(params.email)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidEmailError));
      }

      if (!passwordRegEx.test(params.password)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidPasswordError));
      }

      const checkEmailExist = await new Promise((resolve, reject) => {
        db.query('SELECT * FROM user WHERE email = ?', [params.email], (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }
          resolve(results);
        });
      });

      if (checkEmailExist.length === 0) {
        const password = await service.hashPassword(params.password);

        db.query(
          'INSERT INTO user (fname, lname, email, password, gender, dob_date, dob_month, dob_year, address_line_one, address_line_two, country, city_town, postal_code, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            params.fname,
            params.lname,
            params.email,
            password,
            params.gender,
            params.dob_date,
            params.dob_month,
            params.dob_year,
            params.address_line_one,
            params.address_line_two,
            params.country,
            params.city_town,
            params.postal_code,
            new Date()
          ],
          (err, results) => {
            if (err) {
              return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
            }

            const user_id = results.insertId;

            params.otp = service.generateOtp(4);
            const dateNow = new Date();
            params.otp_expiration_datetime = new Date(dateNow.getTime() + 30 * 60 * 1000);

            db.query(
              'UPDATE user SET otp = ?, otp_expiration_datetime = ? WHERE user_id = ?',
              [params.otp, params.otp_expiration_datetime, user_id],
              async (err, results) => {
                if (err) {
                  return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
                }

                await mailer.sendUserOTPEmail(params);

                const userData = await new Promise((resolve, reject) => {
                  db.query('SELECT user_id, fname, lname, email, token FROM user WHERE user_id = ?', [user_id], (err, results) => {
                    if (err) {
                      return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
                    }
                    resolve(results);
                  });
                });

                userData[0].token = '';

                return res
                  .status(200)
                  .json(service.serviceResponse(true, '000', errorMessages.verificationCodeSendTo + params.email, userData));
              }
            );
          }
        );
      } else {
        let user = checkEmailExist[0];

        if ((user.status === 0 && user.email_verified === 0) || (user.status === 1 && user.email_verified === 0)) {
          const user_id = user.user_id;

          user.otp = service.generateOtp(4);
          const dateNow = new Date();
          user.otp_expiration_datetime = new Date(dateNow.getTime() + 30 * 60 * 1000);

          db.query(
            'UPDATE user SET otp = ?, otp_expiration_datetime = ? WHERE user_id = ?',
            [user.otp, user.otp_expiration_datetime, user_id],
            async (err, results) => {
              if (err) {
                return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
              }

              await mailer.sendUserOTPEmail(user);

              const userData = await new Promise((resolve, reject) => {
                db.query('SELECT user_id, fname, lname, email, token FROM user WHERE user_id = ?', [user_id], (err, results) => {
                  if (err) {
                    return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
                  }
                  resolve(results);
                });
              });

              userData[0].token = '';

              return res
                .status(200)
                .json(service.serviceResponse(true, '000', errorMessages.verificationCodeSendTo + user.email, userData));
            }
          );
        } else if (user.status === 0 && user.email_verified === 1) {
          return res.status(200).json(service.serviceResponse(false, '000', errorMessages.accountNotActiveError));
        } else {
          return res.status(200).json(service.serviceResponse(false, '000', errorMessages.emailAlreadyRegisteredError));
        }
      }
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  resendUserSignupOTP: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['user_id', 'email']));

      if (_.isEmpty(params.user_id) || _.isEmpty(params.email)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      if (!service.validateEmail(params.email)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidEmailError));
      }

      const getUser = await new Promise((resolve, reject) => {
        db.query('SELECT * FROM user WHERE email = ? AND user_id = ?', [params.email, params.user_id], (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }
          resolve(results);
        });
      });

      if (getUser.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.accountNotFoundError));
      } else {
        let user = getUser[0];

        const user_id = user.user_id;

        user.otp = service.generateOtp(4);
        const dateNow = new Date();
        user.otp_expiration_datetime = new Date(dateNow.getTime() + 30 * 60 * 1000);

        db.query(
          'UPDATE user SET otp = ?, otp_expiration_datetime = ? WHERE user_id = ?',
          [user.otp, user.otp_expiration_datetime, user_id],
          async (err, results) => {
            if (err) {
              return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
            }

            await mailer.sendUserOTPEmail(user);

            const userData = await new Promise((resolve, reject) => {
              db.query('SELECT user_id, fname, lname, email, token FROM user WHERE user_id = ?', [user_id], (err, results) => {
                if (err) {
                  return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
                }
                resolve(results);
              });
            });

            userData[0].token = '';

            return res.status(200).json(service.serviceResponse(true, '000', errorMessages.verificationCodeSendTo + user.email, userData));
          }
        );
      }
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  verifyUserSignupOTP: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['user_id', 'otp']));

      if (_.isEmpty(params.user_id) || _.isEmpty(params.otp)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const getUser = await new Promise((resolve, reject) => {
        db.query('SELECT * FROM user WHERE user_id = ?', [params.user_id], (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }
          resolve(results);
        });
      });

      if (getUser.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidUser));
      } else {
        let user = getUser[0];
        if (user.email_verified === 1) {
          return res.status(200).json(service.serviceResponse(false, '000', errorMessages.emailAlreadyVerifyError));
        } else if (user.otp == params.otp) {
          var expireTime = user.otp_expiration_datetime;
          var currentTime = new Date();

          if (expireTime < currentTime) {
            return res.status(200).json(service.serviceResponse(false, '000', errorMessages.verificationCodeExpiredError));
          } else {
            db.query(
              'UPDATE user SET otp = ?, otp_expiration_datetime = ?, email_verified = ?, status = ? WHERE user_id = ?',
              [null, null, 1, 1, params.user_id],
              async (err, results) => {
                if (err) {
                  return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
                }

                await mailer.sendUserWelcomeEmail(user);

                return res.status(200).json(service.serviceResponse(true, '000', errorMessages.OTPVerificationSuccess));
              }
            );
          }
        } else {
          return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidVerificationCodeError));
        }
      }
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  userSignin: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['email', 'password']));

      if (_.isEmpty(params.email) || _.isEmpty(params.password)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      if (!service.validateEmail(params.email)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidEmailError));
      }

      db.query('SELECT * FROM user WHERE email = ?', [params.email], (err, results) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }
        if (results.length === 0) {
          return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidLoginDetailsError));
        }

        const user = results[0];

        if (user.email_verified === 0) {
          return res.status(200).json(service.serviceResponse(false, '000', errorMessages.emailNotVerifiedError));
        }

        if (user.status === 0) {
          return res.status(200).json(service.serviceResponse(false, '000', errorMessages.accountNotActiveError));
        }

        bcrypt.compare(params.password, user.password, (err, isMatch) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err));
          }
          if (!isMatch) {
            return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidLoginDetailsError));
          }

          const token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET, {
            expiresIn: '2h'
          });

          db.query('UPDATE user SET token = ? WHERE user_id = ?', [token, user.user_id], (err, results) => {
            if (err) {
              return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
            }

            return res.status(200).json(
              service.serviceResponse(true, '000', errorMessages.success, {
                user_id: user.user_id,
                fname: user.fname,
                lname: user.lname,
                email: user.email,
                token: token
              })
            );
          });
        });
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  userForgotPassword: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['email']));

      if (_.isEmpty(params.email)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      if (!service.validateEmail(params.email)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidEmailError));
      }

      const getUser = await new Promise((resolve, reject) => {
        db.query('SELECT * FROM user WHERE email = ?', [params.email], (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }
          resolve(results);
        });
      });

      let user = getUser[0];

      if (getUser.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.accountNotFoundError));
      } else if (user.status === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.accountNotActiveError));
      } else if (user.email_verified === 0) {
        const user_id = user.user_id;

        user.otp = service.generateOtp(4);
        const dateNow = new Date();
        user.otp_expiration_datetime = new Date(dateNow.getTime() + 30 * 60 * 1000);

        db.query(
          'UPDATE user SET otp = ?, otp_expiration_datetime = ? WHERE user_id = ?',
          [user.otp, user.otp_expiration_datetime, user_id],
          async (err, results) => {
            if (err) {
              return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
            }

            await mailer.sendUserOTPEmail(user);

            const userData = await new Promise((resolve, reject) => {
              db.query('SELECT user_id, fname, lname, email, token FROM user WHERE user_id = ?', [user_id], (err, results) => {
                if (err) {
                  return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
                }
                resolve(results);
              });
            });

            userData[0].token = '';

            return res.status(200).json(service.serviceResponse(true, '000', errorMessages.verificationCodeSendTo + user.email, userData));
          }
        );
      } else {
        const user_id = user.user_id;

        user.forgot_password_otp = service.generateOtp(4);
        const dateNow = new Date();
        user.forgot_password_otp_expiration_datetime = new Date(dateNow.getTime() + 30 * 60 * 1000);

        db.query(
          'UPDATE user SET forgot_password_otp = ?, forgot_password_otp_expiration_datetime = ? WHERE user_id = ?',
          [user.forgot_password_otp, user.forgot_password_otp_expiration_datetime, user_id],
          async (err, results) => {
            if (err) {
              return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
            }

            await mailer.sendUserForgotPasswordOTPEmail(user);

            const userData = await new Promise((resolve, reject) => {
              db.query('SELECT user_id, fname, lname, email, token FROM user WHERE user_id = ?', [user_id], (err, results) => {
                if (err) {
                  return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
                }
                resolve(results);
              });
            });

            return res.status(200).json(service.serviceResponse(true, '000', errorMessages.verificationCodeSendTo + user.email, userData));
          }
        );
      }
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  verifyUserForgotPasswordOTP: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['user_id', 'forgot_password_otp']));

      if (_.isEmpty(params.user_id) || _.isEmpty(params.forgot_password_otp)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const getUser = await new Promise((resolve, reject) => {
        db.query('SELECT * FROM user WHERE user_id = ?', [params.user_id], (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }
          resolve(results);
        });
      });

      if (getUser.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidUser));
      } else {
        let user = getUser[0];
        if (user.forgot_password_otp == params.forgot_password_otp) {
          var expireTime = user.forgot_password_otp_expiration_datetime;
          var currentTime = new Date();

          if (expireTime < currentTime) {
            return res.status(200).json(service.serviceResponse(false, '000', errorMessages.verificationCodeExpiredError));
          } else {
            db.query(
              'UPDATE user SET forgot_password_otp = ?, forgot_password_otp_expiration_datetime = ? WHERE user_id = ?',
              [null, null, params.user_id],
              async (err, results) => {
                if (err) {
                  return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
                }

                const userData = await new Promise((resolve, reject) => {
                  db.query('SELECT user_id, fname, lname, email, token FROM user WHERE user_id = ?', [params.user_id], (err, results) => {
                    if (err) {
                      return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
                    }
                    resolve(results);
                  });
                });

                return res.status(200).json(service.serviceResponse(true, '000', errorMessages.OTPVerificationSuccess, userData));
              }
            );
          }
        } else {
          return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidVerificationCodeError));
        }
      }
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  resetUserPassword: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['user_id', 'password']));

      if (_.isEmpty(params.user_id) || _.isEmpty(params.password)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const getUser = await new Promise((resolve, reject) => {
        db.query('SELECT * FROM user WHERE user_id = ?', [params.user_id], (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }
          resolve(results);
        });
      });

      if (getUser.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidUser));
      } else if (!passwordRegEx.test(params.password)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidPasswordError));
      } else {
        const password = await service.hashPassword(params.password);

        db.query('UPDATE user SET password = ? WHERE user_id = ?', [password, params.user_id], async (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          return res.status(200).json(service.serviceResponse(true, '000', errorMessages.resetPasswordSuccess));
        });
      }
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },
  /* User signup API End */

  /* Home page API Start */
  homePage: async (req, res) => {
    try {
      const homeData = await new Promise((resolve, reject) => {
        db.query(
          "SELECT * FROM cms WHERE `key` IN ('banner_image', 'banner_title', 'banner_description', 'home_who_we_are_image', 'about_short_description', 'who_we_are_description', 'home_affordable_for_all_title', 'home_affordable_for_all_description', 'home_affordable_for_all_image')",
          (err, results) => {
            if (err) {
              return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
            }
            resolve(results);
          }
        );
      });

      const resObj = {};
      homeData.forEach((record) => {
        if (record.key == 'banner_image' || record.key == 'home_who_we_are_image' || record.key == 'home_affordable_for_all_image') {
          const imagePath = `${req.protocol}://${req.get('host')}/uploads/cms_page/${record.value}`;
          resObj[record.key] = imagePath;
        } else {
          resObj[record.key] = record.value;
        }
      });

      const faqData = await new Promise((resolve, reject) => {
        db.query(
          `SELECT f.*, c.title AS category_title
           FROM faq f JOIN faq_category c ON c.faq_category_id = f.category_id
           WHERE f.status = 1 AND c.status = 1 ORDER BY f.position`,
          (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }
          resolve(results);
        });
      });
      resObj.faq = faqData;

      const queData = await new Promise((resolve, reject) => {
        db.query('SELECT * FROM que WHERE status = 1 ORDER BY position', (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }
          resolve(results);
        });
      });
      resObj.que = queData;

      const teamsdata = await new Promise((resolve, reject) => {
        db.query('SELECT * FROM teams WHERE status = 1 ORDER BY position', (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }
          resolve(results);
        });
      });

      const teams = teamsdata.map((item) => ({
        ...item,
        profile_pic: `${req.protocol}://${req.get('host')}/uploads/team/${item.profile_pic}`
      }));

      resObj.teams = teams;



      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success, resObj));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },
  /* Home page API End */


  /* Benefits Of Counselling API Start */
  benefitsOfCounselling: async (req, res) => {
    try {
      const benefitsOfCounsellingData = await new Promise((resolve, reject) => {
        db.query(
          "SELECT * FROM cms WHERE `key` IN ('benefits_of_counselling_description', 'is_counselling_right_for_you_description')",
          (err, results) => {
            if (err) {
              return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
            }
            resolve(results);
          }
        );
      });

      const resObj = {};
      benefitsOfCounsellingData.forEach((record) => {
        resObj[record.key] = record.value;
      });

      const whyYouNeedCounsellingData = await new Promise((resolve, reject) => {
        db.query('SELECT * FROM why_you_need_counselling WHERE status = 1 ORDER BY position', (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }
          resolve(results);
        });
      });

      const whyYouNeedCounselling = whyYouNeedCounsellingData.map((item) => ({
        ...item,
        image: `${req.protocol}://${req.get('host')}/uploads/why_you_need_counselling_images/${item.image}`
      }));

      resObj.why_you_need_counselling = whyYouNeedCounselling;

      const benefitsOfEngagingInCounsellingData = await new Promise((resolve, reject) => {
        db.query('SELECT * FROM benefits_of_engaging_in_counselling WHERE status = 1 ORDER BY position', (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }
          resolve(results);
        });
      });
      resObj.benefits_of_engaging_in_counselling = benefitsOfEngagingInCounsellingData;

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success, resObj));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },
  /* Benefits Of Counselling API End */

  /* Affordable 4 all API Start */
  affordable4All: async (req, res) => {
    try {
      db.query(
        "SELECT * FROM cms WHERE `key` IN ('counselling_thats_affordable_4_all_description', 'how_it_works_short_description', 'step1_title', 'step1_description', 'step2_title', 'step2_description', 'step3_title', 'step3_description', 'step4_title', 'step4_description', 'why_choose_set_your_own_budget_image', 'why_choose_set_your_own_budget_title1', 'why_choose_set_your_own_budget_description1', 'why_choose_set_your_own_budget_title2', 'why_choose_set_your_own_budget_description2', 'why_choose_set_your_own_budget_title3', 'why_choose_set_your_own_budget_description3', 'why_choose_set_your_own_budget_title4', 'why_choose_set_your_own_budget_description4', 'our_commitment_to_affordable_counselling_description', 'start_your_journey_today_description')",
        (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          const resObj = {};
          results.forEach((record) => {
            if (record.key == 'why_choose_set_your_own_budget_image') {
              const imagePath = `${req.protocol}://${req.get('host')}/uploads/cms_page/${record.value}`;
              resObj[record.key] = imagePath;
            } else {
              resObj[record.key] = record.value;
            }
          });

          return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success, resObj));
        }
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },
  /* Affordable 4 all API End */

  /* About Page API Start */
  aboutPage: async (req, res) => {
    try {
      db.query(
        "SELECT * FROM cms WHERE `key` IN ('about_us', 'who_we_are', 'who_we_are_image', 'our_mission', 'our_mission_image', 'what_make_us_different_image_one', 'what_make_us_different_title_one', 'what_make_us_different_description_one', 'what_make_us_different_image_two', 'what_make_us_different_title_two', 'what_make_us_different_description_two', 'what_make_us_different_image_three', 'what_make_us_different_title_three', 'what_make_us_different_description_three', 'what_make_us_different_image_four', 'what_make_us_different_title_four', 'what_make_us_different_description_four', 'why_choose_first4counselling', 'get_started_today')",
        (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          const resObj = {};
          results.forEach((record) => {
            if (
              record.key == 'who_we_are_image' ||
              record.key == 'our_mission_image' ||
              record.key == 'what_make_us_different_image_one' ||
              record.key == 'what_make_us_different_image_two' ||
              record.key == 'what_make_us_different_image_three' ||
              record.key == 'what_make_us_different_image_four'
            ) {
              const imagePath = `${req.protocol}://${req.get('host')}/uploads/cms_page/${record.value}`;
              resObj[record.key] = imagePath;
            } else {
              resObj[record.key] = record.value;
            }
          });

          return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success, resObj));
        }
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },
  /* About Page API End */

  /* Site Settings API Start */
  siteSettings: async (req, res) => {
    try {
      db.query(
        "SELECT * FROM site_setting WHERE `key` IN ('logo', 'favicon', 'website_title', 'email_receiver', 'email_sender', 'free_plan_duration_in_month', 'footer_logo', 'footer_description', 'address', 'phone', 'footer_email', 'copyright_text', 'facebook', 'linkedin', 'youtube', 'twitter', 'instagram')",
        (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          const resObj = {};
          results.forEach((record) => {
            if (record.key == 'logo' || record.key == 'favicon' || record.key == 'footer_logo') {
              const imagePath = `${req.protocol}://${req.get('host')}/uploads/${record.value}`;
              resObj[record.key] = imagePath;
            } else {
              resObj[record.key] = record.value;
            }
          });

          return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success, resObj));
        }
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },
  /* Site Settings API End */

  /* Complaints Policy API Start */
  complaintsPolicy: async (req, res) => {
    try {
      db.query('SELECT value FROM site_setting WHERE `key` = ?', ['complaints_policy'], (err, results) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }
        return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success, results[0].value));
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },
  /* Complaints Policy API End */

  /* Terms and Conditions API Start */
  termsAndConditions: async (req, res) => {
    try {
      db.query('SELECT value FROM site_setting WHERE `key` = ?', ['terms_and_conditions'], (err, results) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }
        return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success, results[0].value));
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },
  /* Terms and Conditions API End */

  /* Become a counselot API Start */
  becomeACounselor: async (req, res) => {
    try {
      db.query(
        "SELECT * FROM cms WHERE `key` IN ('become_a_counsellor_banner_image', 'become_a_counsellor_banner_title', 'become_a_counsellor_banner_description', 'why_join_f4c_description', 'why_join_f4c_title1', 'why_join_f4c_short_description1', 'why_join_f4c_title2', 'why_join_f4c_short_description2', 'why_join_f4c_title3', 'why_join_f4c_short_description3', 'why_join_f4c_title4', 'why_join_f4c_short_description4', 'apply_to_be_counselor_description', 'individual_description', 'organization_description', 'how_it_works_description', 'how_it_works_title1', 'how_it_works_short_description1', 'how_it_works_title2', 'how_it_works_short_description2', 'how_it_works_title3', 'how_it_works_short_description3', 'how_it_works_title4', 'how_it_works_short_description4', 'begin_your_journey_now_description')",
        (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          const resObj = {};
          results.forEach((record) => {
            if (record.key == 'become_a_counsellor_banner_image') {
              const imagePath = `${req.protocol}://${req.get('host')}/uploads/cms_page/${record.value}`;
              resObj[record.key] = imagePath;
            } else {
              resObj[record.key] = record.value;
            }
          });

          return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success, resObj));
        }
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },
  /* Become a counselot API End */

  /* Contact Page API Start  */
  submitContactEnquiry: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['name', 'email', 'phone', 'subject', 'message', 'enquiry_type']));

      if (_.isEmpty(params.name) || _.isEmpty(params.email) || _.isEmpty(params.subject) || _.isEmpty(params.message)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      if (!service.validateEmail(params.email)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidEmailError));
      }

      /* Enquiry types are fixed; anything else falls back to General */
      const enquiryTypes = ['General', 'Partnership', 'Platform Support'];
      params.enquiry_type = enquiryTypes.includes(params.enquiry_type) ? params.enquiry_type : 'General';

      /* New enquiries go to the top of the manual order. `position` is UNIQUE, so retry if two arrive at once. */
      const insertEnquiry = (attempt, callback) =>
        db.query(
          `INSERT INTO contact_enquiry (name, email, phone, enquiry_type, subject, message, position, created_at)
           SELECT ?, ?, ?, ?, ?, ?, COALESCE(MIN(position), 1) - 1, ? FROM contact_enquiry`,
          [params.name, params.email, params.phone, params.enquiry_type, params.subject, params.message, new Date()],
          (err, results) => {
            if (err && err.code === 'ER_DUP_ENTRY' && attempt < 5) return insertEnquiry(attempt + 1, callback);
            callback(err, results);
          }
        );

      insertEnquiry(
        1,
        async (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          await mailer.sendContactEnquiryEmail(params);

          /* Automatic receipt to the sender; sent in the background, a failure here must not fail the enquiry */
          mailer.sendContactEnquiryConfirmationEmail({ ...params, reference: results.insertId });

          return res.status(200).json(service.serviceResponse(true, '000', errorMessages.contactEnquirySentSuccess));
        }
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  teamList: async (req, res) => {
    try {
      db.query('SELECT * FROM team WHERE status = 1 ORDER BY position', (err, results) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }


        const resObj = results.map((item) => ({
          ...item,
          profile_pic: `${req.protocol}://${req.get('host')}/uploads/team/${item.profile_pic}`
        }));

        return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success, resObj));
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },
  /* Contact Page API End  */

  /* Get SEO Data By Page API Start  */
  getSEODataByPage: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['page']));

      if (_.isEmpty(params.page)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const keys = [`'${params.page}_meta_title'`, `'${params.page}_meta_keyword'`, `'${params.page}_meta_description'`];

      db.query('SELECT * FROM seo WHERE `key` IN (' + keys + ')', (err, results) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }

        const resObj = {};
        results.forEach((record) => {
          resObj[record.key] = record.value;
        });

        return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success, resObj));
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },
  /* Get SEO Data By Page API End  */

  /* ================= REGISTER API ================= */

  userRegister: async (req, res) => {
    try {
      const params = await service.trimObject(
        _.pick(req.body, [
          'fname',
          'lname',
          'email',
          'password',
          'gender',
          'dob_date',
          'dob_month',
          'dob_year',
          'phone_no',
          'city_town',
          'state',
          'country',
          'address',
        ])
      );

      // Required Fields Check
      for (let key in params) {
        if (_.isEmpty(params[key])) {
          return res.status(400).json(
            service.serviceResponse(false, '000', errorMessages.missingParamError)
          );
        }
      }

      // Email Validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(params.email)) {
        return res.status(400).json(
          service.serviceResponse(false, '000', errorMessages.invalidEmailError)
        );
      }

      //Password Validation
      if (!passwordRegEx.test(params.password)) {
        return res.status(400).json(
          service.serviceResponse(false, '000', errorMessages.invalidPasswordError)
        );
      }

      // Phone Validation
      if (!/^[0-9]{10}$/.test(params.phone_no)) {
        return res.status(400).json(
          service.serviceResponse(false, '000', "Invalid Phone Number")
        );
      }

      // Check Existing Email
      const checkEmailExist = await new Promise((resolve, reject) => {
        db.query(
          'SELECT * FROM user1 WHERE email = ?',
          [params.email],
          (err, results) => {
            if (err) return reject(err);
            resolve(results);
          }
        );
      });

      // ================= NEW USER =================
      if (checkEmailExist.length === 0) {

        const hashedPassword = await service.hashPassword(params.password);
        const dob = new Date(`${params.dob_year}-${params.dob_month}-${params.dob_date}`);

        if (isNaN(dob.getTime())) {
          return res.status(400).json(
            service.serviceResponse(false, '000', "Invalid Date of Birth")
          );
        }

        const now = new Date();
        const otp = service.generateOtp(4);
        const otpExpire = new Date(now.getTime() + 30 * 60 * 1000);

        const insertUser = await new Promise((resolve, reject) => {
          db.query(
            `INSERT INTO user1 
          (fname, lname, email, password, gender, dob, phone_no, city_town, state, country, address, otp, otp_expiration_datetime, otp_sent_at, email_verified, status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              params.fname,
              params.lname,
              params.email,
              hashedPassword,
              params.gender,
              dob,
              params.phone_no,
              params.city_town,
              params.state,
              params.country,
              params.address,
              otp,
              otpExpire,
              now,
              0,
              0,
              now
            ],
            (err, results) => {
              if (err) return reject(err);
              resolve(results);
            }
          );
        });

        const user_id1 = insertUser.insertId;

        await mailer.sendUserOTPEmail({
          email: params.email,
          otp: otp,
          fname: params.fname
        });

        return res.status(200).json(
          service.serviceResponse(
            true,
            '000',
            errorMessages.verificationCodeSendTo + params.email,
            { user_id1 }
          )
        );
      }

      // ================= EMAIL EXISTS =================
      const user1 = checkEmailExist[0];

      if (user1.email_verified == 1) {
        return res.status(409).json(
          service.serviceResponse(false, '000', errorMessages.emailAlreadyRegisteredError)
        );
      }

      const now = new Date();
      const otp = service.generateOtp(4);
      const otpExpire = new Date(now.getTime() + 30 * 60 * 1000);

      await new Promise((resolve, reject) => {
        db.query(
          `UPDATE user1 
         SET otp = ?, otp_expiration_datetime = ?, otp_sent_at = ? 
         WHERE user_id1 = ?`,
          [otp, otpExpire, now, user1.user_id1],
          (err) => {
            if (err) return reject(err);
            resolve();
          }
        );
      });

      await mailer.sendUserOTPEmail({
        email: user1.email,
        otp: otp,
        fname: user1.fname
      });

      return res.status(200).json(
        service.serviceResponse(
          true,
          '000',
          errorMessages.verificationCodeSendTo + user1.email,
          { user_id1: user1.user_id1 }
        )
      );

    } catch (err) {
      return res.status(500).json(
        service.serviceResponse(false, '333', errorMessages.serverError)
      );
    }
  },


  /* ================= RESEND OTP ================= */
  resendUserSignupOTP1: async (req, res) => {
    try {

      const bodyData = _.pick(req.body, ['user_id1']);

      const params = {
        user_id1: bodyData.user_id1 ? String(bodyData.user_id1).trim() : "",
      };

      if (!params.user_id1) {
        return res.status(400).json(
          service.serviceResponse(false, '000', errorMessages.missingParamError)
        );
      }

      const getUser = await new Promise((resolve, reject) => {
        db.query(
          'SELECT * FROM user1 WHERE user_id1 = ?',
          [params.user_id1],
          (err, results) => {
            if (err) return reject(err);
            resolve(results);
          }
        );
      });

      if (!getUser || getUser.length === 0) {
        return res.status(404).json(
          service.serviceResponse(false, '000', errorMessages.accountNotFoundError)
        );
      }

      let user = getUser[0];

      const otp = service.generateOtp(4);
      const otpExpiry = new Date(Date.now() + 30 * 60 * 1000);

      await new Promise((resolve, reject) => {
        db.query(
          'UPDATE user1 SET otp = ?, otp_expiration_datetime = ? WHERE user_id1 = ?',
          [otp, otpExpiry, user.user_id1],
          (err, results) => {
            if (err) return reject(err);
            resolve(results);
          }
        );
      });

      user.otp = otp;
      user.otp_expiration_datetime = otpExpiry;

      console.log("New OTP:", otp);

      await mailer.sendUserOTPEmail(user);

      return res.status(200).json(
        service.serviceResponse(
          true,
          '000',
          errorMessages.verificationCodeSendTo + user.email
        )
      );

    } catch (err) {
      console.log("RESEND OTP ERROR:", err);
      return res.status(500).json(
        service.serviceResponse(false, '333', err.message)
      );
    }
  },

  /* ================= VERIFY OTP ================= */

  verifyUserSignupOTP1: async (req, res) => {
    try {

      const bodyData = _.pick(req.body, ['user_id1', 'otp']);

      const params = {
        user_id1: bodyData.user_id1 ? String(bodyData.user_id1).trim() : "",
        otp: bodyData.otp ? String(bodyData.otp).trim() : ""
      };

      if (!params.user_id1 || !params.otp) {
        return res.status(200).json(
          service.serviceResponse(false, '000', errorMessages.missingParamError)
        );
      }

      const getUser = await new Promise((resolve, reject) => {
        db.query(
          'SELECT * FROM user1 WHERE user_id1 = ?',
          [params.user_id1],
          (err, results) => {
            if (err) return reject(err);
            resolve(results);
          }
        );
      });

      if (!getUser || getUser.length === 0) {
        return res.status(200).json(
          service.serviceResponse(false, '000', errorMessages.invalidUser)
        );
      }

      let user = getUser[0];

      if (Number(user.email_verified) === 1) {
        return res.status(200).json(
          service.serviceResponse(false, '000', errorMessages.emailAlreadyVerifyError)
        );
      }

      if (String(user.otp) !== String(params.otp)) {
        return res.status(200).json(
          service.serviceResponse(false, '000', errorMessages.invalidVerificationCodeError)
        );
      }

      if (!user.otp_expiration_datetime) {
        return res.status(200).json(
          service.serviceResponse(false, '000', errorMessages.verificationCodeExpiredError)
        );
      }

      const expireTime = new Date(user.otp_expiration_datetime);
      const currentTime = new Date();

      if (expireTime.getTime() <= currentTime.getTime()) {
        return res.status(200).json(
          service.serviceResponse(false, '000', errorMessages.verificationCodeExpiredError)
        );
      }

      await new Promise((resolve, reject) => {
        db.query(
          'UPDATE user1 SET otp = ?, otp_expiration_datetime = ?, email_verified = ?, status = ? WHERE user_id1 = ?',
          [null, null, 1, 1, params.user_id1],
          (err, results) => {
            if (err) return reject(err);
            resolve(results);
          }
        );
      });

      try {
        await mailer.sendUserWelcomeEmail(user);
      } catch (mailErr) {
        console.log("Mail error:", mailErr);
      }

      return res.status(200).json(
        service.serviceResponse(true, '000', errorMessages.OTPVerificationSuccess)
      );

    } catch (err) {
      console.log("OTP VERIFY ERROR:", err);
      return res.status(200).json(
        service.serviceResponse(false, '333', errorMessages.serverError)
      );
    }
  },


  userSignin1: async (req, res) => {
    try {
      const params = await service.trimObject(
        _.pick(req.body, ['email', 'password'])
      );

      if (_.isEmpty(params.email) || _.isEmpty(params.password)) {
        return res.status(200).json(
          service.serviceResponse(false, '000', errorMessages.missingParamError)
        );
      }

      if (!service.validateEmail(params.email)) {
        return res.status(200).json(
          service.serviceResponse(false, '000', errorMessages.invalidEmailError)
        );
      }


      const query = `
      SELECT user_id1 as id, fname, lname, email, password, email_verified, status,
      gender, dob, phone_no, city_town, state, country, address, profile_image,postal_code,
      'user' as role
      FROM user1 WHERE email = ? `;

      db.query(query, [params.email], (err, results) => {

        if (err) {
          return res.status(200).json(
            service.serviceResponse(false, '000', err.sqlMessage)
          );
        }

        if (results.length === 0) {
          return res.status(200).json(
            service.serviceResponse(false, '000', errorMessages.invalidLoginDetailsError)
          );
        }

        const user = results[0];

        if (user.email_verified === 0) {
          return res.status(200).json(
            service.serviceResponse(false, '000', errorMessages.emailNotVerifiedError)
          );
        }

        if (user.status === 0) {
          return res.status(200).json(
            service.serviceResponse(false, '000', errorMessages.accountNotActiveError)
          );
        }

        bcrypt.compare(params.password, user.password, (err, isMatch) => {

          if (err) {
            return res.status(200).json(
              service.serviceResponse(false, '000', err)
            );
          }

          if (!isMatch) {
            return res.status(200).json(
              service.serviceResponse(false, '000', errorMessages.invalidLoginDetailsError)
            );
          }

          const usertoken = jwt.sign(
            { user_id1: user.id, role: "user" },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
          );

          db.query(
            'UPDATE user1 SET token = ? WHERE user_id1 = ?',
            [usertoken, user.id],
            (err) => {

              if (err) {
                return res.status(200).json(
                  service.serviceResponse(false, '000', err.sqlMessage)
                );
              }

              return res.status(200).json(
                service.serviceResponse(true, '000', errorMessages.success, {
                  token: usertoken,
                  role: user.role,
                  id: user.id,
                  fname: user.fname,
                  lname: user.lname,
                  email: user.email,
                  gender: user.gender,
                  dob: user.dob,
                  phone_no: user.phone_no,
                  city_town: user.city_town,
                  state: user.state,
                  country: user.country,
                  address: user.address,
                  profile_image: user.profile_image,
                  postal_code: user.postal_code
                })
              );
            }
          );

        });
      }
      );

    } catch (err) {
      return res.status(200).json(
        service.serviceResponse(false, '333', errorMessages.serverError)
      );
    }
  },
  counsellorlogin: async (req, res) => {

    try {
      const params = await service.trimObject(_.pick(req.body, ['email', 'password']));

      if (_.isEmpty(params.email) || _.isEmpty(params.password)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      if (!service.validateEmail(params.email)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidEmailError));
      }

      db.query('SELECT * FROM counsellor WHERE email = ?', [params.email], (err, results) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }
        if (results.length === 0) {
          return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidLoginDetailsError));
        }

        const user = results[0];

        if (user.email_verified === 0) {
          return res.status(200).json(service.serviceResponse(false, '000', errorMessages.emailNotVerifiedError));
        }

        if (user.status === 0) {
          return res.status(200).json(service.serviceResponse(false, '000', errorMessages.accountNotActiveError));
        }

        bcrypt.compare(params.password, user.password, (err, isMatch) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err));
          }
          if (!isMatch) {
            return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidLoginDetailsError));
          }

          const token = jwt.sign(
            { c_id: user.c_id, role: "counsellor" },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
          );

          db.query('UPDATE counsellor SET token = ? WHERE c_id = ?', [token, user.c_id], (err, results) => {
            if (err) {
              return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
            }

            return res.status(200).json(
              service.serviceResponse(true, '000', errorMessages.success, {
                c_id: user.c_id,
                fname: user.fname,
                lname: user.lname,
                email: user.email,
                role: "counsellor",
                created_at: user.created_at,
                token: token
              })
            );
          });
        });
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  updateProfileImage: async (req, res) => {
    try {
      if (!req.user || !req.user.user_id1) {
        return res.status(401).json({
          status: false,
          message: "Unauthorized",
        });
      }

      if (!req.files || !req.files.image) {
        return res.status(400).json({
          status: false,
          message: "Image file is required",
        });
      }

      const userId = req.user.user_id1;
      const imageName = req.files.image[0].filename;

      db.query(
        "UPDATE user1 SET profile_image = ? WHERE user_id1 = ?",
        [imageName, userId],
        (err, result) => {
          if (err) {
            console.log("DB ERROR:", err);
            return res.status(500).json({
              status: false,
              message: "Database error",
            });
          }


          if (result.affectedRows === 0) {
            return res.status(400).json({
              status: false,
              message: "User not found",
            });
          }

          return res.status(200).json({
            status: true,
            message: "Profile image updated successfully",
            profile_image: imageName,
          });
        }
      );
    } catch (error) {
      console.log("SERVER ERROR:", error);
      return res.status(500).json({
        status: false,
        message: "Server error",
      });
    }
  },
  updateProfile: async (req, res) => {
    try {
      if (!req.user || !req.user.user_id1) {
        return res.status(401).json({
          status: false,
          message: "Unauthorized",
        });
      }

      const userId = req.user.user_id1;

      const {
        fname,
        lname,
        phone_no,
        gender,
        city_town,
        state,
        country,
        address,
        postal_code,
      } = req.body;

      db.query(
        `UPDATE user1 
       SET fname = ?, 
           lname = ?, 
           phone_no = ?, 
           gender = ?, 
           city_town = ?, 
           state = ?, 
           country = ?, 
           address = ?,
           postal_code=?
       WHERE user_id1 = ?`,
        [
          fname,
          lname,
          phone_no,
          gender,
          city_town,
          state,
          country,
          address,
          postal_code,
          userId
        ],
        (err, result) => {
          if (err) {
            return res.status(500).json({
              status: false,
              message: err.sqlMessage,
            });
          }

          db.query(
            "SELECT * FROM user1 WHERE user_id1 = ?",
            [userId],
            (err, rows) => {
              if (err) {
                return res.status(500).json({
                  status: false,
                  message: err.sqlMessage,
                });
              }

              return res.status(200).json({
                status: true,
                message: "Profile Updated Successfully",
                user: rows[0],
              });
            }
          );
        }
      );
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: "Server Error",
      });
    }
  },

  changePassword: async (req, res) => {
    try {
      if (!req.user || !req.user.user_id1) {
        return res.status(401).json(
          service.serviceResponse(false, '000', "Unauthorized")
        );
      }

      const userId = req.user.user_id1;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json(
          service.serviceResponse(false, '000', errorMessages.missingParamError)
        );
      }

      const userData = await new Promise((resolve, reject) => {
        db.query(
          "SELECT password FROM user1 WHERE user_id1 = ?",
          [userId],
          (err, results) => {
            if (err) return reject(err);
            resolve(results);
          }
        );
      });

      if (!userData || userData.length === 0) {
        return res.status(404).json(
          service.serviceResponse(false, '000', "User not found")
        );
      }

      const user = userData[0];

      const isMatch = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!isMatch) {
        return res.status(400).json(
          service.serviceResponse(false, '000', "Current password is incorrect")
        );
      }

      if (!passwordRegEx.test(newPassword)) {
        return res.status(400).json(
          service.serviceResponse(false, '000', errorMessages.invalidPasswordError)
        );
      }

      const hashedPassword = await bcrypt.hash(newPassword, 14);

      await new Promise((resolve, reject) => {
        db.query(
          "UPDATE user1 SET password = ? WHERE user_id1 = ?",
          [hashedPassword, userId],
          (err, results) => {
            if (err) return reject(err);
            resolve(results);
          }
        );
      });

      return res.status(200).json(
        service.serviceResponse(true, '000', "Password changed successfully")
      );

    } catch (error) {
      console.log("CHANGE PASSWORD ERROR:", error);
      return res.status(500).json(
        service.serviceResponse(false, '333', errorMessages.serverError)
      );
    }
  },
  //=========================================counsellor api start ====================================//
  counsellor: async (req, res) => {

    const { step, data, c_id } = req.body;

    if (!step) {
      return res.status(400).json({ message: "Step is required" });
    }

    // =====================================================
    // STEP 1 - BASIC INFO + PASSWORD HASH + OTP GENERATE
    // =====================================================
    if (step === 1) {

      db.query(
        "SELECT c_id FROM counsellor WHERE email = ?",
        [data.email],
        async (err, result) => {

          if (err) return res.status(500).json({ error: err.message });

          if (result.length > 0) {
            return res.status(400).json({ message: "Email already exists" });
          }

          try {

            const hashedPassword = await bcrypt.hash(data.password, 10);
            const now = new Date();
            const otp = service.generateOtp(4);
            const otpExpire = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes

            db.query(
              `INSERT INTO counsellor 
  (title, fname, lname, email, password, otp, otp_verify, otp_expiration_datetime, otp_sent_at, email_verified, step)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?)`,
              [
                data.title,
                data.fname,
                data.lname,
                data.email,
                hashedPassword,
                otp,
                0,
                otpExpire,
                now,
                0,
                1
              ],
              async (err, insertResult) => {

                if (err)
                  return res.status(500).json({ error: err.message });

                await mailer.sendUserOTPEmail({
                  email: data.email,
                  otp: otp,
                  fname: data.fname
                });

                return res.json({
                  message: "Step 1 completed. OTP sent.",
                  c_id: insertResult.insertId
                });
              }
            );

          } catch (error) {
            return res.status(500).json({ message: "Registration failed" });
          }
        }
      );

      return;
    }

    // =====================================================
    // BELOW STEPS REQUIRE c_id
    // =====================================================
    if (!c_id) {
      return res.status(400).json({ message: "c_id is required" });
    }

    // =====================================================
    // STEP 2 - PERSONAL DETAILS
    // =====================================================
    if (step === 2) {
      const monthMap = {
        January: "01", February: "02", March: "03",
        April: "04", May: "05", June: "06",
        July: "07", August: "08", September: "09",
        October: "10", November: "11", December: "12",
      };

      const monthDigit = monthMap[data.month];
      if (!monthDigit) {
        return res.status(400).json({
          success: false,
          message: "Invalid month",
        });
      }

      const dob = `${data.year}-${monthDigit}-${data.date.padStart(2, "0")}`;


      db.query(
        `UPDATE counsellor SET 
        dob=?, gender=?, mno=?, city=?, state=?, country=?, 
        fulladdress=?, eduction=?, degree=?, step=?
        WHERE c_id=?`,
        [
          dob,
          data.gender,
          data.mno,
          data.city,
          data.state,
          data.country,
          data.fulladdress,
          data.eduction,
          data.degree,
          2,
          c_id
        ],
        (err) => {

          if (err)
            return res.status(500).json({ error: err.message });

          return res.json({ message: "Step 2 completed" });
        }
      );

      return;
    }

    // =====================================================
    // STEP 3
    // =====================================================
    if (step === 3) {

      db.query(
        "UPDATE counsellor SET plan=?, terms=?, step=? WHERE c_id=?",
        [
          data.plan,
          data.terms ? 1 : 0,
          3,
          c_id
        ],
        (err) => {

          if (err)
            return res.status(500).json({ error: err.message });

          return res.json({ message: "Step 3 completed" });
        }
      );

      return;
    }

    // =====================================================
    // STEP 4
    // =====================================================
    if (step === 4) {

      db.query(
        `UPDATE counsellor SET 
        profileType=?, general_info=?, qualification_info=?, 
        website=?, link1=?, link2=?, inperson_price=?, online_price=?, session_type=?, availability=?, client_type=? ,step=?
        WHERE c_id=?`,
        [
          data.profileType,
          data.general_info,
          data.qualification_info,
          data.website,
          data.link1,
          data.link2,
          data.inperson_price,
          data.online_price,
          JSON.stringify(data.session_type),
          JSON.stringify(data.availability),
          JSON.stringify(data.client_type),
          4,
          c_id
        ],

        (err) => {

          if (err)
            return res.status(500).json({ error: err.message });

          return res.json({ message: "Step 4 completed" });
        }
      );

      return;
    }

    // =====================================================
    // STEP 5
    // =====================================================
    if (step === 5) {

      db.query(
        `UPDATE counsellor SET 
        professional_body = ?, 
        counselling_area = ?, 
      other_areas = ?, 
      step = ?
       WHERE c_id = ?`,
        [
          JSON.stringify(data.professional_body || []),
          JSON.stringify(data.counselling_area || []),
          data.other_areas || "",
          5,
          c_id,
        ],
        (err) => {

          if (err)
            return res.status(500).json({ error: err.message });

          return res.json({ message: "Step 5 completed" });
        }
      );

      return;
    }

    // =====================================================
    // STEP 6 - PAYMENT
    // =====================================================
    if (step === 6) {

      db.query(
        `UPDATE counsellor SET 
        cardnumber=?, cardholder_name=?, expiration=?, cvv=?, 
        step=?, is_completed=1
        WHERE c_id=?`,
        [
          data.cardnumber,
          data.cardholder_name,
          data.expiration,
          data.cvv,
          6,
          c_id
        ],
        (err) => {

          if (err)
            return res.status(500).json({ error: err.message });

          return res.json({ message: "Registration completed" });
        }
      );

      return;
    }

  },

  // =====================================================
  // OTP VERIFY
  // =====================================================
  otpVerification: async (req, res) => {

    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP required"
      });
    }

    db.query(
      "SELECT * FROM counsellor WHERE email=?",
      [email],
      async (err, results) => {

        if (err)
          return res.status(500).json({ success: false, message: err.sqlMessage });

        if (!results.length)
          return res.status(400).json({ success: false, message: "Email not found" });

        const user = results[0];

        if (Number(user.email_verified) === 1) {
          return res.status(400).json({
            success: false,
            message: "Email already verified"
          });
        }

        if (String(user.otp) !== String(otp)) {
          return res.status(400).json({
            success: false,
            message: "Invalid OTP"
          });
        }

        if (!user.otp_expiration_datetime) {
          return res.status(400).json({
            success: false,
            message: "OTP expired"
          });
        }

        const expireTime = new Date(user.otp_expiration_datetime);
        const currentTime = new Date();

        if (expireTime.getTime() <= currentTime.getTime()) {
          return res.status(400).json({
            success: false,
            message: "OTP expired"
          });
        }

        db.query(
          `UPDATE counsellor 
         SET otp=NULL, 
         otp_verify=0 ,
             otp_expiration_datetime=NULL, 
             email_verified=1 
         WHERE email=?`,
          [email],
          async (err2) => {

            if (err2)
              return res.status(500).json({ success: false, message: err2.sqlMessage });

            try {
              await mailer.sendUserWelcomeEmail(user);
            } catch (mailErr) {
              console.log("Mail error:", mailErr);
            }

            return res.json({
              success: true,
              message: "OTP verified successfully"
            });
          }
        );
      }
    );
  },

  // RESEND OTP
  // =====================================================
  resendOtpverify: async (req, res) => {

    const { email } = req.body;

    if (!email) {
      return res.json({ success: false, message: "Email is required" });
    }

    const now = new Date();
    const otp = service.generateOtp(4);
    const otpExpire = new Date(now.getTime() + 30 * 60 * 1000);

    db.query(
      `UPDATE counsellor 
SET otp=?, 
otp_verify=0,
otp_expiration_datetime=?, 
otp_sent_at=?, 
email_verified=0
WHERE email=?`,
      [otp, otpExpire, now, email],
      async (err, result) => {

        if (err)
          return res.status(500).json({ success: false, message: err.sqlMessage });

        if (!result.affectedRows)
          return res.json({ success: false, message: "User not found" });

        await mailer.sendUserOTPEmail({
          email: email,
          otp: otp
        });

        return res.json({
          success: true,
          message: "OTP resent successfully"
        });
      }
    );
  },
  clientTypeList: async (req, res) => {
    try {
      const query = `
      SELECT client_type_id AS id, client_type AS name
      FROM client_types
      WHERE status = 1
      ORDER BY client_type
    `;

      db.query(query, (err, results) => {
        if (err) {
          return res.json({
            success: false,
            message: err.sqlMessage
          });
        }

        res.json({
          success: true,
          data: results
        });
      });

    } catch (error) {
      res.json({
        success: false,
        message: "Server Error"
      });
    }
  },
  getCounsellor: (req, res) => {
    const c_id = req.c_id;

    db.query(
      `SELECT * 
     FROM counsellor 
     WHERE c_id = ?`,
      [c_id],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        if (result.length === 0)
          return res.status(404).json({ message: "User not found" });

        const user = result[0];

        res.json({
          success: true,
          data: user,
        });
      }
    );
  },
  getCounsellingarea: async (req, res) => {

    db.query("SELECT counselling_area_id, counselling_area FROM counselling_area",
      (err, results) => {
        if (err) {
          console.error("Database Error:", err);
          return res.status(500).json({
            success: false,
            message: "Failed to fetch tags",
            error: err.message,
          });
        }

        res.status(200).json({
          success: true,
          message: "Tags fetched successfully",
          data: results,
        });
      });

  },
  addArticle: async (req, res) => {
    try {
      const c_id = req.c_id;

      let {
        title,
        short_description,
        description,
        reading_time,
        tags
      } = req.body;

      // ✅ IMAGE HANDLE
      let imageName = null;

      if (req.files?.image) {
        const image = req.files.image[0];
        imageName = image.filename;
      }

      // ✅ INSERT QUERY
      const result = await new Promise((resolve, reject) => {
        db.query(
          `INSERT INTO article 
        (title, short_description, description, reading_time, tags, counsellor_id, image, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            title,
            short_description,
            description,
            reading_time,
            tags,
            c_id,
            imageName,
            new Date()
          ],
          (err, results) => {
            if (err) return reject(err);
            resolve(results);
          }
        );
      });

      // ✅ IMAGE URL BUILD
      let imagePath = null;

      if (imageName) {
        imagePath = `${req.protocol}://${req.get("host")}/uploads/${imageName}`;
      }

      // ✅ FINAL RESPONSE
      return res.status(200).json({
        success: true,
        message: "Article added successfully",
        data: {
          article_id: result.insertId,
          title,
          short_description,
          description,
          reading_time,
          tags,
          image: imagePath
        }
      });

    } catch (err) {
      console.log(err);
      return res.status(500).json({
        success: false,
        message: err.message || "Server Error"
      });
    }
  },

  articlelist: async (req, res) => {
    try {
      const c_id = req.c_id;

      db.query(
        "SELECT * FROM article WHERE counsellor_id = ? ORDER BY article_id DESC",
        [c_id],
        (err, results) => {
          if (err) throw err;

          res.json({
            success: true,
            data: results
          });
        }
      );

    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  },

  // GET PROFILE
  getprofile: (req, res) => {

    const sql = "SELECT * FROM counsellor WHERE c_id=?";

    db.query(sql, [req.query.c_id], (err, result) => {

      if (err) return res.json({ success: false });

      res.json({
        success: true,
        data: result[0]
      });

    });

  },

  editprofile: async (req, res) => {

    const { c_id, currentPassword, newpassword, confirmPassword, ...fields } = req.body;

    try {

      if (newpassword) {

        if (newpassword !== confirmPassword) {
          return res.json({
            success: false,
            message: "Passwords do not match"
          });
        }

        db.query("SELECT password FROM counsellor WHERE c_id = ?", [c_id], async (err, result) => {

          if (err) {
            console.log(err);
            return res.json({ success: false });
          }

          if (!result || result.length === 0) {
            return res.json({ success: false, message: "User not found" });
          }

          const dbPassword = result[0].password;

          // 🔐 Compare current password
          const isMatch = await bcrypt.compare(currentPassword, dbPassword);

          if (!isMatch) {
            return res.json({ success: false, message: "Current password incorrect" });
          }

          // 🔐 Hash new password
          const hash = await bcrypt.hash(newpassword, 10);

          fields.password = hash;

          // 👉 SAME OLD UPDATE QUERY
          const keys = Object.keys(fields);
          const values = Object.values(fields);

          if (keys.length === 0) {
            return res.json({ success: false, message: "No data to update" });
          }

          const sql = `UPDATE counsellor SET ${keys.map(k => `${k}=?`).join(",")} WHERE c_id=?`;

          db.query(sql, [...values, c_id], (err) => {

            if (err) {
              console.log(err);
              return res.json({ success: false });
            }

            res.json({
              success: true,
              message: "Profile Updated"
            });

          });

        });

      } else {

        // 👉 Agar password change nahi ho raha (OLD FLOW SAME)
        const keys = Object.keys(fields);
        const values = Object.values(fields);

        if (keys.length === 0) {
          return res.json({ success: false, message: "No data to update" });
        }

        const sql = `UPDATE counsellor SET ${keys.map(k => `${k}=?`).join(",")} WHERE c_id=?`;

        db.query(sql, [...values, c_id], (err) => {

          if (err) {
            console.log(err);
            return res.json({ success: false });
          }

          res.json({
            success: true,
            message: "Profile Updated"
          });

        });

      }

    } catch (error) {
      console.log(error);
      res.json({ success: false });
    }
  },
  uploadProfileImage: async (req, res) => {
    try {
      const c_id = req.c_id;
      const image = req.files?.uploadimage?.[0]?.filename;
      const video = req.files?.uploadvideo?.[0]?.filename;

      if (image) {
        await db.promise().query(
          "UPDATE counsellor SET uploadimage=? WHERE c_id=?",
          [image, c_id]
        );
      }

      if (video) {
        await db.promise().query(
          "UPDATE counsellor SET uploadvideo=? WHERE c_id=?",
          [video, c_id]
        );
      }

      // 🔥 GET UPDATED USER
      const [rows] = await db.promise().query(
        "SELECT * FROM counsellor WHERE c_id=?",
        [c_id]
      );

      res.json({
        success: true,
        data: rows[0], // 👈 FULL USER
      });

    } catch (err) {
      console.log("UPLOAD ERROR:", err);
      res.status(500).json({ success: false });
    }
  },
  addclasses: async (req, res) => {

    try {
      const c_id = req.c_id;
      const { title, description, keywords, date, time } = req.body;
      const video = req.file ? req.file.filename : null;

      const query = `
      INSERT INTO classes (title, description, keyword, date, time, video,c_id,created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

      db.query(
        query,
        [title, description, keywords, date, time, video, c_id, new Date()],
        (err, result) => {
          if (err) {
            console.log(err);
            return res.json({
              success: false,
              message: err.message,
            });
          }

          res.json({
            success: true,
            message: "Video saved successfully",
            data: result,
          });
        }
      );
    } catch (error) {
      console.log(error);
      res.json({
        success: false,
        message: "Server error",
      });
    }
  },
  classlist: async (req, res) => {
    try {
      const c_id = req.c_id;
      db.query(`SELECT * FROM classes WHERE c_id=?`,
        [c_id],
        (err, results) => {
          if (err) {
            return res.status(500).json({
              success: false,
              message: err.sqlMessage,
            });
          }

          return res.status(200).json({ success: true, data: results, });
        });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Server Error", });
    }
  },
  updateClass: async (req, res) => {
    try {
      const { classes_id } = req.body;

      if (!classes_id) {
        service.deleteUploadedFiles(req.files);
        return res.json({
          success: false,
          message: "classes_id is required",
        });
      }

      let fields = [];
      let values = [];

      // ✅ optional fields (only update if present)
      if (req.body.title) {
        fields.push("title = ?");
        values.push(req.body.title);
      }

      if (req.body.description) {
        fields.push("description = ?");
        values.push(req.body.description);
      }

      if (req.body.status) {
        fields.push("status = ?");
        values.push(req.body.status);
      }

      // ✅ video replace
      if (req.files?.video) {
        const video = req.files.video[0];
        fields.push("video = ?");
        values.push(video.filename);
      }

      // ❌ nothing to update
      if (fields.length === 0) {
        return res.json({
          success: false,
          message: "Nothing to update",
        });
      }

      const query = `UPDATE classes SET ${fields.join(", ")} WHERE classes_id = ?`;

      values.push(classes_id);

      db.query(query, values, (err, result) => {
        if (err) {
          return res.json({
            success: false,
            message: err.sqlMessage,
          });
        }

        return res.json({
          success: true,
          message: "Updated Successfully",
        });
      });

    } catch (err) {
      return res.json({
        success: false,
        message: "Server Error",
      });
    }
  },

  deleteClass: async (req, res) => {
    try {
      const { classes_id, type } = req.query;
      // type = "video" | "all"

      if (!classes_id) {
        return res.json({
          success: false,
          message: "classes_id required",
        });
      }

      // 🔥 get existing record
      db.query(
        "SELECT video FROM classes WHERE classes_id = ?",
        [classes_id],
        (err, result) => {
          if (err) {
            return res.json({
              success: false,
              message: err.sqlMessage,
            });
          }

          if (result.length === 0) {
            return res.json({
              success: false,
              message: "Record not found",
            });
          }

          const oldVideo = result[0].video;

          // 🔥 video file delete (common for both)
          if (oldVideo) {
            fs.unlink(`uploads/${oldVideo}`, (err) => {
              if (err) console.log("File delete error:", err);
            });
          }

          // ✅ ONLY VIDEO DELETE
          if (type === "video") {
            db.query(
              "UPDATE classes SET video = NULL WHERE classes_id = ?",
              [classes_id],
              (err2) => {
                if (err2) {
                  return res.json({
                    success: false,
                    message: err2.sqlMessage,
                  });
                }

                return res.json({
                  success: true,
                  message: "Video Deleted Successfully",
                });
              }
            );
          }

          // ✅ FULL RECORD DELETE
          else if (type === "all") {
            db.query(
              "DELETE FROM classes WHERE classes_id = ?",
              [classes_id],
              (err3) => {
                if (err3) {
                  return res.json({
                    success: false,
                    message: err3.sqlMessage,
                  });
                }

                return res.json({
                  success: true,
                  message: "Class Deleted Successfully",
                });
              }
            );
          }

          // ❌ invalid type
          else {
            return res.json({
              success: false,
              message: "Invalid type (use video or all)",
            });
          }
        }
      );

    } catch (err) {
      return res.json({
        success: false,
        message: "Server Error",
      });
    }
  },
  addQualification: async (req, res) => {
    try {
      const { degree, university, completionDate, description, type } = req.body;

      const c_id = req.c_id;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Certificate required",
        });
      }

    const imagePath = req.file.filename;

      const query = `
      INSERT INTO qualification 
      (c_id, degree, university, completionDate, description, certificate,typeofCertificate,created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

      db.query(
        query,
        [c_id, degree, university, completionDate, description, imagePath, type, new Date()],
        (err, result) => {
          if (err) {
            return res.status(200).json({
              success: false,
              message: err.sqlMessage,
            });
          }

          return res.status(200).json({
            success: true,
            message: "Qualification added",
          });
        }
      );

    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }
  },
  qualificationList: async (req, res) => {
    try {

      const c_id = req.c_id || req.body.c_id;
      const search = req.body.search || "";
      const page = parseInt(req.body.page) || 1;
      const limit = parseInt(req.body.limit) || 10;
      const offset = (page - 1) * limit;
      const type = req.body.type || "";

      let whereConditions = ["c_id = ?"];
      let params = [c_id];

      if (type) {
        whereConditions.push("type = ?");
        params.push(type);
      }

      if (search) {
        whereConditions.push(`(
        degree LIKE ? OR 
        university LIKE ? OR 
        description LIKE ?
      )`);

        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

      const dataQuery = `
      SELECT 
        q_id,
        degree,
        university,
        completionDate,
        description,
        certificate,
        typeofCertificate
      FROM qualification
      ${whereClause}
      LIMIT ? OFFSET ?
    `;

      const countQuery = `
      SELECT COUNT(*) AS total 
      FROM qualification
      ${whereClause}
    `;

      db.query(countQuery, params, (err, countResult) => {
        if (err) {
          return res.status(200).json({
            success: false,
            message: err.sqlMessage,
          });
        }

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        db.query(
          dataQuery,
          [...params, limit, offset],
          (err, results) => {
            if (err) {
              return res.status(200).json({
                success: false,
                message: err.sqlMessage,
              });
            }

            return res.status(200).json({
              success: true,
              message: "Success",
              data: {
                data: results,
                pagination: {
                  totalRecords: total,
                  totalPages,
                  currentPage: page,
                  limit,
                },
              },
            });
          }
        );
      });

    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }
  },
  updateQualification: async (req, res) => {
  try {
    const { q_id } = req.params;
    const { degree, university, completionDate, description } = req.body;

    let imagePath = null;

    if (req.file) {
      imagePath = req.file.filename;
    }

    let query = `
      UPDATE qualification
      SET degree=?, university=?, completionDate=?, description=?
    `;

    let params = [degree, university, completionDate, description];

    // ✅ only update if new file
    if (imagePath) {
      query += `, certificate=?`;
      params.push(imagePath);
    }

    query += ` WHERE q_id=?`;
    params.push(q_id);

    db.query(query, params, (err, result) => {
      if (err) {
        return res.status(200).json({
          success: false,
          message: err.sqlMessage,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Updated Successfully",
      });
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
},

  sessionType: async (req, res) => {
    try {

      const c_id = req.c_id;

      const search = req.body.search || "";
      const page = parseInt(req.body.page) || 1;
      const limit = parseInt(req.body.limit) || 10;
      const offset = (page - 1) * limit;

      let whereConditions = ["c_id = ?"];
      let params = [c_id];

      // ✅ optional search (price or session_type)
      if (search) {
        whereConditions.push(`(
        session_type LIKE ? OR 
        inperson_price LIKE ? OR 
        online_price LIKE ?
      )`);

        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

      const query = `
        SELECT 
        c.session_type,
        c.inperson_price,
        c.online_price,
        c.availability,
        c.client_type,
        c.online_platforms,

  (
    SELECT CONCAT('[', GROUP_CONCAT(JSON_QUOTE(online_platform)), ']') 
    FROM online_platforms 
    WHERE status = 1
  ) AS all_platforms,

    (
  SELECT GROUP_CONCAT(CONCAT(ct.client_type_id, '::', ct.client_type))
  FROM client_types ct
  WHERE ct.status = 1
) AS all_clients 

   FROM counsellor c
   WHERE c.c_id = ?
  `;

      const countQuery = `
      SELECT COUNT(*) AS total 
      FROM counsellor
      ${whereClause}
    `;

      db.query(countQuery, params, (err, countResult) => {
        if (err) {
          return res.status(200).json({
            success: false,
            message: err.sqlMessage,
          });
        }

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        db.query(
          query,
          [...params, limit, offset],
          (err, results) => {
            if (err) {
              return res.status(200).json({
                success: false,
                message: err.sqlMessage,
              });
            }

            const row = results[0];

            // ALL CLIENTS (id + name)
            const allClients = row.all_clients
              ? row.all_clients.split(",").map(i => {
                const [id, name] = i.split("::");
                return { id: Number(id), name };
              })
              : [];

            return res.status(200).json({
              success: true,
              data: {
                data: [{
                  ...row,
                  session_type: JSON.parse(row.session_type || "[]"),
                  client_type: JSON.parse(row.client_type || "[]"),
                  availability: JSON.parse(row.availability || "{}"),
                  online_platforms: JSON.parse(row.online_platforms || "[]"),
                  all_platforms: JSON.parse(row.all_platforms || "[]"),
                  all_clients: allClients
                }]
              }
            });
          }
        );
      });

    } catch (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }
  },
  updatesessionType: async (req, res) => {
    try {
      const { section, data } = req.body;
      const c_id = req.c_id;

      let updateQuery = {};

      if (section === "availability") {
        updateQuery.availability = JSON.stringify(data);
      }

      if (section === "session") {
        updateQuery.inperson_price = data.inperson_price;
        updateQuery.online_price = data.online_price;
        updateQuery.session_type = JSON.stringify(data.session_type);

      }

      if (section === "client_type") {
        updateQuery.client_type = JSON.stringify(data.client_type || []);
      }

      if (section === "online_platforms") {

        updateQuery.online_platforms = JSON.stringify(data.online_platforms);
      }

      await db.promise().query(
        "UPDATE counsellor SET ? WHERE c_id = ?",
        [updateQuery, c_id]
      );
      res.json({ success: true, message: "Updated successfully" });

    } catch (error) {
      console.error(error);
      res.json({ success: false, message: "Error updating data" });
    }
  },

  dbsList: async (req, res) => {
    try {
      const c_id = req.c_id;

      const query = `
      SELECT 
        c.professional_body,
        c.counselling_area,
        c.other_areas,

        (
          SELECT GROUP_CONCAT(
            CONCAT(pb.professional_body_id, '::', pb.professional_body)
          )
          FROM professional_bodies pb
          WHERE pb.status = 1
        ) AS all_professional,

        (
          SELECT GROUP_CONCAT(
            CONCAT(ca.counselling_area_id, '::', ca.counselling_area)
          )
          FROM counselling_area ca
          WHERE ca.status = 1
        ) AS all_counselling

      FROM counsellor c
      WHERE c.c_id = ?
    `;
      console.log("c_id =>", c_id);


      db.query(query, [c_id], (err, results) => {
        if (err) {
          console.log(err);
          return res.json({
            success: false,
            message: err.sqlMessage
          });
        }

        if (!results.length) {
          return res.json({
            success: true,
            data: {
              all_professional: [],
              all_counselling: [],
              professional_body: [],
              counselling_area: [],
              other_areas: ""
            }
          });
        }

        const row = results[0];

        const professional = row.all_professional
          ? row.all_professional.split(",").map((item) => {
            const [id, ...name] = item.split("::");

            return {
              id: Number(id),
              name: name.join("::")
            };
          })
          : [];

        const counselling = row.all_counselling
          ? row.all_counselling.split(",").map((item) => {
            const [id, ...name] = item.split("::");

            return {
              id: Number(id),
              name: name.join("::")
            };
          })
          : [];


        return res.json({
          success: true,
          data: {
            all_professional: professional,
            all_counselling: counselling,

            professional_body: row.professional_body
              ? JSON.parse(row.professional_body)
              : [],

            counselling_area: row.counselling_area
              ? JSON.parse(row.counselling_area)
              : [],

            other_areas: row.other_areas || ""
          }
        });
      });
    } catch (error) {
      console.log(error);
      return res.json({
        success: false,
        message: "Server Error"
      });
    }
  },

  updateDBSStatus: async (req, res) => {
    try {
      const c_id = req.c_id;

      const { professional_body, counselling_area, other_areas } = req.body;

      const professionalJson = JSON.stringify(professional_body || []);
      const counsellingJson = JSON.stringify(counselling_area || []);

      const query = `
      UPDATE counsellor
      SET
        professional_body = ?,
        counselling_area = ?,
        other_areas = ?
      WHERE c_id = ?
    `;

      db.query(
        query,
        [professionalJson, counsellingJson, other_areas || "", c_id],
        (err) => {
          if (err) {
            return res.json({
              success: false,
              message: err.sqlMessage
            });
          }

          return res.json({
            success: true,
            message: "DBS Status Updated Successfully"
          });
        }
      );
    } catch (error) {
      console.error(error);
      res.json({
        success: false,
        message: "Server Error"
      });
    }
  },

  dbsListOnly: async (req, res) => {
    try {
      const query = `
      SELECT 
        (SELECT GROUP_CONCAT(CONCAT(ca.counselling_area_id, '::', ca.counselling_area)) 
         FROM counselling_area ca WHERE ca.status = 1) AS counselling_area,

        (SELECT GROUP_CONCAT(CONCAT(pb.professional_body_id, '::', pb.professional_body)) 
         FROM professional_bodies pb WHERE pb.status = 1) AS professional_body
    `;

      db.query(query, (err, results) => {
        if (err) {
          return res.json({ success: false, message: err.sqlMessage });
        }

        const row = results[0];

        const counselling = row.counselling_area
          ? row.counselling_area.split(",").map(item => {
            const [id, name] = item.split("::");
            return { id: Number(id), name };
          })
          : [];

        const professional = row.professional_body
          ? row.professional_body.split(",").map(item => {
            const [id, name] = item.split("::");
            return { id: Number(id), name };
          })
          : [];

        res.json({
          success: true,
          data: {
            all_counselling: counselling,
            all_professional: professional
          }
        });
      });

    } catch (error) {
      res.json({ success: false, message: "Server Error" });
    }
  },
  searchProfessional: async (req, res) => {
    try {
      const search = req.body.search || "";

      const query = `
      SELECT 
        professional_body_id AS id,
        professional_body AS name
      FROM professional_bodies
      WHERE status = 1
      AND professional_body LIKE ?
      LIMIT 20
    `;

      db.query(query, [`%${search}%`], (err, results) => {
        if (err) {
          return res.json({ success: false, message: err.sqlMessage });
        }

        res.json({
          success: true,
          data: results
        });
      });

    } catch (error) {
      res.json({ success: false, message: "Server Error" });
    }
  },

  searchCounsellor: async (req, res) => {
    try {
      const search = req.body.search || "";

      const query = `
      SELECT 
        counselling_area_id AS id,
        counselling_area AS name
      FROM counselling_area
      WHERE status = 1
      AND counselling_area LIKE ?
      LIMIT 20
    `;

      db.query(query, [`%${search}%`], (err, results) => {
        if (err) {
          return res.json({ success: false, message: err.sqlMessage });
        }

        res.json({
          success: true,
          data: results
        });
      });

    } catch (error) {
      res.json({ success: false, message: "Server Error" });
    }
  },

  //api end counsellor==================================
  //==========================searchcounsellor=======================================
  searchCounsellors: async (req, res) => {
    try {
      const filters = req.body;

      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 6;
      const offset = (page - 1) * limit;

      const values = [];

      // ✅ BASE QUERY (JOIN INCLUDED)
      let baseQuery = `
      FROM counsellor c
      LEFT JOIN counselling_area ca 
        ON JSON_CONTAINS(c.counselling_area, JSON_ARRAY(ca.counselling_area_id))
      WHERE c.is_completed = 1 
      AND c.email_verified = 1
    `;

      // ================= FILTERS =================

      if (filters.deliveryMethod) {
        baseQuery += ` AND c.session_type = ?`;
        values.push(filters.deliveryMethod);
      }

      if (filters.city) {
        baseQuery += ` AND c.city LIKE ?`;
        values.push(`%${filters.city.trim()}%`);
      }

      if (filters.country) {
        baseQuery += ` AND c.country LIKE ?`;
        values.push(`%${filters.country.trim()}%`);
      }

      if (filters.gender) {
        const genderArray = Array.isArray(filters.gender)
          ? filters.gender
          : [filters.gender];

        if (genderArray.length > 0) {
          baseQuery += ` AND c.gender IN (${genderArray.map(() => "?").join(",")})`;
          values.push(...genderArray);
        }
      }

      if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
        baseQuery += ` AND c.price BETWEEN ? AND ?`;
        values.push(filters.minPrice, filters.maxPrice);
      }

      if (filters.counsellingType) {
        const typeArray = Array.isArray(filters.counsellingType)
          ? filters.counsellingType
          : [filters.counsellingType];

        if (typeArray.length > 0) {
          baseQuery += ` AND c.profileType IN (${typeArray.map(() => "?").join(",")})`;
          values.push(...typeArray);
        }
      }

      // ✅ TAG FILTER (IMPORTANT)
      if (filters.tags) {
        const tagArray = Array.isArray(filters.tags)
          ? filters.tags
          : [filters.tags];

        if (tagArray.length > 0) {
          baseQuery += ` AND (${tagArray
            .map(() => `JSON_CONTAINS(c.counselling_area, JSON_ARRAY(?))`)
            .join(" OR ")})`;

          values.push(...tagArray);
        }
      }

      // ✅ SEARCH
      if (filters.keyword && filters.keyword.trim() !== "") {
        const keyword = `%${filters.keyword.trim()}%`;

        baseQuery += `
        AND (
          c.fname LIKE ?
          OR c.lname LIKE ?
          OR c.profileType LIKE ?
          OR c.degree LIKE ?
        )
      `;

        values.push(keyword, keyword, keyword, keyword);
      }

      // ================= FINAL QUERY =================

      const query = `
      SELECT 
        c.*,
        GROUP_CONCAT(DISTINCT ca.counselling_area SEPARATOR ', ') AS Area_of_counseling
      ${baseQuery}
      GROUP BY c.c_id
      LIMIT ? OFFSET ?
    `;

      const countQuery = `
      SELECT COUNT(DISTINCT c.c_id) as total
      ${baseQuery}
    `;

      // ================= COUNT =================
      db.query(countQuery, values, (countErr, countResult) => {
        if (countErr) {
          console.log("COUNT ERROR:", countErr);
          return res.status(500).json({ success: false });
        }

        const total = countResult[0].total;

        // ================= DATA =================
        db.query(query, [...values, limit, offset], (err, results) => {
          if (err) {
            console.log("SEARCH ERROR:", err);
            return res.status(500).json({ success: false });
          }

          // ✅ Availability logic
          const updatedResults = results.map((item) => {
            let status = "Not Available";

            const isValidSlot = (start, end) => {
              return new Date(`1970-01-01 ${start}`) < new Date(`1970-01-01 ${end}`);
            };

            let availability = {};

            try {
              availability = item.availability
                ? JSON.parse(item.availability)
                : {};
            } catch {
              availability = {};
            }

            let slotCount = 0;

            for (let day in availability) {
              if (
                availability[day].enabled &&
                availability[day].slots &&
                availability[day].slots.length > 0
              ) {
                availability[day].slots.forEach((slot) => {
                  if (!isValidSlot(slot.start, slot.end)) return;
                  slotCount++;
                });
              }
            }

            status =
              slotCount > 1
                ? "Available For New Clients"
                : slotCount === 1
                  ? "Limited Availability"
                  : "Not Available";

            return {
              ...item,
              availabilityStatus: status,
            };
          });

          return res.json({
            success: true,
            total,
            data: updatedResults,
          });
        });
      });

    } catch (error) {
      console.log("SERVER ERROR:", error);
      return res.status(500).json({ success: false });
    }
  },
  // controllers/webAPI.js
  //=================counselling area======================//
  getCounsellingAreas: async (req, res) => {
    try {
      const [rows] = await db.promise().query(
        "SELECT counselling_area_id, counselling_area FROM counselling_area WHERE status = 1 ORDER BY counselling_area ASC"
      );

      return res.status(200).json({
        success: true,
        data: rows,
      });
    } catch (error) {
      console.error("Error fetching counselling areas:", error);

      return res.status(500).json({
        success: false,
        message: "Something went wrong",
      });
    }
  },

  //====================================== SAVE ===================
  saveBookmark: async (req, res) => {
    try {

      const userId = req.user.user_id1;
      const { counsellorId } = req.body;

      const [exist] = await db.promise().query(
        "SELECT * FROM user_bookmarks WHERE user_id1 = ? AND c_id = ?",
        [userId, counsellorId]
      );


      if (exist.length > 0) {
        return res.json({ success: true, message: "Already saved" });
      }

      await db.promise().query(
        "INSERT INTO user_bookmarks (user_id1, c_id) VALUES (?, ?)",
        [userId, counsellorId]
      );

      res.json({ success: true });

    } catch (error) {
      console.error("Save Bookmark Error:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },
  //====================================== REMOVE ===================
  removeBookmark: async (req, res) => {
    try {

      const userId = req.user.user_id1;
      const { counsellorId } = req.body;

      await db.promise().query(
        "DELETE FROM user_bookmarks WHERE user_id1 = ? AND c_id = ?",
        [userId, counsellorId]
      );

      res.json({ success: true });

    } catch (error) {
      console.log("REMOVE ERROR:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  //====================================== GET ALL SAVED ===================
  getBookmarks: async (req, res) => {
    try {

      const userId = req.user.user_id1;

      const [rows] = await db.promise().query(
        `SELECT 
  c.c_id,
  c.fname,
  c.lname,
  c.status,
  c.professional_body,
  c.degree,
  c.general_info,
  c.email,
  c.profile_image,
  c.availability,
  GROUP_CONCAT(ca.counselling_area SEPARATOR ', ') AS counselling_area
FROM user_bookmarks ub
JOIN counsellor c ON c.c_id = ub.c_id
LEFT JOIN counselling_area ca 
  ON JSON_CONTAINS(c.counselling_area, JSON_ARRAY(ca.counselling_area_id))
WHERE ub.user_id1 = ?
GROUP BY c.c_id`,
        [userId]
      );

      res.json({ success: true, data: rows });

    } catch (error) {
      console.log("GET BOOKMARK ERROR:", error);
      res.status(500).json({ success: false, error: error.message });
    }
  },
  getCounsellorProfile: async (req, res) => {
    try {
      const counsellorId = req.params.id;

      const [rows] = await db.promise().query(
        `SELECT 
    c.*,

    GROUP_CONCAT(DISTINCT a.counselling_area) AS counselling_area,
    GROUP_CONCAT(DISTINCT ct.client_type) AS client_type_names,
    GROUP_CONCAT(DISTINCT op.online_platform) AS online_platforms_names,
    GROUP_CONCAT(DISTINCT pb.professional_body) AS professional_body_names

    


  FROM counsellor c

  LEFT JOIN counselling_area a 
    ON FIND_IN_SET(
      a.counselling_area_id, 
      REPLACE(REPLACE(c.counselling_area, '[', ''), ']', '')
    )

  LEFT JOIN client_types ct   
    ON FIND_IN_SET(
      ct.client_type_id,
      REPLACE(REPLACE(REPLACE(c.client_type, '[', ''), ']', ''), '"', '')
    )

    LEFT JOIN online_platforms op   
    ON FIND_IN_SET(
      op.online_platform_id,
      REPLACE(REPLACE(REPLACE(c.online_platforms, '[', ''), ']', ''), '"', '')
    )

    
   LEFT JOIN professional_bodies pb   
  ON FIND_IN_SET(
    pb.professional_body_id,
    REPLACE(REPLACE(REPLACE(c.professional_body, '[', ''), ']', ''), '"', '')
  )

  WHERE c.c_id = ?
  GROUP BY c.c_id`,
        [counsellorId]
      );

      if (rows.length === 0) {
        return res.json({
          success: false,
          message: "Counsellor not found"
        });
      }

      let data = rows[0];

      // ✅ counselling area names array me convert karo
      data.counselling_area = data.counselling_area
        ? data.counselling_area.split(",")
        : [];

      // client_type
      data.client_type_names = data.client_type_names
        ? data.client_type_names.split(",")
        : [];

      data.online_platforms_names = data.online_platforms_names
        ? data.online_platforms_names.split(",")
        : [];

      data.professional_body_names = data.professional_body_names
        ? data.professional_body_names.split(",")
        : [];

      try {
        data.availability = data.availability
          ? JSON.parse(data.availability)
          : {};
      } catch {
        data.availability = {};
      }

      try {
        data.Area_of_counseling = data.Area_of_counseling
          ? JSON.parse(data.Area_of_counseling)
          : [];
      } catch {
        data.Area_of_counseling = [];
      }

      try {
        data.client_type = data.client_type
          ? JSON.parse(data.client_type)
          : [];
      } catch {
        data.client_type = [];
      }

      try {
        data.online_platforms = data.online_platforms
          ? JSON.parse(data.online_platforms)
          : [];
      } catch {
        data.online_platforms = [];
      }

      try {
        data.profession = data.profession
          ? JSON.parse(data.profession)
          : [];
      } catch {
        data.profession = [];
      }

      res.json({
        success: true,
        data
      });

    } catch (error) {
      console.log(error);
      res.json({ success: false });
    }
  },
  counsellorQualificationsshow: async (req, res) => {
    try {
      const counsellorId = req.params.id;

      if (!counsellorId) {
        return res.status(400).json({
          success: false,
          message: "c_id is required",
        });
      }

      const query = `
      SELECT 
        q_id,
        degree,
        university,
        completionDate,
        description,
        certificate,
        typeofCertificate
      FROM qualification
      WHERE c_id = ?
      ORDER BY completionDate DESC
    `;

      db.query(query, [counsellorId], (err, results) => {
        if (err) {
          return res.status(200).json({
            success: false,
            message: err.sqlMessage,
          });
        }

        return res.status(200).json({
          success: true,
          data: results,
        });
      });
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: "Server Error",
      });
    }
  },
  //==================getbookedslots==================//
  getBookedSlots: async (req, res) => {
    const counsellorId = req.params.c_id;

    try {
      const [appointments] = await db.promise().query(
        `SELECT 
        RIGHT(booking_id, 4) as booking_id,
        DATE_FORMAT(appointment_date, '%Y-%m-%d') as date,
        TIME_FORMAT(start_time, '%H:%i') as start,
        TIME_FORMAT(end_time, '%H:%i') as end
       FROM appointments 
       WHERE c_id=? AND appointment_date >= CURDATE()`,
        [counsellorId]
      );

      res.json({
        success: true,
        slots: appointments,
      });

    } catch (err) {
      console.log(err);
      res.status(500).json({
        success: false,
        message: "Failed to fetch slots"
      });
    }
  },
  //==========================getbookappoinment Id=================/
  generateBookingId: async (req, res) => {
    try {
      const bookingId = `BK-${Date.now()}-${String(Math.floor(1000 + Math.random() * 9000)).padStart(4, "0")}`;
      res.json({
        success: true,
        booking_id: bookingId,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: "Failed to generate booking ID",
      });
    }
  },
  //==========================book appoinment=================/
  bookAppointment: async (req, res) => {
    const { c_id, slots, mode, payment_method, booking_id, amount, counselling_area_id } = req.body;
    const user_id1 = req.user?.user_id1;

    if (!user_id1) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!slots || slots.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Slots missing",
      });
    }

    const conn = await db.promise().getConnection();

    try {
      await conn.beginTransaction();

      for (let slot of slots) {
        const { date, start, end } = slot;

        if (!date || !start || !end) {
          throw new Error("Invalid slot data");
        }

        const now = new Date();
        const slotDateTime = new Date(date);

        const [h, m] = start.split(":");
        slotDateTime.setHours(h, m, 0, 0);

        if (slotDateTime < now) {
          throw new Error("Past slot");
        }

        const [existing] = await conn.query(
          `SELECT booking_id FROM appointments 
            WHERE c_id=? AND appointment_date=? 
            AND (start_time < ? AND end_time > ?)`,
          [c_id, date, end, start]
        );

        if (existing.length > 0) {
          throw new Error("Slot already booked");
        }

        await conn.query(
          `INSERT INTO appointments 
  (c_id, user_id1, appointment_date, start_time, end_time, mode, amount, payment_method, counselling_area_id, booking_id)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            c_id,
            user_id1,
            date,
            start,
            end,
            mode,
            Number(amount),
            payment_method || null,
            counselling_area_id,
            booking_id
          ]
        );
      }

      await conn.commit();

      res.json({
        success: true,
        booking_id: booking_id,
      });

    } catch (err) {
      await conn.rollback();
      console.log("🔥 ERROR:", err);

      res.status(500).json({
        success: false,
        message: err.message,
      });

    } finally {
      conn.release();
    }
  },
  // GET /web/api/getUserAppointments
  getUserAppointments: async (req, res) => {
    try {
      const user_id1 = req.user?.user_id1;

      if (!user_id1) {
        return res.json({
          success: false,
          message: "User not found",
        });
      }

      const [rows] = await db.promise().query(
        `SELECT 
  a.booking_id,
  a.appointment_date,
  a.start_time,
  a.end_time,
  a.mode,
  a.c_id,
  a.meeting_link,
  ca.counselling_area,   
  c.fname,
  c.lname,
  c.profile_image,
  c.general_info,
  c.professional_body
FROM appointments a
JOIN counsellor c ON c.c_id = a.c_id
LEFT JOIN counselling_area ca 
  ON ca.counselling_area_id = a.counselling_area_id
WHERE a.user_id1 = ?
ORDER BY a.appointment_date DESC`,
        [user_id1]
      );

      return res.json({
        success: true,
        data: rows,
      });

    } catch (err) {
      console.log(err);
      return res.json({
        success: false,
        message: "Something went wrong",
      });
    }
  },
  // DELETE /web/api/cancelAppointment/:id
  cancelAppointment: async (req, res) => {
    try {
      const booking_id = req.params.id;
      const user_id1 = req.user?.user_id1;

      if (!booking_id) {
        return res.json({
          success: false,
          message: "Booking ID required",
        });
      }

      // check if appointment exists
      const [check] = await db.promise().query(
        `SELECT * FROM appointments 
       WHERE booking_id = ? AND user_id1 = ?`,
        [booking_id, user_id1]
      );

      if (check.length === 0) {
        return res.json({
          success: false,
          message: "Appointment not found",
        });
      }

      // delete appointment
      await db.promise().query(
        `DELETE FROM appointments 
       WHERE booking_id = ? AND user_id1 = ?`,
        [booking_id, user_id1]
      );

      return res.json({
        success: true,
        message: "Appointment cancelled successfully",
      });

    } catch (err) {
      console.log(err);
      return res.json({
        success: false,
        message: "Something went wrong",
      });
    }
  },
  getCounsellorAppointments: async (req, res) => {
    try {
      const c_id = req.c_id;

      if (!c_id) {
        return res.json({
          success: false,
          message: "Counsellor not found",
        });
      }

      const [rows] = await db.promise().query(
        `SELECT 
  a.booking_id,
  a.appointment_date,
  a.start_time,
  a.end_time,
  a.platform,
a.meeting_link,
  a.counselling_area_id,
  ca.counselling_area AS counselling_area, 
  a.mode,
  u.fname,
  u.lname,
  u.phone_no,
  u.email,
  u.profile_image
FROM appointments a
JOIN user1 u ON u.user_id1 = a.user_id1
LEFT JOIN counselling_area ca 
  ON ca.counselling_area_id = a.counselling_area_id  
WHERE a.c_id = ?
ORDER BY a.appointment_date, a.start_time`,
        [c_id]
      );

      return res.json({
        success: true,
        data: rows,
      });

    } catch (err) {
      console.log(err);
      return res.json({
        success: false,
        message: "Something went wrong",
      });
    }
  },
  updateAppointment: async (req, res) => {
    try {
      const { booking_id, mode } = req.body;

      let platform = req.body.platform;
      let meeting_link = req.body.meeting_link;

      // 🔥 important logic
      if (mode === "inperson") {
        platform = null;
        meeting_link = null;
      }

      await db.promise().query(
        `UPDATE appointments 
       SET mode = ?, platform = ?, meeting_link = ?
       WHERE booking_id = ?`,
        [mode, platform, meeting_link, booking_id]
      );

      return res.json({
        success: true,
        message: "Appointment updated successfully",
      });
    } catch (err) {
      console.log(err);
      return res.json({
        success: false,
        message: "Something went wrong",
      });
    }
  },


  //========================Email Contact==========================//
  sendEmailToCounsellor: async (req, res) => {
    const { name, phone, email, message, source, c_id, subject } = req.body;

    // ✅ Required validation
    if (!name || !email || !message || !c_id) {
      return res.status(400).json({
        success: false,
        message: "Name, Email, Message and Counsellor ID are required",
      });
    }

    // ✅ Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // ✅ Phone validation
    if (phone && phone.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Invalid phone number",
      });
    }

    // ✅ Message validation
    if (message.length < 4) {
      return res.status(400).json({
        success: false,
        message: "Message too short",
      });
    }

    try {
      const [result] = await db.promise().query(
        "SELECT fname, lname, email FROM counsellor WHERE c_id = ?",
        [c_id]
      );

      if (!result.length) {
        return res.status(400).json({
          success: false,
          message: "Counsellor not found",
        });
      }

      const counsellor = result[0];
      const fullName = `${counsellor.fname} ${counsellor.lname}`;

      await db.promise().query(
        `INSERT INTO contact_emails 
       (name, phone, email, message, source, c_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
        [name, phone, email, message, source, c_id]
      );

      await mailer.sendCounsellorContactEmail({
        to: counsellor.email,
        counsellorName: fullName,
        name,
        phone,
        email,
        message,
        source,
        subject: subject || "New enquiry"
      });

      return res.json({
        success: true,
        message: "Message sent successfully",
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Something went wrong",
      });
    }
  },
  getCounsellorClients: async (req, res) => {
    const c_id = req.c_id;

    if (!c_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    try {
      const [rows] = await db.promise().query(
        `SELECT 
  a.booking_id,  
  u.user_id1 AS user_id,
  CONCAT(u.fname, ' ', u.lname) AS name,
  u.email,
  u.profile_image,
  u.phone_no,
  a.appointment_date,
  a.start_time,
  a.end_time,
  a.mode,
  a.counselling_area_id,
  ca.counselling_area  
FROM appointments a
JOIN user1 u ON u.user_id1 = a.user_id1  
LEFT JOIN counselling_area ca 
  ON ca.counselling_area_id = a.counselling_area_id  
WHERE a.c_id = ?
ORDER BY a.appointment_date DESC, a.start_time DESC`,
        [c_id]
      );

      return res.status(200).json({
        success: true,
        data: rows,
      });

    } catch (err) {
      console.error("🔥 ERROR:", err);

      return res.status(500).json({
        success: false,
        message: "Something went wrong",
      });
    }
  },
  deleteAppointment: async (req, res) => {
    const { id } = req.params;

    try {
      const [result] = await db.promise().query(
        "DELETE FROM appointments WHERE booking_id = ?",
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Appointment not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Appointment deleted successfully",
      });

    } catch (err) {
      console.error("🔥 ERROR:", err);

      return res.status(500).json({
        success: false,
        message: "Delete failed",
      });
    }
  },
  getCounsellorAreas: async (req, res) => {
    try {
      const counsellorId = req.params.id;

      if (!counsellorId) {
        return res.status(400).json({
          success: false,
          message: "Counsellor ID is required",
        });
      }

      const [rows] = await db.promise().query(
        `SELECT DISTINCT counselling_area_id, counselling_area
FROM counselling_area
WHERE JSON_CONTAINS(
  (SELECT counselling_area FROM counsellor WHERE c_id = ?),
  JSON_ARRAY(counselling_area_id)
)
AND status = 1;`,
        [counsellorId]
      );

      return res.status(200).json({
        success: true,
        data: rows,
      });

    } catch (error) {
      console.error("Error fetching counsellor areas:", error);
      return res.status(500).json({
        success: false,
        message: "Something went wrong",
      });
    }
  },
  getCounsellorTags: async (req, res) => {
    const c_id = req.c_id;

    if (!c_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    try {
      const [rows] = await db.promise().query(
        `SELECT counselling_area_id, counselling_area
FROM counselling_area
WHERE JSON_CONTAINS(
  (SELECT counselling_area FROM counsellor WHERE c_id = ?),
  JSON_ARRAY(counselling_area_id)
)
AND status = 1;`,
        [c_id]
      );

      return res.status(200).json({
        success: true,
        data: rows,
      });

    } catch (err) {
      console.error("🔥 ERROR:", err);

      return res.status(500).json({
        success: false,
        message: "Something went wrong",
      });
    }
  }
}