export interface RegisterResponse {
    success: boolean,
    error: string,
    data: {
        username: string
        authenticated: boolean,
        token: string
    }
}

export interface LoginResponse {
    success: boolean,
    error: string,
    data: {
        username: string
        authenticated: boolean,
        token: string
    }
}