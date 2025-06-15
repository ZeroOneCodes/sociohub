import { useState } from "react";
import { Twitter, Linkedin, Instagram, Facebook, Twitch, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
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

const ConnectAppsComponent = () => {
  const [twitterConnected, setTwitterConnected] = useState(false);
  const [linkedinConnected, setLinkedinConnected] = useState(false);
  const [instagramConnected, setInstagramConnected] = useState(false);
  const [facebookConnected, setFacebookConnected] = useState(false);
  const [twitchConnected, setTwitchConnected] = useState(false);
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const [activeItem, setActiveItem] = useState("home");
  // User profile
  const [user] = useState({
    name: "Alex Johnson",
    username: "@alexjohnson",
    coins: 250,
    profileImage: "https://i.pravatar.cc/150?img=32",
  });

  const handleTwitterAuth = () => {
    setTwitterConnected(true);
  };

  const handleLinkedinAuth = () => {
    setLinkedinConnected(true);
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
      className={`bg-gradient-to-b from-[#1a1f2c] to-[#161B22] text-white flex flex-col h-screen fixed transition-all duration-300 ease-in-out border-r border-[#30363D]/50 backdrop-blur-lg shadow-2xl z-10 
      ${isNavExpanded ? "w-72" : "w-20"}`}
      onMouseEnter={() => setIsNavExpanded(true)}
      onMouseLeave={() => setIsNavExpanded(false)}
    >
      {/* Logo Section */}
      <div className={`p-6 flex items-center ${isNavExpanded ? "justify-start" : "justify-center"}`}>
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
              <h1 className="text-2xl font-semibold bg-clip-text text-white animate-shine">
                SocioHub
              </h1>
              <span className="text-xs text-gray-400">Dashboard</span>
            </div>
          </div>
        ) : (
          <div className="p-2 rounded-xl bg-gradient-to-r from-[#0078D7]/10 to-[#00A4EF]/10 hover:from-[#0078D7]/20 hover:to-[#00A4EF]/20 transition-all">
            <FaBars className="text-[#0078D7] text-xl" />
          </div>
        )}
      </div>

      {/* Profile Section */}
      <div className={`px-5 py-4 border-b border-[#30363D]/50 ${!isNavExpanded && "flex justify-center"}`}>
        {isNavExpanded ? (
          <>
            <div className="flex items-center group cursor-pointer">
              <div className="relative">
                <img
                  src={user.profileImage}
                  alt="Profile"
                  className="w-12 h-12 rounded-xl ring-2 ring-[#0078D7]/30 group-hover:ring-[#0078D7] transition-all"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#161B22]" />
              </div>
              <div className="ml-3">
                <p className="font-semibold text-white group-hover:text-[#0078D7] transition-colors">
                  {user.name}
                </p>
                <p className="text-xs text-[#0078D7]">{user.username}</p>
              </div>
            </div>
            <div className="flex items-center mt-4 p-3 bg-gradient-to-r from-[#21262D] to-[#21262D]/50 rounded-xl backdrop-blur-sm">
              <FaCoins className="text-yellow-400 mr-2" />
              <span className="text-sm font-medium">{user.coins} coins</span>
              <button className="ml-auto bg-gradient-to-r from-[#0078D7] to-[#00A4EF] hover:from-[#0068BD] hover:to-[#0094DF] text-white text-xs px-4 py-1.5 rounded-lg transition-all duration-300 shadow-lg shadow-[#0078D7]/20 hover:shadow-[#0078D7]/40">
                Add
              </button>
            </div>
          </>
        ) : (
          <div className="relative group">
            <img
              src={user.profileImage}
              alt="Profile"
              className="w-12 h-12 rounded-xl ring-2 ring-[#0078D7]/30 group-hover:ring-[#0078D7] transition-all"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#161B22]" />
          </div>
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
                    : "text-gray-400 hover:text-white hover:bg-[#21262D]"
                }`}
              >
                <span className={`${isNavExpanded ? "mr-3" : ""} text-xl transition-transform group-hover:scale-110`}>
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
        >
          <FaSignOutAlt className={`text-xl ${isNavExpanded ? "mr-3" : ""}`} />
          {isNavExpanded && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>

      {/* Main Content */}
      <main
        className={`flex-grow ${mainContentMargin} transition-all duration-300 p-8`}
      >
        <div className="w-full max-w-4xl mx-auto"> {/* Full width, centered */}
          <div className="bg-[#0D1117] rounded-xl shadow-2xl overflow-hidden border border-slate-700">
            <ConnectHeader />

            {/* Content */}
            <div className="p-6">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
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
