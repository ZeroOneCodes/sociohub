import Home from "./components/Home"
import Signup from "./components/Signup"
import Login from "./components/Login"
import { BrowserRouter as Router,Routes,Route } from "react-router-dom"
import Logout from "./components/Logout"
import Contact from "./components/Contact"
import Terms from "./components/Terms"
import PrivacyPolicy from "./components/PrivacyPolicy"
import OAuthLogin from "./components/OAuthLogin"
import CombinedSocialPost from "./components/CombinedSocialPost"
import ConnectAppsComponent from "./components/ConnectAppsComponent"
function App() {
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />}/>
        <Route path="/signup" element={<Signup />}/>
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />}/>
        <Route path="/contact" element={<Contact />}/>
        <Route path="/terms" element={<Terms />}/>
        <Route path="/privacy" element={<PrivacyPolicy />}/>
        <Route path="/auth/platorms" element={<OAuthLogin />}/>
        <Route path="/postboth" element={<CombinedSocialPost />} />
        <Route path="/connect/apps" element={<ConnectAppsComponent />}/>
      </Routes>
      
    </Router>
  )
}

export default App
