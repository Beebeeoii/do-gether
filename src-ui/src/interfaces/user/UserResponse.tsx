import { User } from "./User";

export interface RetrieveUserResponse {
    success: boolean
    error: string | null
    data: {
        user: User
    }
}