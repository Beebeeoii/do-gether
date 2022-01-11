import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { Login } from './pages/login/Login';
import { Register } from './pages/register/Register';
import { Dashboard } from './pages/dashboard/Dashboard';
import { useAppSelector } from './app/hooks';
import { selectId, selectToken } from './services/auth/authSplice';
import { Friends } from './pages/friends/Friends';

function App() {
    const token = useAppSelector(selectToken)
    const userId = useAppSelector(selectId)

    let isLoggedIn = false

    if (token && userId) {
        isLoggedIn = true
    }

    return (
        <div className="App">
            <Router>
                <Routes>
                    <Route path="/" element={isLoggedIn ? <Navigate replace to="/dashboard" /> : <Navigate replace to="/login" />}></Route>
                    <Route path="/login" element={isLoggedIn ? <Navigate replace to="/dashboard" /> : <Login />}></Route>
                    <Route path="/register" element={isLoggedIn ? <Navigate replace to="/dashboard" /> : <Register />}></Route>
                    <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />}></Route>
                    <Route path="/friends" element={isLoggedIn ? <Friends /> : <Navigate to="/login" />}></Route>
                </Routes>
            </Router>
        </div>
    )
}

export default App;
