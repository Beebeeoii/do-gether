import { AuthData } from "../../interfaces/auth/Auth";
import { sendGet, sendPost } from "../adapter";

export function createList(authData: AuthData, name: string, ownerId: string, isPrivate: boolean) {
    let headers = {
        "Authorization": `Bearer ${authData.token}`,
        "id": authData.id
    }

    let body = {
        "name": name,
        "owner": ownerId,
        "private": isPrivate
    }

    return sendPost("/list", body, headers)
}

export function fetchListsByUserId(authData: AuthData, userId: string) {
    let headers = {
        "Authorization": `Bearer ${authData.token}`,
        "id": authData.id
    }

    let params = {
        "userId": userId
    }

    return sendGet("/list", params, headers)
}