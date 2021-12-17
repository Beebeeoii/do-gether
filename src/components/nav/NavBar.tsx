import { Logout, Settings } from '@mui/icons-material'
import { Avatar, Divider, IconButton, ListItemIcon, Menu, MenuItem } from '@mui/material'
import Button from '@mui/material/Button'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { selectAuthenticated, logout } from '../../services/auth/authSplice'
import { selectUser } from '../../services/user/userSplice'
import './NavBar.css'

function stringToColor(string: string) {
    let hash = 0
    let i

    for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash)
    }

    let color = '#'

    for (i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff
        color += `00${value.toString(16)}`.substr(-2)
    }

    return color
}

function stringAvatar(name: string) {
    return {
        sx: {
            bgcolor: stringToColor(name),
        },
        children: name.split(' ')[0][0]
    }
}

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
            <h1>
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
                <MenuItem>
                    <ListItemIcon>
                        <Settings fontSize="small" />
                    </ListItemIcon>
                    Settings
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => {
                    dispatch(logout())
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