import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { List } from '../../interfaces/list/List';
import { createList, fetchListsByUserId } from '../../adapters/list/list';
import { AxiosError } from 'axios';
import { CreateListRequest, RetrieveListsByUserIdRequest } from '../../interfaces/list/ListRequest';

export interface ListState {
    lists: Array<List>
    status: 'idle' | 'loading' | 'succeeded' | 'failed',
    error: string | null
}

const initialState: ListState = {
    lists: [],
    status: "idle",
    error: null
}

export const addList = createAsyncThunk("list/create", async (listRequest: CreateListRequest, { rejectWithValue }) => {
    try {
        const response = await createList(listRequest.authData, listRequest.name, listRequest.owner, listRequest.private)
        return response.data
    } catch (err) {
        let error = err as AxiosError
        if (!error.response) {
            throw err
        }
        return rejectWithValue(error.response.data)
    }
})

export const retrieveAllLists = createAsyncThunk("list/fetchAll", async (listRequest: RetrieveListsByUserIdRequest, { rejectWithValue }) => {
    try {
        const response = await fetchListsByUserId(listRequest.authData, listRequest.userId)
        return response.data
    } catch (err) {
        let error = err as AxiosError
        if (!error.response) {
            throw err
        }
        return rejectWithValue(error.response.data)
    }
})

export const listSlice = createSlice({
    name: 'list',
    initialState: initialState,
    reducers: {
        resetLists: (state) => {
            state.lists = []
            state.status = "idle"
            state.error = null
        }
    },
    extraReducers: (builder) => {
        builder.addCase(addList.pending, (state, action) => {
            state.status = "loading"
        })

        builder.addCase(addList.fulfilled, (state, action) => {
            if (action.payload.success) {
                state.lists.push({
                    id: action.payload.data.id,
                    name: action.payload.data.name,
                    owner: action.payload.data.owner,
                    private: action.payload.data.private
                })
            }
            state.status = "succeeded"
        })

        builder.addCase(retrieveAllLists.fulfilled, (state, action) => {
            if (action.payload.success) {
                state.lists = action.payload.data
                state.status = "succeeded"
            }
        })
    }
})

export const { resetLists } = listSlice.actions

export const selectLists = (state: RootState) => state.list.lists
export const selectListStatus = (state: RootState) => state.list.status

export default listSlice.reducer