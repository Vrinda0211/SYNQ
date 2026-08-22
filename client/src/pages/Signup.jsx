import { useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import "../styles/Signup.css";

export default function Signup({onLogin})
{
    const [name,setName]=useState("");
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    const [confirmPassword,setConfirmPassword]=useState("");
    const [msg,setMsg]=useState("");
    const [busy,setBusy]=useState(false);
    const navigate=useNavigate();

    async function handleSubmit(e)
    {
        e.preventDefault();
        setMsg("");

        if(!name||!email||!password||!confirmPassword)
        {
            setMsg("Please fill all fields.");
            return;
        }

        if(password!==confirmPassword)
        {
            setMsg("Passwords do not match.");
            return;
        }

        if(password.length<6)
        {
            setMsg("Password must contain at least 6 characters.");
            return;
        }

        setBusy(true);

        try
        {
            const response=await fetch("http://localhost:3001/api/auth/signup",
                {
                    method:"POST",
                    headers:
                    {
                        "Content-Type":"application/json"
                    },
                    body:JSON.stringify(
                        {
                            name,
                            email,
                            password
                        }
                    )
                }
            );

            const data=await response.json();

            if(!response.ok)
            {
                setMsg(data.error||"Could not create account.");
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
        <div className="Signup">
            <form className="SignupForm" onSubmit={handleSubmit}>
                <h1 className="SignupTitle">Join SYNQ</h1>

                <p className="SignupSubtitle">
                    Create an account to connect with your community
                </p>

                <div className="SignupGroup">
                    <label className="SignupLabel">Name</label>

                    <input
                        className="SignupInput"
                        type="text"
                        value={name}
                        onChange={(e)=>setName(e.target.value)}
                        placeholder="Enter your name"
                    />
                </div>

                <div className="SignupGroup">
                    <label className="SignupLabel">Email</label>

                    <input
                        className="SignupInput"
                        type="email"
                        value={email}
                        onChange={(e)=>setEmail(e.target.value)}
                        placeholder="Enter your email"
                    />
                </div>

                <div className="SignupGroup">
                    <label className="SignupLabel">Password</label>

                    <input
                        className="SignupInput"
                        type="password"
                        value={password}
                        onChange={(e)=>setPassword(e.target.value)}
                        placeholder="Create a password"
                    />
                </div>

                <div className="SignupGroup">
                    <label className="SignupLabel">Confirm Password</label>

                    <input
                        className="SignupInput"
                        type="password"
                        value={confirmPassword}
                        onChange={(e)=>setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                    />
                </div>

                {msg&&
                    <div className="SignupMessage">
                        {msg}
                    </div>
                }

                <button
                    type="submit"
                    className="SignupButton"
                    disabled={busy}
                >
                    {busy?"Creating Account...":"Create Account"}
                </button>

                <p className="LoginPrompt">
                    Already have an account?{" "}
                    <Link to="/login">Login</Link>
                </p>

                <button
                    type="button"
                    className="SignupBackButton"
                    onClick={()=>navigate("/")}
                >
                    Back to Home
                </button>
            </form>
        </div>
    );
}