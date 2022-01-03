import { AuthData } from "../auth/Auth";

export interface UserRequest {
    authData: AuthData
    userId: string
}

export interface RetrieveByUsernameRequest {
    authData: AuthData
    username: string
}

export interface FriendReqRequest {
    authData: AuthData
    userId: string
}