export interface List {
    id: string
    name: string
    owner: string
    private: boolean
    members: Array<string>
}

export interface ListData {
    name: string
    private: boolean
}