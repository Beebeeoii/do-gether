import axios from "axios";

const BASE_URL = `http://${process.env.BACKEND_HOST}:${process.env.BACKEND_PORT}`

export function sendGet(route: string, params?: object, headers?: object) {
    return axios.get(`${BASE_URL}${route}`, {
        params: params,
        headers: {
            ...headers
        }
    })
}

export function sendDelete(route: string, params?: object, headers?: object) {
    return axios.delete(`${BASE_URL}${route}`, {
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