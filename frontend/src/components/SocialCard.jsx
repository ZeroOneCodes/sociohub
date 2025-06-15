import { CheckCircle } from "lucide-react";

const SocialCard = ({ icon: Icon, name, isConnected, onConnect }) => {
  return (
    <div
      className={`border rounded-lg p-4 transition-all duration-300 ${
        isConnected
          ? "border-emerald-700"
          : "border-slate-600 hover:border-blue-500"
      }`}
      style={{
        backgroundColor: isConnected 
          ? 'rgb(32,34,34)' 
          : 'rgb(32,34,34)'
      }}
      onMouseEnter={(e) => {
        if (!isConnected) {
          e.target.style.backgroundColor = 'rgb(38,40,40)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isConnected) {
          e.target.style.backgroundColor = 'rgb(32,34,34)';
        }
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-full ${
              isConnected
                ? "text-emerald-400"
                : "text-blue-400"
            }`}
            style={{
              backgroundColor: isConnected 
                ? 'rgb(16,78,44)' 
                : 'rgb(25,27,27)'
            }}
          >
            <Icon size={20} />
          </div>
          <span className="font-medium text-white">{name}</span>
        </div>
        {isConnected ? (
          <span className="text-sm text-emerald-400 flex items-center">
            <CheckCircle size={16} className="mr-1" /> Connected
          </span>
        ) : (
          <button
            onClick={onConnect}
            className="px-4 py-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            Connect
          </button>
        )}
      </div>
    </div>
  );
};

export default SocialCard;