import { RegisterResponse, LoginResponse } from "../../interfaces/auth/AuthResponse";

const mockUser1 = {
    id: "0sfjas",
    username: "beebeeoii",
    friends: [],
    outgoing_requests: [],
    incoming_requests: [],
    points: 0
}

export function createUser(username: string, password: string) {
    return new Promise<RegisterResponse>((resolve) => {
        setTimeout(() => resolve({
            success: true,
            error: "",
            data: {
                user: mockUser1,
                authenticated: true,
                token: "sample_jwt_token"
            }
        }), 500)
    })
}

export async function authenticate(username: string, password: string) {
    if (username !== "test" || password !== "test") {
        return new Promise<LoginResponse>((resolve) => {
            setTimeout(() => resolve({
                success: false,
                error: "Unauthorised: Invalid username or password",
                data: {
                    authenticated: false,
                    token: ""
                }
            }), 500)
        })
    }

    return new Promise<LoginResponse>((resolve) => {
        setTimeout(() => resolve({
            success: true,
            error: "",
            data: {
                user: mockUser1,
                authenticated: true,
                token: "sample_jwt_token"
            }
        }), 500)
    })
}