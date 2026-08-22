import { useState } from "react";
import { Routes,Route } from "react-router-dom";
import Home from "./pages/Home";
import RequestHelp from "./pages/RequestHelp";
import OfferHelp from "./pages/OfferHelp";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

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
    }

    function handleLogout()
    {
        localStorage.removeItem("synq_user");
        localStorage.removeItem("synq_token");
        setUser(null);
    }

    return(
        <Routes>
            <Route path="/" element={<Home user={user} onLogout={handleLogout}/>}/>
            <Route path="/request" element={<RequestHelp user={user}/>}/>
            <Route path="/offer" element={<OfferHelp user={user}/>}/>
            <Route path="/login" element={<Login onLogin={handleLogin}/>}/>
            <Route path="/signup" element={<Signup onLogin={handleLogin}/>}/>
        </Routes>
    );
}

export default App;