import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { List } from '../../interfaces/list/List';
import { createList, deleteExistingList, editExistingList, fetchListMemberUsernames, fetchListsByUserId } from '../../adapters/list/list';
import { AxiosError } from 'axios';
import { CreateListRequest, DeleteListRequest, EditListRequest, RetrieveListMemberUsernamesRequest, RetrieveListsByUserIdRequest } from '../../interfaces/list/ListRequest';

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

export const editList = createAsyncThunk("list/edit", async (listRequest: EditListRequest, { rejectWithValue }) => {
    try {
        const response = await editExistingList(listRequest)
        return response.data
    } catch (err) {
        let error = err as AxiosError
        if (!error.response) {
            throw err
        }
        return rejectWithValue(error.response.data)
    }
})

export const deleteList = createAsyncThunk("list/delete", async (listRequest: DeleteListRequest, { rejectWithValue }) => {
    try {
        const response = await deleteExistingList(listRequest.authData, listRequest.id)
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

export const retrieveListMemberUsernames = createAsyncThunk("list/fetchMemberUsernames", async (listRequest: RetrieveListMemberUsernamesRequest, { rejectWithValue }) => {
    try {
        const response = await fetchListMemberUsernames(listRequest.authData, listRequest.listId)
        return response.data
    } catch (err) {
        let error = err as AxiosError
        if (!error.response) {
            throw err
        }
        return rejectWithValue(error.response.data)
    }
})

const sortAlpha = (a: string, b: string) => {
    if (a < b) {
        return -1
    }

    if (a > b) {
        return 1
    }

    return 0
}

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
                    private: action.payload.data.private,
                    members: []
                })
            }

            state.lists.sort((a: List, b: List) => sortAlpha(a.name, b.name))
            state.status = "succeeded"
        })

        builder.addCase(editList.fulfilled, (state, action) => {
            if (action.payload.success) {
                let updatedLists: Array<List> = []

                for (let list of state.lists) {
                    if (list.id !== action.payload.data.id) {
                        updatedLists.push(list)
                    } else {
                        let updatedList: List = {
                            id: action.payload.data.id,
                            name: action.payload.data.name,
                            owner: action.payload.data.owner,
                            private: action.payload.data.private,
                            members: action.payload.data.tags,
                        }

                        updatedLists.push(updatedList)
                    }
                }

                updatedLists.sort((a: List, b: List) => sortAlpha(a.name, b.name))
                state.lists = updatedLists
            }
            state.status = "succeeded"
        })

        builder.addCase(deleteList.fulfilled, (state, action) => {
            if (action.payload.success) {
                let updatedLists: Array<List> = []

                for (let list of state.lists) {
                    if (list.id !== action.payload.data.id) {
                        updatedLists.push(list)
                    }
                }

                updatedLists.sort((a: List, b: List) => sortAlpha(a.name, b.name))
                state.lists = updatedLists
            }
            state.status = "succeeded"
        })

        builder.addCase(retrieveAllLists.fulfilled, (state, action) => {
            if (action.payload.success) {
                if (action.payload.data) {
                    action.payload.data.sort((a: List, b: List) => sortAlpha(a.name, b.name))
                }
                state.lists = action.payload.data ? action.payload.data : []
                state.status = "succeeded"
            }
        })
    }
})

export const { resetLists } = listSlice.actions

export const selectLists = (state: RootState) => state.list.lists
export const selectListStatus = (state: RootState) => state.list.status

export default listSlice.reducer