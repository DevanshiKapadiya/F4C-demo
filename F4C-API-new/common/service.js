const bcrypt = require('bcryptjs');
const { _ } = require('lodash');
const path = require('path');
const fs = require('fs');

module.exports = {
  serviceResponse: (status, screen_code, message, data) => {
    return {
      status: status,
      screen_code: screen_code,
      message: message,
      data: data
    };
  },

  trimObject: async (params) => {
    Object.keys(params).forEach((k) => {
      if (typeof params[k] === "string") {
        params[k] = params[k].trim();
        if (k === "email") {
          params[k] = params[k].toLowerCase();
        }
      }
    });
    return params;
  },


  validateEmail: (email) => {
    const regex =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regex.test(String(email).toLowerCase());
  },

  hashPassword: async (plaintextPassword) => {
    const hash = await bcrypt.hash(plaintextPassword, 14);
    return hash;
  },

  generateOtp: (length) => {
    return Math.floor(Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1));
  },

  capitalizeFirstLetter: (sentence) => {
    return sentence
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },

  deleteUploadedFiles: (files) => {
    if (!files) return;

    Object.values(files)
      .flat()
      .forEach((file) => {
        const filePath = path.join(__dirname, '../' + file.destination, file.filename);
        fs.unlink(filePath, (err) => {
          if (err) console.error('Failed to delete file:', filePath);
        });
      });
  }
};
