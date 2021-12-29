import { Card, IconButton, Tooltip, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { AuthData } from "../../interfaces/auth/Auth";
import EditIcon from '@mui/icons-material/Edit';
import { DragDropContext, Draggable, DraggingStyle, Droppable, DropResult, NotDraggingStyle } from "react-beautiful-dnd";
import { Task } from "../../interfaces/task/Task";
import { reorderTasks, retrieveTasks, selectTasks } from "../../services/task/taskSplice";
import { ReorderTasksRequest, RetrieveTasksByListIdRequest } from "../../interfaces/task/TaskRequest";
import { TaskDialog } from "../taskDialog/TaskDialog";

export interface TaskBoardProps {
    authData: AuthData,
    listId: string
}

const grid = 8

const getBoardStyle = (isDraggingOver: boolean) => ({
    background: "white",
    padding: grid,
    width: 250
})

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

export function TaskBoard(props: TaskBoardProps) {
    const dispatch = useAppDispatch()
    const { authData, listId } = props

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

        let taskReqeust: ReorderTasksRequest = {
            authData: authData,
            listId: listId,
            newTaskOrder: reorder(
                tasks,
                result.source.index,
                result.destination.index
            )
        }

        dispatch(reorderTasks(taskReqeust))
    }

    const [editTaskDialogOpen, setEditTaskDialogOpen] = useState<boolean>(false)

    const handleEditTaskDialogClose = () => {
        setSelectedTask(null)
        setEditTaskDialogOpen(false)
    }

    return (
        <div>
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="droppable">
                    {(provided, snapshot) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            style={getBoardStyle(snapshot.isDraggingOver)}
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
                                            style={getTaskItemStyle(
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

            {selectedTask && <TaskDialog open={editTaskDialogOpen} data={selectedTask} authData={authData} currentListId={listId} onClose={handleEditTaskDialogClose} />}
        </div>
    )
}