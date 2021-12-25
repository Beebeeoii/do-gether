package interfaces

type User struct {
	Id           string
	Username     string
	Friends      []string
	Outgoing_req []string
	Incoming_req []string
}

type CreateUserResponse struct {
	BaseResponse
}
