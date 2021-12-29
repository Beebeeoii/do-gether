import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { Task, TaskReorderData } from '../../interfaces/task/Task';
import { createTask, fetchTasks, reorderList } from '../../adapters/task/task';
import { AxiosError } from 'axios';
import { CreateTaskRequest, ReorderTasksRequest, RetrieveTasksByListIdRequest } from '../../interfaces/task/TaskRequest';

export interface TaskState {
    tasks: Array<Task>
    listId: string | null
    status: 'idle' | 'loading' | 'succeeded' | 'failed'
    error: string | null
}

const initialState: TaskState = {
    tasks: [],
    listId: null,
    status: "idle",
    error: null
}

export const addTask = createAsyncThunk("task/create", async (taskRequest: CreateTaskRequest, { rejectWithValue }) => {
    try {
        const response = await createTask(taskRequest)
        return response.data
    } catch (err) {
        let error = err as AxiosError
        if (!error.response) {
            throw err
        }
        return rejectWithValue(error.response.data)
    }
})

export const retrieveTasks = createAsyncThunk("task/fetch", async (taskRequest: RetrieveTasksByListIdRequest, { rejectWithValue }) => {
    try {
        const response = await fetchTasks(taskRequest.authData, taskRequest.listId)
        return response.data
    } catch (err) {
        let error = err as AxiosError
        if (!error.response) {
            throw err
        }
        return rejectWithValue(error.response.data)
    }
})

export const reorderTasks = createAsyncThunk("task/reorder", async (taskRequest: ReorderTasksRequest, { rejectWithValue }) => {
    try {
        let newTaskOrder: Array<TaskReorderData> = taskRequest.newTaskOrder.map(task => (
            {
                id: task.id,
                listOrder: task.listOrder
            }
        ) as TaskReorderData)
        const response = await reorderList(taskRequest.authData, taskRequest.listId, newTaskOrder)
        return response.data
    } catch (err) {
        let error = err as AxiosError
        if (!error.response) {
            throw err
        }
        return rejectWithValue(error.response.data)
    }
})

export const taskSlice = createSlice({
    name: 'task',
    initialState: initialState,
    reducers: {
        resetTasks: (state) => {
            state.tasks = []
            state.listId = null
            state.status = "idle"
            state.error = null
        }
    },
    extraReducers: (builder) => {
        builder.addCase(addTask.pending, (state, action) => {
            state.status = "loading"
        })

        builder.addCase(addTask.fulfilled, (state, action) => {
            if (action.payload.success && state.listId == action.payload.data.listId) {
                let task: Task = {
                    id: action.payload.data.id,
                    owner: action.payload.data.owner,
                    title: action.payload.data.title,
                    tags: action.payload.data.tags,
                    listId: action.payload.data.listId,
                    listOrder: action.payload.data.listOrder,
                    priority: action.payload.data.priority,
                    due: action.payload.data.due,
                    plannedStart: action.payload.data.plannedStart,
                    plannedEnd: action.payload.data.plannedEnd,
                    completed: action.payload.data.completed
                }
                state.tasks.push(task)
            }
            state.status = "succeeded"
        })

        builder.addCase(retrieveTasks.fulfilled, (state, action) => {
            if (action.payload.success) {
                if (action.payload.data) {
                    state.tasks = action.payload.data.sort((a: Task, b: Task) => a.listOrder - b.listOrder)
                } else {
                    state.tasks = []
                }
                state.listId = action.meta.arg.listId
            }
            state.status = "succeeded"
        })

        builder.addCase(reorderTasks.pending, (state, action) => {
            state.tasks = action.meta.arg.newTaskOrder.sort((a: Task, b: Task) => a.listOrder - b.listOrder)
            state.status = "loading"
        })

        builder.addCase(reorderTasks.fulfilled, (state, action) => {
            if (action.payload.success) {
                state.tasks = action.payload.data.sort((a: Task, b: Task) => a.listOrder - b.listOrder)
            }
            state.status = "succeeded"
        })
    }
})

export const { resetTasks } = taskSlice.actions

export const selectTasks = (state: RootState) => state.task.tasks
export const selectTaskListId = (state: RootState) => state.task.listId
export const selectTaskStatus = (state: RootState) => state.task.status

export default taskSlice.reducer