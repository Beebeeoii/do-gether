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

export interface EditTaskRequest {
    authData: AuthData
    id: string,
    listId: string,
    title: string,
    tags: Array<string>,
    priority: number,
    due: number,
    plannedStart: number,
    plannedEnd: number,
}

export interface EditTaskCompletedRequest {
    authData: AuthData
    id: string,
    listId: string,
    completed: boolean
}

export interface DeleteTaskRequest {
    authData: AuthData
    id: string
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
    id: string
    listId: string
    newTaskOrder: number
    updatedListOrder: Array<Task>
}
