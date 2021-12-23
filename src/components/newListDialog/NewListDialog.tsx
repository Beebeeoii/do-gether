import { Button, Dialog, DialogTitle, TextField } from "@mui/material";
import { useState } from "react";
import { ListData } from "../../interfaces/list/List";
import CreateIcon from '@mui/icons-material/Create';

export interface NewDialogProps {
    open: boolean
    onClose: (newList: ListData | null) => void
}

const DEFAULT_LIST_NAME_VALUE = ""

export function NewListDialog(props: NewDialogProps) {
    const { onClose, open } = props

    let [listName, setListName] = useState<string>(DEFAULT_LIST_NAME_VALUE)

    const handleListNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setListName(event.target.value)
    }

    const handleCreateNewList = () => {
        let newList: ListData = {
            name: listName,
            private: false
        }
        onClose(newList)
        resetState()
    }

    const handleDialogClose = () => {
        onClose(null)
        resetState()
    }

    function resetState() {
        setListName(DEFAULT_LIST_NAME_VALUE)
    }

    return (
        <Dialog onClose={handleDialogClose} open={open}>
            <DialogTitle>Create a List</DialogTitle>

            <TextField
                id="taskTitle"
                label="List Name"
                value={listName}
                onChange={handleListNameChange}
                variant="outlined"
            />

            <Button
                variant="contained"
                endIcon={<CreateIcon />}
                onClick={handleCreateNewList}
            >
                Create List
            </Button>
        </Dialog >
    )
}