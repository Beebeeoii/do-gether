import { Box, Card, Checkbox, Chip, Container, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { AuthData } from "../../interfaces/auth/Auth";
import EditIcon from '@mui/icons-material/Edit';
import { DragDropContext, Draggable, DraggingStyle, Droppable, DropResult, NotDraggingStyle } from "react-beautiful-dnd";
import { Task } from "../../interfaces/task/Task";
import { editTaskCompleted, reorderTasks, retrieveTasks, selectTasks } from "../../services/task/taskSplice";
import { EditTaskCompletedRequest, ReorderTasksRequest, RetrieveTasksByListIdRequest } from "../../interfaces/task/TaskRequest";
import { TaskDialog } from "../taskDialog/TaskDialog";
import MutitaskingIllustration from '../../assets/illustrations/illustration-multitasking.svg'

export interface TaskBoardProps {
    authData: AuthData,
    listId: string,
    filterTags: Array<string>
    isCompleted: boolean
}

const grid = 8

const getBoardStyle = (isDraggingOver: boolean) => ({
    background: "white",
    padding: 0,
    marginTop: "1rem"
} as React.CSSProperties)

const getTaskItemStyle = (isDragging: boolean, draggableStyle: DraggingStyle | NotDraggingStyle | undefined) => ({
    userSelect: "none",
    padding: grid * 2,
    margin: `0 0 ${grid * 2}px 0`,
    background: isDragging ? "lightgreen" : "lightgrey",
    ...draggableStyle
} as React.CSSProperties)

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
}

const priorityLevelColours: { [index: number]: string | null } = {
    [-1]: "lightgrey",
    1: 'green',
    2: 'yellow',
    3: 'red'
}

export function TaskBoard(props: TaskBoardProps) {
    const dispatch = useAppDispatch()
    const { authData, listId, filterTags, isCompleted } = props

    const tasks = useAppSelector(selectTasks)

    useEffect(() => {
        let taskRequest: RetrieveTasksByListIdRequest = {
            authData: authData,
            listId: listId
        }
        dispatch(retrieveTasks(taskRequest))
    }, [listId, dispatch])

    const [selectedTask, setSelectedTask] = useState<Task | null>(null)
    const handleEditTask = (task: Task) => {
        return () => {
            setSelectedTask(task)
            setEditTaskDialogOpen(true)
        }
    }

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) {
            return
        }

        let taskRequest: ReorderTasksRequest = {
            authData: authData,
            id: tasks[result.source.index].id,
            listId: listId,
            newTaskOrder: result.destination.index,
            updatedListOrder: reorder(
                tasks,
                result.source.index,
                result.destination.index
            )
        }

        dispatch(reorderTasks(taskRequest))
    }

    const [editTaskDialogOpen, setEditTaskDialogOpen] = useState<boolean>(false)

    const handleEditTaskDialogClose = () => {
        setSelectedTask(null)
        setEditTaskDialogOpen(false)
    }

    const handleCompletedChange = (taskId: string, initialOrder: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
        let taskRequest: EditTaskCompletedRequest = {
            authData: authData,
            id: taskId,
            listId: listId,
            completed: event.target.checked
        }

        dispatch(editTaskCompleted(taskRequest)).then(value => {
            let taskRequest: ReorderTasksRequest
            if (!value.payload.data.completed) {
                taskRequest = {
                    authData: authData,
                    id: tasks[initialOrder].id,
                    listId: listId,
                    newTaskOrder: tasks.filter((task, _, __) => !task.completed).length,
                    updatedListOrder: reorder(
                        tasks,
                        initialOrder,
                        tasks.filter((task, _, __) => !task.completed).length
                    )
                }
            } else {
                taskRequest = {
                    authData: authData,
                    id: tasks[initialOrder].id,
                    listId: listId,
                    newTaskOrder: tasks.length - 1,
                    updatedListOrder: reorder(
                        tasks,
                        initialOrder,
                        tasks.length - 1
                    )
                }
            }

            dispatch(reorderTasks(taskRequest))
        })
    };

    return (
        <Box sx={{ padding: 0 }}>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable">
                    {(provided, snapshot) => (
                        <Container
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            style={getBoardStyle(snapshot.isDraggingOver)}
                            className="tasksContainer"
                        >
                            {tasks.map((item, index) => {
                                if (item.completed == isCompleted && (filterTags.length == 0 || filterTags.every((tag, _, __) => item.tags.includes(tag)))) {
                                    return <Draggable key={item.id} draggableId={item.id} index={index} isDragDisabled={filterTags.length != 0 || isCompleted}>
                                        {(provided, snapshot) => (
                                            <Card
                                                sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignContent: 'center', position: 'relative' }}
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                style={getTaskItemStyle(
                                                    snapshot.isDragging,
                                                    provided.draggableProps.style
                                                )}
                                            >
                                                {item.priority != -1 && <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, backgroundColor: priorityLevelColours[item.priority], width: '4px' }} />}
                                                <Stack direction={"column"} gap={2}>
                                                    <Typography variant="subtitle1" component="div">
                                                        {item.title}
                                                    </Typography>

                                                    <Stack direction={"row"} gap={1}>
                                                        {item.tags.map((tag, index) => (
                                                            <Chip key={index} label={tag} color="primary" variant="outlined" />
                                                        ))}
                                                    </Stack>
                                                </Stack>

                                                <div className="menu">
                                                    <Tooltip title="Edit">
                                                        <IconButton aria-label="edit" onClick={handleEditTask(item)}>
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>

                                                    <Checkbox checked={item.completed} onChange={handleCompletedChange(item.id, item.listOrder)} />
                                                </div>
                                            </Card>
                                        )}
                                    </Draggable>
                                }
                            })}

                            {tasks.findIndex((item, _) => item.completed == isCompleted && (filterTags.length == 0 || filterTags.every((tag, _, __) => item.tags.includes(tag)))) == -1 && <Box sx={{ display: "flex", justifyContent: "center" }}>
                                <img src={MutitaskingIllustration} width={"100%"} style={{ maxWidth: "600px" }} />
                            </Box>}
                            {provided.placeholder}
                        </Container>
                    )}
                </Droppable>
            </DragDropContext>


            {selectedTask && <TaskDialog open={editTaskDialogOpen} data={selectedTask} authData={authData} currentListId={listId} onClose={handleEditTaskDialogClose} />}
        </Box>
    )
}