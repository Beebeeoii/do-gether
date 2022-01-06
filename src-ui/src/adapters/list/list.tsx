import { AuthData } from "../../interfaces/auth/Auth";
import { EditListMembersRequest, EditListRequest } from "../../interfaces/list/ListRequest";
import { sendDelete, sendGet, sendPost } from "../adapter";

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

export function editExistingList(data: EditListRequest) {
    let headers = {
        "Authorization": `Bearer ${data.authData.token}`,
        "id": data.authData.id
    }

    let body = {
        "id": data.id,
        "name": data.name,
        "private": data.private
    }

    return sendPost("/list/edit", body, headers)
}

export function editExistingListMembers(data: EditListMembersRequest) {
    let headers = {
        "Authorization": `Bearer ${data.authData.token}`,
        "id": data.authData.id
    }

    let body = {
        "id": data.id,
        "members": data.members
    }

    return sendPost("/list/editMembers", body, headers)
}

export function deleteExistingList(authData: AuthData, id: string) {
    let headers = {
        "Authorization": `Bearer ${authData.token}`,
        "id": authData.id
    }

    let params = {
        "listId": id
    }

    return sendDelete("/list", params, headers)
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

export function fetchListMembers(authData: AuthData, listId: string) {
    let headers = {
        "Authorization": `Bearer ${authData.token}`,
        "id": authData.id
    }

    let params = {
        "listId": listId
    }

    return sendGet("/list/members", params, headers)
}