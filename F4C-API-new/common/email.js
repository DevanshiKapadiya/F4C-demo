const ejs = require('ejs');
const nodemailer = require('nodemailer');
const path = require('path');
const db = require('../db/db');


const siteSettingsData = () => {
  return new Promise((resolve, reject) => {
    db.query('SELECT * FROM site_setting', (err, results) => {
      if (err) {
        return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
      }
      const resObj = {};
      results.forEach((record) => {
        resObj[record.key] = record.value;
      });
      resolve(resObj); // Resolve with the site settings data

    });
  });
};

module.exports = {
  sendContactEnquiryEmail: async function (params) {
    const websiteSettings = await siteSettingsData();

    /* Configure Nodemailer transporter (using Gmail as an example) */
    const transporter = nodemailer.createTransport({
      host: websiteSettings.smtp_host /* e.g., smtp.gmail.com */,
      port: websiteSettings.smtp_port /* Usually 587 for TLS or 465 for SSL */,
      secure: true /* Set to true if using port 465 */,
      auth: {
        user: websiteSettings.smtp_email /* Your email address */,
        pass: websiteSettings.smtp_password /* Your email password or app-specific password */
      }
    });

    /* Render the email template */
    const emailHtml = await ejs.renderFile(path.join(__dirname, '../views/contact_enquiry_email.ejs'), {
      websiteTitle: websiteSettings.website_title,
      name: params.name,
      email: params.email,
      phone: params.phone || 'Not provided',
      subject: params.subject,
      message: params.message
    });

    /* Email options */
    const mailOptions = {
      from: websiteSettings.website_title + '<' + websiteSettings.email_sender + '>' /* Sender email */,
      to: websiteSettings.email_receiver /* Recipient email */,
      subject: `New Contact Enquiry from ${websiteSettings.website_title}`,
      html: emailHtml /* Use the rendered HTML */
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending email:', err);
      } else {
        console.log('Email sent:', info.response);
      }
    });
  },

  /* Automatic receipt sent to the person who submitted the enquiry. Resolves true/false, never throws. */
  sendContactEnquiryConfirmationEmail: async function (params) {
    try {
      const websiteSettings = await siteSettingsData();

      const transporter = nodemailer.createTransport({
        host: websiteSettings.smtp_host,
        port: websiteSettings.smtp_port,
        secure: true,
        auth: {
          user: websiteSettings.smtp_email,
          pass: websiteSettings.smtp_password
        }
      });

      const emailHtml = await ejs.renderFile(path.join(__dirname, '../views/contact_enquiry_confirmation_email.ejs'), {
        websiteTitle: websiteSettings.website_title,
        name: params.name,
        reference: params.reference,
        enquiryType: params.enquiry_type
      });

      await transporter.sendMail({
        from: websiteSettings.website_title + '<' + websiteSettings.email_sender + '>',
        to: params.email,
        subject: `We have received your enquiry - ${websiteSettings.website_title}`,
        html: emailHtml
      });
      return true;
    } catch (err) {
      console.error('Error sending enquiry confirmation email:', err);
      return false;
    }
  },

  sendUserOTPEmail: async function (params) {
    const websiteSettings = await siteSettingsData();

    /* Configure Nodemailer transporter (using Gmail as an example) */
    const transporter = nodemailer.createTransport({
      host: websiteSettings.smtp_host /* e.g., smtp.gmail.com */,
      port: websiteSettings.smtp_port /* Usually 587 for TLS or 465 for SSL */,
      secure: true /* Set to true if using port 465 */,
      auth: {
        user: websiteSettings.smtp_email /* Your email address */,
        pass: websiteSettings.smtp_password /* Your email password or app-specific password */
      }
    });

    /* Render the email template */
    const emailHtml = await ejs.renderFile(path.join(__dirname, '../views/user_registration_otp_email.ejs'), {
      websiteTitle: websiteSettings.website_title,
      name: params.fname + ' ' + params.lname,
      otp: params.otp
    });

    /* Email options */
    const mailOptions = {
      from: websiteSettings.website_title + '<' + websiteSettings.email_sender + '>' /* Sender email */,
      to: params.email /* Recipient email */,
      subject: `Verify your email address - ${websiteSettings.website_title}`,
      html: emailHtml /* Use the rendered HTML */
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending email:', err);
      } else {
        console.log('Email sent:', info.response);
      }
    });
  },

  sendUserForgotPasswordOTPEmail: async function (params) {
    const websiteSettings = await siteSettingsData();

    /* Configure Nodemailer transporter (using Gmail as an example) */
    const transporter = nodemailer.createTransport({
      host: websiteSettings.smtp_host /* e.g., smtp.gmail.com */,
      port: websiteSettings.smtp_port /* Usually 587 for TLS or 465 for SSL */,
      secure: true /* Set to true if using port 465 */,
      auth: {
        user: websiteSettings.smtp_email /* Your email address */,
        pass: websiteSettings.smtp_password /* Your email password or app-specific password */
      }
    });

    /* Render the email template */
    const emailHtml = await ejs.renderFile(path.join(__dirname, '../views/user_forgot_password_otp_email.ejs'), {
      websiteTitle: websiteSettings.website_title,
      name: params.fname + ' ' + params.lname,
      otp: params.forgot_password_otp
    });

    /* Email options */
    const mailOptions = {
      from: websiteSettings.website_title + '<' + websiteSettings.email_sender + '>' /* Sender email */,
      to: params.email /* Recipient email */,
      subject: `Forgot Password - ${websiteSettings.website_title}`,
      html: emailHtml /* Use the rendered HTML */
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending email:', err);
      } else {
        console.log('Email sent:', info.response);
      }
    });
  },

  sendUserWelcomeEmail: async function (params) {
    const websiteSettings = await siteSettingsData();

    /* Configure Nodemailer transporter (using Gmail as an example) */
    const transporter = nodemailer.createTransport({
      host: websiteSettings.smtp_host /* e.g., smtp.gmail.com */,
      port: websiteSettings.smtp_port /* Usually 587 for TLS or 465 for SSL */,
      secure: true /* Set to true if using port 465 */,
      auth: {
        user: websiteSettings.smtp_email /* Your email address */,
        pass: websiteSettings.smtp_password /* Your email password or app-specific password */
      }
    });

    /* Render the email template */
    const emailHtml = await ejs.renderFile(path.join(__dirname, '../views/user_welcome_email.ejs'), {
      websiteTitle: websiteSettings.website_title,
      name: params.fname + ' ' + params.lname
    });

    /* Email options */
    const mailOptions = {
      from: websiteSettings.website_title + '<' + websiteSettings.email_sender + '>' /* Sender email */,
      to: params.email /* Recipient email */,
      subject: `Welcome to ${websiteSettings.website_title}`,
      html: emailHtml /* Use the rendered HTML */
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending email:', err);
      } else {
        console.log('Email sent:', info.response);
      }
    });
  },
  sendCounsellorContactEmail: async function (params) {
    const websiteSettings = await siteSettingsData();

    /* Configure Nodemailer transporter (using Gmail as an example) */
    const transporter = nodemailer.createTransport({
      host: websiteSettings.smtp_host /* e.g., smtp.gmail.com */,
      port: websiteSettings.smtp_port /* Usually 587 for TLS or 465 for SSL */,
      secure: true /* Set to true if using port 465 */,
      auth: {
        user: websiteSettings.smtp_email /* Your email address */,
        pass: websiteSettings.smtp_password /* Your email password or app-specific password */
      }
    });

    /* Render the email template */
    const emailHtml = await ejs.renderFile(
      path.join(__dirname, '../views/contacts_counsellor_email.ejs'),
      {
        websiteTitle: websiteSettings.website_title,
        name: params.name,
        email: params.email,
        phone: params.phone || 'Not provided',
        subject: params.subject || 'No Subject', // ✅ FIX
        message: params.message,
        source: params.source,

      }
    );

    /* Email options */
    const mailOptions = {
      from: `${websiteSettings.website_title} <${websiteSettings.email_sender}>`,
      to: params.to, // ✅ ONLY THIS
      subject: `New Contact Enquiry from ${websiteSettings.website_title}`,
      html: emailHtml
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending email:', err);
      } else {
        console.log('Email sent:', info.response);
      }
    });
  },
};
