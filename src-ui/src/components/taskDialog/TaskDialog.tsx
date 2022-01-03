import { Autocomplete, Button, Chip, Dialog, DialogActions, DialogTitle, FormControl, FormControlLabel, FormGroup, InputLabel, MenuItem, Rating, Select, SelectChangeEvent, Stack, Switch, Tab, Tabs, TextField, Typography } from "@mui/material";
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import MomentAdapter from '@mui/lab/AdapterMoment';
import { ChangeEvent, SyntheticEvent, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { List } from "../../interfaces/list/List";
import { Task } from "../../interfaces/task/Task";
import { selectLists } from "../../services/list/listSplice";
import { resetTags, retrieveTagsByListId, selectTags, selectTagStatus } from "../../services/task/tagSplice";
import { DateTimePicker } from "@mui/lab";
import { Star } from "@mui/icons-material";
import { Box } from "@mui/system";
import moment from "moment";
import { CreateTaskRequest, EditTaskRequest, RetrieveTagsByListIdRequest } from "../../interfaces/task/TaskRequest";
import { AuthData } from "../../interfaces/auth/Auth";
import { addTask, editTask } from "../../services/task/taskSplice";

interface TabPanelProps {
    children?: React.ReactNode
    index: number
    value: number
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ paddingTop: 2, paddingBottom: 3, paddingLeft: 3, paddingRight: 3, width: '500px' }}>
                    {children}
                </Box>
            )}
        </div>
    )
}

function tabProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    }
}

export interface TaskDialogProps {
    open: boolean
    data: Task | null,
    authData: AuthData,
    currentListId: string,
    onClose: () => void
}

const DEFAULT_TASK_TITLE_VALUE = ""
const DEFAULT_LIST_VALUE = "defaultList"
const DEFAULT_TAGS_SELECTED_VALUE: Array<string> = []
const DEFAULT_TAG_SUGGESTIONS_OPEN_VALUE = false
const DEFAULT_PRIORITY_LEVEL_VALUE = -1

export function TaskDialog(props: TaskDialogProps) {
    const dispatch = useAppDispatch()
    const { onClose, data, authData, currentListId, open } = props

    let [taskTitle, setTaskTitle] = useState<string>(data ? data.title : DEFAULT_TASK_TITLE_VALUE)

    const lists = useAppSelector(selectLists)
    let [listId, setListId] = useState<string>(currentListId)

    const tagStatus = useAppSelector(selectTagStatus)
    const tagSuggestions = useAppSelector(selectTags)
    const [tagsSelected, setTagsSelected] = useState<Array<string>>(data ? data.tags : DEFAULT_TAGS_SELECTED_VALUE)
    const [tagsSuggestionsOpen, setTagsSuggestionsOpen] = useState<boolean>(DEFAULT_TAG_SUGGESTIONS_OPEN_VALUE)
    const tagsLoading = tagsSuggestionsOpen && tagStatus === "idle"

    useEffect(() => {
        if (!tagsLoading) {
            return undefined
        }

        if (tagStatus === "idle") {
            let tagRequest: RetrieveTagsByListIdRequest = {
                authData: authData,
                listId: currentListId
            }
            dispatch(retrieveTagsByListId(tagRequest))
        }
    }, [tagsLoading])

    const [dueDateActive, setDueDateActive] = useState<boolean>(data ? data.due != -1 : false)
    const [dueDate, setDueDate] = useState<Date | null>(data ? dueDateActive ? moment.unix(data.due).toDate() : null : dueDateActive ? new Date() : null)

    const [plannedStartActive, setPlannedStartActive] = useState<boolean>(data ? data.plannedStart != -1 : false)
    const [plannedStart, setPlannedStart] = useState<Date | null>(data ? plannedStartActive ? moment.unix(data.plannedStart).toDate() : null : plannedStartActive ? new Date() : null)

    const [plannedEndActive, setPlannedEndActive] = useState<boolean>(data ? data.plannedEnd != -1 : false)
    const [plannedEnd, setPlannedEnd] = useState<Date | null>(data ? plannedEndActive ? moment.unix(data.plannedEnd).toDate() : null : plannedEndActive ? new Date() : null)

    const [priorityLevel, setPriorityLevel] = useState<number | null>(data ? data.priority : DEFAULT_PRIORITY_LEVEL_VALUE)

    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTaskTitle(event.target.value)
    }

    const handleListChange = (event: SelectChangeEvent) => {
        setListId(event.target.value)
    }

    const handleDueDateActiveChange = (_: ChangeEvent<HTMLInputElement>, checked: boolean) => {
        setDueDateActive(checked)
    }

    const handlePlannedStartActiveChange = (_: ChangeEvent<HTMLInputElement>, checked: boolean) => {
        setPlannedStartActive(checked)
    }

    const handlePlannedEndActiveChange = (_: ChangeEvent<HTMLInputElement>, checked: boolean) => {
        setPlannedEndActive(checked)
    }

    const handlePriorityLevelChange = (_: SyntheticEvent<Element, Event>, priorityLevel: number | null) => {
        if (priorityLevel == null) {
            setPriorityLevel(-1)
        } else {
            setPriorityLevel(priorityLevel)
        }
    }

    const handleCreateTask = () => {
        if (data) {
            let editTaskRequest: EditTaskRequest = {
                authData: authData,
                id: data.id,
                listId: listId,
                title: taskTitle,
                tags: tagsSelected,
                priority: priorityLevel!,
                due: dueDate ? moment(dueDate).unix() : -1,
                plannedStart: plannedStart ? moment(plannedStart).unix() : -1,
                plannedEnd: plannedEnd ? moment(plannedEnd).unix() : -1
            }
            dispatch(editTask(editTaskRequest))
        } else {
            let createTaskRequest: CreateTaskRequest = {
                authData: authData,
                owner: authData.id,
                title: taskTitle,
                tags: tagsSelected,
                listId: listId,
                priority: priorityLevel!,
                due: dueDate ? moment(dueDate).unix() : -1,
                plannedStart: plannedStart ? moment(plannedStart).unix() : -1,
                plannedEnd: plannedEnd ? moment(plannedEnd).unix() : -1
            }
            dispatch(addTask(createTaskRequest))
        }

        onClose()
        resetState()
    }

    const handleDialogClose = () => {
        onClose()
        resetState()
    }

    function resetState() {
        setTaskTitle(DEFAULT_TASK_TITLE_VALUE)
        setListId(DEFAULT_LIST_VALUE)
        setTagsSelected(DEFAULT_TAGS_SELECTED_VALUE)
        setTagsSuggestionsOpen(DEFAULT_TAG_SUGGESTIONS_OPEN_VALUE)
        setDueDate(new Date())
        setPriorityLevel(DEFAULT_PRIORITY_LEVEL_VALUE)
        dispatch(resetTags())
    }

    const [tabValue, setTabValue] = useState(0)

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue)
    };

    return (
        <Dialog onClose={handleDialogClose} open={open}>
            <DialogTitle>
                {data ? "Edit a Task" : "Create a task"}
            </DialogTitle>

            <Box sx={{ padding: '4px' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="basic tabs example">
                        <Tab label="Main" {...tabProps(0)} />
                        <Tab label="Extra" {...tabProps(1)} />
                    </Tabs>
                </Box>

                <TabPanel value={tabValue} index={0}>
                    <Stack direction={"column"} gap={2}>
                        <TextField
                            id="taskTitle"
                            label="Task"
                            value={taskTitle}
                            onChange={handleTitleChange}
                            variant="standard"
                        />

                        <Stack direction={'row'} justifyContent={'space-between'} gap={4}>
                            <FormControl sx={{ flexGrow: 1 }}>
                                <InputLabel id="listSelectorLabel">List</InputLabel>
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
                            </FormControl>

                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: "column"
                                }}
                            >
                                <Typography>Priority</Typography>

                                <Rating
                                    name="priority"
                                    value={priorityLevel}
                                    precision={1}
                                    max={3}
                                    onChange={handlePriorityLevelChange}
                                    icon={<Star fontSize="inherit" />}
                                    emptyIcon={<Star style={{ opacity: 0.50 }} fontSize="inherit" />}
                                />
                            </Box>
                        </Stack>

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
                            options={tagSuggestions}
                            value={tagsSelected}
                            onChange={(_, tagsSelected: Array<string>) => {
                                setTagsSelected(tagsSelected)
                            }}
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
                    </Stack>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <Stack direction={"column"} gap={2}>
                        <Stack direction={"row"} justifyContent={"space-between"}>
                            <FormGroup sx={{ justifyContent: "center" }}>
                                <FormControlLabel control={<Switch checked={dueDateActive} value={dueDateActive} onChange={handleDueDateActiveChange} />} label="Include due date" />
                            </FormGroup>

                            {dueDateActive && <LocalizationProvider dateAdapter={MomentAdapter}>
                                <DateTimePicker
                                    renderInput={(props) => <TextField {...props} />}
                                    label="Due date"
                                    value={dueDate}
                                    onChange={(dateSelected) => {
                                        setDueDate(dateSelected)
                                    }}
                                />
                            </LocalizationProvider>}
                        </Stack>

                        <Stack direction={"row"} justifyContent={"space-between"}>
                            <FormGroup sx={{ justifyContent: "center" }}>
                                <FormControlLabel control={<Switch value={plannedStartActive} onChange={handlePlannedStartActiveChange} />} label="Include date to start" />
                            </FormGroup>

                            {plannedStartActive && <LocalizationProvider dateAdapter={MomentAdapter}>
                                <DateTimePicker
                                    renderInput={(props) => <TextField {...props} />}
                                    label="Planned start date"
                                    value={plannedStart}
                                    onChange={(dateSelected) => {
                                        setPlannedStart(dateSelected)
                                    }}
                                />
                            </LocalizationProvider>}
                        </Stack>

                        <Stack direction={"row"} justifyContent={"space-between"}>
                            <FormGroup sx={{ justifyContent: "center" }}>
                                <FormControlLabel control={<Switch value={plannedEndActive} onChange={handlePlannedEndActiveChange} />} label="Include end date" />
                            </FormGroup>

                            {plannedEndActive && <LocalizationProvider dateAdapter={MomentAdapter}>
                                <DateTimePicker
                                    renderInput={(props) => <TextField {...props} />}
                                    label="Planned end date"
                                    value={plannedEnd}
                                    onChange={(dateSelected) => {
                                        setPlannedEnd(dateSelected)
                                    }}
                                />
                            </LocalizationProvider>}
                        </Stack>
                    </Stack>
                </TabPanel>
            </Box>

            <DialogActions>
                {data && <Button color="error">
                    Delete
                </Button>}

                <div style={{ flex: '1 0 0' }} />

                <Button onClick={handleDialogClose}>
                    Cancel
                </Button>

                <Button variant="contained" onClick={handleCreateTask} autoFocus>
                    {data ? "Edit Task" : "Create Task"}
                </Button>
            </DialogActions>
        </Dialog >
    )
}