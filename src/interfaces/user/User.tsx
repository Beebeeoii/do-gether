export interface User {
    id: string
    username: string
    friends: Array<string>
    outgoing_requests: Array<string>
    incoming_requests: Array<string>
    points: number
}