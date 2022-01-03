import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { NavBar } from "../../components/nav/NavBar"
import { UserRequest } from "../../interfaces/user/UserRequest";
import { retrieveUserInfo, selectUserStatus } from "../../services/user/userSplice";
import { selectId, selectToken } from "../../services/auth/authSplice";
import { AuthData } from "../../interfaces/auth/Auth";
import { Box, Divider, IconButton, Stack, TextField, Typography } from "@mui/material";
import { Search } from "@mui/icons-material";
import { SearchUserDialog } from "../../components/searchUserDialog/SearchUserDialog";

export function Friends() {
    const dispatch = useAppDispatch()
    const authId = useAppSelector(selectId)
    const authToken = useAppSelector(selectToken)

    const authData: AuthData = {
        id: authId!,
        token: authToken!
    }

    const userStatus = useAppSelector(selectUserStatus)
    useEffect(() => {
        if (userStatus === "idle") {
            let userRequest: UserRequest = {
                authData: authData,
                userId: authId!
            }

            dispatch(retrieveUserInfo(userRequest))
        }
    }, [userStatus, dispatch])

    const [usernameInput, setUsernameInput] = useState<string>("")
    const handleUsernameInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUsernameInput(event.target.value)
    }

    const [searchUserDialogOpen, setSearchUserDialogOpen] = useState<boolean>(false)

    const handleSearchUserDialogOpen = () => {
        setSearchUserDialogOpen(true)
    }

    const handleSearchUserDialogClose = () => {
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
                    Your Friends
                </Typography>
                <Divider />
            </Stack>

            <SearchUserDialog authData={authData} open={searchUserDialogOpen} username={usernameInput} onClose={handleSearchUserDialogClose}/>
        </Box>
    )
}