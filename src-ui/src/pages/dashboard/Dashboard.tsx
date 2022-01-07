import { useEffect, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { NavBar } from "../../components/nav/NavBar"
import "./Dashboard.css"
import { UserRequest } from "../../interfaces/user/UserRequest";
import { Button, ButtonGroup, ClickAwayListener, Grow, MenuItem, MenuList, Paper, Popper, Stack } from "@mui/material";
import { AddTask, ArrowDropDown, ArrowRight } from "@mui/icons-material";
import { List } from "../../interfaces/list/List";
import { retrieveUserInfo, selectUserStatus } from "../../services/user/userSplice";
import { selectId, selectToken } from "../../services/auth/authSplice";
import { AuthData } from "../../interfaces/auth/Auth";
import { ListSelect } from "../../components/listSelect/ListSelect";
import { TaskBoard } from "../../components/taskBoard/TaskBoard";
import { TaskDialog } from "../../components/taskDialog/TaskDialog";
import { ListMemberAvatar } from "../../components/listMemberAvatars/ListMemberAvatars";
import { ListOwnerAvatar } from "../../components/listOwnerAvatar/ListOwnerAvatar";
import { TaskFilterDialog } from "../../components/taskFilterDialog/TaskFilterDialog";

const options = ['Add task', 'Filter']
const DEFAULT_FILTER_TAGS_SELECTED_VALUE: Array<string> = []

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

    const anchorRef = useRef<HTMLDivElement>(null)
    const [actionDropdownOpen, setActionDropdownOpen] = useState<boolean>(false)
    const [selectedOptionIndex, setSelectedOptionIndex] = useState<number>(0)

    const handleActionDropdownToggle = () => {
        setActionDropdownOpen((prevOpen) => !prevOpen)
    }

    const handleActionDropdownClose = (event: Event) => {
        if (anchorRef.current && anchorRef.current.contains(event.target as HTMLElement)) {
            return
        }

        setActionDropdownOpen(false)
    }

    const handleActionDropdownMenuItemClick = (_: React.MouseEvent<HTMLLIElement, MouseEvent>, index: number,) => {
        setSelectedOptionIndex(index)
        switch (index) {
            case 0: {
                setFilterDialogOpen(true)
                break
            }
            default: {
                break
            }
        }
        setActionDropdownOpen(false)
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

                {selectedList && <ListOwnerAvatar authData={authData} listId={selectedList.id} />}
                {selectedList && <ListMemberAvatar authData={authData} listId={selectedList.id} />}

                <div style={{ flex: '1 0 0' }} />

                <ButtonGroup variant="contained" ref={anchorRef} aria-label="action-button">
                    <Button onClick={handleTaskDialogOpen}>
                        <AddTask sx={{ mr: 1 }} />
                        {options[selectedOptionIndex]}
                    </Button>
                    <Button
                        size="small"
                        aria-controls={actionDropdownOpen ? 'split-button-menu' : undefined}
                        aria-expanded={actionDropdownOpen ? 'true' : undefined}
                        aria-label="select merge strategy"
                        aria-haspopup="menu"
                        onClick={handleActionDropdownToggle}
                    >
                        <ArrowDropDown />
                    </Button>
                </ButtonGroup>

                <Popper
                    open={actionDropdownOpen}
                    anchorEl={anchorRef.current}
                    transition
                    disablePortal
                    placement="bottom-end"
                    style={{ zIndex: 2 }}
                >
                    {({ TransitionProps }) => (
                        <Grow
                            {...TransitionProps}
                            style={{
                                transformOrigin: 'center top'
                            }}
                        >
                            <Paper>
                                <ClickAwayListener onClickAway={handleActionDropdownClose}>
                                    <MenuList id="action-dropdown-menu">
                                        {options.slice(1).map((option, index) => (
                                            <MenuItem
                                                key={option}
                                                selected={index === selectedOptionIndex}
                                                onClick={(event) => handleActionDropdownMenuItemClick(event, index)}
                                            >
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </MenuList>
                                </ClickAwayListener>
                            </Paper>
                        </Grow>
                    )}
                </Popper>
            </Stack>

            {selectedList && <TaskBoard authData={authData} listId={selectedList.id} filterTags={filterTagsSelected}/>}
            {taskDialogOpen && selectedList && <TaskDialog open={taskDialogOpen} data={null} authData={authData} currentListId={selectedList.id} onClose={handleTaskDialogClose} />}

            {filterDialogOpen && selectedList && <TaskFilterDialog open={filterDialogOpen} tags={filterTagsSelected} authData={authData} listId={selectedList.id} onClose={handleFilterDialogClose} />}
        </div>
    )
}