package interfaces

type List struct {
	Id      string   `json:"id"`
	Name    string   `json:"name"`
	Owner   string   `json:"owner"`
	Private bool     `json:"private"`
	Members []string `json:"members"`
}

type CreateListResponse struct {
	BaseResponse
	Data List `json:"data"`
}

type EditListResponse struct {
	BaseResponse
	Data List `json:"data"`
}

type DeleteListResponse struct {
	BaseResponse
	Data List `json:"data"`
}

type BasicListData struct {
	Id      string `json:"id"`
	Name    string `json:"name"`
	Owner   string `json:"owner"`
	Private bool   `json:"private"`
}

type RetrieveListResponse struct {
	BaseResponse
	Data List `json:"data"`
}

type RetrieveListsResponse struct {
	BaseResponse
	Data []BasicListData `json:"data"`
}

type RetrieveListMemberUsernamesResponse struct {
	BaseResponse
	Data []string `json:"data"`
}
