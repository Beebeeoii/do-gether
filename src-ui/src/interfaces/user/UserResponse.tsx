import { User } from "./User";

export interface RetrieveUserResponse {
    success: boolean
    error: string | null
    data: {
        id: string,
        username: string,
        friends: Array<string>,
        outgoing_req: Array<string>,
        incoming_req: Array<string>
    }
}