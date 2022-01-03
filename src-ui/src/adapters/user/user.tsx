import { AuthData } from "../../interfaces/auth/Auth";
import { sendDelete, sendGet, sendPost } from "../adapter";

export function fetchUserInfo(authData: AuthData, userId: string) {
    let headers = {
        "Authorization": `Bearer ${authData.token}`,
        "id": authData.id
    }

    return sendGet(`/user/${userId}`, undefined, headers)
}

export function fetchUserByUsername(authData: AuthData, username: string) {
    let headers = {
        "Authorization": `Bearer ${authData.token}`,
        "id": authData.id
    }

    let params = {
        "username": username
    }

    return sendGet(`/user/friend`, params, headers)
}

export function sendOutgoingFriendRequest(authData: AuthData, userId: string) {
    let headers = {
        "Authorization": `Bearer ${authData.token}`,
        "id": authData.id
    }

    let body = {
        "id": userId
    }

    return sendPost(`/user/friend/sendReq`, body, headers)
}
export function deleteFriendRequest(authData: AuthData, userId: string) {
    let headers = {
        "Authorization": `Bearer ${authData.token}`,
        "id": authData.id
    }

    let params = {
        "id": userId
    }

    return sendDelete(`/user/friend/deleteReq`, params, headers)
}

export function acceptIncomingFriendRequest(authData: AuthData, userId: string) {
    let headers = {
        "Authorization": `Bearer ${authData.token}`,
        "id": authData.id
    }

    let body = {
        "id": userId
    }

    return sendPost(`/user/friend/acceptReq`, body, headers)
}

export function deleteFriend(authData: AuthData, userId: string) {
    let headers = {
        "Authorization": `Bearer ${authData.token}`,
        "id": authData.id
    }

    let params = {
        "id": userId
    }

    return sendDelete(`/user/friend`, params, headers)
}