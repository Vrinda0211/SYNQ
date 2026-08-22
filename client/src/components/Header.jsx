import { useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import "../styles/Header.css";

export default function Header({user,onLogout})
{
    const [menuOpen,setMenuOpen]=useState(false);
    const navigate=useNavigate();

    function handleLogout()
    {
        setMenuOpen(false);
        onLogout();
        navigate("/");
    }

    const initials=user?
        user.name
            .split(" ")
            .map((name)=>name[0])
            .join("")
            .slice(0,2)
            .toUpperCase()
        :"";

    return(
        <header className="Header">
            <div className="HeaderLeft">
                <Link to="/" className="Logo">
                    SYNQ
                </Link>

                <nav className="Navigation">
                    <Link to="/" className="NavLink">
                        Home
                    </Link>

                    <Link to="/request" className="NavLink">
                        Request Help
                    </Link>

                    <Link to="/offer" className="NavLink">
                        Offer Help
                    </Link>
                </nav>
            </div>

            <div className="HeaderRight">
                {user?
                    <div className="ProfileContainer">
                        <button
                            className="ProfileButton"
                            onClick={()=>setMenuOpen(!menuOpen)}
                        >
                            <span className="Avatar">
                                {initials}
                            </span>

                            <span className="ProfileArrow">
                                {menuOpen?"▲":"▼"}
                            </span>
                        </button>

                        {menuOpen&&
                            <div className="ProfileMenu">
                                <div className="ProfileInfo">
                                    <span className="MenuAvatar">
                                        {initials}
                                    </span>

                                    <div>
                                        <div className="ProfileName">
                                            {user.name}
                                        </div>

                                        <div className="ProfileEmail">
                                            {user.email}
                                        </div>
                                    </div>
                                </div>

                                <div className="MenuDivider"></div>

                                <Link
                                    to="/profile"
                                    className="MenuItem"
                                    onClick={()=>setMenuOpen(false)}
                                >
                                    My Profile
                                </Link>

                                <Link
                                    to="/my-requests"
                                    className="MenuItem"
                                    onClick={()=>setMenuOpen(false)}
                                >
                                    My Requests
                                </Link>

                                <Link
                                    to="/my-offers"
                                    className="MenuItem"
                                    onClick={()=>setMenuOpen(false)}
                                >
                                    My Offers
                                </Link>

                                <Link
                                    to="/settings"
                                    className="MenuItem"
                                    onClick={()=>setMenuOpen(false)}
                                >
                                    Settings
                                </Link>

                                <div className="MenuDivider"></div>

                                <button
                                    className="LogoutMenuItem"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            </div>
                        }
                    </div>
                    :
                    <div className="AuthButtons">
                        <Link to="/login" className="LoginNavButton">
                            Login
                        </Link>

                        <Link to="/signup" className="SignupNavButton">
                            Sign Up
                        </Link>
                    </div>
                }
            </div>
        </header>
    );
}