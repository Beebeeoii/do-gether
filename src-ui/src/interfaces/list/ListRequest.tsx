import { AuthData } from "../auth/Auth";

export interface CreateListRequest {
    authData: AuthData
    name: string
    owner: string
    private: boolean
}

export interface RetrieveListsByUserIdRequest {
    authData: AuthData
    userId: string
}