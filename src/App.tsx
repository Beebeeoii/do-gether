import { Home } from './pages/home/Home'
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { Login } from './pages/login/Login';
import { Register } from './pages/register/Register';
import { Dashboard } from './pages/dashboard/Dashboard';
import { useAppSelector } from './app/hooks';
import { selectAuthenticated, selectToken, selectUserId, selectUsername } from './services/auth/authSplice';
import { retrieveUserInfo, selectUser } from './services/user/userSplice';
import { useDispatch } from 'react-redux';
import { UserRequest } from './interfaces/user/UserRequest';

function App() {
    const isLoggedIn = useAppSelector(selectAuthenticated)
    const token = useAppSelector(selectToken)
    const userId = useAppSelector(selectUserId)
    const username = useAppSelector(selectUsername)
    const user = useAppSelector(selectUser)
    const dispatch = useDispatch()

    if (isLoggedIn && !user) {
        let userRequest: UserRequest = {
            userId: userId!,
            token: token
        }
        dispatch(retrieveUserInfo(userRequest))
    }

    return (
        <div className="App">
            <Router>
                <Routes>
                    <Route path="/" element={isLoggedIn ? <Navigate replace to={`/dashboard/${username}`} /> : <Home />}></Route>
                    <Route path="/login" element={isLoggedIn ? <Navigate replace to={`/dashboard/${username}`} /> : <Login />}></Route>
                    <Route path="/register" element={isLoggedIn ? <Navigate replace to={`/dashboard/${username}`} /> : <Register />}></Route>
                    <Route path="/dashboard/:username" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />}></Route>
                </Routes>
            </Router>
        </div>
    )
}

export default App;
