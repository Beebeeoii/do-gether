import { Task } from "../../interfaces/task/Task";
import { CreateTaskResponse, RetrieveTaskResponse, RetrieveTaskTagsResponse } from "../../interfaces/task/TaskResponses";

export function createTask(task: Task) {
    return new Promise<CreateTaskResponse>((resolve) => {
        setTimeout(() => resolve({
            success: true,
            error: "",
            data: {
                task: {
                    id: "0asgn3",
                    title: "CVWO Assignment",
                    tags: ["CVWO", "Programming"],
                    listId: "main",
                    priority: 2,
                    listOrder: 1,
                    due: Date.now(),
                    completed: false,
                    plannedStart: null,
                    plannedEnd: null,
                    ownerId: "beebeeoii"
                }
            }
        }), 500)
    })
}

export function fetchTasks(listId: string) {
    if (listId === "c74k5s21detok95e8s5g") {
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
                            listId: "main",
                            listOrder: 0,
                            due: Date.now(),
                            completed: false,
                            plannedStart: null,
                            plannedEnd: null,
                            ownerId: "c74iusi1detpc265l08g"
                        }
                    ]
                }
            }), 500)
        })
    }
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
                        listOrder: 0,
                        due: Date.now(),
                        completed: false,
                        plannedStart: null,
                        plannedEnd: null,
                        ownerId: "c74iusi1detpc265l08g"
                    },
                    {
                        id: "pgam03bvv",
                        title: "Sunday Service",
                        tags: ["Church"],
                        priority: 2,
                        listId: "c74jkqa1detok95e8s50",
                        listOrder: 1,
                        due: Date.now(),
                        completed: false,
                        plannedStart: null,
                        plannedEnd: null,
                        ownerId: "c74iusi1detpc265l08g"
                    },
                    {
                        id: "tba0j3",
                        title: "Meetup with ABC",
                        tags: ["Friends"],
                        priority: 0,
                        listId: "c74jkqa1detok95e8s50",
                        listOrder: 2,
                        due: Date.now(),
                        completed: false,
                        plannedStart: null,
                        plannedEnd: null,
                        ownerId: "c74iusi1detpc265l08g"
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
                        plannedStart: null,
                        plannedEnd: null,
                        ownerId: "c74iusi1detpc265l08g"
                    }
                ]
            }
        }), 500)
    })
}

export function fetchTagsByListId(list_id: string) {
    return new Promise<RetrieveTaskTagsResponse>((resolve) => {
        setTimeout(() => resolve({
            success: true,
            error: "",
            data: {
                tags: [
                    "CS2100",
                    "MA2001",
                    "MA2002"
                ]
            }
        }))
    })

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
                        plannedStart: null,
                        plannedEnd: null,
                        ownerId: "c74iusi1detpc265l08g"
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
                        plannedStart: null,
                        plannedEnd: null,
                        ownerId: "c74iusi1detpc265l08g"
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
                        plannedStart: null,
                        plannedEnd: null,
                        ownerId: "c74iusi1detpc265l08g"
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
                        plannedStart: null,
                        plannedEnd: null,
                        ownerId: "c74iusi1detpc265l08g"
                    }
                ]
            }
        }), 500)
    })
}