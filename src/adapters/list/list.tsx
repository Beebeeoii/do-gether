import { List } from "../../interfaces/list/List";
import { CreateListResponse, RetrieveListByUserIdResponse } from "../../interfaces/list/ListResponses";

export function createList(list: List) {
    return new Promise<CreateListResponse>((resolve) => {
        setTimeout(() => resolve({
            success: true,
            error: "",
            data: {
                list: {
                    id: "list06",
                    name: list.name,
                    owner: "beebeeoii",
                    private: list.private
                },
            }
        }), 500)
    })
}

export function fetchListsByUserId(user_id: string) {
    return new Promise<RetrieveListByUserIdResponse>((resolve) => {
        setTimeout(() => resolve({
            success: true,
            error: "",
            data: {
                lists: [
                    {
                        id: "list01",
                        name: "main",
                        owner: "beebeeoii",
                        private: true
                    },
                    {
                        id: "list02",
                        name: "backlog",
                        owner: "beebeeoii",
                        private: true
                    },
                    {
                        id: "list03",
                        name: "school_101",
                        owner: "beebeeoii",
                        private: false
                    }
                ]
            }
        }), 500)
    })
}