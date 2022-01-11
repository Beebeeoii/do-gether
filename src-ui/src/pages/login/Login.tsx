import { Alert, Button, Card, Link, Snackbar, Stack, TextField, Typography } from "@mui/material"
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../app/hooks";
import { LoginResponse } from "../../interfaces/auth/AuthResponse";
import { Credentials } from "../../interfaces/auth/Credentials";
import { SnackBarState } from "../../interfaces/utils/Snackbar";
import { login } from "../../services/auth/authSplice";
import "./Login.css"

export function Login() {
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

    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    return (
        <Stack direction={"column"} marginTop={24} sx={{ width: "22rem" }}>
            <Card className="login" elevation={3}>
                <Stack direction={"column"} gap={3} sx={{ padding: "2rem 2.5rem" }}>
                    <Typography variant="h5" sx={{ fontWeight: "bold", marginBottom: "1rem" }}>
                        Log in to Do-gether
                    </Typography>

                    <TextField id="usernameInput" label="Username" variant="outlined" onChange={(e) => setUsername(e.target.value)} autoFocus />
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
                                severity: "error",
                                message: `Error: ${authPayload.error}`
                            })()
                        }
                    }}>
                        Login
                    </Button>

                    <Snackbar open={snackBarState.open} autoHideDuration={6000} onClose={closeSnackBar} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
                        <Alert onClose={closeSnackBar} severity={snackBarState.severity} sx={{ width: '100%' }}>
                            {snackBarState.message}
                        </Alert>
                    </Snackbar>
                </Stack>
            </Card>

            <Typography variant="caption" sx={{ marginTop: "1rem", marginLeft: "0.5rem" }}>
                No account?
                <Link href="/register" sx={{ marginLeft: "0.3rem" }}>
                    Register
                </Link>
            </Typography>
        </Stack>

    )
}