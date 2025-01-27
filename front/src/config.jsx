import axios from "axios";

export const api_url = `${window.location.protocol}//${window.location.hostname}/api/`;
export const send_cryptoaddress = 'TEDepUJidzXfCkHtDmWhAPQiTibhiRE2C5'
export const axiinstance = axios.create(
    {
        withCredentials: true,
        baseURL: api_url,
        paramsSerializer: (params) => {
            // Проходим по каждому параметру и проверяем, если это массив, то сериализуем в нужный формат
            const serializedParams = Object.keys(params).map(key => {
                const value = params[key];
                if (Array.isArray(value)) {
                    // Для массивов создаем параметры вида: key=value1&key=value2
                    return value.map(v => `${key}=${encodeURIComponent(v)}`).join('&');
                } else {
                    // Для обычных параметров оставляем как есть
                    return `${key}=${encodeURIComponent(value)}`;
                }
            }).join('&');

            return serializedParams;
        }
    }
)