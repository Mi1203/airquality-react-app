import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://localhost:44343';

console.log('API Base URL:', API_BASE_URL);

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

//logs
api.interceptors.request.use((config) => {
    console.log(`${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
});

api.interceptors.response.use(
    (response) => {
        console.log(`${response.status} ${response.config.url}`);
        return response;
    },
    (error) => {
        console.error(`${error.message}`, {
            url: error.config?.url,
            baseURL: error.config?.baseURL
        });
        return Promise.reject(error);
    }
);