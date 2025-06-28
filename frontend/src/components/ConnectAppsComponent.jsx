import { useState,useEffect } from "react";
import {
  Twitter,
  Linkedin,
  Instagram,
  Facebook,
  Twitch,
  CheckCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FaHome,
  FaRobot,
  FaPlug,
  FaCoins,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa";
import ConnectHeader from "./ConnectHeader";
import SocialCard from "./SocialCard";
import { useNavigate } from "react-router-dom";
const baseURL = import.meta.env.VITE_API_BASE_URL;

const ConnectAppsComponent = () => {
  const [twitterConnected, setTwitterConnected] = useState(false);
  const [linkedinConnected, setLinkedinConnected] = useState(false);
  const [instagramConnected, setInstagramConnected] = useState(false);
  const [facebookConnected, setFacebookConnected] = useState(false);
  const [twitchConnected, setTwitchConnected] = useState(false);
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const [activeItem, setActiveItem] = useState("home");
  const navigate = useNavigate();

  useEffect(() => {
  const checkTwitterAuth = async () => {
    try {
      const userId = localStorage.getItem('userId');
      console.log("Checking Twitter status for user:", userId);
      
      const response = await axios.get(`${baseURL}/api/v1/auth/twitter/status`, {
        withCredentials: true,
        headers: {
          'User-ID': userId,
        },
      });

      console.log("Twitter API response:", response.data);
      
      // Update connection status based on the new response format
      const isConnected = response.data.status && 
                         response.data.tokens?.hasToken && 
                         response.data.tokens?.hasSecret;
      
      setTwitterConnected(isConnected);
      
      // Store profile info if connected
      if (isConnected) {
        console.log("Twitter connected with profile:", response.data.profile);
        localStorage.setItem('twitterProfile', JSON.stringify({
          name: response.data.profile.name,
          screenName: response.data.profile.screen_name
        }));
      } else {
        console.log("Twitter not connected");
        localStorage.removeItem('twitterProfile');
      }

    } catch (error) {
      console.error('Error checking Twitter authentication:', error);
      setTwitterConnected(false);
      localStorage.removeItem('twitterProfile');
    }
  };
  
  checkTwitterAuth();
}, []);

  useEffect(() => {
  const checkLinkedInAuth = async () => {
    try {
      const userId = localStorage.getItem('userId');
      console.log("Checking LinkedIn status for user:", userId);
      
      const response = await axios.get(`${baseURL}/api/v1/auth/linkedin/status`, {  // Changed from /callback to /status
        withCredentials: true,
        headers: {
          'User-ID': userId,
        },
      });

      console.log("LinkedIn API response:", response.data);
      
      // Update connection status based on the response
      const isConnected = response.data.status && 
                         response.data.tokens?.hasAccessToken;
      
      setLinkedinConnected(isConnected);
      
      // Store profile info if connected
      if (isConnected) {
        console.log("LinkedIn connected with profile:", response.data.profile);
        localStorage.setItem('linkedinProfile', JSON.stringify({
          name: response.data.profile.name,
          email: response.data.profile.email,
          picture: response.data.profile.picture
        }));
      } else {
        console.log("LinkedIn not connected");
        localStorage.removeItem('linkedinProfile');
      }

    } catch (error) {
      console.error('Error checking LinkedIn authentication:', error);
      setLinkedinConnected(false);
      localStorage.removeItem('linkedinProfile');
    }
  };
  
  checkLinkedInAuth();
}, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${baseURL}/api/v1/auth/logout`,
        {},
        {
          withCredentials: true,
        }
      );
      sessionStorage.removeItem("accessToken");
      localStorage.removeItem("userId");
      navigate("/login");
    } catch (err) {
      console.error("Logout error:", err);
      sessionStorage.removeItem("accessToken");
      localStorage.removeItem("userId");
      navigate("/login");
    }
  };

  // User profile
  const [user] = useState({
    name: "Alex Johnson",
    username: "@alexjohnson",
    coins: 250,
    profileImage: "https://i.pravatar.cc/150?img=32",
  });

  const handleTwitterAuth = () => {
    window.location.href = `${baseURL}/api/v1/auth/twitter`;
  };

  const handleLinkedinAuth = () => {
    window.location.href = `${baseURL}/api/v1/auth/linkedin`;
  };

  const handleInstagramAuth = () => {
    setInstagramConnected(true);
  };

  const handleFacebookAuth = () => {
    setFacebookConnected(true);
  };

  const handleTwitchAuth = () => {
    setTwitchConnected(true);
  };

  const navItems = [
    { icon: <FaHome />, label: "Home", active: false, path: "/postboth" },
    {
      icon: <FaPlug />,
      label: "Connect Apps",
      active: true,
      path: "/connect/apps",
    },
  ];

  const mainContentMargin = isNavExpanded ? "ml-64" : "ml-16";

  return (
    <div className="min-h-screen flex bg-[#0D1117]">
      {/* Sidebar Navigation */}
      <aside
        className={`text-white flex flex-col h-screen fixed transition-all duration-300 ease-in-out border-r border-[#30363D]/50 backdrop-blur-lg shadow-2xl z-10 
      ${isNavExpanded ? "w-72" : "w-20"}`}
        style={{ backgroundColor: "rgb(25,26,26)" }}
        onMouseEnter={() => setIsNavExpanded(true)}
        onMouseLeave={() => setIsNavExpanded(false)}
      >
        {/* Logo Section */}
        <div
          className={`p-6 flex items-center ${
            isNavExpanded ? "justify-start" : "justify-center"
          }`}
        >
          {isNavExpanded ? (
            <div className="flex items-center gap-3">
              <Link to="/" className="hover:opacity-80 transition group">
                <img
                  src="/l1.PNG"
                  alt="logo"
                  className="h-10 w-10 object-contain rounded-xl shadow-lg group-hover:scale-105 transition-transform"
                />
              </Link>
              <div className="flex flex-col">
                <h1 className="text-2xl bg-clip-text text-white font-semibold animate-shine">
                  SocioHub
                </h1>
              </div>
            </div>
          ) : (
            <div className="p-2 rounded-xl  hover:bg-gray-100 transition-all">
              <FaBars className="text-[#11111] text-xl" />
            </div>
          )}
        </div>

        {/* Profile Section */}
        <div
          className={`px-5 py-4 border-b border-[#30363D]/50 ${
            !isNavExpanded && "flex justify-center"
          }`}
        >
          {isNavExpanded ? (
            <>
              <div className="flex items-center group cursor-pointer">
                <div className="ml-3">
                  <p className="font-semibold text-white group-hover:text-[#0078D7] transition-colors">
                    {user.name}
                  </p>
                  <p className="text-xs text-[#0078D7]">{user.username}</p>
                </div>
              </div>
              <div
                className="flex items-center mt-4 p-3 rounded-xl backdrop-blur-sm"
                style={{ backgroundColor: "rgb(32,34,34)" }}
              >
                <span className="text-sm font-medium">{user.coins} coins</span>
              </div>
            </>
          ) : (
            <div className="relative group"></div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-grow py-6">
          <ul className="space-y-2 px-3">
            {navItems.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.path}
                  onClick={() => setActiveItem(item.id)}
                  className={`flex items-center ${
                    isNavExpanded ? "px-4" : "justify-center px-0"
                  } py-3 rounded-xl font-medium transition-all duration-300 group
                ${
                  activeItem === item.id
                    ? "bg-gradient-to-r from-[#0078D7]/20 to-[#00A4EF]/10 text-[#0078D7]"
                    : "text-gray-400 hover:text-white"
                }`}
                  style={{
                    backgroundColor:
                      activeItem === item.id
                        ? "rgba(0,120,215,0.15)"
                        : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (activeItem !== item.id) {
                      e.target.style.backgroundColor = "rgb(32,34,34)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeItem !== item.id) {
                      e.target.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  <span
                    className={`${
                      isNavExpanded ? "mr-3" : ""
                    } text-xl transition-transform group-hover:scale-110`}
                  >
                    {item.icon}
                  </span>
                  {isNavExpanded && (
                    <span className="text-sm">{item.label}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Section */}
        <div className={`p-5 ${!isNavExpanded && "flex justify-center"}`}>
          <button
            className={`flex items-center w-full px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl transition-all duration-300
        ${isNavExpanded ? "" : "justify-center"}`}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "rgba(248,113,113,0.1)";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
            }}
            onClick={handleLogout}
          >
            <FaSignOutAlt
              className={`text-xl ${isNavExpanded ? "mr-3" : ""}`}
            />
            {isNavExpanded && (
              <span className="text-sm font-medium">Logout</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`flex-grow ${mainContentMargin} transition-all duration-300 p-8`}
        style={{ backgroundColor: "rgb(32,34,34)" }}
      >
        <div className="w-full max-w-4xl mx-auto">
          {" "}
          {/* Full width, centered */}
          <div
            className="rounded-xl shadow-2xl overflow-hidden border border-slate-700"
            style={{ backgroundColor: "rgb(32,34,34)" }}
          >
            <ConnectHeader />

            {/* Content */}
            <div className="p-6">
              <div className="text-center mb-8">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: "rgb(25,27,27)" }}
                >
                  <CheckCircle className="text-blue-400 text-3xl" />
                </div>
                <h2 className="text-xl font-semibold text-white">
                  Social Connections
                </h2>
                <p className="text-slate-300 mt-2">
                  Connect your social media accounts to unlock all features.
                </p>
              </div>

              <div className="space-y-4">
                <SocialCard
                  icon={Twitter}
                  name="Twitter"
                  isConnected={twitterConnected}
                  onConnect={handleTwitterAuth}
                />
                <SocialCard
                  icon={Linkedin}
                  name="LinkedIn"
                  isConnected={linkedinConnected}
                  onConnect={handleLinkedinAuth}
                />
                <SocialCard
                  icon={Instagram}
                  name="Instagram"
                  isConnected={instagramConnected}
                  onConnect={handleInstagramAuth}
                />
                <SocialCard
                  icon={Facebook}
                  name="Facebook"
                  isConnected={facebookConnected}
                  onConnect={handleFacebookAuth}
                />
                <SocialCard
                  icon={Twitch}
                  name="Twitch"
                  isConnected={twitchConnected}
                  onConnect={handleTwitchAuth}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConnectAppsComponent;
