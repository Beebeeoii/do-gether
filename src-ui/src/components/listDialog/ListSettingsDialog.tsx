import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Stack, TextField, Tooltip } from "@mui/material";
import { KeyboardEvent, useState } from "react";
import { List, ListSettingsDialogOpResponse } from "../../interfaces/list/List";
import { AuthData } from "../../interfaces/auth/Auth";
import { CreateListRequest, DeleteListRequest, EditListRequest } from "../../interfaces/list/ListRequest";
import { addList, deleteList, editList } from "../../services/list/listSplice";
import { useAppDispatch } from "../../app/hooks";

export interface ListSettingsDialogProps {
    open: boolean
    authData: AuthData
    data: List | null
    onClose: (res: ListSettingsDialogOpResponse) => void
}

const DEFAULT_LIST_NAME_VALUE = ""
const DEFAULT_IS_PRIVATE_VALUE = true

export function ListSettingsDialog(props: ListSettingsDialogProps) {
    const dispatch = useAppDispatch()
    const { open, authData, data, onClose } = props

    let [listName, setListName] = useState<string>(data ? data.name : DEFAULT_LIST_NAME_VALUE)
    let [isPrivate, setIsPrivate] = useState<boolean>(data ? data.private : DEFAULT_IS_PRIVATE_VALUE)

    const handleListNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setListName(event.target.value)
    }

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter") {
            handleCreateNewList()
        }
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
                onClose({
                    id: value.payload.data.id,
                    operation: "new"
                })
            })
        } else {
            let editListRequest: EditListRequest = {
                authData: authData,
                id: data.id,
                name: listName,
                private: isPrivate
            }

            dispatch(editList(editListRequest)).then(value => {
                onClose({
                    id: value.payload.data.id,
                    operation: "edit"
                })
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
                onClose({
                    id: data.id,
                    operation: "delete"
                })
            })
        } else {
            onClose({
                id: "",
                operation: "close"
            })
        }

        resetState()
    }

    const handleDialogClose = () => {
        onClose({
            id: "",
            operation: "close"
        })
        resetState()
    }

    function resetState() {
        setListName(DEFAULT_LIST_NAME_VALUE)
        setIsPrivate(DEFAULT_IS_PRIVATE_VALUE)
    }

    return (
        <Dialog onClose={handleDialogClose} open={open} fullWidth>
            <DialogTitle>
                {data ? "Edit list" : "Create a list"}
            </DialogTitle>

            <DialogContent>
                <Stack direction={'column'} gap={2} >
                    <TextField
                        id="taskTitle"
                        label="List Name"
                        value={listName}
                        onChange={handleListNameChange}
                        variant="outlined"
                        autoFocus
                        sx={{ marginTop: "0.5rem" }}
                        onKeyDown={onKeyDown}
                    />

                    <Tooltip title="Private lists do not appear on your profile page when another user searches for you" placement="right" arrow>
                        <FormControlLabel control={<Checkbox checked={isPrivate} onChange={handleCheckboxChange} />} label="Private" />
                    </Tooltip>
                </Stack>
            </DialogContent>

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