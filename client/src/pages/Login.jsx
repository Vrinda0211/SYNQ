import { useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import "../styles/Login.css";

export default function Login({onLogin})
{
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    const [msg,setMsg]=useState("");
    const [busy,setBusy]=useState(false);
    const navigate=useNavigate();

    async function handleSubmit(e)
    {
        e.preventDefault();
        setMsg("");

        if(!email||!password)
        {
            setMsg("Please enter your email and password.");
            return;
        }

        setBusy(true);

        try
        {
            const response=await fetch("http://localhost:3001/api/auth/login",
                {
                    method:"POST",
                    headers:
                    {
                        "Content-Type":"application/json"
                    },
                    body:JSON.stringify(
                        {
                            email,
                            password
                        }
                    )
                }
            );

            const data=await response.json();

            if(!response.ok)
            {
                setMsg(data.error||"Login failed.");
                return;
            }

            localStorage.setItem("synq_token",data.token);
            localStorage.setItem("synq_user",JSON.stringify(data.user));
            onLogin(data.user);

            navigate("/");
        }
        catch(error)
        {
            console.error(error);
            setMsg("Unable to connect to the server.");
        }
        finally
        {
            setBusy(false);
        }
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
                    disabled={busy}
                >
                    {busy?"Logging in...":"Login"}
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