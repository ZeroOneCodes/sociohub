import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { FaTwitter,FaPlug,FaRobot, FaLinkedin, FaFileUpload, FaCalendarAlt, FaCheckCircle, FaTimes, FaHome, FaUser, FaCog, FaCoins, FaSignOutAlt, FaBell, FaChartLine, FaBars } from 'react-icons/fa';
import { Link } from 'react-router-dom'
const CombinedSocialPost = () => {
  // State variables
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [publishStatus, setPublishStatus] = useState('draft');
  const [mediaFile, setMediaFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [postToTwitter, setPostToTwitter] = useState(false);
  const [postToLinkedIn, setPostToLinkedIn] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [twitterSuccess, setTwitterSuccess] = useState(false);
  const [linkedInSuccess, setLinkedInSuccess] = useState(false);
  const fileInputRef = useRef(null);
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const [activeItem, setActiveItem] = useState("home");
  // User profile
  const [user] = useState({
    name: "Alex Johnson",
    username: "@alexjohnson",
    coins: 250,
    profileImage: "https://i.pravatar.cc/150?img=32"
  });

  const MAX_TWEET_LENGTH = 280;

  useEffect(() => {
    if (successMessage === '') {
      setTwitterSuccess(false);
      setLinkedInSuccess(false);
    }
  }, [successMessage]);

  const handleFileSelect = () => fileInputRef.current.click();

  const handleFileChange = (e) => handleFile(e.target.files[0]);

  const handleFile = (file) => {
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      setErrorMessage('Please upload only image or video files.');
      return;
    }
    
    const maxSize = isImage ? 5 * 1024 * 1024 : 15 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMessage(`File size must be less than ${maxSize / (1024 * 1024)}MB.`);
      return;
    }

    setMediaFile(file);
    setErrorMessage('');
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeMedia = () => {
    setMediaFile(null);
    setPreviewUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadProgress(0);
    setErrorMessage('');
    setSuccessMessage('');
    setTwitterSuccess(false);
    setLinkedInSuccess(false);
 
    const formData = new FormData();
    if (postToLinkedIn) {
      formData.append('title', title);
      formData.append('tags', JSON.stringify(tags.split(',').map(tag => tag.trim())));
      formData.append('publishStatus', publishStatus);
    }
    formData.append('content', content);
    formData.append('postToTwitter', postToTwitter);
    formData.append('postToLinkedIn', postToLinkedIn);
    
    if (mediaFile) {
      formData.append('media', mediaFile);
    }

    formData.append('isScheduled', isScheduled);
    if (isScheduled) {
      formData.append('scheduleDate', scheduleDate);
      formData.append('scheduleTime', scheduleTime);
    }

    try {
      const response = await axios.post('http://localhost:3005/combined', formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      if (isScheduled) {
        setSuccessMessage(`Post scheduled for ${scheduleDate} at ${scheduleTime}`);
      } else {
        let message = '';
        if (response.data.linkedIn) {
          setLinkedInSuccess(true);
          message += 'Post successful on LinkedIn! ';
        } 
        if (response.data.twitter) {
          setTwitterSuccess(true);
          message += 'Post successful on Twitter!';
        }
        setSuccessMessage(message.trim());
      }

      // Reset form
      setTitle('');
      setContent('');
      setTags('');
      removeMedia();
      setIsScheduled(false);
      setScheduleDate('');
      setScheduleTime('');
    } catch (error) {
      console.error('Error posting:', error);
      if (error.response) {
        setErrorMessage(error.response.data.error || 'An error occurred while posting');
        if (error.response.data.details) {
          setErrorMessage((prev) => `${prev}. Details: ${error.response.data.details}`);
        }
      } else if (error.request) {
        setErrorMessage('No response received from the server. Check your network connection.');
      } else {
        setErrorMessage('Error setting up the request. Please try again.');
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const navItems = [
    { icon: <FaHome />, label: "Home", active: false, path:"/postboth" },
    { icon: <FaPlug />, label: "Connect Apps", active: false, path:"/connect/apps" },
];

  const mainContentMargin = isNavExpanded ? "ml-64" : "ml-16";

  return (
    <div className="min-h-screen flex rgb(25,26,26)">
      {/* Sidebar Navigation */}
      <aside
      className={`text-white flex flex-col h-screen fixed transition-all duration-300 ease-in-out border-r border-[#30363D]/50 backdrop-blur-lg shadow-2xl z-10 
      ${isNavExpanded ? "w-72" : "w-20"}`}
      style={{backgroundColor: 'rgb(25,26,26)'}}
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
      <div className={`px-5 py-4 border-b border-[#30363D]/50 ${!isNavExpanded && "flex justify-center"}`}>
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
            <div className="flex items-center mt-4 p-3 rounded-xl backdrop-blur-sm" style={{backgroundColor: 'rgb(32,34,34)'}}>
              <span className="text-sm font-medium">{user.coins} coins</span>
            </div>
          </>
        ) : (
          <div className="relative group">
            
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
                    : "text-gray-400 hover:text-white"
                }`}
                style={{
                  backgroundColor: activeItem === item.id 
                    ? 'rgba(0,120,215,0.15)' 
                    : 'transparent'
                }}
                onMouseEnter={(e) => {
                  if (activeItem !== item.id) {
                    e.target.style.backgroundColor = 'rgb(32,34,34)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeItem !== item.id) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
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
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(248,113,113,0.1)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
          }}
        >
          <FaSignOutAlt className={`text-xl ${isNavExpanded ? "mr-3" : ""}`} />
          {isNavExpanded && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>

      {/* Main Content */}
      <main className={`flex-grow ${mainContentMargin} transition-all duration-300 p-8`} style={{backgroundColor: 'rgb(32,34,34)'}}>
        <div className="mb-8 ml-10">
          <h2 className="text-3xl font-semibold text-white  bg-clip-text">
            Create Post +
          </h2>
          <p className="text-gray-400">Publish across multiple platforms seamlessly</p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
          {/* Messages */}
          <div className="mb-6">
            {successMessage && (
              <div className="rounded-lg overflow-hidden backdrop-blur-sm border border-[#30363D] shadow-lg" style={{backgroundColor: 'rgba(32,34,34,0.8)'}}>
                <div className="p-4 flex items-center justify-between">
                  <span className="font-medium text-white">Post Status</span>
                  {isScheduled && (
                    <span className="text-[#0078D7] flex items-center">
                      <FaCalendarAlt className="mr-2" /> Scheduled
                    </span>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  {twitterSuccess && (
                    <div className="flex items-center p-3 rounded-lg border border-[#0078D7]/30" style={{backgroundColor: 'rgb(38,40,40)'}}>
                      <div className="flex items-center justify-center w-10 h-10 bg-[#0078D7]/20 rounded-full mr-3">
                        <FaTwitter className="text-[#0078D7]" />
                      </div>
                      <span className="text-[#0078D7]">Successfully posted to Twitter</span>
                      <FaCheckCircle className="ml-auto text-[#0078D7]" />
                    </div>
                  )}
                  {linkedInSuccess && (
                    <div className="flex items-center p-3 rounded-lg border border-[#0078D7]/30" style={{backgroundColor: 'rgb(38,40,40)'}}>
                      <div className="flex items-center justify-center w-10 h-10 bg-[#0078D7]/20 rounded-full mr-3">
                        <FaLinkedin className="text-[#0078D7]" />
                      </div>
                      <span className="text-[#0078D7]">Successfully posted to LinkedIn</span>
                      <FaCheckCircle className="ml-auto text-[#0078D7]" />
                    </div>
                  )}
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="p-4 rounded-lg bg-red-900/30 border border-red-800/50 backdrop-blur-sm">
                <div className="flex items-center">
                  <FaTimes className="text-red-500 mr-2" />
                  <p className="text-red-400">{errorMessage}</p>
                </div>
              </div>
            )}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Content Editor */}
              <div className="rounded-xl border border-[#30363D] shadow-xl p-6" style={{backgroundColor: 'rgb(32,34,34)'}}>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  placeholder="What's on your mind?"
                  className="w-full p-4 border border-[#30363D] rounded-lg text-white placeholder-gray-500 focus:border-[#0078D7] focus:ring-[#0078D7] transition-colors resize-none h-40"
                  style={{backgroundColor: 'rgb(25,27,27)'}}
                />
                {postToTwitter && (
                  <div className={`text-right mt-2 text-sm ${
                    content.length > MAX_TWEET_LENGTH ? 'text-red-400' : 'text-gray-500'
                  }`}>
                    {content.length}/{MAX_TWEET_LENGTH}
                  </div>
                )}
              </div>

              {/* Media Upload */}
              <div 
                className="rounded-xl border border-[#30363D] shadow-xl p-6"
                style={{backgroundColor: 'rgb(32,34,34)'}}
                onClick={handleFileSelect}
              >
                <div className={`border-2 border-dashed border-[#30363D] rounded-lg p-6 cursor-pointer hover:border-[#0078D7] transition-all ${
                  mediaFile ? '' : 'hover:bg-[#161B22]'
                }`} style={{backgroundColor: mediaFile ? 'rgb(25,27,27)' : 'rgb(25,27,27)'}}>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,video/*"
                    className="hidden"
                  />
                  
                  {!mediaFile ? (
                    <div className="text-center py-10">
                      <FaFileUpload className="text-[#0078D7] text-4xl mx-auto mb-4" />
                      <p className="text-gray-300 font-medium mb-2">Drag and drop media or click to browse</p>
                      <p className="text-sm text-gray-500">Supports: Images (5MB max) and Videos (15MB max)</p>
                    </div>
                  ) : (
                    <div className="">
                      <div className="text-[#0078D7] font-medium mb-3">{mediaFile.name}</div>
                      {previewUrl && mediaFile.type.startsWith('image/') && (
                        <img 
                          src={previewUrl} 
                          alt="Preview" 
                          className="max-h-48 mx-auto rounded-lg shadow-lg"
                        />
                      )}
                      {previewUrl && mediaFile.type.startsWith('video/') && (
                        <video 
                          src={previewUrl} 
                          controls 
                          className="max-h-48 mx-auto rounded-lg shadow-lg"
                        />
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeMedia();
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  )}
                </div>

                {isUploading && (
                  <div className="mt-4">
                    <div className="h-2 rounded-full overflow-hidden" style={{backgroundColor: 'rgb(38,40,40)'}}>
                      <div 
                        className="h-full bg-gradient-to-r from-[#0078D7] to-[#00A4EF] transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <div className="text-center mt-2 text-sm text-gray-500">
                      {uploadProgress}% Uploaded
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Settings */}
            <div className="space-y-6">
              {/* Platforms */}
              <div className="rounded-xl border border-[#30363D] shadow-xl p-6" style={{backgroundColor: 'rgb(32,34,34)'}}>
                <h3 className="font-bold text-white mb-4">Share to</h3>
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setPostToTwitter(!postToTwitter)}
                    className={`w-full p-3 rounded-lg border ${
                      postToTwitter 
                        ? 'border-[#0078D7] bg-[#0078D7]/10' 
                        : 'border-[#30363D]'
                    } transition-all duration-200`}
                    style={{backgroundColor: postToTwitter ? 'rgba(0,120,215,0.1)' : 'rgb(38,40,40)'}}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-[#0078D7]/20 flex items-center justify-center">
                        <FaTwitter className="text-[#0078D7]" />
                      </div>
                      <div className="ml-3 text-left">
                        <div className="font-medium text-white">Twitter</div>
                        <div className="text-sm text-gray-500">280 characters</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={postToTwitter}
                        onChange={(e) => setPostToTwitter(e.target.checked)}
                        className="ml-auto"
                      />
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPostToLinkedIn(!postToLinkedIn)}
                    className={`w-full p-3 rounded-lg border ${
                      postToLinkedIn 
                        ? 'border-[#0078D7] bg-[#0078D7]/10' 
                        : 'border-[#30363D]'
                    } transition-all duration-200`}
                    style={{backgroundColor: postToLinkedIn ? 'rgba(0,120,215,0.1)' : 'rgb(38,40,40)'}}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-[#0078D7]/20 flex items-center justify-center">
                        <FaLinkedin className="text-[#0078D7]" />
                      </div>
                      <div className="ml-3 text-left">
                        <div className="font-medium text-white">LinkedIn</div>
                        <div className="text-sm text-gray-500">Professional network</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={postToLinkedIn}
                        onChange={(e) => setPostToLinkedIn(e.target.checked)}
                        className="ml-auto"
                      />
                    </div>
                  </button>
                </div>
              </div>

              {/* Schedule */}
              <div className="rounded-xl border border-[#30363D] shadow-xl p-6" style={{backgroundColor: 'rgb(32,34,34)'}}>
                <h3 className="font-bold text-white mb-4">Schedule</h3>
                <button
                  type="button"
                  onClick={() => setIsScheduled(!isScheduled)}
                  className={`w-full p-3 rounded-lg border ${
                    isScheduled 
                      ? 'border-[#0078D7] bg-[#0078D7]/10' 
                      : 'border-[#30363D]'
                  } transition-all duration-200 mb-4`}
                  style={{backgroundColor: isScheduled ? 'rgba(0,120,215,0.1)' : 'rgb(38,40,40)'}}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-[#0078D7]/20 flex items-center justify-center">
                      <FaCalendarAlt className="text-[#0078D7]" />
                    </div>
                    <div className="ml-3 text-left">
                      <div className="font-medium text-white">Schedule Post</div>
                      <div className="text-sm text-gray-500">Set future date & time</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={isScheduled}
                      onChange={(e) => setIsScheduled(e.target.checked)}
                      className="ml-auto"
                    />
                  </div>
                </button>

                {isScheduled && (
                  <div className="space-y-4 p-4 rounded-lg border border-[#30363D]" style={{backgroundColor: 'rgb(25,27,27)'}}>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Date</label>
                      <input
                        type="date"
                        value={scheduleDate}
                        onChange={(e) => setScheduleDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required={isScheduled}
                        className="w-full p-2 border border-[#30363D] rounded-lg text-white focus:border-[#0078D7] focus:ring-[#0078D7] transition-colors"
                        style={{backgroundColor: 'rgb(32,34,34)'}}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Time</label>
                      <input
                        type="time"
                        value={scheduleTime}
                        onChange={(e) => setScheduleTime(e.target.value)}
                        required={isScheduled}
                        className="w-full p-2 border border-[#30363D] rounded-lg text-white focus:border-[#0078D7] focus:ring-[#0078D7] transition-colors"
                        style={{backgroundColor: 'rgb(32,34,34)'}}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* LinkedIn Options */}
              {postToLinkedIn && (
                <div className="rounded-xl border border-[#30363D] shadow-xl p-6" style={{backgroundColor: 'rgb(32,34,34)'}}>
                  <h3 className="font-bold text-white mb-4">LinkedIn Options</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter post title"
                        className="w-full p-2 border border-[#30363D] rounded-lg text-white focus:border-[#0078D7] focus:ring-[#0078D7] transition-colors"
                        style={{backgroundColor: 'rgb(25,27,27)'}}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Tags</label>
                      <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="tech, marketing, design"
                        className="w-full p-2 border border-[#30363D] rounded-lg text-white focus:border-[#0078D7] focus:ring-[#0078D7] transition-colors"
                        style={{backgroundColor: 'rgb(25,27,27)'}}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">Visibility</label>
                      <select
                        value={publishStatus}
                        onChange={(e) => setPublishStatus(e.target.value)}
                        className="w-full p-2 border border-[#30363D] rounded-lg text-white focus:border-[#0078D7] focus:ring-[#0078D7] transition-colors"
                        style={{backgroundColor: 'rgb(25,27,27)'}}
                      >
                        <option value="draft">Save as Draft</option>
                        <option value="published">Publish Now</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button 
                type="submit"
                disabled={isUploading || (!postToTwitter && !postToLinkedIn)}
                className={`w-full p-4 rounded-lg font-semibold shadow-lg ${
                  isUploading || (!postToTwitter && !postToLinkedIn)
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#0078D7] to-[#00A4EF] text-white hover:from-[#006CBC] hover:to-[#0078D7] transition-all'
                }`}
              >
                {isUploading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </div>
                ) : (
                  <>
                    {isScheduled ? (
                      <div className="flex items-center justify-center">
                        <FaCalendarAlt className="mr-2" />
                        Schedule Post
                      </div>
                    ) : (
                      'Share Now'
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default CombinedSocialPost;