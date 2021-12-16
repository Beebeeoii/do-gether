import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { authenticate, createUser } from '../../adapters/auth/auth';
import { Credentials } from '../../interfaces/auth/Credentials';

export interface AuthState {
    authenticated: boolean
    username: string
}

const initialState: AuthState = {
    authenticated: false,
    username: "guest"
}

export const register = createAsyncThunk("auth/register", async (credentials: Credentials) => {
    const response = await createUser(credentials.username, credentials.password)
    return response
})

export const login = createAsyncThunk("auth/authenticate", async (credentials: Credentials) => {
    const response = await authenticate(credentials.username, credentials.password)
    return response
})

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state: AuthState) => {
            state.authenticated = false
            state.username = "guest"
        }
    },
    extraReducers: (builder) => {
        builder.addCase(register.fulfilled, (state, action) => {
            if (action.payload.success) {
                state.authenticated = action.payload.data.authenticated
                state.username = action.payload.data.username
            }
        })
        builder.addCase(login.fulfilled, (state, action) => {
            if (action.payload.success) {
                state.authenticated = action.payload.data.authenticated
                state.username = action.payload.data.username
            }
        })
    }
})

export const { logout } = authSlice.actions

export const selectUser = (state: RootState) => state.auth.username
export const isAuthenticated = (state: RootState) => state.auth.authenticated

export default authSlice.reducer