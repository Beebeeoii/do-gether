import { AuthData } from "../../interfaces/auth/Auth";
import { Task } from "../../interfaces/task/Task";
import { CreateTaskRequest } from "../../interfaces/task/TaskRequest";
import { RetrieveTaskResponse } from "../../interfaces/task/TaskResponses";
import { sendGet, sendPost } from "../adapter";

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

export function reorderList(taskList: Array<Task>) {
    return new Promise<RetrieveTaskResponse>((resolve) => {
        setTimeout(() => resolve({
            success: true,
            error: "",
            data: {
                tasks: [
                    {
                        id: "asd02v",
                        title: "CVWO Assignment",
                        tags: ["CVWO", "Programming"],
                        priority: 1,
                        listId: "c74jkqa1detok95e8s50",
                        listOrder: 2,
                        due: Date.now(),
                        completed: false,
                        plannedStart: -1,
                        plannedEnd: -1,
                        owner: "c74iusi1detpc265l08g"
                    },
                    {
                        id: "pgam03bvv",
                        title: "Sunday Service",
                        tags: ["Church"],
                        priority: 2,
                        listId: "c74jkqa1detok95e8s50",
                        listOrder: 0,
                        due: Date.now(),
                        completed: false,
                        plannedStart: -1,
                        plannedEnd: -1,
                        owner: "c74iusi1detpc265l08g"
                    },
                    {
                        id: "tba0j3",
                        title: "Meetup with ABC",
                        tags: ["Friends"],
                        priority: 0,
                        listId: "c74jkqa1detok95e8s50",
                        listOrder: 1,
                        due: Date.now(),
                        completed: false,
                        plannedStart: -1,
                        plannedEnd: -1,
                        owner: "c74iusi1detpc265l08g"
                    },
                    {
                        id: "sjkg04",
                        title: "Discuss YF exco stuff with ben and wx",
                        tags: ["Church", "Friends"],
                        priority: 2,
                        listId: "c74jkqa1detok95e8s50",
                        listOrder: 3,
                        due: Date.now(),
                        completed: true,
                        plannedStart: -1,
                        plannedEnd: -1,
                        owner: "c74iusi1detpc265l08g"
                    }
                ]
            }
        }), 500)
    })
}