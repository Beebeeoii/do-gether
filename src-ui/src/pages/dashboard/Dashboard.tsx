import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { NavBar } from "../../components/nav/NavBar"
import { selectTasks, retrieveTasks, addTask, selectTaskStatus, reorderTasks } from "../../services/task/taskSplice";
import { DragDropContext, Draggable, DraggingStyle, Droppable, DropResult, NotDraggingStyle } from 'react-beautiful-dnd';
import "./Dashboard.css"
import { Task, TaskData } from "../../interfaces/task/Task";
import { UserRequest } from "../../interfaces/user/UserRequest";
import { Card, Divider, Fab, FormControl, IconButton, InputLabel, ListItemText, MenuItem, Select, SelectChangeEvent, Stack, Tooltip, Typography } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/Archive';
import AddIcon from '@mui/icons-material/Add';
import { AddTask } from "@mui/icons-material";
import { TaskDialog } from "../../components/taskDialog/TaskDialog";
import { addList, retrieveAllLists, selectLists, selectListStatus } from "../../services/list/listSplice";
import { List, ListData } from "../../interfaces/list/List";
import { RetrieveListByUserIdResponse } from "../../interfaces/list/ListResponses";
import { NewListDialog } from "../../components/newListDialog/NewListDialog";
import { retrieveUserInfo, selectUser, selectUserStatus } from "../../services/user/userSplice";
import { selectId, selectToken } from "../../services/auth/authSplice";
import { AuthData } from "../../interfaces/auth/Auth";
import { CreateListRequest, RetrieveListsByUserIdRequest } from "../../interfaces/list/ListRequest";
import { CreateTaskRequest, RetrieveTasksByListIdRequest } from "../../interfaces/task/TaskRequest";

const grid = 8

const getListStyle = (isDraggingOver: boolean) => ({
    background: isDraggingOver ? "lightblue" : "lightgrey",
    padding: grid,
    width: 250
});

const reorder = (list: Array<Task>, startIndex: number, endIndex: number) => {
    const result: Array<Task> = []
    list.forEach((task: Task) => result.push(Object.assign({}, task)))

    result[startIndex].listOrder = endIndex

    if (startIndex > endIndex) {
        for (let i = endIndex; i < startIndex; i++) {
            result[i].listOrder += 1
        }
    }

    if (endIndex > startIndex) {
        for (let i = startIndex + 1; i < endIndex + 1; i++) {
            result[i].listOrder -= 1
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
    const authId = useAppSelector(selectId)
    const authToken = useAppSelector(selectToken)

    const authData: AuthData = {
        id: authId!,
        token: authToken!
    }

    const userStatus = useAppSelector(selectUserStatus)
    const user = useAppSelector(selectUser)
    useEffect(() => {
        if (userStatus === "idle") {
            let userRequest: UserRequest = {
                authData: authData,
                userId: authId!
            }

            dispatch(retrieveUserInfo(userRequest))
        }
    }, [userStatus, dispatch])

    const listStatus = useAppSelector(selectListStatus)
    const lists = useAppSelector(selectLists)
    const [selectedList, setSelectedList] = useState<List>(DEFAULT_LIST)
    useEffect(() => {
        if (listStatus === "idle") {
            let listRequest: RetrieveListsByUserIdRequest = {
                authData: authData,
                userId: authId!
            }

            dispatch(retrieveAllLists(listRequest)).then((value) => {
                let payload: RetrieveListByUserIdResponse = value.payload as RetrieveListByUserIdResponse
                let mainList = payload.data.filter((value: List, _: number, __: List[]) => {
                    return value.name === "main"
                })
                setSelectedList(mainList[0])

                if (taskStatus === "idle") {
                    let taskRequest: RetrieveTasksByListIdRequest = {
                        authData: authData,
                        listId: mainList[0].id
                    }
        
                    dispatch(retrieveTasks(taskRequest))
                }
            })
        }
    }, [listStatus, dispatch])
    const handleListChange = (event: SelectChangeEvent) => {
        if (event.target.value === CREATE_LIST) {
            return
        }

        let selected = lists.filter((value: List, _: number, __: List[]) => {
            return value.id === event.target.value
        })
        setSelectedList(selected[0])
        let taskRequest: RetrieveTasksByListIdRequest = {
            authData: authData,
            listId: selected[0].id
        }
        dispatch(retrieveTasks(taskRequest))
    }
    const [newListDialogOpen, setNewListDialogOpen] = useState<boolean>(false)
    const handleNewListDialogOpen = () => {
        setNewListDialogOpen(true)
    }
    const handleNewListDialogClose = (newList: ListData | null) => {
        setNewListDialogOpen(false)

        if (newList) {
            let listRequest: CreateListRequest = {
                authData: authData,
                name: newList.name,
                owner: authId!,
                private: newList.private 
            }

            dispatch(addList(listRequest))
        }
    }

    const taskStatus = useAppSelector(selectTaskStatus)
    const tasks = useAppSelector(selectTasks)
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)
    // useEffect(() => {
    //     if (taskStatus === "idle") {
    //         let taskRequest: RetrieveTasksByListIdRequest = {
    //             authData: authData,
    //             listId: selectedList.id
    //         }

    //         dispatch(retrieveTasks(taskRequest))
    //     }
    // }, [taskStatus, dispatch])
    const handleEditTask = (task: Task) => {
        return () => {
            setSelectedTask(task)
            setTaskDialogOpen(true)
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
        setSelectedTask(null)
        setTaskDialogOpen(true)
    }
    const handleTaskDialogClose = (newTask: TaskData | null) => {
        setTaskDialogOpen(false)

        if (newTask) {
            console.log(newTask)
            let createTaskRequest: CreateTaskRequest = {
                authData: authData,
                owner: user!.id,
                title: newTask.title,
                tags: newTask.tags,
                listId: newTask.listId,
                priority: newTask.priority,
                due: newTask.due,
                plannedStart: newTask.plannedStart,
                plannedEnd: newTask.plannedEnd
            }
            dispatch(addTask(createTaskRequest))
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
                        <Divider />
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
                                                    <IconButton aria-label="edit" onClick={handleEditTask(item)}>
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
            {taskDialogOpen && <TaskDialog open={taskDialogOpen} data={selectedTask} onClose={handleTaskDialogClose} />}
        </div>
    )
}