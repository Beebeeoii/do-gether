package interfaces

type AuthData struct {
	Token  string `json:"token"`
	UserId string `json:"id"`
}

type AuthResponse struct {
	BaseResponse
	Data AuthData `json:"data"`
}
