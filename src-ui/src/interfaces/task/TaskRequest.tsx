import { AuthData } from "../auth/Auth";

export interface CreateTaskRequest {
    authData: AuthData
    owner: string,
    title: string,
    tags: Array<string>,
    listId: string,
    priority: number,
    due: number,
    plannedStart: number,
    plannedEnd: number,
}

export interface RetrieveTasksByListIdRequest {
    authData: AuthData
    listId: string
}

export interface RetrieveTagsByListIdRequest {
    authData: AuthData
    listId: string
}