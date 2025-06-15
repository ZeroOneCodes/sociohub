import { CheckCircle } from "lucide-react";

const SocialCard = ({ icon: Icon, name, isConnected, onConnect }) => {
  return (
    <div
      className={`border rounded-lg p-4 transition-all duration-300 ${
        isConnected
          ? "border-emerald-700 bg-slate-700"
          : "border-slate-600 hover:border-blue-500 bg-slate-700"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-full ${
              isConnected
                ? "bg-emerald-900 text-emerald-400"
                : "bg-slate-600 text-blue-400"
            }`}
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
