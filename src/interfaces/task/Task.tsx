export interface Task {
    title: string
    tags: Array<string>
    listName: string
    listOrder: number
    priority: "low" | "medium" | "high"
    due: number
    completed: boolean
    plan_start: number
    plan_end: number
    creator: string
    private: boolean
}