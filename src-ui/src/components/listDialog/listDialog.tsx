import { Button, Checkbox, Dialog, DialogActions, DialogTitle, FormControlLabel, Stack, TextField, Tooltip } from "@mui/material";
import { useState } from "react";
import { List } from "../../interfaces/list/List";
import { AuthData } from "../../interfaces/auth/Auth";
import { CreateListRequest, DeleteListRequest, EditListRequest } from "../../interfaces/list/ListRequest";
import { addList, deleteList, editList } from "../../services/list/listSplice";
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

    const handleDeleteList = () => {
        if (data) {
            let deleteListRequest: DeleteListRequest = {
                authData: authData,
                id: data.id
            }
            dispatch(deleteList(deleteListRequest)).then(_ => {
                onClose(null)
            })
        } else {
            onClose(null)
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
                {data ? "Edit list" : "Create a list"}
            </DialogTitle>

            <Stack direction={'column'} gap={2} sx={{ width: '300px', padding: 2 }}>
                <TextField
                    id="taskTitle"
                    label="List Name"
                    value={listName}
                    onChange={handleListNameChange}
                    variant="outlined"
                    autoFocus
                />

                <Tooltip title="Private lists do not appear on your profile page when another user searches for you" placement="right" arrow>
                    <FormControlLabel control={<Checkbox checked={isPrivate} onChange={handleCheckboxChange} />} label="Private" />
                </Tooltip>
            </Stack>

            <DialogActions>
                {data && <Button color="error" onClick={handleDeleteList}>
                    Delete
                </Button>}

                <div style={{ flex: '1 0 0' }} />

                <Button onClick={handleDialogClose}>
                    Cancel
                </Button>

                <Button variant="contained" onClick={handleCreateNewList}>
                    {data ? "Edit list" : "Create List"}
                </Button>
            </DialogActions>
        </Dialog >
    )
}