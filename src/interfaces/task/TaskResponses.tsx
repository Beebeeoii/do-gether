import { Task } from "./Task";

export interface CreateTaskResponse {
    success: boolean,
    error: string,
    data: {
        task: Task
    }
}

export interface RetrieveTaskResponse {
    success: boolean,
    error: string,
    data: {
        tasks: Array<Task>
    }
}

export interface UpdateTaskResponse {
    success: boolean,
    error: string,
    data: {
        task: Task
    }
}

export interface DeleteTaskResponse {
    success: boolean,
    error: string,
    data: {
        tasks: Array<Task>
    }
}
