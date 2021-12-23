package interfaces

type BaseResponse struct {
	Success bool   `json:"success"`
	Error   string `json:"error"`
}
