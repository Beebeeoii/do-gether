export interface Task {
    id: string
    title: string
    tags: Array<string>
    list_name: string
    list_order: number
    priority: "low" | "medium" | "high"
    due: number
    completed: boolean
    planned_start: number
    planned_end: number
    owner: string
    private: boolean
}