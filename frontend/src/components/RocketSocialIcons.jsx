import { useState, useEffect } from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail } from 'lucide-react';

export default function SocialMediaRocket() {
  const [position, setPosition] = useState(0);
  const [activeIcon, setActiveIcon] = useState(0);
  
  const icons = [
    { Icon: Twitter, color: "text-blue-400", bg: "bg-blue-900" },
    { Icon: Facebook, color: "text-blue-300", bg: "bg-blue-900" },
    { Icon: Instagram, color: "text-pink-400", bg: "bg-pink-900" },
    { Icon: Linkedin, color: "text-blue-300", bg: "bg-blue-900" },
    { Icon: Youtube, color: "text-red-400", bg: "bg-red-900" },
    { Icon: Mail, color: "text-gray-300", bg: "bg-gray-800" }
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      setPosition(prevPosition => {
        const newPosition = prevPosition + 1;
        if (newPosition >= 100) {
          setActiveIcon(prevIcon => (prevIcon + 1) % icons.length);
          return 0;
        }
        return newPosition;
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, [icons.length]);
  
  const { Icon, color, bg } = icons[activeIcon];
  
  return (
    <div className="w-full h-64 bg-gradient-to-r from-gray-900 to-indigo-900 rounded-lg p-6 relative overflow-hidden">
      <h2 className="text-xl font-bold text-center mb-4 text-gray-100">Social Media Rocket</h2>
      
      {/* Path visualization */}
      <div className="w-full h-px bg-gray-700 absolute top-32"></div>
      
      {/* Stars in background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-1/3 left-1/2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-2/3 left-1/3 w-1 h-1 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 left-3/4 w-1 h-1 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-3/4 left-1/5 w-2 h-2 bg-white rounded-full animate-pulse"></div>
      </div>
      
      {/* The flying social media icon */}
      <div 
        className="absolute transition-all duration-100 ease-in-out"
        style={{ 
          left: `${position}%`, 
          top: position < 50 ? `${32 - position/3}%` : `${15 + (position-50)/3}%`
        }}
      >
        {/* Rocket body */}
        <div className={`rounded-full p-3 ${bg} shadow-lg transform -rotate-12`}>
          <div className={`relative ${color}`}>
            <Icon size={28} />
            
            {/* Rocket flame */}
            <div className="absolute -bottom-2 -left-1 -rotate-45">
              <div className="flex space-x-0.5">
                <div className="w-1 h-3 bg-orange-400 rounded-full animate-pulse"></div>
                <div className="w-1 h-4 bg-yellow-300 rounded-full animate-pulse"></div>
                <div className="w-1 h-3 bg-orange-400 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Rocket trail */}
        <div className="absolute top-1/2 right-full -mr-2">
          <div className="flex space-x-1">
            <div className="w-4 h-1 bg-indigo-400 rounded-full opacity-40"></div>
            <div className="w-3 h-1 bg-indigo-300 rounded-full opacity-30"></div>
            <div className="w-2 h-1 bg-indigo-200 rounded-full opacity-20"></div>
          </div>
        </div>
      </div>
      
      {/* Social media icons at bottom */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
        {icons.map((icon, index) => (
          <div 
            key={index} 
            className={`p-2 rounded-full ${index === activeIcon ? icon.bg + ' shadow-md' : 'bg-gray-800'} cursor-pointer transition-all duration-300`}
          >
            <icon.Icon size={20} className={index === activeIcon ? icon.color : 'text-gray-500'} />
          </div>
        ))}
      </div>
    </div>
  );
}