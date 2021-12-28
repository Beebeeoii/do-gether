export interface Task {
    id: string
    owner: string
    title: string
    tags: Array<string>
    listId: string
    listOrder: number
    priority: number
    due: number
    plannedStart: number
    plannedEnd: number
    completed: boolean
}

export interface TaskData {
    title: string
    tags: Array<string>
    listId: string
    listOrder: number
    priority: number
    due: number
    plannedStart: number
    plannedEnd: number
    completed: boolean
}