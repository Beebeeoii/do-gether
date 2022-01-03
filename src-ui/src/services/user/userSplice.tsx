import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { User } from '../../interfaces/user/User';
import { FriendReqRequest, RetrieveByUsernameRequest, UserRequest } from '../../interfaces/user/UserRequest';
import { acceptIncomingFriendRequest, deleteFriend, deleteFriendRequest, fetchUserByUsername, fetchUserInfo, sendOutgoingFriendRequest } from '../../adapters/user/user';
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

export const retrieveUserByUsername = createAsyncThunk("user/retrieveByUsername", async (userRequest: RetrieveByUsernameRequest, { rejectWithValue }) => {
    try {
        const response = await fetchUserByUsername(userRequest.authData, userRequest.username)
        return response.data
    } catch (err) {
        let error = err as AxiosError
        if (!error.response) {
            throw err
        }
        return rejectWithValue(error.response.data)
    }
})

export const sendFriendRequest = createAsyncThunk("user/sendFriendRequest", async (friendReqRequest: FriendReqRequest, { rejectWithValue }) => {
    try {
        const response = await sendOutgoingFriendRequest(friendReqRequest.authData, friendReqRequest.userId)
        return response.data
    } catch (err) {
        let error = err as AxiosError
        if (!error.response) {
            throw err
        }
        return rejectWithValue(error.response.data)
    }
})

export const acceptFriendRequest = createAsyncThunk("user/acceptFriendRequest", async (friendReqRequest: FriendReqRequest, { rejectWithValue }) => {
    try {
        const response = await acceptIncomingFriendRequest(friendReqRequest.authData, friendReqRequest.userId)
        return response.data
    } catch (err) {
        let error = err as AxiosError
        if (!error.response) {
            throw err
        }
        return rejectWithValue(error.response.data)
    }
})

export const removeFriendRequest = createAsyncThunk("user/removeFriendRequest", async (friendReqRequest: FriendReqRequest, { rejectWithValue }) => {
    try {
        const response = await deleteFriendRequest(friendReqRequest.authData, friendReqRequest.userId)
        return response.data
    } catch (err) {
        let error = err as AxiosError
        if (!error.response) {
            throw err
        }
        return rejectWithValue(error.response.data)
    }
})

export const removeFriend = createAsyncThunk("user/removeFriend", async (friendReqRequest: FriendReqRequest, { rejectWithValue }) => {
    try {
        const response = await deleteFriend(friendReqRequest.authData, friendReqRequest.userId)
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