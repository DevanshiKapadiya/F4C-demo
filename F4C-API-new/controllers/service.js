const bcrypt = require('bcryptjs');

module.exports = {
  serviceResponse: (status, screen_code, message, data) => {
    return {
      status: status,
      screen_code: screen_code,
      message: message,
      data: data
    };
  },

  trimObject: (params) => {
    Object.keys(params).forEach((k) => {
      if (typeof params[k] === "string") {
        params[k] = params[k].trim();
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

  deleteUploadedFiles: async (files) => {
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
