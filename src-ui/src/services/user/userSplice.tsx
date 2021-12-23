import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { User } from '../../interfaces/user/User';
import { UserRequest } from '../../interfaces/user/UserRequest';
import { fetchUserInfo } from '../../adapters/user/user';

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

export const retrieveUserInfo = createAsyncThunk("user/retrieve", async (userRequest: UserRequest) => {
    const response = await fetchUserInfo(userRequest)
    return response
})

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(retrieveUserInfo.fulfilled, (state, action) => {
            if (action.payload.success) {
                state.status = "succeeded"
                state.user = action.payload.data.user
            }
        })
    }
})

export const selectUser = (state: RootState) => state.user.user

export default userSlice.reducer