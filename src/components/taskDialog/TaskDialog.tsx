import { Chip, Dialog, DialogTitle, MenuItem, Select, SelectChangeEvent, Stack, TextField } from "@mui/material";
import { useState } from "react";
import { Task } from "../../interfaces/task/Task";

export interface TaskDialogProps {
    open: boolean
    selected_value: string
    onClose: (value: string) => void
}



export function TaskDialog(props: TaskDialogProps) {
    const { onClose, selected_value, open } = props
    let [taskTitle, setTaskTitle] = useState<string>("")
    let [listName, setListName] = useState<string>("main")

    let task: Task = {
        id: "asd0",
        title: "test",
        tags: [],
        priority: "low",
        private: true,
        planned_end: Date.now(),
        planned_start: Date.now(),
        owner_id: "beebeeoii",
        list_id: "defaultList",
        due: Date.now(),
        list_order: -1,
        completed: false
    }

    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTaskTitle(event.target.value);
        console.log(taskTitle)
    };


    const handleListChange = (event: SelectChangeEvent) => {
        setListName(event.target.value)

    }

    const handleDialogClose = () => {
        onClose(selected_value)
        resetState()
    }

    function resetState() {
        setTaskTitle("")
        setListName("main")
    }

    return (
        <Dialog onClose={handleDialogClose} open={open}>
            <DialogTitle>Create a task</DialogTitle>

            <TextField
                id="task_title"
                label="Task"
                multiline
                maxRows={2}

                value={taskTitle}
                onChange={handleTitleChange}
                variant="standard"
            />

            <Select
                labelId="listSelectorLabel"
                id="listSelector"
                value={listName}
                onChange={handleListChange}
                autoWidth
                label="List"
            >
                <MenuItem value="main">Main</MenuItem>
                <MenuItem value="backlog">Backlog</MenuItem>
            </Select>

        </Dialog>
    )
}