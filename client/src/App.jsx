import { Routes,Route } from "react-router-dom";
import Home from "./pages/Home";
import RequestHelp from "./pages/RequestHelp";
import OfferHelp from "./pages/OfferHelp";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function App()
{
    return(
        <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/request" element={<RequestHelp/>}/>
            <Route path="/offer" element={<OfferHelp/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/signup" element={<Signup/>}/>
        </Routes>
    );
}

export default App;