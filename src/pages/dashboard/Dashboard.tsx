import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { NavBar } from "../../components/nav/NavBar"
import { selectTasks, retrieveTasks, addTask, selectTaskStatus, reorderTasks } from "../../services/task/taskSplice";
import { DragDropContext, Draggable, DraggingStyle, Droppable, DropResult, NotDraggingStyle } from 'react-beautiful-dnd';
import "./Dashboard.css"
import { Task } from "../../interfaces/task/Task";
import { Card, IconButton, Input, SpeedDial, SpeedDialAction, SpeedDialIcon, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/Archive';
import { AddTask, AddToQueue, Archive } from "@mui/icons-material";

const grid = 8;

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
            console.log("1")
            result[i].list_order += 1
        }
    }

    if (endIndex > startIndex) {
        for (let i = startIndex + 1; i < endIndex + 1; i++) {
            console.log("2")
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
} as React.CSSProperties);

const fabActions = [
    { icon: <AddTask />, name: 'New Task' },
    { icon: <Archive />, name: 'New Backlog Task' }
];

export function Dashboard() {
    const dispatch = useAppDispatch()
    const [dataLoadState, setDataLoadState] = useState<boolean>(false)

    const addNewTask = (type: string) => {
        return () => dispatch(addTask({
            id: "asdjgt1",
            title: "CVWO Assignment",
            tags: ["CVWO", "Programming"],
            list_name: "main",
            priority: "high",
            list_order: 1,
            due: Date.now(),
            completed: false,
            planned_start: Date.now(),
            planned_end: Date.now(),
            owner: "beebeeoii",
            private: true
        }))
    }

    // const [tasks, setTasks] = useState<Array<Task>>([])
    const taskStatus = useAppSelector(selectTaskStatus)


    useEffect(() => {
        if (taskStatus === "idle") {
            dispatch(retrieveTasks("beebeeoii"))
            setDataLoadState(true)
        }
    }, [taskStatus, dispatch])

    const tasks = useAppSelector(selectTasks)

    const onDragEnd = (result: DropResult) => {
        // dropped outside the list
        if (!result.destination) {
            return;
        }

        dispatch(reorderTasks(reorder(
            tasks,
            result.source.index,
            result.destination.index
        )))
    }

    return (
        <div className="dashboard">
            <NavBar />

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
                                                <IconButton aria-label="edit">
                                                    <EditIcon />
                                                </IconButton>

                                                <IconButton aria-label="archive">
                                                    <ArchiveIcon />
                                                </IconButton>
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

            <SpeedDial
                ariaLabel="Create a task"
                sx={{ position: 'absolute', bottom: 32, right: 32 }}
                icon={<SpeedDialIcon />}
            >
                {fabActions.map((action) => (
                    <SpeedDialAction
                        key={action.name}
                        icon={action.icon}
                        tooltipTitle={action.name}
                        onClick={addNewTask(action.name)}
                    />
                ))}
            </SpeedDial>
        </div>
    )
}