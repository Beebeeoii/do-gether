import { Button, Dialog, DialogActions, DialogTitle, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { AuthData } from "../../interfaces/auth/Auth";
import { useAppDispatch } from "../../app/hooks";
import { User } from "../../interfaces/user/User";
import { retrieveUserByUsername, sendFriendRequest } from "../../services/user/userSplice";
import { FriendReqRequest, RetrieveByUsernameRequest } from "../../interfaces/user/UserRequest";
import { UserAvatar } from "../userAvatar/UserAvatar";

export interface SearchUserDialogProps {
    open: boolean
    authData: AuthData
    username: string
    onClose: (pendingFriend: User | null) => void
}

export function SearchUserDialog(props: SearchUserDialogProps) {
    const dispatch = useAppDispatch()
    const { open, authData, username, onClose } = props

    const [doesUserExist, setDoesUserExist] = useState<boolean>(false)
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        if (username && open) {
            let retrieveByUsernameReq: RetrieveByUsernameRequest = {
                authData: authData,
                username: username
            }

            dispatch(retrieveUserByUsername(retrieveByUsernameReq)).then((value) => {
                if (value.payload.success) {
                    setDoesUserExist(true)

                    let user: User = {
                        id: value.payload.data.id,
                        username: value.payload.data.username,
                        friends: value.payload.data.friends,
                        outgoing_requests: value.payload.data.outgoing_requests,
                        incoming_requests: value.payload.data.incoming_requests,
                    }

                    setUser(user)
                }
            })
        }
    }, [open])

    const handleSendFriendRequest = () => {
        if (user) {
            let friendReqRequest: FriendReqRequest = {
                authData: authData,
                userId: user.id
            }

            dispatch(sendFriendRequest(friendReqRequest)).then((value) => {
                if (value.payload.success) {
                    onClose(user)
                } else {
                    onClose(null)
                }
            })
        } else {
            onClose(null)
        }

        resetState()
    }

    const handleDialogClose = () => {
        onClose(null)
        resetState()
    }

    function resetState() {
        setDoesUserExist(false)
        setUser(null)
    }

    return (
        <Dialog onClose={handleDialogClose} open={open}>
            <DialogTitle>
                User Search: {username}
            </DialogTitle>

            {doesUserExist && <Stack direction={'row'} gap={2} sx={{ width: '300px', padding: 2 }}>
                <UserAvatar username={username} />

                <Typography sx={{ marginTop: "auto", marginBottom: "auto" }}>
                    {username}
                </Typography>
            </Stack>}

            {!doesUserExist && <Typography sx={{ width: '300px', padding: 2 }}>
                No such user found
            </Typography>}


            <DialogActions>
                <Button onClick={handleDialogClose}>
                    Cancel
                </Button>

                {doesUserExist && <Button variant="contained" onClick={handleSendFriendRequest}>
                    Send Friend Request
                </Button>}
            </DialogActions>
        </Dialog >
    )
}