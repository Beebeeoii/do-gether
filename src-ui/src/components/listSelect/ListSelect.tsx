import { Box, Divider, FormControl, IconButton, InputLabel, ListItemText, MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material";
import { MouseEvent, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { List } from "../../interfaces/list/List";
import { retrieveAllLists, selectLists, selectListStatus } from "../../services/list/listSplice";
import { AuthData } from "../../interfaces/auth/Auth";
import { RetrieveListsByUserIdRequest } from "../../interfaces/list/ListRequest";
import AddIcon from '@mui/icons-material/Add';
import { ListDialog } from "../listDialog/listDialog";
import SettingsIcon from "@mui/icons-material/Settings";

export interface ListSelectProps {
    authData: AuthData,
    userId: string,
    onSelect: (listSelected: List) => void
}

const CREATE_LIST_VALUE = "new_list"
const NO_LIST_VALUE = "no_list"
const NO_LIST_TEXT = "No lists to show"

const getListsOwnedByUser = (lists: Array<List>, userId: string) => lists.filter((list, _, __) => list.owner === userId)
const getListsNotOwnedByUser = (lists: Array<List>, userId: string) => lists.filter((list, _, __) => list.owner !== userId)

export function ListSelect(props: ListSelectProps) {
    const dispatch = useAppDispatch()
    const { authData, userId, onSelect } = props

    const listStatus = useAppSelector(selectListStatus)
    const lists = useAppSelector(selectLists)
    const [selectedList, setSelectedList] = useState<List | null>(null)

    const [userLists, setUserLists] = useState<Array<List>>([])
    const [userJoinedLists, setUserJoinedLists] = useState<Array<List>>([])
    const [listDialogOpen, setListDialogOpen] = useState<boolean>(false)
    const [listBeingEdited, setListBeingEdited] = useState<List | null>(null)
    const [newListId, setNewListId] = useState<string | null>(null)

    useEffect(() => {
        if (listStatus === "idle") {
            let listRequest: RetrieveListsByUserIdRequest = {
                authData: authData,
                userId: userId
            }

            dispatch(retrieveAllLists(listRequest))
        } else if (listStatus === "succeeded" && newListId !== "") {
            let listsOwnedByUser = getListsOwnedByUser(lists, userId)
            let listsNotOwnedByUser = getListsNotOwnedByUser(lists, userId)

            if (lists.length == 0) {
                return
            }

            setUserLists(listsOwnedByUser)
            setUserJoinedLists(listsNotOwnedByUser)
            
            let listToSelect = listsOwnedByUser.length == 0 ? listsNotOwnedByUser[0] : listsOwnedByUser[0]
            
            if (newListId) {
                listToSelect = listsOwnedByUser.filter((list, _, __) => list.id === newListId)[0]
                setNewListId("")
            }
            
            setSelectedList(listToSelect)
            onSelect(listToSelect)
        }
    }, [newListId, listStatus, dispatch])

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

    const handleListSettingsDialogOpen = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation()
        setListBeingEdited(userLists[Number(event.currentTarget.value)])
        setListDialogOpen(true)
    }    

    const handleListDialogOpen = () => {
        setListBeingEdited(null)
        setListDialogOpen(true)
    }

    const handleListDialogClose = (newListId: string | null) => {
        setListBeingEdited(null)
        setListDialogOpen(false)
        setNewListId(newListId)
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
                    renderValue={() => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selectedList?.name}
                        </Box>
                    )}
                >
                    {userLists.length == 0 && <MenuItem disabled value={NO_LIST_VALUE}>
                        {NO_LIST_TEXT}
                    </MenuItem>}

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

                    {userLists.map((list: List, index: number) => (
                        <MenuItem
                            key={list.id}
                            value={list.id}
                            sx={{ justifyContent: "space-between" }}
                        >
                            {list.name}
                            <IconButton value={index} aria-label="list_settings" onClick={handleListSettingsDialogOpen}>
                                <SettingsIcon />
                            </IconButton>
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

                    <MenuItem key={CREATE_LIST_VALUE} value={CREATE_LIST_VALUE} onClick={handleListDialogOpen}>
                        <AddIcon />
                        <ListItemText primary="New List" />
                    </MenuItem>
                </Select>
            </FormControl>

            {!listBeingEdited && <ListDialog open={listDialogOpen} data={null} authData={authData} onClose={handleListDialogClose} />}
            {listBeingEdited && <ListDialog open={listDialogOpen} data={listBeingEdited} authData={authData} onClose={handleListDialogClose} />}
        </div>
    )
}