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
                    list_id: "main",
                    priority: "Urgent",
                    list_order: 1,
                    due: Date.now(),
                    completed: false,
                    // planned_start: Date.now(),
                    // planned_end: Date.now(),
                    owner_id: "beebeeoii",
                    private: true
                }
            }
        }), 500)
    })
}

export function fetchTasks(list_id: string) {
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
                        priority: "Normal",
                        list_id: "main",
                        list_order: 0,
                        due: Date.now(),
                        completed: false,
                        // planned_start: Date.now(),
                        // planned_end: Date.now(),
                        owner_id: "beebeeoii",
                        private: true
                    },
                    {
                        id: "pgam03bvv",
                        title: "Sunday Service",
                        tags: ["Church"],
                        priority: "Urgent",
                        list_id: "main",
                        list_order: 1,
                        due: Date.now(),
                        completed: false,
                        // planned_start: Date.now(),
                        // planned_end: Date.now(),
                        owner_id: "beebeeoii",
                        private: false
                    },
                    {
                        id: "tba0j3",
                        title: "Meetup with ABC",
                        tags: ["Friends"],
                        priority: "Trivial",
                        list_id: "main",
                        list_order: 2,
                        due: Date.now(),
                        completed: false,
                        // planned_start: Date.now(),
                        // planned_end: Date.now(),
                        owner_id: "beebeeoii",
                        private: true
                    },
                    {
                        id: "sjkg04",
                        title: "Discuss YF exco stuff with ben and wx",
                        tags: ["Church", "Friends"],
                        priority: "Urgent",
                        list_id: "main",
                        list_order: 3,
                        due: Date.now(),
                        completed: true,
                        // planned_start: Date.now(),
                        // planned_end: Date.now(),
                        owner_id: "beebeeoii",
                        private: true
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
                        priority: "Normal",
                        list_id: "main",
                        list_order: 2,
                        due: Date.now(),
                        completed: false,
                        // planned_start: Date.now(),
                        // planned_end: Date.now(),
                        owner_id: "beebeeoii",
                        private: true
                    },
                    {
                        id: "pgam03bvv",
                        title: "Sunday Service",
                        tags: ["Church"],
                        priority: "Urgent",
                        list_id: "main",
                        list_order: 0,
                        due: Date.now(),
                        completed: false,
                        // planned_start: Date.now(),
                        // planned_end: Date.now(),
                        owner_id: "beebeeoii",
                        private: false
                    },
                    {
                        id: "tba0j3",
                        title: "Meetup with ABC",
                        tags: ["Friends"],
                        priority: "Trivial",
                        list_id: "main",
                        list_order: 1,
                        due: Date.now(),
                        completed: false,
                        // planned_start: Date.now(),
                        // planned_end: Date.now(),
                        owner_id: "beebeeoii",
                        private: true
                    },
                    {
                        id: "sjkg04",
                        title: "Discuss YF exco stuff with ben and wx",
                        tags: ["Church", "Friends"],
                        priority: "Urgent",
                        list_id: "main",
                        list_order: 3,
                        due: Date.now(),
                        completed: true,
                        // planned_start: Date.now(),
                        // planned_end: Date.now(),
                        owner_id: "beebeeoii",
                        private: true
                    }
                ]
            }
        }), 500)
    })
}