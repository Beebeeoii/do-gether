import { Alert, Button, Card, Container, Link, Snackbar, Stack, TextField, Typography } from "@mui/material"
import { KeyboardEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../app/hooks";
import { LoginResponse } from "../../interfaces/auth/AuthResponse";
import { Credentials } from "../../interfaces/auth/Credentials";
import { SnackBarState } from "../../interfaces/utils/Snackbar";
import { login } from "../../services/auth/authSplice";

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

    const onLogin = async () => {
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
    }

    const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter") {
            onLogin()
        }
    }

    return (
        <Container maxWidth="xs">
            <Stack direction={"column"} marginTop={"8rem"}>
                <Card className="login" elevation={3}>
                    <Stack direction={"column"} gap={3} sx={{ padding: "2rem 2.5rem" }}>
                        <Typography variant="h5" sx={{ fontWeight: "bold", marginBottom: "1rem" }}>
                            Log in to Do-gether
                        </Typography>

                        <TextField id="usernameInput" label="Username" variant="outlined" onChange={(e) => setUsername(e.target.value)} onKeyDown={onKeyDown} autoFocus />
                        <TextField id="passwordInput" label="Password" variant="outlined" type="password" autoComplete="current-password" onChange={(e) => setPassword(e.target.value)} onKeyDown={onKeyDown} />
                        <Button variant="contained" onClick={onLogin}>
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
        </Container>
    )
}