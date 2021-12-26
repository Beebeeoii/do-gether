import { TaskState } from './../services/task/taskSplice';
import { AuthState } from './../services/auth/authSplice';
import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import authReducer from '../services/auth/authSplice';
import taskReducer from '../services/task/taskSplice';
import tagReducer from '../services/task/tagSplice';
import userReducer from '../services/user/userSplice';
import listReducer from '../services/list/listSplice';

interface StoreState {
    auth: AuthState,
    task: TaskState
}

interface AuthStateToStore {
    authenticated: boolean
    id: string | null
    token: string | null
}

const saveToLocalStorage = (state: StoreState) => {
    try {
        let authStateToStore: AuthStateToStore = {
            authenticated: state.auth.authenticated,
            id: state.auth.id,
            token: state.auth.token
        }
        localStorage.setItem('auth', JSON.stringify(authStateToStore))
    } catch (e) {
        console.error(e)
    }
}

const loadFromLocalStorage = () => {
    try {
        const authStateStr = localStorage.getItem('auth')

        return {
            auth: authStateStr ? JSON.parse(authStateStr) : undefined
        }
    } catch (e) {
        console.error(e)
        return undefined
    }
}

export const store = configureStore({
    reducer: {
        auth: authReducer,
        task: taskReducer,
        user: userReducer,
        list: listReducer,
        tag: tagReducer
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
