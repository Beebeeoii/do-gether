import { Home } from './pages/home/Home'
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { Login } from './pages/login/Login';
import { Register } from './pages/register/Register';
import { Dashboard } from './pages/dashboard/Dashboard';
import { useAppSelector } from './app/hooks';
import { selectAuthenticated } from './services/auth/authSplice';
import { selectUser } from './services/user/userSplice';

function App() {
    const isLoggedIn = useAppSelector(selectAuthenticated)
    const user = useAppSelector(selectUser)

    const username = user?.username

    return (
        <div className="App">
            <Router>
                <Routes>
                    <Route path="/" element={isLoggedIn && user ? <Navigate replace to={`/dashboard/${username}`} /> : <Home />}></Route>
                    <Route path="/login" element={isLoggedIn && user ? <Navigate replace to={`/dashboard/${username}`} /> : <Login />}></Route>
                    <Route path="/register" element={isLoggedIn && user ? <Navigate replace to={`/dashboard/${username}`} /> : <Register />}></Route>
                    <Route path="/dashboard/:username" element={isLoggedIn && user ? <Dashboard /> : <Navigate to="/login" />}></Route>
                </Routes>
            </Router>
        </div>
    )
}

export default App;
