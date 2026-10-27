import { axiosInstance } from './axiosService';

const axiosPost = async (url, payload) => {
  try {
    const responseObject = await axiosInstance.post(url, payload);
    if (responseObject.data.screen_code == '444') {
      localStorage.removeItem('token');
      localStorage.removeItem('users');
      window.location.reload();
    }
    return responseObject;
  } catch (error) {
    throw error.response;
  }
};

const axiosGet = async (url) => {
  try {
    const responseObject = await axiosInstance.get(url);
    if (responseObject.data.screen_code == '444') {
      localStorage.removeItem('token');
      localStorage.removeItem('users');
      window.location.reload();
    }
    return responseObject;
  } catch (error) {
    throw error.response;
  }
};

const axiosPrivatePost = async (url, payload) => {
  const admin = JSON?.parse(window?.localStorage?.getItem('users'));
  const data = { ...payload, adminId: String(admin.admin_id) };
  try {
    const responseObject = await axiosInstance.post(url, data, {
      headers: {
        Authorization: localStorage.getItem('token')
      }
    });
    if (responseObject.data.screen_code == '444') {
      localStorage.removeItem('token');
      localStorage.removeItem('users');
      window.location.reload();
    }
    return responseObject;
  } catch (error) {
    throw error.response;
  }
};
const axiosPrivateFormdataPost = async (url, payload) => {
  const admin = JSON?.parse(window?.localStorage?.getItem('users'));
  const data = { ...payload, adminId: String(admin.admin_id) };
  try {
    const responseObject = await axiosInstance.post(url, data, {
      headers: {
        Authorization: localStorage.getItem('token'),
        'Content-Type': 'multipart/form-data'
      }
    });
    if (responseObject.data.screen_code == '444') {
      localStorage.removeItem('token');
      localStorage.removeItem('users');
      window.location.reload();
    }
    return responseObject;
  } catch (error) {
    throw error.response;
  }
};

const axiosPrivateGet = async (url) => {
  try {
    const responseObject = await axiosInstance.get(url, {
      headers: {
        Authorization: localStorage.getItem('token')
      }
    });
    if (responseObject.data.screen_code == '444') {
      localStorage.removeItem('token');
      localStorage.removeItem('users');
      window.location.reload();
    }
    return responseObject;
  } catch (error) {
    throw error.response;
  }
};

export { axiosPost, axiosGet, axiosPrivatePost, axiosPrivateGet, axiosPrivateFormdataPost };
