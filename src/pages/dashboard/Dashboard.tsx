import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { NavBar } from "../../components/nav/NavBar"
import { getTasks, reorderTasks, retrieveTasks } from "../../services/task/taskSplice";
import { DragDropContext, Draggable, DraggingStyle, Droppable, DropResult, NotDraggingStyle } from 'react-beautiful-dnd';
import "./Dashboard.css"
import { Task } from "../../interfaces/task/Task";
import { Card, IconButton, Input, TextField, Typography } from "@mui/material";
import { Box } from "@mui/system";
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/Archive';

const grid = 8;

const getListStyle = (isDraggingOver: boolean) => ({
    background: isDraggingOver ? "lightblue" : "lightgrey",
    padding: grid,
    width: 250
});

const reorder = (list: Array<Task>, startIndex: number, endIndex: number) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
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

export function Dashboard() {
    const dispatch = useAppDispatch()
    const [dataLoadState, setDataLoadState] = useState<boolean>(false)
    // const [tasks, setTasks] = useState<Array<Task>>([])


    useEffect(() => {
        if (!dataLoadState) {
            dispatch(retrieveTasks("beebeeoii"))
            setDataLoadState(true)
        }
    }, [dataLoadState, dispatch])

    let tasks = useAppSelector(getTasks)

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
        
        // tasks = useAppSelector(getTasks)
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
                                <Draggable key={item.title} draggableId={item.title} index={index}>
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
        </div>
    )
}