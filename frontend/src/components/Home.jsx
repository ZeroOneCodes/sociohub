import React from 'react'
import { Link } from 'react-router-dom'
import Features from './Features'
import Works from './Works'
import Footer from './Footer'
import LaunchDate from './LaunchDate'
import Navbar from './Navbar'
function Home() {
  return (
    <>
    <Navbar />
    <div className='flex flex-col items-center justify-center text-center'>
      <h1 className='font-semibold my-20 text-4xl sm:text-5xl md:text-8xl flex flex-col items-center leading-tight'>
        <div className="flex items-center gap-4">
          <span>Post once</span>

          {/* Animated SVG container */}
          <div className="relative w-14 h-14 overflow-hidden">
          <div className="absolute w-full h-full animate-toggle-icons flex items-center justify-center">
              <Link to="/" className="cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="text-blue-400 w-12 h-12 flex-shrink-0"
                >
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 22.4.36a9.1 9.1 0 0 1-2.88 1.1A4.52 4.52 0 0 0 16.11 0c-2.5 0-4.51 2-4.51 4.5 0 .35.04.69.11 1.01A12.94 12.94 0 0 1 1.64.88a4.48 4.48 0 0 0-.61 2.27c0 1.56.8 2.93 2.01 3.73a4.48 4.48 0 0 1-2.05-.56v.06c0 2.18 1.55 4.01 3.6 4.43a4.52 4.52 0 0 1-2.03.08 4.51 4.51 0 0 0 4.21 3.14A9.06 9.06 0 0 1 .96 19.54a12.84 12.84 0 0 0 6.95 2.04c8.33 0 12.89-6.9 12.89-12.88 0-.2 0-.39-.01-.58A9.21 9.21 0 0 0 23 3z" />
                </svg>
              </Link>

              {/* LinkedIn */}
              <Link to="/" className="cursor-pointer">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  className="text-blue-600 w-12 h-12 flex-shrink-0"
                >
                  <path d="M4.98 3.5C4.98 4.88 3.88 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM0 24V7.98h5V24H0zm7.5-16h4.8v2.2h.07c.67-1.27 2.31-2.6 4.76-2.6 5.1 0 6 3.36 6 7.72V24h-5v-7.72c0-1.85-.03-4.22-2.57-4.22-2.57 0-2.96 2-2.96 4.07V24h-5V8z" />
                </svg>
              </Link>
            </div>
          </div>

          <span>share</span>
        </div>

        <span className="block">everywhere</span>
      </h1>

      {/* Paragraph centered below */}
      <p className="max-w-2xl px-4 text-lg text-gray-500 leading-relaxed text-center">
        <span className="block">
          Effortlessly share your content on Twitter and LinkedIn with a single click.
        </span>
        <span className="block">
          Streamline your social presence and double your reach
        </span>
        <span className="block">
          without the extra work!
        </span>
      </p>
      <div className='mt-8'>
            <Link 
                to="/login" 
                className='text-sm sm:text-base font-semibold text-black bg-blue-300 px-4 py-2 sm:px-6 sm:py-3 rounded-full hover:bg-blue-500 transition-colors duration-200'
            >
                Try Out !
            </Link>
        </div>
        <Features />
        <Works/>
       
    </div>
    <LaunchDate />
    <Footer/>
    </>
    



  )
}

export default Home
