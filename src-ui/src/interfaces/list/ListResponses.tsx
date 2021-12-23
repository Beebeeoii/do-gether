import { List } from "./List";

export interface CreateListResponse {
    success: boolean,
    error: string,
    data: {
        list: List
    }
}

export interface RetrieveListByUserIdResponse {
    success: boolean,
    error: string,
    data: {
        lists: Array<List>
    }
}