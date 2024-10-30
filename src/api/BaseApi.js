import apiConfig from '@/config/apiConfig';

const apiUrl = apiConfig.baseUrl;

export const fetchApi = async (endpoint, method = 'GET', body = null) => {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(`${apiUrl}${endpoint}`, options);

    if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
    }

    return response.json();
};
