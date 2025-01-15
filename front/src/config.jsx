import axios from "axios";

export const api_url = `${window.location.protocol}//${window.location.hostname}/api/`;
export const send_cryptoaddress = 'TEDepUJidzXfCkHtDmWhAPQiTibhiRE2C5'
export const axiinstance = axios.create(
    {
        withCredentials: true,
        baseURL: api_url,
    }
)