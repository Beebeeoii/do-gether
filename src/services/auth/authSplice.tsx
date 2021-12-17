import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { authenticate, createUser } from '../../adapters/auth/auth';
import { Credentials } from '../../interfaces/auth/Credentials';

export interface AuthState {
    userId: string | null
    authenticated: boolean
    token: string | null
}

const initialState: AuthState = {
    userId: null,
    authenticated: false,
    token: null
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
            state.userId = null
            state.authenticated = false
            state.token = null
        }
    },
    extraReducers: (builder) => {
        builder.addCase(register.fulfilled, (state, action) => {
            if (action.payload.success) {
                state.authenticated = action.payload.data.authenticated
                state.userId = action.payload.data.user.id
            }
        })
        builder.addCase(login.fulfilled, (state, action) => {
            if (action.payload.success && action.payload.data.user) {
                state.authenticated = action.payload.data.authenticated
                state.userId = action.payload.data.user.id
            }
        })
    }
})

export const { logout } = authSlice.actions

export const selectUserId = (state: RootState) => state.auth.userId
export const selectAuthenticated = (state: RootState) => state.auth.authenticated

export default authSlice.reducer