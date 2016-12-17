import Axios from 'axios';
const Constants = require('../Constants.js')
const Cookie = require('../Cookie.js');

var wAxios = Axios.create();

wAxios.defaults.baseURL = Constants.API_URL;
// wAxios.defaults.baseURL = 'http://localhost:8000';
// wAxios.defaults.baseURL = __API_URL__;
wAxios.defaults.headers.common['Authorization'] = Cookie.getCookie('token');

exports.wAxios = wAxios;