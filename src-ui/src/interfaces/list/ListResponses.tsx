import { List } from "./List";

export interface CreateListResponse {
    success: boolean,
    error: string,
    data: {
        id: string,
        name: string,
        owner: string,
        private: boolean,
        members: Array<string>
    }
}

export interface RetrieveListByUserIdResponse {
    success: boolean,
    error: string,
    data: Array<List>
}