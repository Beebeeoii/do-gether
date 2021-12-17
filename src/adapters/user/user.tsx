import { UserRequest } from "../../interfaces/user/UserRequest";
import { RetrieveUserResponse } from "../../interfaces/user/UserResponse";

const mockUser1 = {
    id: "0sfjas",
    username: "beebeeoii",
    friends: [],
    outgoing_requests: [],
    incoming_requests: [],
    points: 0
}

export function fetchUserInfo(userRequest: UserRequest) {
    return new Promise<RetrieveUserResponse>((resolve) => {
        setTimeout(() => resolve({
            success: true,
            error: null,
            data: {
                user: mockUser1
            }
        }), 500)
    })
}