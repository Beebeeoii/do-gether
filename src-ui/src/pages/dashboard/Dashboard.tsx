import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { NavBar } from "../../components/nav/NavBar"
import "./Dashboard.css"
import { UserRequest } from "../../interfaces/user/UserRequest";
import { Fab, Stack } from "@mui/material";
import { AddTask } from "@mui/icons-material";
import { List } from "../../interfaces/list/List";
import { retrieveUserInfo, selectUserStatus } from "../../services/user/userSplice";
import { selectId, selectToken } from "../../services/auth/authSplice";
import { AuthData } from "../../interfaces/auth/Auth";
import { ListSelect } from "../../components/listSelect/ListSelect";
import { TaskBoard } from "../../components/taskBoard/TaskBoard";
import { TaskDialog } from "../../components/taskDialog/TaskDialog";
import { ListMemberAvatar } from "../../components/listMemberAvatars/ListMemberAvatars";
import { ListOwnerAvatar } from "../../components/listOwnerAvatar/ListOwnerAvatar";

export function Dashboard() {
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

            <Stack direction="row" gap={3} alignItems={'center'}>
                <ListSelect authData={authData} userId={authData.id} onSelect={handleListChange} />

                {selectedList && <ListOwnerAvatar authData={authData} listId={selectedList.id}/>}
                {selectedList && <ListMemberAvatar authData={authData} listId={selectedList.id}/>}

                <div style={{ flex: '1 0 0' }} />

                <Fab color="primary" aria-label="addTask" onClick={handleTaskDialogOpen} variant="extended">
                    <AddTask sx={{ mr: 1 }} />
                    Add task
                </Fab>
            </Stack>

            {selectedList && <TaskBoard authData={authData} listId={selectedList.id} />}
            {taskDialogOpen && selectedList && <TaskDialog open={taskDialogOpen} data={null} authData={authData} currentListId={selectedList.id} onClose={handleTaskDialogClose} />}
        </div>
    )
}