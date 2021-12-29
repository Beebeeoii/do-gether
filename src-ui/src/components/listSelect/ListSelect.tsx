import { Divider, FormControl, InputLabel, ListItemText, MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { List, ListData } from "../../interfaces/list/List";
import { addList, retrieveAllLists, selectLists, selectListStatus } from "../../services/list/listSplice";
import { AuthData } from "../../interfaces/auth/Auth";
import { CreateListRequest, RetrieveListsByUserIdRequest } from "../../interfaces/list/ListRequest";
import { RetrieveListByUserIdResponse } from "../../interfaces/list/ListResponses";
import AddIcon from '@mui/icons-material/Add';
import { NewListDialog } from "../newListDialog/NewListDialog";

export interface ListSelectProps {
    authData: AuthData,
    userId: string,
    onSelect: (listSelected: List) => void
}

const CREATE_LIST_VALUE = "new_list"

export function ListSelect(props: ListSelectProps) {
    const dispatch = useAppDispatch()
    const { authData, userId, onSelect } = props

    const listStatus = useAppSelector(selectListStatus)
    const lists = useAppSelector(selectLists)
    const [selectedList, setSelectedList] = useState<List | null>(null)

    const [userLists, setUserLists] = useState<Array<List>>([])
    const [userJoinedLists, setUserJoinedLists] = useState<Array<List>>([])

    useEffect(() => {
        if (listStatus === "idle") {
            let listRequest: RetrieveListsByUserIdRequest = {
                authData: authData,
                userId: userId
            }

            dispatch(retrieveAllLists(listRequest)).then((value) => {
                let payload: RetrieveListByUserIdResponse = value.payload as RetrieveListByUserIdResponse

                if (payload.data) {
                    let listsOwnedByUser = payload.data.filter((list, _, __) => list.owner == userId)
                    let listsNotOwnedByUser = payload.data.filter((list, _, __) => list.owner != userId)

                    setUserLists(listsOwnedByUser)
                    setUserJoinedLists(listsNotOwnedByUser)

                    let listToSelect = listsOwnedByUser.length == 0 ? listsNotOwnedByUser[0] : listsOwnedByUser[0]
                    setSelectedList(listToSelect)
                    onSelect(listToSelect)
                }
            })
        }
    }, [listStatus, dispatch])

    const handleListChange = (event: SelectChangeEvent) => {
        if (event.target.value === CREATE_LIST_VALUE || !event.target.value) {
            return
        }

        let selected = lists.filter((value: List, _: number, __: List[]) => {
            return value.id === event.target.value
        })

        setSelectedList(selected[0])
        onSelect(selected[0])
    }

    const [newListDialogOpen, setNewListDialogOpen] = useState<boolean>(false)
    
    const handleNewListDialogOpen = () => {
        setNewListDialogOpen(true)
    }

    const handleNewListDialogClose = (newList: ListData | null) => {
        setNewListDialogOpen(false)

        if (newList) {
            let listRequest: CreateListRequest = {
                authData: authData,
                name: newList.name,
                owner: authData.id,
                private: newList.private
            }

            dispatch(addList(listRequest)).then(value => {
                let newList: List = {
                    id: value.payload.data.id,
                    name: value.payload.data.name,
                    owner: value.payload.data.owner,
                    private: value.payload.data.private
                }

                let newUserLists = userLists
                newUserLists.push(newList)

                setUserLists(newUserLists)

                setSelectedList(newList)
                onSelect(newList)
            })
        }
    }

    return (
        <div>
            <FormControl sx={{ m: 1, width: 300 }}>
                <InputLabel id="list-select-label">
                    List
                </InputLabel>

                <Select
                    labelId="list-select-label"
                    id="list-select"
                    value={selectedList ? selectedList.id : ""}
                    label="List"
                    onChange={handleListChange}
                >
                    {userLists.length != 0 && <li>
                        <Typography
                            sx={{ mt: 0.5, ml: 2 }}
                            color="text.secondary"
                            display="block"
                            variant="caption"
                        >
                            Your lists
                        </Typography>
                    </li>}

                    {userLists.map((list: List, _: number) => (
                        <MenuItem
                            key={list.id}
                            value={list.id}
                        >
                            {list.name}
                        </MenuItem>
                    ))}

                    {userJoinedLists.length != 0 && <div>
                        <Divider component="li" />
                        <li>
                            <Typography
                                sx={{ mt: 0.5, ml: 2 }}
                                color="text.secondary"
                                display="block"
                                variant="caption"
                            >
                                Lists owned by others
                            </Typography>
                        </li>
                    </div>}

                    {userJoinedLists.map((list: List, _: number) => (
                        <MenuItem
                            key={list.id}
                            value={list.id}
                        >
                            {list.name}
                        </MenuItem>
                    ))}

                    <Divider />

                    <MenuItem key={CREATE_LIST_VALUE} value={CREATE_LIST_VALUE} onClick={handleNewListDialogOpen}>
                        <AddIcon />
                        <ListItemText primary="New List" />
                    </MenuItem>
                </Select>
            </FormControl>

            <NewListDialog open={newListDialogOpen} onClose={handleNewListDialogClose} />
        </div>
    )
}