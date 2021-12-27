import { Button, Checkbox, Dialog, DialogTitle, FormControlLabel, TextField } from "@mui/material";
import { useState } from "react";
import { ListData } from "../../interfaces/list/List";
import CreateIcon from '@mui/icons-material/Create';

export interface NewDialogProps {
    open: boolean
    onClose: (newList: ListData | null) => void
}

const DEFAULT_LIST_NAME_VALUE = ""
const DEFAULT_IS_PRIVATE_VALUE = true

export function NewListDialog(props: NewDialogProps) {
    const { onClose, open } = props

    let [listName, setListName] = useState<string>(DEFAULT_LIST_NAME_VALUE)
    let [isPrivate, setIsPrivate] = useState<boolean>(DEFAULT_IS_PRIVATE_VALUE)

    const handleListNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setListName(event.target.value)
    }

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsPrivate(event.target.checked)
    }

    const handleCreateNewList = () => {
        let newList: ListData = {
            name: listName,
            private: isPrivate
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
        setIsPrivate(DEFAULT_IS_PRIVATE_VALUE)
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

            <FormControlLabel control={<Checkbox checked={isPrivate} onChange={handleCheckboxChange} />} label="Private" />

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