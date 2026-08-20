import Home from "./pages/Home";
import { Routes,Route } from "react-router-dom";
import RequestHelp from "./pages/RequestHelp";
import OfferHelp from "./pages/OfferHelp";

function App()
{
  return(
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/request" element={<RequestHelp/>}/>
      <Route path="/offer" element={<OfferHelp/>}/>
    </Routes>
  );
}
export default App;