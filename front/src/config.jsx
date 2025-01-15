import axios from "axios";

export const api_url = '79.132.137.130/api/';
export const send_cryptoaddress = 'TEDepUJidzXfCkHtDmWhAPQiTibhiRE2C5'
export const axiinstance = axios.create(
    {
        withCredentials: true,
        baseURL: api_url,
    }
)