import axios from 'axios';

const api = axios.create({ baseURL: process.env.API_URL });

axios.defaults.baseURL = api.defaults.baseURL;
