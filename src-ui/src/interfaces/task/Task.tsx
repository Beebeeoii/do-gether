export interface Task {
    id: string
    title: string
    tags: Array<string>
    list_id: string
    list_order: number
    priority: "Trivial" | "Normal" | "Urgent" | null
    due: number | null
    completed: boolean
    // planned_start: number | null
    // planned_end: number | null
    owner_id: string
    private: boolean
}

export interface TaskData {
    title: string
    tags: Array<string>
    list_id: string
    list_order: number
    priority: "Trivial" | "Normal" | "Urgent" | null
    due: number | null
    completed: boolean
    // planned_start: number | null
    // planned_end: number | null
    private: boolean
}