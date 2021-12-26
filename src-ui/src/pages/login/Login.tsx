import { Alert, Button, Snackbar, TextField } from "@mui/material"
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../app/hooks";
import { LoginResponse } from "../../interfaces/auth/AuthResponse";
import { Credentials } from "../../interfaces/auth/Credentials";
import { login } from "../../services/auth/authSplice";
import "./Login.css"

interface SnackBarState {
    open: boolean
    message: string
}

export function Login() {
    const defaultSnackBarState = {
        open: false,
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

    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    return (
        <div className="login">
            <div className="main">
                <h1 className="title">
                    Login
                </h1>

                <TextField id="usernameInput" label="Username" variant="outlined" onChange={(e) => setUsername(e.target.value)} />
                <TextField id="passwordInput" label="Password" variant="outlined" type="password" autoComplete="current-password" onChange={(e) => setPassword(e.target.value)} />
                <Button variant="contained" onClick={async () => {
                    let credentials: Credentials = {
                        username: username,
                        password: password
                    }
                    let authRes = await dispatch(login(credentials))
                    let authPayload = authRes.payload as LoginResponse

                    if (authPayload.success) {
                        navigate("/dashboard")
                    } else {
                        openSnackBar({
                            open: true,
                            message: `Error: ${authPayload.error}`
                        })()
                    }
                }}>
                    Login
                </Button>

                <Snackbar open={snackBarState.open} autoHideDuration={6000} onClose={closeSnackBar} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
                    <Alert onClose={closeSnackBar} severity="warning" sx={{ width: '100%' }}>
                        {snackBarState.message}
                    </Alert>
                </Snackbar>
            </div>
        </div>
    )
}