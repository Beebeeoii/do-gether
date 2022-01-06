import { Autocomplete, Button, Chip, Dialog, DialogActions, DialogTitle, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { AuthData } from "../../interfaces/auth/Auth";
import { useAppDispatch } from "../../app/hooks";
import { UserFriend } from "../../interfaces/user/User";
import { retrieveUserFriends } from "../../services/user/userSplice";
import { editListMembers, retrieveListMembers } from "../../services/list/listSplice";
import { EditListMembersRequest, RetrieveListMembersRequest } from "../../interfaces/list/ListRequest";

export interface ListMembersDialogProps {
    open: boolean
    listId: string
    authData: AuthData
    onClose: () => void
}

const DEFAULT_MEMBER_SUGGESTIONS_VALUE: Array<UserFriend> = []
const DEFAULT_MEMBERS_SELECTED_VALUE: Array<UserFriend> = []
const DEFAULT_MEMBER_SUGGESTIONS_OPEN_VALUE = false

export function ListMembersDialog(props: ListMembersDialogProps) {
    const dispatch = useAppDispatch()
    const { open, listId, authData, onClose } = props

    const [memberSuggestions, setMemberSuggestions] = useState<Array<UserFriend>>(DEFAULT_MEMBER_SUGGESTIONS_VALUE)
    const [memberSuggestionsOpen, setMemberSuggestionsOpen] = useState<boolean>(DEFAULT_MEMBER_SUGGESTIONS_OPEN_VALUE)
    const [membersSelected, setMembersSelected] = useState<Array<UserFriend>>(DEFAULT_MEMBERS_SELECTED_VALUE)

    useEffect(() => {
        let friendsTemp: Array<UserFriend> = []
        dispatch(retrieveUserFriends(authData)).then(value => {
            if (!value.payload.data) {
                return
            }
            for (let friendObject of value.payload.data) {
                friendsTemp.push({
                    id: friendObject.id,
                    username: friendObject.username,
                    type: friendObject.type
                } as UserFriend)
            }
            setMemberSuggestions(friendsTemp)
        })

        if (listId) {
            let retrieveListMemberUsernamesRequest: RetrieveListMembersRequest = {
                authData: authData,
                listId: listId
            } 

            dispatch(retrieveListMembers(retrieveListMemberUsernamesRequest)).then(value => {
                setMembersSelected(value.payload.data as Array<UserFriend>)
            })
        }
    }, [dispatch])

    const handleUpdateListMembers = () => {
        let editListMembersRequest: EditListMembersRequest = {
            authData: authData,
            id: listId,
            members: membersSelected.map((member, _, __) => member.id)
        } 

        dispatch(editListMembers(editListMembersRequest)).then(_ => {
            onClose()
        })
    }

    const handleDialogClose = () => {
        onClose()
    }

    return (
        <Dialog onClose={handleDialogClose} open={open}>
            <DialogTitle>
                List Members
            </DialogTitle>

            <Autocomplete
                multiple
                limitTags={3}
                id="members"
                open={memberSuggestionsOpen}
                onOpen={() => {
                    setMemberSuggestionsOpen(true)
                }}
                onClose={() => {
                    setMemberSuggestionsOpen(false)
                }}
                options={memberSuggestions.filter((value, _, __) => value.type === "friend")}
                value={membersSelected}
                onChange={(_, memberssSelected: Array<UserFriend>) => {
                    setMembersSelected(memberssSelected)
                }}
                getOptionLabel={(option) => option.username}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderTags={(value: readonly UserFriend[], getTagProps) =>
                    value.map((option: UserFriend, index: number) => (
                        <Chip variant="outlined" label={option.username} {...getTagProps({ index })} />
                    ))
                }
                renderInput={(params) => (
                    <TextField {...params} label="Members" placeholder="Add a member" />
                )}
                sx={{ width: '300px', padding: 2 }}
            />

            <DialogActions>
                <Button onClick={handleDialogClose}>
                    Cancel
                </Button>

                <Button variant="contained" onClick={handleUpdateListMembers}>
                    Update
                </Button>
            </DialogActions>
        </Dialog >
    )
}