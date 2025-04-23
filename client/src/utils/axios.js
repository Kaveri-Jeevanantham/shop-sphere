import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5001',
  withCredentials: true,
  xsrfHeaderName: 'x-xsrf-token',
});

export default instance;
