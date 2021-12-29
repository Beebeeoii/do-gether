import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { NavBar } from "../../components/nav/NavBar"
import { selectTasks, retrieveTasks, addTask, selectTaskStatus, reorderTasks } from "../../services/task/taskSplice";
import { DragDropContext, Draggable, DraggingStyle, Droppable, DropResult, NotDraggingStyle } from 'react-beautiful-dnd';
import "./Dashboard.css"
import { Task, TaskData } from "../../interfaces/task/Task";
import { UserRequest } from "../../interfaces/user/UserRequest";
import { Card, Fab, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/Archive';
import { AddTask } from "@mui/icons-material";
import { TaskDialog } from "../../components/taskDialog/TaskDialog";
import { List } from "../../interfaces/list/List";
import { retrieveUserInfo, selectUser, selectUserStatus } from "../../services/user/userSplice";
import { selectId, selectToken } from "../../services/auth/authSplice";
import { AuthData } from "../../interfaces/auth/Auth";
import { CreateTaskRequest, ReorderTasksRequest, RetrieveTasksByListIdRequest } from "../../interfaces/task/TaskRequest";
import { ListSelect } from "../../components/listSelect/ListSelect";

const grid = 8

const getListStyle = (isDraggingOver: boolean) => ({
    background: "white",
    padding: grid,
    width: 250
});

const reorder = (list: Array<Task>, startIndex: number, endIndex: number) => {
    const result: Array<Task> = []
    for (let index in list) {
        result.push({
            ...list[index],
            listOrder: Number(index)
        })
    }

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
    margin: `0 0 ${grid * 2}px 0`,

    // change background colour if dragging
    background: isDragging ? "lightgreen" : "lightgrey",

    // styles we need to apply on draggables
    ...draggableStyle
} as React.CSSProperties)

const DEFAULT_LIST: List = {
    id: "",
    name: "",
    owner: "",
    private: true
}

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


    const [selectedList, setSelectedList] = useState<List>(DEFAULT_LIST)

    const handleListChange = (list: List) => {
        let taskRequest: RetrieveTasksByListIdRequest = {
            authData: authData,
            listId: list.id
        }
        setSelectedList(list)
        dispatch(retrieveTasks(taskRequest))
    }

    const taskStatus = useAppSelector(selectTaskStatus)
    const tasks = useAppSelector(selectTasks)
    const [selectedTask, setSelectedTask] = useState<Task | null>(null)
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

        let taskReqeust: ReorderTasksRequest = {
            authData: authData,
            listId: selectedList.id,
            newTaskOrder: reorder(
                tasks,
                result.source.index,
                result.destination.index
            )
        }

        dispatch(reorderTasks(taskReqeust))
    }

    const [taskDialogOpen, setTaskDialogOpen] = useState<boolean>(false)
    const handleTaskDialogOpen = () => {
        setSelectedTask(null)
        setTaskDialogOpen(true)
    }
    const handleTaskDialogClose = (newTask: TaskData | null) => {
        setTaskDialogOpen(false)

        if (newTask) {
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
                <ListSelect authData={authData} userId={authData.id} onSelect={handleListChange}/>
 
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

            {taskDialogOpen && <TaskDialog open={taskDialogOpen} data={selectedTask} authData={authData} currentListId={selectedList.id} onClose={handleTaskDialogClose} />}
        </div>
    )
}