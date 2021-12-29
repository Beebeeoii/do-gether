package interfaces

type Task struct {
	Id           string   `json:"id"`
	Owner        string   `json:"owner"`
	Title        string   `json:"title"`
	Tags         []string `json:"tags"`
	ListId       string   `json:"listId"`
	ListOrder    int      `json:"listOrder"`    // -1 for serial auto increment
	Priority     int      `json:"priority"`     // -1 if unset
	Due          int      `json:"due"`          // -1 if nil
	PlannedStart int      `json:"plannedStart"` // -1 if nil
	PlannedEnd   int      `json:"plannedEnd"`   // -1 if nil
	Completed    bool     `json:"completed"`
}

type CreateTaskResponse struct {
	BaseResponse
	Data Task `json:"data"`
}

type EditTaskResponse struct {
	BaseResponse
	Data Task `json:"data"`
}

type TaskCreationData struct {
	Owner        string   `json:"owner"`
	Title        string   `json:"title"`
	Tags         []string `json:"tags"`
	ListId       string   `json:"listId"`
	Priority     int      `json:"priority"`
	Due          int      `json:"due"`          // -1 if nil
	PlannedStart int      `json:"plannedStart"` // -1 if nil
	PlannedEnd   int      `json:"plannedEnd"`   // -1 if nil
}

type TaskEditionData struct {
	Id           string   `json:"id"`
	Title        string   `json:"title"`
	Tags         []string `json:"tags"`
	Priority     int      `json:"priority"`
	Due          int      `json:"due"`          // -1 if nil
	PlannedStart int      `json:"plannedStart"` // -1 if nil
	PlannedEnd   int      `json:"plannedEnd"`   // -1 if nil
}

type BasicTaskReorderData struct {
	Id        string `json:"id"`
	ListOrder int    `json:"listOrder"`
}

type RetrieveTasksResponse struct {
	BaseResponse
	Data []Task `json:"data"`
}

type RetrieveTagsResponse struct {
	BaseResponse
	Data []string `json:"data"`
}
