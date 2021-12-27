import { Autocomplete, Button, Chip, Dialog, DialogTitle, FormControlLabel, FormGroup, MenuItem, Rating, Select, SelectChangeEvent, Stack, Switch, TextField } from "@mui/material";
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import MomentAdapter from '@mui/lab/AdapterMoment';
import { ChangeEvent, SyntheticEvent, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { List } from "../../interfaces/list/List";
import { Task, TaskData } from "../../interfaces/task/Task";
import { selectLists } from "../../services/list/listSplice";
import { retrieveTagsByListId, selectTags, selectTagStatus } from "../../services/task/tagSplice";
import { DatePicker, DateTimePicker } from "@mui/lab";
import { PriorityHigh } from "@mui/icons-material";
import CreateIcon from '@mui/icons-material/Create';
import { Box } from "@mui/system";
import moment from "moment";

export interface TaskDialogProps {
    open: boolean
    data: Task | null
    onClose: (newTask: TaskData | null) => void
}

const DEFAULT_TASK_TITLE_VALUE = ""
const DEFAULT_LIST_VALUE = "defaultList"
const DEFAULT_TAGS_SELECTED_VALUE: Array<string> = []
const DEFAULT_TAG_SUGGESTIONS_OPEN_VALUE = false
const DEFAULT_INCLUDE_TIME_VALUE = false
const DEFAULT_PRIORITY_LEVEL_VALUE = -1
const DEFAULT_HOVER_PRIORITY_LEVEL_VALUE = -1

const priorityLevelLabels: { [index: number]: string | null } = {
    [-1]: 'Unset',
    1: 'Trivial',
    2: 'Normal',
    3: 'Urgent'
}

export function TaskDialog(props: TaskDialogProps) {
    const dispatch = useAppDispatch()
    const { onClose, data, open } = props

    let [taskTitle, setTaskTitle] = useState<string>(data ? data.title : DEFAULT_TASK_TITLE_VALUE)

    const lists = useAppSelector(selectLists)
    let [listId, setListId] = useState<string>(data ? data.listId : DEFAULT_LIST_VALUE)

    const tagStatus = useAppSelector(selectTagStatus)
    const tagSuggestions = useAppSelector(selectTags)
    const [tagsSelected, setTagsSelected] = useState<Array<string>>(data ? data.tags : DEFAULT_TAGS_SELECTED_VALUE)
    const [tagsSuggestionsOpen, setTagsSuggestionsOpen] = useState<boolean>(DEFAULT_TAG_SUGGESTIONS_OPEN_VALUE)
    const tagsLoading = tagsSuggestionsOpen && tagSuggestions.length === 0

    useEffect(() => {
        if (!tagsLoading) {
            return undefined
        }

        if (tagStatus === "idle") {
            dispatch(retrieveTagsByListId("list01"))
        }
    }, [tagsLoading])

    const [dueDate, setDueDate] = useState<Date | null>(data ? moment(data.due).toDate() : new Date())
    const [includeTime, setIncludeTime] = useState<boolean>(DEFAULT_INCLUDE_TIME_VALUE)

    const [priorityLevel, setPriorityLevel] = useState<number | null>(data ? data.priority : DEFAULT_PRIORITY_LEVEL_VALUE)
    const [hoverPriorityLevel, setHoverPriorityLevel] = useState(DEFAULT_HOVER_PRIORITY_LEVEL_VALUE)

    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTaskTitle(event.target.value)
    }

    const handleListChange = (event: SelectChangeEvent) => {
        setListId(event.target.value)
    }

    const handleIncludeTimeChange = (_: ChangeEvent<HTMLInputElement>, checked: boolean) => {
        setIncludeTime(checked)
    }

    const handlePriorityLevelChange = (_: SyntheticEvent<Element, Event>, priorityLevel: number | null) => {
        if (priorityLevel == null) {
            setPriorityLevel(-1)
        } else {
            setPriorityLevel(priorityLevel)
        }
    }

    const handleHoverPriorityLevelChange = (_: SyntheticEvent<Element, Event>, newHoverPriorityLevel: number) => {
        setHoverPriorityLevel(newHoverPriorityLevel)
    }

    const handleCreateTask = () => {
        let task: TaskData = {
            title: taskTitle,
            tags: tagsSelected,
            priority: priorityLevel!,
            listId: listId,
            listOrder: -1,
            due: moment(dueDate).unix(),
            plannedStart: null,
            plannedEnd: null,
            completed: false
        }
        onClose(task)
        resetState()
    }

    const handleDialogClose = () => {
        onClose(null)
        resetState()
    }

    function resetState() {
        setTaskTitle(DEFAULT_TASK_TITLE_VALUE)
        setListId(DEFAULT_LIST_VALUE)
        setTagsSelected(DEFAULT_TAGS_SELECTED_VALUE)
        setTagsSuggestionsOpen(DEFAULT_TAG_SUGGESTIONS_OPEN_VALUE)
        setDueDate(new Date())
        setIncludeTime(DEFAULT_INCLUDE_TIME_VALUE)
        setPriorityLevel(DEFAULT_PRIORITY_LEVEL_VALUE)
        setHoverPriorityLevel(DEFAULT_HOVER_PRIORITY_LEVEL_VALUE)
    }

    return (
        <Dialog onClose={handleDialogClose} open={open}>
            <DialogTitle>
                {data ? "Edit a Task" : "Create a task"}
            </DialogTitle>

            <TextField
                id="taskTitle"
                label="Task"
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

            <Stack direction={"row"} spacing={3}>
                {!includeTime && <LocalizationProvider dateAdapter={MomentAdapter}>
                    <DatePicker
                        renderInput={(params) => <TextField {...params} />}
                        label="Due date"
                        value={dueDate}
                        onChange={(dateSelected) => {
                            setDueDate(dateSelected);
                        }}
                    />
                </LocalizationProvider>}

                {includeTime && <LocalizationProvider dateAdapter={MomentAdapter}>
                    <DateTimePicker
                        renderInput={(props) => <TextField {...props} />}
                        label="Due date"
                        value={dueDate}
                        onChange={(dateSelected) => {
                            setDueDate(dateSelected)
                        }}
                    />
                </LocalizationProvider>}

                <FormGroup>
                    <FormControlLabel control={<Switch value={includeTime} onChange={handleIncludeTimeChange} />} label="Include time" />
                </FormGroup>
            </Stack>

            <Box
                sx={{
                    width: 200,
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <Rating
                    name="priority"
                    value={priorityLevel}
                    precision={1}
                    max={3}
                    onChange={handlePriorityLevelChange}
                    onChangeActive={handleHoverPriorityLevelChange}
                    icon={<PriorityHigh fontSize="inherit" />}
                    emptyIcon={<PriorityHigh style={{ opacity: 0.55 }} fontSize="inherit" />}
                />
                {priorityLevel !== null && (
                    <Box sx={{ ml: 2 }}>{priorityLevelLabels[hoverPriorityLevel !== -1 ? hoverPriorityLevel : priorityLevel]}</Box>
                )}
            </Box>

            <Button
                variant="contained"
                endIcon={<CreateIcon />}
                onClick={handleCreateTask}
            >
                {data ? "Edit Task" : "Create Task"}
            </Button>
        </Dialog >
    )
}