import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { User } from '../../interfaces/user/User';
import { UserRequest } from '../../interfaces/user/UserRequest';
import { fetchUserInfo } from '../../adapters/user/user';
import { AxiosError } from 'axios';

export interface UserState {
    user: User | null
    status: 'idle' | 'loading' | 'succeeded' | 'failed',
    error: string | null
}

const initialState: UserState = {
    user: null,
    status: 'idle',
    error: null
}

export const retrieveUserInfo = createAsyncThunk("user/retrieve", async (userRequest: UserRequest, { rejectWithValue }) => {
    try {
        const response = await fetchUserInfo(userRequest.authData, userRequest.userId)
        return response.data
    } catch (err) {
        let error = err as AxiosError
        if (!error.response) {
            throw err
        }
        return rejectWithValue(error.response.data)
    }

})

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        resetUsers: (state) => {
            state.user = null
            state.status = "idle"
            state.error = null
        }
    },
    extraReducers: (builder) => {
        builder.addCase(retrieveUserInfo.fulfilled, (state, action) => {
            if (action.payload.success) {
                state.status = "succeeded"
                state.user = {
                    id: action.payload.data.id,
                    username: action.payload.data.username,
                    friends: action.payload.data.friends,
                    outgoing_requests: action.payload.data.outgoing_requests,
                    incoming_requests: action.payload.data.incoming_requests
                }
            }
        })
    }
})

export const { resetUsers } = userSlice.actions

export const selectUser = (state: RootState) => state.user.user
export const selectUserStatus = (state: RootState) => state.user.status

export default userSlice.reducer