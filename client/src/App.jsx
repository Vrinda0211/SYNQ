import { useState } from "react";
import { Routes,Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import RequestHelp from "./pages/RequestHelp";
import OfferHelp from "./pages/OfferHelp";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import MapDashboard from "./pages/MapDashboard";
import RequestOfferDetails from "./pages/RequestOfferDetails";

function App()
{
    const [user,setUser]=useState(()=>
    {
        const savedUser=localStorage.getItem("synq_user");
        return savedUser?JSON.parse(savedUser):null;
    });

    function handleLogin(userData)
    {
        setUser(userData);
        localStorage.setItem(
            "synq_user",
            JSON.stringify(userData)
        );
    }

    function handleLogout()
    {
        localStorage.removeItem("synq_user");
        localStorage.removeItem("synq_token");
        setUser(null);
    }

    return(
        <>
            <Header
                user={user}
                onLogout={handleLogout}
            />

            <Routes>
                <Route
                    path="/"
                    element={<Home user={user}/>}
                />

                <Route
                    path="/request"
                    element={<RequestHelp user={user}/>}
                />

                <Route
                    path="/offer"
                    element={<OfferHelp user={user}/>}
                />

                <Route
                    path="/login"
                    element={<Login onLogin={handleLogin}/>}
                />

                <Route
                    path="/signup"
                    element={<Signup onLogin={handleLogin}/>}
                />

                <Route
                    path="/map"
                    element={<MapDashboard/>}
                />

                <Route
                    path="/details"
                    element={<RequestOfferDetails/>}
                />
            </Routes>
        </>
    );
}

export default App;