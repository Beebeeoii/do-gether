import { Button, Checkbox, Dialog, DialogTitle, FormControlLabel, TextField } from "@mui/material";
import { useState } from "react";
import { List } from "../../interfaces/list/List";
import CreateIcon from '@mui/icons-material/Create';
import { AuthData } from "../../interfaces/auth/Auth";
import { CreateListRequest, EditListRequest } from "../../interfaces/list/ListRequest";
import { addList, editList } from "../../services/list/listSplice";
import { useAppDispatch } from "../../app/hooks";

export interface ListDialogProps {
    open: boolean
    authData: AuthData
    data: List | null
    onClose: (newListId: string | null) => void
}

const DEFAULT_LIST_NAME_VALUE = ""
const DEFAULT_IS_PRIVATE_VALUE = true

export function ListDialog(props: ListDialogProps) {
    const dispatch = useAppDispatch()
    const { open, authData, data, onClose } = props

    let [listName, setListName] = useState<string>(data ? data.name : DEFAULT_LIST_NAME_VALUE)
    let [isPrivate, setIsPrivate] = useState<boolean>(data ? data.private : DEFAULT_IS_PRIVATE_VALUE)

    const handleListNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setListName(event.target.value)
    }

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setIsPrivate(event.target.checked)
    }

    const handleCreateNewList = () => {
        if (!data) {
            let createListRequest: CreateListRequest = {
                authData: authData,
                name: listName,
                owner: authData.id,
                private: isPrivate
            }

            dispatch(addList(createListRequest)).then(value => {
                onClose(value.payload.data.id)
            })
        } else {
            let editListRequest: EditListRequest = {
                authData: authData,
                id: data.id,
                name: listName,
                private: isPrivate
            }

            dispatch(editList(editListRequest)).then(value => {
                onClose(value.payload.data.id)
            })
        }
        
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
            <DialogTitle>
                {data ? "Edit list": "Create a List"}
            </DialogTitle>

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
                {data ? "Edit list" : "Create List"}
            </Button>

        </Dialog >
    )
}