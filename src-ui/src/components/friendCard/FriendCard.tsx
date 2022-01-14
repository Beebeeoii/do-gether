import { useState } from "react";
import { useAppDispatch } from "../../app/hooks";
import { Card, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { Cancel, Delete, PersonAdd, PersonRemove } from "@mui/icons-material";
import { FriendReqRequest } from "../../interfaces/user/UserRequest";
import { AuthData } from "../../interfaces/auth/Auth";
import { acceptFriendRequest, removeFriend, removeFriendRequest } from "../../services/user/userSplice";
import { UserAvatar } from "../userAvatar/UserAvatar";

export interface FriendCardProps {
    authData: AuthData,
    userId: string,
    username: string,
    type: 'outgoing' | 'incoming' | 'friend',
    onCancelOrRemove: (userId: string, action: "Cancel" | "Remove") => void,
    onAccept: (userId: string) => void
}

export function FriendCard(props: FriendCardProps) {
    const dispatch = useAppDispatch()
    const { authData, userId, username, type, onCancelOrRemove, onAccept } = props

    const [updatedType, setUpdatedType] = useState<'null' | 'outgoing' | 'incoming' | 'friend'>(type)

    const handleAcceptFriendRequest = () => {
        let friendReqRequest: FriendReqRequest = {
            authData: authData,
            userId: userId
        }

        dispatch(acceptFriendRequest(friendReqRequest)).then((value) => {
            if (value.payload.success) {
                setUpdatedType('friend')

                onAccept(userId)
            } else {
                onAccept("")
            }
        })
    }

    const handleCancelFriendRequest = () => {
        let friendReqRequest: FriendReqRequest = {
            authData: authData,
            userId: userId
        }

        dispatch(removeFriendRequest(friendReqRequest)).then((value) => {
            if (value.payload.success) {
                setUpdatedType('null')
                onCancelOrRemove(userId, "Cancel")
            } else {
                onCancelOrRemove("", "Cancel")
            }
        })
    }

    const handleRemoveFriend = () => {
        let friendReqRequest: FriendReqRequest = {
            authData: authData,
            userId: userId
        }

        dispatch(removeFriend(friendReqRequest)).then((value) => {
            if (value.payload.success) {
                setUpdatedType('null')
                onCancelOrRemove(userId, "Remove")
            } else {
                onCancelOrRemove("", "Remove")
            }
        })
    }

    return (
        <Card elevation={1} sx={{ padding: "1rem" }}>
            <Stack direction={"row"} alignItems={"center"} justifyContent={"space-between"}>
                <Stack direction={"column"} alignItems={"center"} sx={{ width: "25%" }}>
                    <UserAvatar username={username} />

                    <Typography sx={{ textOverflow: "ellipsis", width: "100%", overflow: "hidden", whiteSpace: "nowrap", textAlign: "center" }}>
                        {username}
                    </Typography>
                </Stack>

                {updatedType === "outgoing" && <Tooltip title="Cancel request">
                    <IconButton aria-label="cancel" onClick={handleCancelFriendRequest}>
                        <Cancel />
                    </IconButton>
                </Tooltip>}

                {updatedType === "incoming" && <Stack direction={"row"}>
                    <Tooltip title="Delete request" onClick={handleCancelFriendRequest}>
                        <IconButton aria-label="delete">
                            <Delete />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Accept request">
                        <IconButton aria-label="person-add" onClick={handleAcceptFriendRequest}>
                            <PersonAdd />
                        </IconButton>
                    </Tooltip>
                </Stack>}

                {updatedType === "friend" && <Tooltip title="Remove friend">
                    <IconButton aria-label="person-remove" onClick={handleRemoveFriend}>
                        <PersonRemove />
                    </IconButton>
                </Tooltip>}
            </Stack>
        </Card>
    )
}