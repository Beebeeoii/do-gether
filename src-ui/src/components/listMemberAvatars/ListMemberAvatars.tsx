import { Avatar, AvatarGroup, Tooltip } from "@mui/material";
import { useEffect, useState } from "react";
import { useAppDispatch } from "../../app/hooks";
import { retrieveListMemberUsernames } from "../../services/list/listSplice";
import { AuthData } from "../../interfaces/auth/Auth";
import { RetrieveListMemberUsernamesRequest } from "../../interfaces/list/ListRequest";
import { stringAvatar } from "../../utils/utils";

export interface ListMemberAvatarProps {
    authData: AuthData
    listId: string | null
}

export function ListMemberAvatar(props: ListMemberAvatarProps) {
    const dispatch = useAppDispatch()
    const { authData, listId } = props

    const [members, setMembers] = useState<Array<string>>([])

    useEffect(() => {
        if (listId) {
            let retrieveListMemberUsernamesRequest: RetrieveListMemberUsernamesRequest = {
                authData: authData,
                listId: listId
            } 

            dispatch(retrieveListMemberUsernames(retrieveListMemberUsernamesRequest)).then(value => {
                setMembers(value.payload.data)
            })
        }
    }, [listId])

    return (
        <AvatarGroup max={4}>
            {members.map((username: string, index: number) => (
                <Tooltip title={username} key={index}>
                    <Avatar {...stringAvatar(username)} />
                </Tooltip>
            ))}
        </AvatarGroup>
    )
}