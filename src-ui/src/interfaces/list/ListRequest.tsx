import { AuthData } from "../auth/Auth";

export interface CreateListRequest {
    authData: AuthData
    name: string
    owner: string
    private: boolean
}

export interface EditListRequest {
    authData: AuthData
    id: string
    name: string
    private: boolean
}

export interface EditListMembersRequest {
    authData: AuthData
    id: string
    members: Array<string>
}

export interface DeleteListRequest {
    authData: AuthData
    id: string
}

export interface RetrieveListsByUserIdRequest {
    authData: AuthData
    userId: string
}

export interface RetrieveListMembersRequest {
    authData: AuthData
    listId: string
}

export interface RetrieveListOwnerRequest {
    authData: AuthData
    listId: string
}