import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { deleteCookie, getCookie, setCookie } from './cookies';
let isRefreshing = false as boolean;
const instance = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use(
  async (config) => {
    let token = getCookie('access_token') || ('' as null | string);
    const refreshToken = getCookie('refresh_token');
    let decodeToken = null as any;

    try {
      decodeToken = token && jwtDecode(token?.toString());
    } catch (error) {
      console.log('error', error);
    }

    const isExpired = decodeToken && Date.now() / 1000 >= decodeToken?.exp;

    // Check if refresh is needed and avoid unnecessary refreshes
    if ((isExpired || !decodeToken) && refreshToken && !isRefreshing) {
      isRefreshing = true;

      try {
        const refreshResponse = await instance.post(
          process.env.NEXT_PUBLIC_BASE_URL + '/api/auth/refresh/',
          { refresh: refreshToken },
        );

        if (refreshResponse.status === 200) {
          setCookie('access_token', refreshResponse.data.access);
          setCookie('refresh_token', refreshResponse.data.refresh);
          token = refreshResponse.data.access;

          // Modify the config with the new token
          config.headers['Authorization'] = 'Bearer ' + token; // for Spring Boot back-end
          // config.headers['x-access-token'] = token; // for Node.js Express back-end

          // Return the modified config directly (no need for await)
          return config;
        } else {
          // Refresh failed, clear tokens and reject the request
          deleteCookie('access_token');
          deleteCookie('refresh_token');
          token = null;
          return Promise.reject(new Error('Refresh failed'));
        }
      } catch (error: any) {
        if (error?.response?.status === 401) {
          deleteCookie('access_token');
          deleteCookie('refresh_token');
        }
        return Promise.reject(error); // Reject with the caught error
      } finally {
        isRefreshing = false;
      }
    } else {
      // No refresh needed, use existing token if available
      if (token) {
        config.headers['Authorization'] = 'Bearer ' + token;
      } else {
        // No token available, remove any existing authorization header
        delete config.headers['WWW-Authenticate'];
      }
      // Return the unmodified config directly (no need for await)
      return config;
    }
  },
  (error) => {
    return Promise.reject(error); // Reject with the original error
  },
);

instance.interceptors.response.use(
  (res) => res,
  async (err) => {
    // Refresh failed or not applicable, return original error
    return err?.response;
  },
);
export { instance };

export async function GET(url: string) {
  return await instance.get(url);
}

export async function POST(url: string, data?: object) {
  return await instance.post(url, data);
}

export async function PUT(url: string, data: object) {
  return await instance.put(url, data);
}
export async function DELETE(url: string) {
  return await instance.delete(url);
}
