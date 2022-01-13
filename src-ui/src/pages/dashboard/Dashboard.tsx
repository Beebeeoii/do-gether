import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { NavBar } from "../../components/nav/NavBar"
import "./Dashboard.css"
import { UserRequest } from "../../interfaces/user/UserRequest";
import { Alert, Badge, Button, ButtonGroup, Snackbar, Stack, Tooltip, Typography } from "@mui/material";
import { AddTask, CheckBoxOutlineBlankOutlined, CheckBoxOutlined, FilterAltOutlined, PlaylistAdd } from "@mui/icons-material";
import { List, ListSettingsDialogOpResponse } from "../../interfaces/list/List";
import { retrieveUserInfo, selectUserStatus } from "../../services/user/userSplice";
import { selectId, selectToken } from "../../services/auth/authSplice";
import { AuthData } from "../../interfaces/auth/Auth";
import { ListSelect } from "../../components/listSelect/ListSelect";
import { TaskBoard } from "../../components/taskBoard/TaskBoard";
import { TaskDialog } from "../../components/taskDialog/TaskDialog";
import { ListMemberAvatar } from "../../components/listMemberAvatars/ListMemberAvatars";
import { ListOwnerAvatar } from "../../components/listOwnerAvatar/ListOwnerAvatar";
import { TaskFilterDialog } from "../../components/taskFilterDialog/TaskFilterDialog";
import { SnackBarState } from "../../interfaces/utils/Snackbar";
import { resetTags } from "../../services/task/tagSplice";
import { ListSettingsDialog } from "../../components/listDialog/ListSettingsDialog";
import MutitaskingIllustration from '../../assets/illustrations/illustration-multitasking.svg'

const DEFAULT_FILTER_TAGS_SELECTED_VALUE: Array<string> = []

export function Dashboard() {
    const dispatch = useAppDispatch()

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

    const handleFilterClick = () => {
        setFilterDialogOpen(true)
    }

    const [filterDialogOpen, setFilterDialogOpen] = useState<boolean>(false)
    const [filterTagsSelected, setFilterTagsSelected] = useState<Array<string>>(DEFAULT_FILTER_TAGS_SELECTED_VALUE)
    const handleFilterDialogClose = (tagsSelected: Array<string> | null) => {
        if (!tagsSelected) {
            setFilterTagsSelected(DEFAULT_FILTER_TAGS_SELECTED_VALUE)
        } else {
            setFilterTagsSelected(tagsSelected)
        }

        setFilterDialogOpen(false)
    }

    const [isCompleted, setIsCompleted] = useState<boolean>(false)
    const handleCompletedClick = () => {
        setIsCompleted(!isCompleted)
    }

    const [selectedList, setSelectedList] = useState<List | null>(null)

    const handleListChange = (list: List | null) => {
        setFilterTagsSelected(DEFAULT_FILTER_TAGS_SELECTED_VALUE)
        dispatch(resetTags())
        setSelectedList(list)
    }

    const [taskDialogOpen, setTaskDialogOpen] = useState<boolean>(false)
    const handleTaskDialogOpen = () => {
        if (selectedList) {
            setTaskDialogOpen(true)
        } else {
            openSnackBar({
                open: true,
                message: "No list selected. Please select or create a new list",
                severity: "warning"
            })()
        }
    }

    const handleTaskDialogClose = () => {
        setTaskDialogOpen(false)
    }

    const [listSettingsDialogOpen, setListSettingsDialogOpen] = useState<boolean>(false)

    const handleListDialogOpen = () => {
        setListSettingsDialogOpen(true)
    }

    const handleListDialogClose = (_: ListSettingsDialogOpResponse) => {
        setListSettingsDialogOpen(false)
    }

    return (
        <div className="dashboard">
            <NavBar />

            <Stack direction="row" gap={3} alignItems={'center'}>
                <ListSelect authData={authData} userId={authData.id} onSelect={handleListChange} />

                {selectedList && <ListOwnerAvatar authData={authData} listId={selectedList.id} />}
                {selectedList && <ListMemberAvatar authData={authData} listId={selectedList.id} />}

                <div style={{ flex: '1 0 0' }} />

                <ButtonGroup variant="contained" aria-label="action-button">
                    {!selectedList && <Button onClick={handleListDialogOpen}>
                        <PlaylistAdd sx={{ mr: 1 }} />
                        Create List
                    </Button>}

                    {selectedList && <Button onClick={handleTaskDialogOpen}>
                        <AddTask sx={{ mr: 1 }} />
                        Add Task
                    </Button>}

                    {selectedList && <Tooltip title="Filter" arrow>
                        <Button onClick={handleFilterClick} sx={{ paddingTop: "8px", paddingBottom: "8px" }} >
                            <Badge color="secondary" variant={filterTagsSelected.length == 0 ? undefined : "dot"}>
                                <FilterAltOutlined />
                            </Badge>
                        </Button>
                    </Tooltip>}

                    {selectedList && <Tooltip title={isCompleted ? "View current tasks" : "View completed tasks"} arrow>
                        <Button onClick={handleCompletedClick} sx={{ paddingTop: "8px", paddingBottom: "8px" }} >
                            {isCompleted ? <CheckBoxOutlineBlankOutlined /> : <CheckBoxOutlined />}
                        </Button>
                    </Tooltip>}
                </ButtonGroup>
            </Stack>

            {selectedList && <TaskBoard authData={authData} listId={selectedList.id} filterTags={filterTagsSelected} isCompleted={isCompleted} />}
            {!selectedList && <Stack direction={"row"} justifyContent={"center"}>
                <img src={MutitaskingIllustration} width={"40%"} />
            </Stack>}

            {taskDialogOpen && selectedList && <TaskDialog open={taskDialogOpen} data={null} authData={authData} currentListId={selectedList.id} onClose={handleTaskDialogClose} />}
            {filterDialogOpen && selectedList && <TaskFilterDialog open={filterDialogOpen} tags={filterTagsSelected} authData={authData} listId={selectedList.id} onClose={handleFilterDialogClose} />}

            <Snackbar open={snackBarState.open} autoHideDuration={6000} onClose={closeSnackBar} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
                <Alert onClose={closeSnackBar} severity={snackBarState.severity} sx={{ width: '100%' }}>
                    {snackBarState.message}
                </Alert>
            </Snackbar>

            <ListSettingsDialog open={listSettingsDialogOpen} data={null} authData={authData} onClose={handleListDialogClose} />
        </div>
    )
}