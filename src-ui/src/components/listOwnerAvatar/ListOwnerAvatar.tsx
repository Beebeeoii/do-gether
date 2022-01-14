import { Box, Stack, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import { useAppDispatch } from "../../app/hooks";
import { retrieveListOwner } from "../../services/list/listSplice";
import { AuthData } from "../../interfaces/auth/Auth";
import { RetrieveListOwnerRequest } from "../../interfaces/list/ListRequest";
import { BasicUser } from "../../interfaces/user/User";
import { UserAvatar } from "../userAvatar/UserAvatar";

export interface ListOwnerAvatarProps {
    authData: AuthData
    listId: string | null
}

export function ListOwnerAvatar(props: ListOwnerAvatarProps) {
    const dispatch = useAppDispatch()
    const { authData, listId } = props

    const [owner, setOwner] = useState<BasicUser>()

    useEffect(() => {
        if (listId) {
            let retrieveListOwnerRequest: RetrieveListOwnerRequest = {
                authData: authData,
                listId: listId
            }

            dispatch(retrieveListOwner(retrieveListOwnerRequest)).then(value => {
                if (value.payload.data) {
                    setOwner(value.payload.data as BasicUser)
                }
            })
        }
    }, [listId])

    return (
        <Stack direction={'row'} alignItems={'center'} gap={1}>
            {owner && <Tooltip title={owner.username} arrow>
                <Box sx={{border: "3px solid #aa52f7", borderRadius: "50%", padding: "2px"}}>
                    <UserAvatar username={owner.username} />
                </Box>
            </Tooltip>}
        </Stack>
    )
}