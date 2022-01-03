import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { NavBar } from "../../components/nav/NavBar"
import "./Friends.css"
import { UserRequest } from "../../interfaces/user/UserRequest";
import { List } from "../../interfaces/list/List";
import { retrieveUserInfo, selectUserStatus } from "../../services/user/userSplice";
import { selectId, selectToken } from "../../services/auth/authSplice";
import { AuthData } from "../../interfaces/auth/Auth";
import { Divider, Stack, TextField, Typography } from "@mui/material";

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

    const [selectedList, setSelectedList] = useState<List | null>(null)

    const handleListChange = (list: List) => {
        setSelectedList(list)
    }

    const [taskDialogOpen, setTaskDialogOpen] = useState<boolean>(false)
    const handleTaskDialogOpen = () => {
        setTaskDialogOpen(true)
    }

    const handleTaskDialogClose = () => {
        setTaskDialogOpen(false)
    }

    return (
        <div className="dashboard">
            <NavBar />

            <TextField
                id="searchFriends"
                label="Search Friends"
                variant="outlined"
            />

            <Stack direction={"column"}>
                <Typography>
                    Your Friends
                </Typography>
                <Divider />
            </Stack>

            <Stack direction={"column"}>
                <Typography>
                    Pending Friend Requests
                </Typography>
                <Divider />
            </Stack>

            <Stack direction={"column"}>
                <Typography>
                    Incoming Friend Requests
                </Typography>
                <Divider />
            </Stack>
        </div>
    )
}