import { NavBar } from "../../components/nav/NavBar"
import "./Dashboard.css"

export function Dashboard() {
    return (
        <div className="dashboard">
            <NavBar />

            <div className="main">
                <h1 className="title">
                    Do-gether.
                    Your To-Do List with friends.
                </h1>
            </div>
        </div>
    )
}