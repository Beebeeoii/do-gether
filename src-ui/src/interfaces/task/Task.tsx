export interface Task {
    id: string
    ownerId: string
    title: string
    tags: Array<string>
    listId: string
    listOrder: number
    priority: number
    due: number | null
    plannedStart: number | null
    plannedEnd: number | null
    completed: boolean
}

export interface TaskData {
    title: string
    tags: Array<string>
    listId: string
    listOrder: number
    priority: number
    due: number | null
    plannedStart: number | null
    plannedEnd: number | null
    completed: boolean
}