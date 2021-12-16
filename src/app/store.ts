import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
// import counterReducer from '../features/counter/counterSlice';
import authReducer from '../services/auth/authSplice';

const saveToLocalStorage = (state: object) => {
    try {
        localStorage.setItem('state', JSON.stringify(state))
    } catch (e) {
        console.error(e)
    }
}

const loadFromLocalStorage = () => {
    try {
        const stateStr = localStorage.getItem('state')
        return stateStr ? JSON.parse(stateStr) : undefined
    } catch (e) {
        console.error(e)
        return undefined
    }
}

export const store = configureStore({
    reducer: {
        auth: authReducer
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
