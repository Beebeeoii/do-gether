import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState, AppThunk } from '../../app/store';
import { register, authenticate } from '../../adapters/auth/auth';

export interface AuthState {
    authenticated: boolean
    username: string
}

const initialState: AuthState = {
    authenticated: false,
    username: "guest"
}

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (state: AuthState, action: PayloadAction<string>) => {
            state.authenticated = true
            state.username = action.payload
        },
        logout: (state: AuthState) => {
            state.authenticated = true
            state.username = "guest"
        }
    }
})

export const { login, logout } = authSlice.actions
export const selectUser = (state: RootState) => state.auth.username
export const isAuthenticated = (state: RootState) => state.auth.authenticated
export default authSlice.reducer