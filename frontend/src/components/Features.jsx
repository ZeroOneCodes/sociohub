import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faSquareYoutube } from '@fortawesome/free-brands-svg-icons';
const Features = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl sm:text-5xl font-semibold text-center mb-12">
          Powerful Features
        </h2>
        <p className="text-lg sm:text-xl text-center text-gray-500 mb-16">
          Everything you need to streamline your social media presence on Twitter and LinkedIn
        </p>

        <div className="flex flex-col items-center gap-12">
          {/* Top Center Feature */}
          <div className="w-full max-w-md flex flex-col items-center text-center shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="text-blue-400 w-16 h-16 mb-4"
            >
              <path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM0 24V7.98h5V24H0zm7.5-16h4.8v2.2h.07c.67-1.27 2.31-2.6 4.76-2.6 5.1 0 6 3.36 6 7.72V24h-5v-7.72c0-1.85-.03-4.22-2.57-4.22-2.57 0-2.96 2-2.96 4.07V24h-5V8z" />
            </svg>
            <h3 className="text-2xl font-semibold mb-4">Cross-Platform Posting</h3>
            <p>
              Share your content across Twitter and LinkedIn with a single click, saving time and ensuring consistency.
            </p>
          </div>

          {/* Middle Row - 2 Side Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 w-full max-w-4xl">
            {/* Schedule Posts */}
            <div className="flex flex-col items-center text-center shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="text-green-400 w-16 h-16 mb-4"
              >
                <path d="M20 2H4C2.9 2 2 2.9 2 4v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 18H4V6h16v14z" />
              </svg>
              <h3 className="text-2xl font-semibold mb-4">Schedule Posts</h3>
              <p>
                Plan your content in advance with our easy-to-use scheduling tool for optimal engagement times.
              </p>
            </div>

            {/* Analytics Dashboard */}
            <div className="flex flex-col items-center text-center shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="text-purple-400 w-16 h-16 mb-4"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm2-13h-4v4h4V7zm0 6h-4v4h4v-4z" />
              </svg>
              <h3 className="text-2xl font-semibold mb-4">Analytics Dashboard</h3>
              <p>
                Track performance across platforms with comprehensive analytics and actionable insights.
              </p>
            </div>
          </div>

          {/* Bottom Center Feature */}
          <div className="w-full max-w-md flex flex-col items-center text-center shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow duration-300">
                {/* <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    className="text-red-400 w-16 h-16 mb-4"
                >
                    <path d="M7 9V7h4V5H7V3H5v2H3v2h2v2H5v2h2v-2h4V9h2V7h-2zm4 4H7v2h4v2H7v2h6v-2h-4v-2z" />
                </svg> */}
                <img src="/apps.png" alt="apps logo" className='w-16 h-16 mb-4'/>
                <h3 className="text-2xl font-semibold mb-4">Exciting New Apps Coming Soon</h3>
                <p className="text-gray-500">
                    Stay tuned! We're working on integrating platforms like Instagram, YouTube, and more in the near future.
                </p>

                <div className="flex space-x-4 mt-4">
                    {/* Instagram Icon */}
                    <FontAwesomeIcon icon={faInstagram} size="3x" />

                    {/* YouTube Icon */}
                    <FontAwesomeIcon icon={faSquareYoutube} size="3x"/>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
