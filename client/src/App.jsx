import Home from "./pages/Home";
import { Routes,Route } from "react-router-dom";
import RequestHelp from "./pages/RequestHelp";

function App()
{
  return(
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/request" element={<RequestHelp/>}/>
    </Routes>
  );
}
export default App;