import Button from '@mui/material/Button'
import './NavBar.css'

export function NavBar() {
    return (
        <nav className="navBar">
            <h1>
                Do-gether
            </h1>

            <div className="menu">
                <Button className="menuButton" variant="outlined" sx={{mx: "12px"}} href="/register">Register</Button>
                <Button className="menuButton" variant="contained" sx={{mx: "12px"}} href="/login">Login</Button>
            </div>
        </nav>
    )
}