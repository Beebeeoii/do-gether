import { Box, Divider, FormControl, IconButton, InputLabel, ListItemText, MenuItem, Select, SelectChangeEvent, Stack, Tooltip, Typography } from "@mui/material";
import { MouseEvent, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { List, ListSettingsDialogOpResponse } from "../../interfaces/list/List";
import { retrieveAllLists, selectLists, selectListStatus } from "../../services/list/listSplice";
import { AuthData } from "../../interfaces/auth/Auth";
import { RetrieveListsByUserIdRequest } from "../../interfaces/list/ListRequest";
import AddIcon from '@mui/icons-material/Add';
import { ListSettingsDialog } from "../listDialog/ListSettingsDialog";
import SettingsIcon from "@mui/icons-material/Settings";
import GroupIcon from "@mui/icons-material/Group";
import { ListMembersDialog } from "../listDialog/ListMembersDialog";

export interface ListSelectProps {
    authData: AuthData,
    userId: string,
    onSelect: (listSelected: List | null) => void
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
    const [listMembersDialogOpen, setListMembersDialogOpen] = useState<boolean>(false)
    const [listSettingsDialogOpen, setListSettingsDialogOpen] = useState<boolean>(false)
    const [listBeingEdited, setListBeingEdited] = useState<List | null>(null)

    const [settingsDialogOperation, setSettingsDialogOperation] = useState<'new' | 'edit' | 'delete' | 'close' | 'idle'>()
    const [newListId, setNewListId] = useState<string | null>(null)

    useEffect(() => {
        if (listStatus === "idle") {
            let listRequest: RetrieveListsByUserIdRequest = {
                authData: authData,
                userId: userId
            }

            dispatch(retrieveAllLists(listRequest))
        } else if (settingsDialogOperation != "idle" && listStatus === "succeeded") {
            let listsOwnedByUser = getListsOwnedByUser(lists, userId)
            let listsNotOwnedByUser = getListsNotOwnedByUser(lists, userId)

            setUserLists(listsOwnedByUser)
            setUserJoinedLists(listsNotOwnedByUser)

            if (settingsDialogOperation == "delete" && lists.length == 0) {
                setNewListId(null)
                setSettingsDialogOperation(undefined)
                setSelectedList(null)
                onSelect(null)
                return
            }

            if (settingsDialogOperation == "edit" || settingsDialogOperation == "close" || lists.length == 0) {
                return
            }

            let listToSelect = listsOwnedByUser.length == 0 ? listsNotOwnedByUser[0] : listsOwnedByUser[0]

            if (newListId) {
                listToSelect = listsOwnedByUser.filter((list, _, __) => list.id === newListId)[0]
            }

            setNewListId("")
            setSettingsDialogOperation("idle")
            setSelectedList(listToSelect)
            onSelect(listToSelect)
        }
    }, [settingsDialogOperation, listStatus, dispatch])

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

    const handleListMembersDialogOpen = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation()
        setListBeingEdited(userLists[Number(event.currentTarget.value)])
        setListMembersDialogOpen(true)
    }

    const handleListMembersDialogClose = () => {
        setListBeingEdited(null)
        setListMembersDialogOpen(false)
    }

    const handleListSettingsDialogOpen = (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation()
        setListBeingEdited(userLists[Number(event.currentTarget.value)])
        setListSettingsDialogOpen(true)
    }

    const handleListDialogOpen = () => {
        setListBeingEdited(null)
        setListSettingsDialogOpen(true)
    }

    const handleListDialogClose = (res: ListSettingsDialogOpResponse) => {
        setListBeingEdited(null)
        setListSettingsDialogOpen(false)

        switch (res.operation) {
            // @ts-expect-error
            case "new": {
                setNewListId(res.id) // falls through to default
            }
            default: {
                setSettingsDialogOperation(res.operation)
                break
            }
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
                    renderValue={() => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {selectedList?.name}
                        </Box>
                    )}
                >
                    {userLists.length == 0 && userJoinedLists.length == 0 && <MenuItem disabled value={NO_LIST_VALUE}>
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
                            <Stack direction={"row"}>
                                <Tooltip title="Members" arrow>
                                    <IconButton value={index} aria-label="list_settings" onClick={handleListMembersDialogOpen}>
                                        <GroupIcon />
                                    </IconButton>
                                </Tooltip>

                                <Tooltip title="Settings" arrow>
                                    <IconButton value={index} aria-label="list_settings" onClick={handleListSettingsDialogOpen}>
                                        <SettingsIcon />
                                    </IconButton>
                                </Tooltip>

                            </Stack>
                        </MenuItem>
                    ))}

                    {userJoinedLists.length != 0 && <div>
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

            {listMembersDialogOpen && listBeingEdited && <ListMembersDialog listId={listBeingEdited?.id} open={listMembersDialogOpen} authData={authData} onClose={handleListMembersDialogClose} />}

            {!listBeingEdited && <ListSettingsDialog open={listSettingsDialogOpen} data={null} authData={authData} onClose={handleListDialogClose} />}
            {listBeingEdited && <ListSettingsDialog open={listSettingsDialogOpen} data={listBeingEdited} authData={authData} onClose={handleListDialogClose} />}
        </div>
    )
}