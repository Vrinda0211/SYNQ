import { useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import "../styles/Login.css";

export default function Login()
{
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    const [msg,setMsg]=useState("");
    const navigate=useNavigate();

    function handleSubmit(e)
    {
        e.preventDefault();
        setMsg("");

        if(!email||!password)
        {
            setMsg("Please enter your email and password.");
            return;
        }

        setMsg("Login details are valid.");
    }

    return(
        <div className="Login">
            <form className="LoginForm" onSubmit={handleSubmit}>
                <h1 className="LoginTitle">Welcome Back</h1>

                <p className="LoginSubtitle">
                    Sign in to continue to SYNQ
                </p>

                <div className="LoginGroup">
                    <label className="LoginLabel">Email</label>

                    <input
                        className="LoginInput"
                        type="email"
                        value={email}
                        onChange={(e)=>setEmail(e.target.value)}
                        placeholder="Enter your email"
                    />
                </div>

                <div className="LoginGroup">
                    <label className="LoginLabel">Password</label>

                    <input
                        className="LoginInput"
                        type="password"
                        value={password}
                        onChange={(e)=>setPassword(e.target.value)}
                        placeholder="Enter your password"
                    />
                </div>

                {msg&&
                    <div className="LoginMessage">
                        {msg}
                    </div>
                }

                <button
                    type="submit"
                    className="LoginButton"
                >
                    Login
                </button>

                <p className="SignupPrompt">
                    Don't have an account?{" "}
                    <Link to="/signup">Sign up</Link>
                </p>

                <button
                    type="button"
                    className="BackButton"
                    onClick={()=>navigate("/")}
                >
                    Back to Home
                </button>
            </form>
        </div>
    );
}