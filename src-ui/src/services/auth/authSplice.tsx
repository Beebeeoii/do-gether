import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { authenticate, createUser } from '../../adapters/auth/auth';
import { Credentials } from '../../interfaces/auth/Credentials';
import { AxiosError } from 'axios';

export interface AuthState {
    authenticated: boolean
    id: string | null
    token: string | null
    status: 'idle' | 'loading' | 'succeeded' | 'failed',
}

const initialState: AuthState = {
    authenticated: false,
    id: null,
    token: null,
    status: "idle"
}

export const register = createAsyncThunk("auth/register", async (credentials: Credentials, { rejectWithValue }) => {
    try {
        await createUser(credentials.username, credentials.password)
        const loginResponse = await authenticate(credentials.username, credentials.password)
        return loginResponse.data
    } catch (err) {
        let error = err as AxiosError
        if (!error.response) {
            throw err
        }
        return rejectWithValue(error.response.data)
    }
})

export const login = createAsyncThunk("auth/authenticate", async (credentials: Credentials, { rejectWithValue }) => {
    try {
        const response = await authenticate(credentials.username, credentials.password)
        return response.data
    } catch (err) {
        let error = err as AxiosError
        if (!error.response) {
            throw err
        }
        return rejectWithValue(error.response.data)
    }
})

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state: AuthState) => {
            state.authenticated = false
            state.id = null
            state.token = null
        }
    },
    extraReducers: (builder) => {
        builder.addCase(register.fulfilled, (state, action) => {
            if (action.payload.success) {
                state.status = "succeeded"
                state.authenticated = true
                state.id = action.payload.data.id
                state.token = action.payload.data.token
            }
        })

        builder.addCase(login.fulfilled, (state, action) => {
            if (action.payload.success && action.payload.data.token) {
                state.status = "succeeded"
                state.authenticated = true
                state.id = action.payload.data.id
                state.token = action.payload.data.token
            }
        })
    }
})

export const { logout } = authSlice.actions

export const selectAuthenticated = (state: RootState) => state.auth.authenticated
export const selectId = (state: RootState) => state.auth.id
export const selectToken = (state: RootState) => state.auth.token

export default authSlice.reducer