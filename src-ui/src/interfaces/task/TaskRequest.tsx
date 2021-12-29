import { AuthData } from "../auth/Auth";
import { Task } from "./Task";

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

export interface ReorderTasksRequest {
    authData: AuthData
    listId: string
    newTaskOrder: Array<Task>
}
