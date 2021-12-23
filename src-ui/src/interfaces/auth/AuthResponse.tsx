import { User } from "../user/User";

export interface RegisterResponse {
    success: boolean,
    error: string | null,
    data: {
        user: User
        authenticated: boolean,
        token: string
    }
}

export interface LoginResponse {
    success: boolean,
    error: string | null,
    data: {
        user?: User
        authenticated: boolean,
        token: string
    }
}