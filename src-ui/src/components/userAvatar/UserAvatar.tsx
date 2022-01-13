import { Avatar } from "@mui/material";
import { stringAvatar } from "../../utils/utils";


export interface UserAvatarProps {
    username: string
}

export function UserAvatar(props: UserAvatarProps) {
    const { username } = props

    return (
        <Avatar {...stringAvatar(username)} />
    )
}