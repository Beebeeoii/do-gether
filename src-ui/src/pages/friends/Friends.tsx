import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { NavBar } from "../../components/nav/NavBar"
import { UserRequest } from "../../interfaces/user/UserRequest";
import { retrieveUserFriends, retrieveUserInfo, selectUserStatus } from "../../services/user/userSplice";
import { selectId, selectToken } from "../../services/auth/authSplice";
import { AuthData } from "../../interfaces/auth/Auth";
import { Box, Divider, IconButton, Stack, TextField, Typography } from "@mui/material";
import { Search } from "@mui/icons-material";
import { SearchUserDialog } from "../../components/searchUserDialog/SearchUserDialog";
import { User, UserFriend } from "../../interfaces/user/User";
import { FriendCard } from "../../components/friendCard/FriendCard";

export function Friends() {
    const dispatch = useAppDispatch()
    const authId = useAppSelector(selectId)
    const authToken = useAppSelector(selectToken)

    const authData: AuthData = {
        id: authId!,
        token: authToken!
    }

    const userStatus = useAppSelector(selectUserStatus)
    const [friends, setFriends] = useState<Array<UserFriend>>([])

    useEffect(() => {
        if (userStatus === "idle") {
            let userRequest: UserRequest = {
                authData: authData,
                userId: authId!
            }

            dispatch(retrieveUserInfo(userRequest))
        }

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
            setFriends(friendsTemp)
        })
    }, [userStatus, dispatch])

    const [usernameInput, setUsernameInput] = useState<string>("")
    const handleUsernameInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUsernameInput(event.target.value)
    }

    const [searchUserDialogOpen, setSearchUserDialogOpen] = useState<boolean>(false)

    const handleSearchUserDialogOpen = () => {
        setSearchUserDialogOpen(true)
    }

    const handleSearchUserDialogClose = (user: User | null) => {
        if (user) {
            let friendsTemp: Array<UserFriend> = friends
            friendsTemp.push({
                id: user.id,
                username: user.username,
                type: 'outgoing'
            } as UserFriend)
            setFriends(friendsTemp)
        }

        setSearchUserDialogOpen(false)
    }

    return (
        <Box sx={{ width: '1280px' }}>
            <NavBar />

            <TextField
                id="searchFriends"
                label="Search Users"
                variant="outlined"
                value={usernameInput}
                onChange={handleUsernameInputChange}
                InputProps={{
                    endAdornment: <IconButton type="submit" sx={{ p: '10px' }} aria-label="search" onClick={handleSearchUserDialogOpen}>
                        <Search />
                    </IconButton>
                }}
            />

            <Stack direction={"column"}>
                <Typography>
                    Pending Requests
                </Typography>

                <Divider />

                {friends.map((friendObject: UserFriend, index: number) => {
                    if (friendObject.type !== "friend") {
                        return <FriendCard key={index} authData={authData} type={friendObject.type} userId={friendObject.id} username={friendObject.username} />
                    }
                })}
                
                <Typography>
                    Your Friends
                </Typography>

                <Divider />

                {friends.map((friendObject: UserFriend, index: number) => {
                    if (friendObject.type === "friend") {
                        return <FriendCard key={index} authData={authData} type={friendObject.type} userId={friendObject.id} username={friendObject.username} />
                    }
                })}
            </Stack>

            <SearchUserDialog authData={authData} open={searchUserDialogOpen} username={usernameInput} onClose={handleSearchUserDialogClose} />
        </Box>
    )
}