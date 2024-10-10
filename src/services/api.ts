import axios from 'axios';

const createApi = (baseURL: string) => {
  return axios.create({
    baseURL,
    withCredentials: true,
  });
};

export default createApi;