import { Task } from "../../interfaces/task/Task";
import { CreateTaskResponse, RetrieveTaskResponse } from "../../interfaces/task/TaskResponses";

export function createTask(task: Task) {
    return new Promise<CreateTaskResponse>((resolve) => {
        setTimeout(() => resolve({
            success: true,
            error: "",
            data: {
                task: {
                    title: "CVWO Assignment",
                    tags: ["CVWO", "Programming"],
                    listName: "main",
                    priority: "high",
                    listOrder: 1,
                    due: Date.now(),
                    completed: false,
                    plan_start: Date.now(),
                    plan_end: Date.now(),
                    creator: "beebeeoii",
                    private: true
                }
            }
        }), 500)
    })
}

export function fetchTasks(username: string) {
    return new Promise<RetrieveTaskResponse>((resolve) => {
        setTimeout(() => resolve({
            success: true,
            error: "",
            data: {
                tasks: [
                    {
                        title: "CVWO Assignment",
                        tags: ["CVWO", "Programming"],
                        priority: "medium",
                        listName: "main",
                        listOrder: 0,
                        due: Date.now(),
                        completed: false,
                        plan_start: Date.now(),
                        plan_end: Date.now(),
                        creator: "beebeeoii",
                        private: true
                    },
                    {
                        title: "Sunday Service",
                        tags: ["Church"],
                        priority: "high",
                        listName: "main",
                        listOrder: 1,
                        due: Date.now(),
                        completed: false,
                        plan_start: Date.now(),
                        plan_end: Date.now(),
                        creator: "beebeeoii",
                        private: false
                    },
                    {
                        title: "Meetup with ABC",
                        tags: ["Friends"],
                        priority: "low",
                        listName: "main",
                        listOrder: 3,
                        due: Date.now(),
                        completed: false,
                        plan_start: Date.now(),
                        plan_end: Date.now(),
                        creator: "beebeeoii",
                        private: true
                    },
                    {
                        title: "Discuss YF exco stuff with ben and wx",
                        tags: ["Church", "Friends"],
                        priority: "high",
                        listName: "main",
                        listOrder: 2,
                        due: Date.now(),
                        completed: true,
                        plan_start: Date.now(),
                        plan_end: Date.now(),
                        creator: "beebeeoii",
                        private: true
                    }
                ]
            }
        }), 500)
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
                        title: "CVWO Assignment",
                        tags: ["CVWO", "Programming"],
                        priority: "medium",
                        listName: "main",
                        listOrder: 1,
                        due: Date.now(),
                        completed: false,
                        plan_start: Date.now(),
                        plan_end: Date.now(),
                        creator: "beebeeoii",
                        private: true
                    },
                    {
                        title: "Sunday Service",
                        tags: ["Church"],
                        priority: "high",
                        listName: "main",
                        listOrder: 0,
                        due: Date.now(),
                        completed: false,
                        plan_start: Date.now(),
                        plan_end: Date.now(),
                        creator: "beebeeoii",
                        private: false
                    },
                    {
                        title: "Meetup with ABC",
                        tags: ["Friends"],
                        priority: "low",
                        listName: "main",
                        listOrder: 3,
                        due: Date.now(),
                        completed: false,
                        plan_start: Date.now(),
                        plan_end: Date.now(),
                        creator: "beebeeoii",
                        private: true
                    },
                    {
                        title: "Discuss YF exco stuff with ben and wx",
                        tags: ["Church", "Friends"],
                        priority: "high",
                        listName: "main",
                        listOrder: 2,
                        due: Date.now(),
                        completed: true,
                        plan_start: Date.now(),
                        plan_end: Date.now(),
                        creator: "beebeeoii",
                        private: true
                    }
                ]
            }
        }), 500)
    })
}