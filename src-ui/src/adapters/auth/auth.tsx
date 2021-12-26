import { sendGet, sendPost } from "../adapter";

export function createUser(username: string, password: string) {
    let body = {
        "username": username,
        "password": password
    }

    return sendPost("/user", body)
}

export async function authenticate(username: string, password: string) {
    let params = {
        "username": username,
        "password": password
    }

    return sendGet("/user/authenticate", params)
}