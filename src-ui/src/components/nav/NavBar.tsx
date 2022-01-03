import { Logout, Settings, People } from '@mui/icons-material'
import { Avatar, Divider, IconButton, ListItemIcon, Menu, MenuItem } from '@mui/material'
import Button from '@mui/material/Button'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { selectAuthenticated, logout } from '../../services/auth/authSplice'
import { resetLists } from '../../services/list/listSplice'
import { resetTasks } from '../../services/task/taskSplice'
import { resetUsers, selectUser } from '../../services/user/userSplice'
import { stringAvatar } from '../../utils/utils'
import './NavBar.css'

export function NavBar() {
    const isLoggedIn = useAppSelector(selectAuthenticated)
    const user = useAppSelector(selectUser)

    let username = ""

    if (user !== null) {
        username = user.username
    }

    const dispatch = useAppDispatch()
    const navigate = useNavigate()

    const [anchorEl, setAnchorEl] = useState<HTMLElement>()
    const isMenuOpen = Boolean(anchorEl)
    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget)
    };
    const handleClose = () => {
        setAnchorEl(undefined)
    };

    return (
        <nav className="navBar">
            <h1 className='logo' onClick={() => navigate("/dashboard")}>
                Do-gether
            </h1>

            {!isLoggedIn && <div className="menu">
                <Button className="menuButton" variant="outlined" sx={{ mx: "12px" }} href="/register">Register</Button>
                <Button className="menuButton" variant="contained" sx={{ mx: "12px" }} href="/login">Login</Button>
            </div>}

            {isLoggedIn && <IconButton onClick={handleMenuClick} size="small" sx={{ ml: 2 }}>
                <Avatar {...stringAvatar(username)} />
            </IconButton>}

            <Menu
                anchorEl={anchorEl}
                open={isMenuOpen}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                    elevation: 0,
                    sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        '& .MuiAvatar-root': {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                        },
                        '&:before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                        },
                    },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={() => {
                    navigate("/friends")
                }}>
                    <ListItemIcon>
                        <People fontSize="small" />
                    </ListItemIcon>
                    Friends
                </MenuItem>

                <MenuItem>
                    <ListItemIcon>
                        <Settings fontSize="small" />
                    </ListItemIcon>
                    Settings
                </MenuItem>

                <Divider />

                <MenuItem onClick={() => {
                    dispatch(logout())
                    dispatch(resetLists())
                    dispatch(resetTasks())
                    dispatch(resetUsers())
                    navigate("/login")
                }}>
                    <ListItemIcon>
                        <Logout fontSize="small" />
                    </ListItemIcon>
                    Logout
                </MenuItem>
            </Menu>
        </nav>
    )
}