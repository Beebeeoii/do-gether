export interface User {
    id: string
    username: string
    friends: Array<string>
    outgoing_requests: Array<string>
    incoming_requests: Array<string>
}

export interface UserFriend {
    id: string
    username: string
    type: "outgoing" | "incoming" | "friend"
}