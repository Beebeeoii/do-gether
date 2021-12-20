import { Chip, Dialog, DialogTitle, makeStyles, MenuItem, Select, SelectChangeEvent, Stack, TextField, ThemeProvider } from "@mui/material";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { List } from "../../interfaces/list/List";
import { Task } from "../../interfaces/task/Task";
import { retrieveAllLists, selectLists, selectListStatus } from "../../services/list/listSplice";

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

    const [tags, setTags] = useState<Array<string>>(["tag1", "tag2"])
    const [tagInputValue, setTagInputValue] = useState<string>("")

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

    const handleTagInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTagInputValue(event.target.value)
    }

    const handleTagsChange = (value: string) => {
        return (event: React.KeyboardEvent<HTMLDivElement>) => {
            if (event.key === "Enter") {
                const newSelectedItem = [...tags]
                // const duplicatedValues = newSelectedItem.indexOf(
                //     event.target.value.trim()
                // );

                // if (duplicatedValues !== -1) {
                //     setTagInputValue("");
                //     return;
                // }
                if (!value.replace(/\s/g, "").length) return

                newSelectedItem.push(value.trim())
                setTags(newSelectedItem)
                setTagInputValue("")
                console.log(tags)
            }
            if (tags.length && !tagInputValue.length && event.key === "Backspace") {
                setTags(tags.slice(0, tags.length - 1))
            }
            // const clonedArray = Object.assign([], tags)
            // const index = tags.indexOf(event.target.value, 0)
            // clonedArray.splice(index, 1)
            // setTags(clonedArray)
        }
    }

    const handleDeleteTag = (tag: string) => {
        return () => {
            const clonedArray = Object.assign([], tags)
            const index = tags.indexOf(tag, 0)
            clonedArray.splice(index, 1)
            setTags(clonedArray)
        }
    }

    const handleDialogClose = () => {
        onClose(selected_value)
        resetState()
    }

    function resetState() {
        setTaskTitle("")
        setListId(DEFAULT_LIST_VALUE)
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
                {lists.map((list: List, index: number) => (
                    <MenuItem key={list.id} value={list.id}>{list.name}</MenuItem>
                ))}
            </Select>

            <TextField
                id="tags"
                label="Tags"
                multiline
                maxRows={5}
                onChange={handleTagInputChange}
                value={tagInputValue}
                onKeyDown={handleTagsChange(tagInputValue)}
                variant="standard"
                InputProps={{
                    startAdornment: tags.map((tag: string) => (
                        <Chip
                            key={tag}
                            tabIndex={-1}
                            label={tag}
                            onDelete={handleDeleteTag(tag)}
                        />
                    ))
                }}
            />

        </Dialog >
    )
}