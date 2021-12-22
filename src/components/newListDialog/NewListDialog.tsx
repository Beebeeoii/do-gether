import { Autocomplete, Button, Chip, Dialog, DialogTitle, FormControlLabel, FormGroup, makeStyles, MenuItem, Rating, Select, SelectChangeEvent, Stack, Switch, TextField, ThemeProvider } from "@mui/material";
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import MomentAdapter from '@mui/lab/AdapterMoment';
import { ChangeEvent, FormEvent, SyntheticEvent, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { List, ListData } from "../../interfaces/list/List";
import { Task, TaskData } from "../../interfaces/task/Task";
import { retrieveAllLists, selectLists, selectListStatus } from "../../services/list/listSplice";
import { retrieveTagsByListId, selectTags, selectTagStatus } from "../../services/task/tagSplice";
import { DatePicker, DateTimePicker } from "@mui/lab";
import { PriorityHigh } from "@mui/icons-material";
import CreateIcon from '@mui/icons-material/Create';
import { Box } from "@mui/system";
import moment from "moment";

export interface NewDialogProps {
    open: boolean
    onClose: (newList: ListData | null) => void
}

const DEFAULT_LIST_NAME_VALUE = ""

export function NewListDialog(props: NewDialogProps) {
    const dispatch = useAppDispatch()
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