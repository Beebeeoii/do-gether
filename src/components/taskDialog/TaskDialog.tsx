import { Autocomplete, Chip, Dialog, DialogTitle, makeStyles, MenuItem, Select, SelectChangeEvent, Stack, TextField, ThemeProvider } from "@mui/material";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { List } from "../../interfaces/list/List";
import { Task } from "../../interfaces/task/Task";
import { retrieveAllLists, selectLists, selectListStatus } from "../../services/list/listSplice";
import { retrieveTagsByListId, selectTags, selectTagStatus } from "../../services/task/tagSplice";

export interface TaskDialogProps {
    open: boolean
    selected_value: string
    onClose: (value: string) => void
}

const DEFAULT_LIST_VALUE = "defaultList"

export function TaskDialog(props: TaskDialogProps) {
    const dispatch = useAppDispatch()
    const { onClose, selected_value, open } = props

    let [taskTitle, setTaskTitle] = useState<string>("")

    const listStatus = useAppSelector(selectListStatus)
    const lists = useAppSelector(selectLists)
    useEffect(() => {
        if (listStatus === "idle") {
            dispatch(retrieveAllLists("beebeeoii"))
        }
    }, [listStatus, dispatch])
    let [listId, setListId] = useState<string>(DEFAULT_LIST_VALUE)

    const tagStatus = useAppSelector(selectTagStatus)
    const tagSuggestions = useAppSelector(selectTags)
    const [tagsSelected, setTagsSelected] = useState<Array<string>>([])
    const [tagsSuggestionsOpen, setTagsSuggestionsOpen] = useState<boolean>(false)
    const tagsLoading = tagsSuggestionsOpen && tagSuggestions.length === 0

    useEffect(() => {
        if (!tagsLoading) {
            return undefined
        }

        if (tagStatus === "idle") {
            dispatch(retrieveTagsByListId("list01"))
        }
    }, [tagsLoading])

    // let task: Task = {
    //     id: "asd0",
    //     title: "test",
    //     tags: [],
    //     priority: "low",
    //     private: true,
    //     planned_end: Date.now(),
    //     planned_start: Date.now(),
    //     owner_id: "beebeeoii",
    //     list_id: "defaultList",
    //     due: Date.now(),
    //     list_order: -1,
    //     completed: false
    // }

    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTaskTitle(event.target.value)
    }

    const handleListChange = (event: SelectChangeEvent) => {
        setListId(event.target.value)
    }

    const handleDialogClose = () => {
        onClose(selected_value)
        resetState()
    }

    function resetState() {
        setTaskTitle("")
        setListId(DEFAULT_LIST_VALUE)
        setTagsSelected([])
    }

    return (
        <Dialog onClose={handleDialogClose} open={open}>
            <DialogTitle>Create a task</DialogTitle>

            <TextField
                id="taskTitle"
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
                value={listId}
                onChange={handleListChange}
                autoWidth
                label="List"
            >
                <MenuItem key={DEFAULT_LIST_VALUE} value={DEFAULT_LIST_VALUE} disabled>Choose your list</MenuItem>
                {lists.map((list: List, _: number) => (
                    <MenuItem key={list.id} value={list.id}>{list.name}</MenuItem>
                ))}
            </Select>

            <Autocomplete
                multiple
                limitTags={3}
                id="tags"
                open={tagsSuggestionsOpen}
                onOpen={() => {
                    setTagsSuggestionsOpen(true)
                }}
                onClose={() => {
                    setTagsSuggestionsOpen(false)
                }}
                freeSolo
                loading={tagsLoading}
                loadingText="Loading"
                options={tagSuggestions}
                value={tagsSelected}
                onChange={(_, tagsSelected: Array<string>) => {
                    setTagsSelected(tagsSelected)
                }}
                style={{ width: 500 }}
                getOptionLabel={(option) => option}
                renderTags={(value: readonly string[], getTagProps) =>
                    value.map((option: string, index: number) => (
                        <Chip variant="outlined" label={option} {...getTagProps({ index })} />
                    ))
                }
                renderInput={(params) => (
                    <TextField {...params} label="Tags" placeholder="Add a tag" />
                )}
            />
        </Dialog >
    )
}