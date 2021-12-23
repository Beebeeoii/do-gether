import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { fetchTagsByListId } from '../../adapters/task/task';

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
export const retrieveTagsByListId = createAsyncThunk("tag/fetchByListId", async (list_id: string) => {
    const response = await fetchTagsByListId(list_id)
    return response
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
        }
    },
    extraReducers: (builder) => {
        builder.addCase(retrieveTagsByListId.fulfilled, (state, action) => {
            state.status = "succeeded"
            if (action.payload.success) {
                state.tags = action.payload.data.tags
            }
        })
    }
})

export const selectTags = (state: RootState) => state.tag.tags
export const selectTagStatus = (state: RootState) => state.tag.status

export default tagSlice.reducer