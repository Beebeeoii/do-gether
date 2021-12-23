import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { List } from '../../interfaces/list/List';
import { createList, fetchListsByUserId } from '../../adapters/list/list';

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

export const addList = createAsyncThunk("list/create", async (list: List) => {
    const response = await createList(list)
    return response
})

export const retrieveAllLists = createAsyncThunk("list/fetchAll", async (user_id: string) => {
    const response = await fetchListsByUserId(user_id)
    return response
})

export const listSlice = createSlice({
    name: 'list',
    initialState: initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(addList.pending, (state, action) => {
            state.status = "loading"
        })

        builder.addCase(addList.fulfilled, (state, action) => {
            if (action.payload.success) {
                state.lists.push(action.payload.data.list)
            }
            state.status = "succeeded"
        })

        builder.addCase(retrieveAllLists.fulfilled, (state, action) => {
            if (action.payload.success) {
                state.lists = action.payload.data.lists
                state.status = "succeeded"
            }
        })
    }
})

export const selectLists = (state: RootState) => state.list.lists
export const selectListStatus = (state: RootState) => state.list.status

export default listSlice.reducer