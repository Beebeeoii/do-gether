import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { NavBar } from "../../components/nav/NavBar"
import { UserRequest } from "../../interfaces/user/UserRequest";
import { retrieveUserFriends, retrieveUserInfo, selectUserStatus } from "../../services/user/userSplice";
import { selectId, selectToken } from "../../services/auth/authSplice";
import { AuthData } from "../../interfaces/auth/Auth";
import { Alert, Box, Container, Divider, Grid, IconButton, Snackbar, Stack, TextField, Typography } from "@mui/material";
import { Search } from "@mui/icons-material";
import { SearchUserDialog } from "../../components/searchUserDialog/SearchUserDialog";
import { User, UserFriend } from "../../interfaces/user/User";
import { FriendCard } from "../../components/friendCard/FriendCard";
import FindExploreIllustration from '../../assets/illustrations/illustration-find-explore.svg'
import { SnackBarState } from "../../interfaces/utils/Snackbar";

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
    const [hasPendingRequests, setHasPendingRequests] = useState<boolean>(false);
    const [hasFriends, setHasFriends] = useState<boolean>(false);

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
                if (friendObject.type !== "friend" && !hasPendingRequests) {
                    setHasPendingRequests(true)
                }

                if (friendObject.type === "friend" && !hasFriends) {
                    setHasFriends(true)
                }

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
            setHasPendingRequests(true)

            let friendsTemp: Array<UserFriend> = friends
            friendsTemp.push({
                id: user.id,
                username: user.username,
                type: 'outgoing'
            } as UserFriend)

            setFriends(friendsTemp)

            openSnackBar({
                open: true,
                severity: "success",
                message: "Friend request sent"
            })()
        }

        setSearchUserDialogOpen(false)
    }

    const handleFriendCardOnCancelOrRemove = (userId: string, action: "Cancel" | "Remove") => {
        if (userId === "") {
            openSnackBar({
                open: true,
                severity: "error",
                message: "An error has occurred"
            })()
            return
        }

        let updatedFriends: Array<UserFriend> = []
        let hasOtherFriends = false
        let hasOtherPendingRequests = false

        for (let friend of friends) {
            if (userId !== friend.id) {
                updatedFriends.push(friend)

                if (friend.type === "friend") {
                    hasOtherFriends = true
                }

                if (friend.type !== "friend") {
                    hasOtherPendingRequests = true
                }
            }
        }

        setFriends(updatedFriends)
        setHasFriends(hasOtherFriends)
        setHasPendingRequests(hasOtherPendingRequests)

        openSnackBar({
            open: true,
            severity: "success",
            message: action === "Cancel" ? "Friend request cancelled" : "Friend removed"
        })()
    }

    const handleFriendCardOnAccept = (userId: string) => {
        if (userId === "") {
            openSnackBar({
                open: true,
                severity: "error",
                message: "An error has occurred"
            })()
            return
        }
        
        let updatedFriends: Array<UserFriend> = []
        let hasOtherPendingRequests = false

        for (let friend of friends) {
            if (userId !== friend.id) {
                updatedFriends.push(friend)

                if (friend.type !== "friend") {
                    hasOtherPendingRequests = true
                }
            } else {
                updatedFriends.push({
                    ...friend,
                    type: "friend"
                })
            }
        }

        setFriends(updatedFriends)

        if (!hasFriends) {
            setHasFriends(true)
        }

        setHasPendingRequests(hasOtherPendingRequests)

        openSnackBar({
            open: true,
            severity: "success",
            message: "Friend request accepted"
        })()
    }

    const defaultSnackBarState: SnackBarState = {
        open: false,
        severity: "info",
        message: ""
    }
    const [snackBarState, setSnackBarState] = useState<SnackBarState>(defaultSnackBarState)
    const openSnackBar = (newState: SnackBarState) => () => {
        setSnackBarState(newState)
    }

    const closeSnackBar = () => {
        setSnackBarState({
            ...snackBarState,
            open: false
        })
    }

    return (
        <Container maxWidth="lg">
            <NavBar />

            <Grid container rowGap={3} alignItems={"center"}>
                <Grid item>
                    <TextField
                        id="searchFriends"
                        label="Search Users"
                        variant="outlined"
                        value={usernameInput}
                        onChange={handleUsernameInputChange}
                        InputProps={{
                            endAdornment: <IconButton type="submit" sx={{ p: '1rem' }} aria-label="search" onClick={handleSearchUserDialogOpen}>
                                <Search />
                            </IconButton>
                        }}
                    />
                </Grid>

                <Grid item xs={12}>
                    <Stack direction={"column"}>
                        {hasPendingRequests && <Stack direction={"column"} marginBottom={2}>
                            <Typography sx={{ marginTop: "1rem", fontWeight: "bold" }}>
                                Pending Requests
                            </Typography>

                            <Divider />

                            <Grid container direction={"row"} rowGap={3} justifyContent={"space-between"} marginTop={2}>
                                {friends.map((friendObject: UserFriend, index: number) => {
                                    if (friendObject.type !== "friend") {
                                        return <Grid key={index} item xs={12} sm={5.5} md={3.5}>
                                            <FriendCard authData={authData} type={friendObject.type} userId={friendObject.id} username={friendObject.username} onCancelOrRemove={handleFriendCardOnCancelOrRemove} onAccept={handleFriendCardOnAccept} />
                                        </Grid>
                                    }
                                })}
                            </Grid>
                        </Stack>}

                        {hasFriends && <Stack direction={"column"}>
                            <Typography sx={{ marginTop: "1rem", fontWeight: "bold" }}>
                                Your Friends
                            </Typography>

                            <Divider />

                            <Grid container direction={"row"} rowGap={3} justifyContent={"space-between"} marginTop={2}>
                                {friends.map((friendObject: UserFriend, index: number) => {
                                    if (friendObject.type === "friend") {
                                        return <Grid key={index} item xs={12} sm={5.5} md={3.5}>
                                            <FriendCard authData={authData} type={friendObject.type} userId={friendObject.id} username={friendObject.username} onCancelOrRemove={handleFriendCardOnCancelOrRemove} onAccept={handleFriendCardOnAccept} />
                                        </Grid>
                                    }
                                })}
                            </Grid>
                        </Stack>}

                        {friends.length == 0 && <Box sx={{ display: "flex", justifyContent: "center" }}>
                            <img src={FindExploreIllustration} width={"100%"} style={{ maxWidth: "600px" }} />
                        </Box>}
                    </Stack>
                </Grid>
            </Grid>

            <SearchUserDialog authData={authData} open={searchUserDialogOpen} username={usernameInput} onClose={handleSearchUserDialogClose} />

            <Snackbar open={snackBarState.open} autoHideDuration={6000} onClose={closeSnackBar} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
                <Alert onClose={closeSnackBar} severity={snackBarState.severity} sx={{ width: '100%' }}>
                    {snackBarState.message}
                </Alert>
            </Snackbar>
        </Container>
    )
}