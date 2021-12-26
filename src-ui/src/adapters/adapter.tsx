import axios, { AxiosRequestHeaders } from "axios";

const BASE_URL = "http://localhost:8080"

export function sendGet(route: string, params?: object, headers?: object) {
    return axios.get(`${BASE_URL}${route}`, {
        params: params,
        headers: {
            ...headers
        }
    })
}

export function sendPost(route: string, body?: object, headers?: object) {
    return axios.post(`${BASE_URL}${route}`, body, {
        headers: {
            ...headers
        }
    })
}