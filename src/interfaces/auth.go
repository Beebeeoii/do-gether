package interfaces

type AuthData struct {
	Token string `json:"token"`
}

type AuthResponse struct {
	BaseResponse
	Data AuthData `json:"data"`
}
