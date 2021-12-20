import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { Task } from '../../interfaces/task/Task';
import { createTask, fetchTasks, reorderList } from '../../adapters/task/task';

export interface TaskState {
    tasks: Array<Task>
    status: 'idle' | 'loading' | 'succeeded' | 'failed',
    error: string | null
}

const initialState: TaskState = {
    tasks: [],
    status: "idle",
    error: null
}

export const addTask = createAsyncThunk("task/create", async (task: Task) => {
    const response = await createTask(task)
    return response
})

export const retrieveTasks = createAsyncThunk("task/fetch", async (list_id: string) => {
    const response = await fetchTasks(list_id)
    return response
})

export const reorderTasks = createAsyncThunk("task/reorder", async (taskList: Array<Task>) => {
    const response = await reorderList(taskList)
    return response
})

export const taskSlice = createSlice({
    name: 'task',
    initialState: initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(addTask.pending, (state, action) => {
            state.status = "loading"
        })

        builder.addCase(addTask.fulfilled, (state, action) => {
            state.status = "succeeded"
            if (action.payload.success) {
                state.tasks.push(action.payload.data.task)
            }
        })

        builder.addCase(retrieveTasks.fulfilled, (state, action) => {
            if (action.payload.success) {
                state.tasks = action.payload.data.tasks.sort((a: Task, b: Task) => a.list_order - b.list_order)
            }
        })

        builder.addCase(reorderTasks.pending, (state, action) => {
            state.status = "loading"
            state.tasks = action.meta.arg.sort((a: Task, b: Task) => a.list_order - b.list_order)
        })
        
        builder.addCase(reorderTasks.fulfilled, (state, action) => {
            state.status = "succeeded"
            if (action.payload.success) {
                state.tasks = action.payload.data.tasks.sort((a: Task, b: Task) => a.list_order - b.list_order)
            }
        })
    }
})

export const selectTasks = (state: RootState) => state.task.tasks
export const selectTaskStatus = (state: RootState) => state.task.status

export default taskSlice.reducer