import { NavBar } from "../../components/nav/NavBar"
import "./Home.css"

export function Home() {
    return (
        <div className="home">
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