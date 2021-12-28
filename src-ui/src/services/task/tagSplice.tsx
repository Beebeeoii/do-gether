import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { fetchTagsByListId } from '../../adapters/task/task';
import { AxiosError } from 'axios';
import { RetrieveTagsByListIdRequest } from '../../interfaces/task/TaskRequest';

export interface TagState {
    tags: Array<string>
    status: 'idle' | 'loading' | 'succeeded' | 'failed',
    error: string | null
}

const initialState: TagState = {
    tags: [],
    status: "idle",
    error: null
}

export const retrieveTagsByListId = createAsyncThunk("tag/fetchByListId", async (tagRequest: RetrieveTagsByListIdRequest, { rejectWithValue }) => {
    try {
        const response = await fetchTagsByListId(tagRequest.authData, tagRequest.listId)
        return response.data
    } catch (err) {
        let error = err as AxiosError
        if (!error.response) {
            throw err
        }
        return rejectWithValue(error.response.data)
    }
})

export const tagSlice = createSlice({
    name: 'tag',
    initialState: initialState,
    reducers: {
        addTag: (state, action: PayloadAction<string>) => {
            state.tags.push(action.payload)
        },
        removeTag: (state, action: PayloadAction<string>) => {
            const index = state.tags.indexOf(action.payload, 0)
            state.tags.splice(index, 1)
        },
        resetTags: (state) => {
            state.tags = []
            state.status = "idle"
        }
    },
    extraReducers: (builder) => {
        builder.addCase(retrieveTagsByListId.fulfilled, (state, action) => {
            if (action.payload.success) {
                if (action.payload.data) {
                    state.tags = action.payload.data
                } else {
                    state.tags = []
                }
            }
            state.status = "succeeded"
        })
    }
})

export const { addTag, removeTag, resetTags } = tagSlice.actions

export const selectTags = (state: RootState) => state.tag.tags
export const selectTagStatus = (state: RootState) => state.tag.status

export default tagSlice.reducer