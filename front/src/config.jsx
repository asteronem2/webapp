import axios from "axios";

export const api_url = 'https://f7c5-185-39-207-68.ngrok-free.app/api/';
// export const api_url = 'http://127.0.0.1:8000/';
export const send_cryptoaddress = 'TEDepUJidzXfCkHtDmWhAPQiTibhiRE2C5'
export const axiinstance = axios.create(
    {
        withCredentials: true,
        baseURL: api_url,
    }
)