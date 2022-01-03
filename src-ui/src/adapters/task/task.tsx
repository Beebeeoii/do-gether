import { AuthData } from "../../interfaces/auth/Auth";
import { TaskReorderData } from "../../interfaces/task/Task";
import { CreateTaskRequest, DeleteTaskRequest, EditTaskRequest } from "../../interfaces/task/TaskRequest";
import { sendDelete, sendGet, sendPost } from "../adapter";

export function createTask(data: CreateTaskRequest) {
    let headers = {
        "Authorization": `Bearer ${data.authData.token}`,
        "id": data.authData.id
    }

    let body = {
        "owner": data.owner,
        "title": data.title,
        "tags": data.tags,
        "listId": data.listId,
        "priority": data.priority,
        "due": data.due,
        "plannedStart": data.plannedStart,
        "plannedEnd": data.plannedEnd
    }

    return sendPost("/task", body, headers)
}

export function editExistingTask(data: EditTaskRequest) {
    let headers = {
        "Authorization": `Bearer ${data.authData.token}`,
        "id": data.authData.id
    }

    let body = {
        "id": data.id,
        "listId": data.listId,
        "title": data.title,
        "tags": data.tags,
        "priority": data.priority,
        "due": data.due,
        "plannedStart": data.plannedStart,
        "plannedEnd": data.plannedEnd
    }

    return sendPost("/task/edit", body, headers)
}

export function deleteExistingTask(authData: AuthData, id: string) {
    let headers = {
        "Authorization": `Bearer ${authData.token}`,
        "id": authData.id
    }

    let params = {
        "taskId": id
    }

    return sendDelete("/task", params, headers)
}

export function fetchTasks(authData: AuthData, listId: string) {
    let headers = {
        "Authorization": `Bearer ${authData.token}`,
        "id": authData.id
    }

    let params = {
        "listId": listId
    }

    return sendGet("/task", params, headers)
}

export function fetchTagsByListId(authData: AuthData, listId: string) {
    let headers = {
        "Authorization": `Bearer ${authData.token}`,
        "id": authData.id
    }

    let params = {
        "listId": listId
    }

    return sendGet("/task/tagSuggestion", params, headers)
}

export function reorderList(authData: AuthData, listId: string, newTaskOrder: Array<TaskReorderData>) {
    let headers = {
        "Authorization": `Bearer ${authData.token}`,
        "id": authData.id
    }

    let body = {
        "listId": listId,
        "tasks": newTaskOrder
    }

    return sendPost("/task/reorder", body, headers)
}