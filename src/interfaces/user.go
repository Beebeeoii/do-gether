package interfaces

type User struct {
	Id           string   `json:"id"`
	Username     string   `json:"username"`
	Friends      []string `json:"friends"`
	Outgoing_req []string `json:"outgoing_req"`
	Incoming_req []string `json:"incoming_req"`
}

type CreateUserResponse struct {
	BaseResponse
	Data User `json:"data"`
}
