import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const getBaseUrl = () => {
    // Using the host machine's Mobile Hotspot IP address (192.168.137.1)
    // so the physical phone connected to the hotspot can reach Spring Boot.
    return 'http://192.168.137.1:8081';
};

const apiClient = axios.create({
    baseURL: getBaseUrl(),
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 401) {
            await AsyncStorage.removeItem('token');
            const { navigationRef } = require('../../App');
            if (navigationRef.isReady()) {
                navigationRef.reset({
                    index: 0,
                    routes: [{ name: 'Login' }],
                });
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
