import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormGroup, IconButton, InputLabel, Menu, MenuItem, Rating, Select, SelectChangeEvent, Stack, Switch, Tab, Tabs, TextField, Tooltip, Typography } from "@mui/material";
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import MomentAdapter from '@mui/lab/AdapterMoment';
import { ChangeEvent, MouseEvent, ReactNode, SyntheticEvent, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { List } from "../../interfaces/list/List";
import { Task } from "../../interfaces/task/Task";
import { selectLists } from "../../services/list/listSplice";
import { resetTags } from "../../services/task/tagSplice";
import { DateTimePicker } from "@mui/lab";
import { DriveFileMove, Star } from "@mui/icons-material";
import { Box } from "@mui/system";
import moment from "moment";
import { CreateTaskRequest, DeleteTaskRequest, EditTaskRequest, MoveTaskRequest } from "../../interfaces/task/TaskRequest";
import { AuthData } from "../../interfaces/auth/Auth";
import { addTask, deleteTask, editTask, moveTask } from "../../services/task/taskSplice";
import { TaskTagsAutocomplete } from "../taskTagsAutocomplete/TaskTagsAutocomplete";

interface TabPanelProps {
    children?: ReactNode
    index: number
    value: number
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props

    return (
        <div
            role="tabPanel"
            hidden={value !== index}
            id={`tabPanel-${index}`}
            aria-labelledby={`tab-${index}`}
            {...other}
        >
            {value === index && (
                <Stack direction={"column"} rowGap={3} paddingTop={"0.5rem"}>
                    {children}
                </Stack>
            )}
        </div>
    )
}

function tabProps(index: number) {
    return {
        id: `tab-${index}`,
        'aria-controls': `tabPanel-${index}`,
    }
}

export interface TaskDialogProps {
    open: boolean
    data: Task | null,
    authData: AuthData,
    currentListId: string,
    onClose: () => void
}

const NO_LIST_VALUE = "no_list"
const NO_LIST_TEXT = "No lists to move to"

const DEFAULT_TASK_TITLE_VALUE = ""
const DEFAULT_MOVE_MENU_OPEN_VALUE = false
const DEFAULT_LIST_VALUE = "defaultList"
const DEFAULT_TAGS_SELECTED_VALUE: Array<string> = []
const DEFAULT_PRIORITY_LEVEL_VALUE = -1

export function TaskDialog(props: TaskDialogProps) {
    const dispatch = useAppDispatch()
    const { onClose, data, authData, currentListId, open } = props

    let [taskTitle, setTaskTitle] = useState<string>(data ? data.title : DEFAULT_TASK_TITLE_VALUE)

    const lists = useAppSelector(selectLists)
    let [listId, setListId] = useState<string>(currentListId)

    const [moveMenuAnchorEl, setMoveMenuAnchorEl] = useState<HTMLElement | null>(null);
    let [moveTaskMenuOpen, setMoveTaskMenuOpen] = useState<boolean>(DEFAULT_MOVE_MENU_OPEN_VALUE)

    const handleMoveTaskMenuClick = (event: MouseEvent<HTMLButtonElement>) => {
        setMoveMenuAnchorEl(event.currentTarget)
        setMoveTaskMenuOpen(true)
    }

    const handleMoveTaskMenuClose = () => {
        setMoveTaskMenuOpen(false)
    }

    const handleMoveTask = (newListId: string) => (event: MouseEvent<HTMLLIElement>) => {
        let moveTaskRequest: MoveTaskRequest = {
            authData: authData,
            id: data!.id,
            newListId: newListId,
            originalListId: data!.listId,
            originalListOrder: data!.listOrder
        }
        dispatch(moveTask(moveTaskRequest))
        setMoveTaskMenuOpen(false)
        onClose()
    }
    
    const [tagsSelected, setTagsSelected] = useState<Array<string>>(data ? data.tags : DEFAULT_TAGS_SELECTED_VALUE)

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
        if (taskTitle.length === 0) {
            return
        }

        if (data) {
            let editTaskRequest: EditTaskRequest = {
                authData: authData,
                id: data.id,
                listId: listId,
                title: taskTitle,
                tags: tagsSelected,
                priority: priorityLevel!,
                due: (dueDate && dueDateActive) ? moment(dueDate).unix() : -1,
                plannedStart: (plannedStart && plannedStartActive) ? moment(plannedStart).unix() : -1,
                plannedEnd: (plannedEnd && plannedEndActive) ? moment(plannedEnd).unix() : -1
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
                due: (dueDate && dueDateActive) ? moment(dueDate).unix() : -1,
                plannedStart: (plannedStart && plannedStartActive) ? moment(plannedStart).unix() : -1,
                plannedEnd: (plannedEnd && plannedEndActive) ? moment(plannedEnd).unix() : -1
            }
            dispatch(addTask(createTaskRequest))
        }

        onClose()
        resetState()
    }

    const handleDeleteTask = () => {
        if (data) {
            let deleteTaskRequest: DeleteTaskRequest = {
                authData: authData,
                id: data.id
            }
            dispatch(deleteTask(deleteTaskRequest))
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
        setPriorityLevel(DEFAULT_PRIORITY_LEVEL_VALUE)
        setDueDate(new Date())
        setPlannedStart(new Date())
        setPlannedEnd(new Date())
        dispatch(resetTags())
    }

    const [tabValue, setTabValue] = useState(0)

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue)
    };

    return (
        <Dialog onClose={handleDialogClose} open={open} fullWidth>
            <DialogTitle>
                {data ? "Edit a Task" : "Create a task"}
            </DialogTitle>

            <DialogContent>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="tabs">
                        <Tab label="Main" {...tabProps(0)} />
                        <Tab label="Extra" {...tabProps(1)} />
                    </Tabs>
                </Box>

                <TabPanel value={tabValue} index={0} >
                    <TextField
                        id="taskTitle"
                        label="Task"
                        value={taskTitle}
                        onChange={handleTitleChange}
                        variant="standard"
                        autoFocus
                        fullWidth
                        error={taskTitle.length === 0}
                        helperText="Task must have a name"
                    />

                    <Stack direction={'row'} justifyContent={'space-between'} gap={2} marginTop={"0.5rem"}>
                        <FormControl sx={{ flexGrow: 1 }}>
                            <InputLabel id="listSelectorLabel">List</InputLabel>
                            <Select
                                labelId="listSelectorLabel"
                                id="listSelector"
                                value={listId}
                                onChange={handleListChange}
                                autoWidth
                                label="List"
                                disabled={data != null}
                            >
                                <MenuItem key={DEFAULT_LIST_VALUE} value={DEFAULT_LIST_VALUE} disabled>Choose your list</MenuItem>
                                {lists.map((list: List, _: number) => (
                                    <MenuItem key={list.id} value={list.id}>{list.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {data && <Tooltip title="Move task to another list">
                            <IconButton id="move-task-button" aria-controls="move-task-menu" aria-haspopup="true" aria-expanded={moveTaskMenuOpen ? 'true' : undefined} onClick={handleMoveTaskMenuClick}>
                                <DriveFileMove />
                            </IconButton>
                        </Tooltip>}

                        {data && <Menu
                            id="move-task-menu"
                            anchorEl={moveMenuAnchorEl}
                            open={moveTaskMenuOpen}
                            onClose={handleMoveTaskMenuClose}
                            MenuListProps={{
                                'aria-labelledby': 'move-task-button',
                            }}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                        >
                            {lists.filter((list, _, __) => list.id != data.listId).length == 0 && <MenuItem disabled value={NO_LIST_VALUE}>
                                {NO_LIST_TEXT}
                            </MenuItem>}

                            {lists.map((list: List, _: number) => {
                                if (list.id != data.listId) {
                                    return <MenuItem key={list.id} value={list.id} onClick={handleMoveTask(list.id)}>
                                        {list.name}
                                    </MenuItem>
                                }
                            })}
                        </Menu>}

                        <Box sx={{ display: 'flex', flexDirection: "column" }}>
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

                    <TaskTagsAutocomplete authData={authData} listId={currentListId} tags={tagsSelected} freeSolo={true} onTagsSelect={setTagsSelected} />
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
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
                            <FormControlLabel control={<Switch checked={plannedStartActive} value={plannedStartActive} onChange={handlePlannedStartActiveChange} />} label="Include start date" />
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
                            <FormControlLabel control={<Switch checked={plannedEndActive} value={plannedEndActive} onChange={handlePlannedEndActiveChange} />} label="Include end date" />
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
                </TabPanel>
            </DialogContent>

            <DialogActions>
                {data && <Button color="error" onClick={handleDeleteTask}>
                    Delete
                </Button>}

                <div style={{ flex: '1 0 0' }} />

                <Button onClick={handleDialogClose}>
                    Cancel
                </Button>

                <Button variant="contained" onClick={handleCreateTask}>
                    {data ? "Edit Task" : "Create Task"}
                </Button>
            </DialogActions>
        </Dialog >
    )
}