import { createAsyncThunk } from "@reduxjs/toolkit";
import { RegisterResponse, LoginResponse } from "../../interfaces/auth/AuthResponse";

export function createUser(username: string, password: string) {
    return new Promise<RegisterResponse>((resolve) => {
        setTimeout(() => resolve({
            success: true,
            error: "",
            data: {
                username: "beebeeoii",
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
                    username: username,
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
                username: "beebeeoii",
                authenticated: true,
                token: "sample_jwt_token"
            }
        }), 500)
    })
}