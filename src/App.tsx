import { Home } from './pages/home/Home'
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { Login } from './pages/login/Login';
import { Register } from './pages/register/Register';
import { Dashboard } from './pages/dashboard/Dashboard';
import { useAppSelector } from './app/hooks';
import { isAuthenticated, selectUser } from './services/auth/authSplice';

function App() {
    const isLoggedIn = useAppSelector(isAuthenticated)
    const username = useAppSelector(selectUser)

    return (
        <div className="App">
            <Router>
                <Routes>
                    <Route path="/" element={<Home />}></Route>
                    <Route path="/login" element={isLoggedIn ? <Navigate replace to={`/dashboard/${username}`} /> : <Login />}></Route>
                    <Route path="/register" element={isLoggedIn ? <Navigate replace to={`/dashboard/${username}`} /> : <Register />}></Route>
                    <Route path="/dashboard/:username" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />}></Route>
                </Routes>
            </Router>
        </div>
    )
}

export default App;
