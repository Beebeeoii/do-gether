import { AvatarGroup, Box, Stack, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import { useAppDispatch } from "../../app/hooks";
import { retrieveListMembers } from "../../services/list/listSplice";
import { AuthData } from "../../interfaces/auth/Auth";
import { RetrieveListMembersRequest } from "../../interfaces/list/ListRequest";
import { BasicUser } from "../../interfaces/user/User";
import { UserAvatar } from "../userAvatar/UserAvatar";

export interface ListMemberAvatarProps {
    authData: AuthData
    listId: string | null
}

export function ListMemberAvatar(props: ListMemberAvatarProps) {
    const dispatch = useAppDispatch()
    const { authData, listId } = props

    const [members, setMembers] = useState<Array<BasicUser>>([])

    useEffect(() => {
        if (listId) {
            let retrieveListMemberUsernamesRequest: RetrieveListMembersRequest = {
                authData: authData,
                listId: listId
            }

            dispatch(retrieveListMembers(retrieveListMemberUsernamesRequest)).then(value => {
                if (value.payload.data) {
                    setMembers(value.payload.data as Array<BasicUser>)
                } else {
                    setMembers([])
                }
            })
        }
    }, [listId, dispatch])

    return (
        <Stack direction={'row'} alignItems={'center'} gap={1}>
            <AvatarGroup max={4}>
                {members.map((member: BasicUser, index: number) => (
                    <Tooltip title={member.username} key={index} arrow>
                        <Box sx={{ border: "2px solid #52d1f7", borderRadius: "50%", padding: "1px", marginRight: "4px" }}>
                            <UserAvatar username={member.username} />
                        </Box>
                    </Tooltip>
                ))}
            </AvatarGroup>
        </Stack>
    )
}