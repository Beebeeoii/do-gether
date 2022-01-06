import { Avatar, AvatarGroup, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import { useAppDispatch } from "../../app/hooks";
import { retrieveListMembers } from "../../services/list/listSplice";
import { AuthData } from "../../interfaces/auth/Auth";
import { RetrieveListMembersRequest } from "../../interfaces/list/ListRequest";
import { stringAvatar } from "../../utils/utils";
import { UserFriend } from "../../interfaces/user/User";

export interface ListMemberAvatarProps {
    authData: AuthData
    listId: string | null
}

export function ListMemberAvatar(props: ListMemberAvatarProps) {
    const dispatch = useAppDispatch()
    const { authData, listId } = props

    const [members, setMembers] = useState<Array<UserFriend>>([])

    useEffect(() => {
        if (listId) {
            let retrieveListMemberUsernamesRequest: RetrieveListMembersRequest = {
                authData: authData,
                listId: listId
            } 

            dispatch(retrieveListMembers(retrieveListMemberUsernamesRequest)).then(value => {
                if (value.payload.data) {
                    setMembers(value.payload.data as Array<UserFriend>)
                }
            })
        }
    }, [listId])

    return (
        <AvatarGroup max={4}>
            {members.map((member: UserFriend, index: number) => (
                <Tooltip title={member.username} key={index}>
                    <Avatar {...stringAvatar(member.username)} />
                </Tooltip>
            ))}
        </AvatarGroup>
    )
}