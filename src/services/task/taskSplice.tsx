import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { Task } from '../../interfaces/task/Task';
import { createTask, fetchTasks, reorderList } from '../../adapters/task/task';

export interface TaskState {
    tasks: Array<Task>
}

const initialState: TaskState = {
    tasks: []
}

export const addTask = createAsyncThunk("task/create", async (task: Task) => {
    const response = await createTask(task)
    return response
})

export const retrieveTasks = createAsyncThunk("task/fetch", async (username: string) => {
    const response = await fetchTasks(username)
    return response
})

export const reorderTasks = createAsyncThunk("task/reorder", async (taskList: Array<Task>) => {
    console.log('test')
    const response = await reorderList(taskList)
    return response
})

export const taskSlice = createSlice({
    name: 'task',
    initialState: initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(addTask.fulfilled, (state, action) => {
            if (action.payload.success) {
                state.tasks.push(action.payload.data.task)
            }
        })

        builder.addCase(retrieveTasks.fulfilled, (state, action) => {
            if (action.payload.success) {
                state.tasks = action.payload.data.tasks.sort((a: Task, b: Task) => a.listOrder - b.listOrder)
            }
        })

        // TODO requires reworking
        builder.addCase(reorderTasks.pending, (state, action) => {
            for (let i = 0; i < action.meta.arg.length; i++) {
                let index = state.tasks.indexOf(action.meta.arg[i])
                state.tasks[index].listOrder = i
            }
            state.tasks = state.tasks.sort((a: Task, b: Task) => a.listOrder - b.listOrder)
            console.log(state.tasks)
        })
    }
})

export const getTasks = (state: RootState) => state.task.tasks

export default taskSlice.reducer