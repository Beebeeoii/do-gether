import { AuthData } from "../auth/Auth";

export interface UserRequest {
    authData: AuthData
    userId: string
}