import axios from 'axios';

const api = axios.create({ 
    baseURL: 'https://backend-k71s.onrender.com/api', 
});

axios.defaults.baseURL = api.defaults.baseURL;
