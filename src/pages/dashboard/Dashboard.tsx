import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { NavBar } from "../../components/nav/NavBar"
import { selectTasks, retrieveTasks, addTask, selectTaskStatus, reorderTasks } from "../../services/task/taskSplice";
import { DragDropContext, Draggable, DraggingStyle, Droppable, DropResult, NotDraggingStyle } from 'react-beautiful-dnd';
import "./Dashboard.css"
import { Task, TaskData } from "../../interfaces/task/Task";
import { Button, Card, Divider, Fab, FormControl, IconButton, Input, InputLabel, ListItemText, MenuItem, Select, SelectChangeEvent, SpeedDial, SpeedDialAction, SpeedDialIcon, Stack, TextField, Tooltip, Typography } from "@mui/material";
import { Box } from "@mui/system";
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/Archive';
import AddIcon from '@mui/icons-material/Add';
import { AddTask } from "@mui/icons-material";
import { TaskDialog } from "../../components/taskDialog/TaskDialog";
import { addList, retrieveAllLists, selectLists, selectListStatus } from "../../services/list/listSplice";
import { List, ListData } from "../../interfaces/list/List";
import { PayloadAction } from "@reduxjs/toolkit";
import { RetrieveListByUserIdResponse } from "../../interfaces/list/ListResponses";
import { NewListDialog } from "../../components/newListDialog/NewListDialog";

const grid = 8

const getListStyle = (isDraggingOver: boolean) => ({
    background: isDraggingOver ? "lightblue" : "lightgrey",
    padding: grid,
    width: 250
});

const reorder = (list: Array<Task>, startIndex: number, endIndex: number) => {
    const result: Array<Task> = []
    list.forEach((task: Task) => result.push(Object.assign({}, task)))

    result[startIndex].list_order = endIndex

    if (startIndex > endIndex) {
        for (let i = endIndex; i < startIndex; i++) {
            result[i].list_order += 1
        }
    }

    if (endIndex > startIndex) {
        for (let i = startIndex + 1; i < endIndex + 1; i++) {
            result[i].list_order -= 1
        }
    }

    return result
};

const getItemStyle = (isDragging: boolean, draggableStyle: DraggingStyle | NotDraggingStyle | undefined) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: "none",
    padding: grid * 2,
    margin: `0 0 ${grid}px 0`,

    // change background colour if dragging
    background: isDragging ? "lightgreen" : "grey",

    // styles we need to apply on draggables
    ...draggableStyle
} as React.CSSProperties)

const DEFAULT_LIST: List = {
    id: "",
    name: "",
    owner: "",
    private: true
}

const CREATE_LIST = "New List"

export function Dashboard() {
    const dispatch = useAppDispatch()

    const taskStatus = useAppSelector(selectTaskStatus)
    const tasks = useAppSelector(selectTasks)
    useEffect(() => {
        if (taskStatus === "idle") {
            dispatch(retrieveTasks("beebeeoii"))
        }
    }, [taskStatus, dispatch])

    const listStatus = useAppSelector(selectListStatus)
    const lists = useAppSelector(selectLists)
    const [selectedList, setSelectedList] = useState<List>(DEFAULT_LIST)
    useEffect(() => {
        if (listStatus === "idle") {
            dispatch(retrieveAllLists("beebeeoii")).then((value) => {
                let payload: RetrieveListByUserIdResponse = value.payload as RetrieveListByUserIdResponse
                let mainList = payload.data.lists.filter((value: List, _: number, __: List[]) => {
                    return value.name === "main"
                })
                setSelectedList(mainList[0])
            })
        }
    }, [listStatus, dispatch])
    const handleListChange = (event: SelectChangeEvent) => {
        if (event.target.value === CREATE_LIST) {
            console.log(CREATE_LIST)
            return
        }

        let selected = lists.filter((value: List, _: number, __: List[]) => {
            return value.id === event.target.value
        })
        setSelectedList(selected[0])
    }
    const [newListDialogOpen, setNewListDialogOpen] = useState<boolean>(false)
    const handleNewListDialogOpen = () => {
        setNewListDialogOpen(true)
    }
    const handleNewListDialogClose = (newList: ListData | null) => {
        setNewListDialogOpen(false)

        if (newList) {
            console.log(newList as List)
            dispatch(addList(newList as List))
        }
    }

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) {
            return
        }

        dispatch(reorderTasks(reorder(
            tasks,
            result.source.index,
            result.destination.index
        )))
    }

    const [taskDialogOpen, setTaskDialogOpen] = useState<boolean>(false)
    const handleTaskDialogOpen = () => {
        setTaskDialogOpen(true)
    }
    const handleTaskDialogClose = (newTask: TaskData | null) => {
        setTaskDialogOpen(false)

        if (newTask) {
            console.log(newTask)
            dispatch(addTask(newTask as Task))
        }
    }

    return (
        <div className="dashboard">
            <NavBar />

            <Stack direction="row" justifyContent="space-between">
                {listStatus !== "idle" && <FormControl sx={{ m: 1, width: 300 }}>
                    <InputLabel id="list-select-label">List</InputLabel>
                    <Select
                        labelId="list-select-label"
                        id="list-select"
                        value={selectedList.id}
                        label="List"
                        onChange={handleListChange}
                    >
                        {lists.map((list: List, _: number) => (
                            <MenuItem key={list.id} value={list.id}>{list.name}</MenuItem>
                        ))}
                        <Divider/>
                        <MenuItem key={CREATE_LIST} value={CREATE_LIST} onClick={handleNewListDialogOpen}>
                            <AddIcon />
                            <ListItemText primary={CREATE_LIST} />
                        </MenuItem>
                    </Select>
                </FormControl>}

                <Fab color="primary" aria-label="addTask" onClick={handleTaskDialogOpen} variant="extended">
                    <AddTask sx={{ mr: 1 }} />
                    Add task
                </Fab>
            </Stack>

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable">
                    {(provided, snapshot) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            style={getListStyle(snapshot.isDraggingOver)}
                            className="tasksContainer"
                        >
                            {tasks.map((item, index) => (
                                <Draggable key={item.id} draggableId={item.id} index={index}>
                                    {(provided, snapshot) => (
                                        <Card
                                            sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            style={getItemStyle(
                                                snapshot.isDragging,
                                                provided.draggableProps.style
                                            )}
                                        >
                                            <Typography variant="subtitle1" component="div">
                                                {item.title}
                                            </Typography>

                                            <div className="menu">
                                                <Tooltip title="Edit">
                                                    <IconButton aria-label="edit">
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Move to Backlog">
                                                    <IconButton aria-label="archive" >
                                                        <ArchiveIcon />
                                                    </IconButton>
                                                </Tooltip>

                                            </div>
                                        </Card>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            <NewListDialog open={newListDialogOpen} onClose={handleNewListDialogClose} />
            <TaskDialog open={taskDialogOpen} onClose={handleTaskDialogClose} />
        </div>
    )
}