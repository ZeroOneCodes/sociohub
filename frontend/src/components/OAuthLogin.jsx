import { useState } from 'react';
import { Twitter, Linkedin, CheckCircle } from 'lucide-react';

const OAuthLogin = () => {
  const [twitterConnected, setTwitterConnected] = useState(false);
  const [linkedinConnected, setLinkedinConnected] = useState(false);

  const handleTwitterAuth = () => {
    // Implement Twitter OAuth logic here
    setTwitterConnected(true);
  };

  const handleLinkedinAuth = () => {
    // Implement LinkedIn OAuth logic here
    setLinkedinConnected(true);
  };

  const allConnected = twitterConnected && linkedinConnected;

  return (
    <div className="min-h-screen  flex items-center justify-center p-4">
      <div className="rounded-xl shadow-2xl overflow-hidden w-full max-w-md border border-slate-700">
        {/* Softer, more sophisticated gradient */}
        <div className="bg-gradient-to-r  p-6 text-white">
          <h1 className="text-2xl font-semibold">Almost There!</h1>
          <p className="text-slate-300 mt-1">Connect your accounts to complete onboarding</p>
        </div>
        
        <div className="p-6 ">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-blue-400 text-3xl" />
            </div>
            <h2 className="text-xl font-semibold text-white">Final Step</h2>
            <p className="text-slate-300 mt-2">
              Connect your Twitter and LinkedIn accounts to unlock all features.
            </p>
          </div>

          <div className="space-y-4">
            {/* Twitter Connection - More subtle design */}
            <div className={`border rounded-lg p-4 transition-all duration-300 ${
              twitterConnected 
                ? 'border-emerald-700 bg-slate-700' 
                : 'border-slate-600 hover:border-blue-500 bg-slate-700'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    twitterConnected 
                      ? 'bg-emerald-900 text-emerald-400' 
                      : 'bg-slate-600 text-blue-400'
                  }`}>
                    <Twitter size={20} />
                  </div>
                  <span className="font-medium text-white">Twitter</span>
                </div>
                {twitterConnected ? (
                  <span className="text-sm text-emerald-400 flex items-center">
                    <CheckCircle size={16} className="mr-1" /> Connected
                  </span>
                ) : (
                  <button
                    onClick={handleTwitterAuth}
                    className="px-4 py-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>

            {/* LinkedIn Connection - More subtle design */}
            <div className={`border rounded-lg p-4 transition-all duration-300 ${
              linkedinConnected 
                ? 'border-emerald-700 bg-slate-700' 
                : 'border-slate-600 hover:border-blue-500 bg-slate-700'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${
                    linkedinConnected 
                      ? 'bg-emerald-900 text-emerald-400' 
                      : 'bg-slate-600 text-blue-400'
                  }`}>
                    <Linkedin size={20} />
                  </div>
                  <span className="font-medium text-white">LinkedIn</span>
                </div>
                {linkedinConnected ? (
                  <span className="text-sm text-emerald-400 flex items-center">
                    <CheckCircle size={16} className="mr-1" /> Connected
                  </span>
                ) : (
                  <button
                    onClick={handleLinkedinAuth}
                    className="px-4 py-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-700 text-center">
            {allConnected ? (
              <button
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all"
              >
                Complete Onboarding
              </button>
            ) : (
              <p className="text-sm text-slate-400">
                Connect both accounts to continue
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OAuthLogin;