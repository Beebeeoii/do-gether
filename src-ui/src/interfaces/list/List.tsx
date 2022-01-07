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

export interface ListSettingsDialogOpResponse {
    id: string
    operation: 'new' | 'edit' | 'delete' | 'close'
}