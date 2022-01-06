package interfaces

type User struct {
	Id           string   `json:"id"`
	Username     string   `json:"username"`
	Friends      []string `json:"friends"`
	Outgoing_req []string `json:"outgoing_req"`
	Incoming_req []string `json:"incoming_req"`
}

type BasicUser struct {
	Id       string `json:"id"`
	Username string `json:"username"`
}

type UserFriend struct {
	Id       string `json:"id"`
	Username string `json:"username"`
	Type     string `json:"type"`
}

type CreateUserResponse struct {
	BaseResponse
	Data User `json:"data"`
}

type RetrieveUserResponse struct {
	BaseResponse
	Data User `json:"data"`
}

type RetrieveUserFriendsResponse struct {
	BaseResponse
	Data []UserFriend `json:"data"`
}

// type FindUserResponse struct {
// 	BaseResponse
// 	Data BasicUser `json:"data"`
// }
