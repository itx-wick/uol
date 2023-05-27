import axios from 'axios';

// import AsyncStorage from '@react-native-async-storage/async-storage';

let BASE_URL_SERVER;
export const postApiCall = async (endPoint, data) => {
  //DEV
  // BASE_URL_SERVER = 'https://devucmd.uol.edu.pk/api/app.php/';
  //LIVE
  BASE_URL_SERVER = 'https://ucmdportal.uol.edu.pk/api/app.php/';
  console.log(BASE_URL_SERVER + `${endPoint}`);
  return new Promise((resolve, reject) => {
    let headers = {
      'Content-Type': 'application/json',
    };
    console.log('Data', data);
    axios
      .post(BASE_URL_SERVER + `${endPoint}`, data, {headers: headers})
      .then(resp => {
        let response = resp.data;
        resolve(response);
      })
      .catch(err => {
        if (err.response) {
          console.log(err.response.data.message);
        } else if (err.request) {
          console.log(err.request);
        } else {
          console.log(err);
        }
        reject(err);
      });
  });
};

export const postFileApiCall = (endPoint, data) => {
  return new Promise((resolve, reject) => {
    let headers = {
      'Content-Type': 'multipart/form-data',
    };
    axios
      .post(BASE_URL_SERVER + `${endPoint}`, data, {headers: headers})
      .then(resp => {
        let response = resp.data;
        resolve(response);
      })
      .catch(err => {
        if (err.response) {
          console.log(err.response.data.message);
        } else if (err.request) {
          console.log(err.request);
        } else {
          console.log(err);
        }
        reject(err);
      });
  });
};

export const getApiCall = (endPoint, data) => {
  return new Promise((resolve, reject) => {
    let headers = {
      'Content-Type': 'application/json',
    };
    axios
      .get(BASE_URL_SERVER + `${endPoint}`, data, {headers: headers})
      .then(resp => {
        let response = resp.data;
        resolve(response);
      })
      .catch(err => {
        if (err.response) {
          console.log(err.response.data.message);
        } else if (err.request) {
          console.log(err.request);
        } else {
          console.log(err);
        }
        reject(err);
      });
  });
};
