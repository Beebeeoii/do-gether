import { TaskState } from './../services/task/taskSplice';
import { AuthState } from './../services/auth/authSplice';
import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
// import counterReducer from '../features/counter/counterSlice';
import authReducer from '../services/auth/authSplice';
import taskReducer from '../services/task/taskSplice';

interface StoreState {
    auth: AuthState,
    task: TaskState
}

const saveToLocalStorage = (state: StoreState) => {
    try {
        localStorage.setItem('auth', JSON.stringify(state.auth))
    } catch (e) {
        console.error(e)
    }
}

const loadFromLocalStorage = () => {
    try {
        const authStateStr = localStorage.getItem('auth')
        // const taskStateStr = localStorage.getItem('task')

        return {
            auth: authStateStr ? JSON.parse(authStateStr) : undefined,
            task: undefined
        }
    } catch (e) {
        console.error(e)
        return undefined
    }
}

export const store = configureStore({
    reducer: {
        auth: authReducer,
        task: taskReducer
    },
    preloadedState: loadFromLocalStorage()
})

store.subscribe(() => {
    saveToLocalStorage(store.getState())
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>
