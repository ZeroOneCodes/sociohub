import React from 'react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

function Navbar() {
  return (
    <nav className=' px-2 flex justify-between  items-center bg-transparent '>
        <div className='flex  '>
        <div className='flex items-center gap-2'>
            {/* <FontAwesomeIcon 
                icon={faPaperPlane} 
                className='h-20 w-20 sm:h-14 sm:w-14 md:h-30 md:w-30 object-contain' 
            /> */}
            <Link to="/" className="hover:opacity-80 transition">
                <img 
                    src="/l1.PNG" 
                    alt="logo" 
                    className="mx-4 sm:mx-6 md:mx-10 h-8 w-8 sm:h-14 sm:w-14 md:h-16 md:w-16 object-contain" 
                />
            </Link>
           <Link to="/" className="hover:opacity-80 transition">
                <span className="font-semibold text-lg sm:text-xl md:text-2xl">
                    SocioHub
                </span>
            </Link>
        </div>
            <div className='hidden md:flex p-2 rounded-full items-center mx-10'>
                <Link to="/"className='text-sm font-semibold p-2 rounded-full text-gray-300 hover:text-white transition-colors duration-200' >Demo</Link>
            </div>
            <div className=' hidden md:flex p-2 rounded-full items-center '>
                <Link to="/login" className='text-sm font-semibold p-2 rounded-full text-gray-300 hover:text-white transition-colors duration-200'>Login</Link>
            </div>
        </div>
        <div className='hidden md:flex m-10 px-2.5 justify-between gap-10'>
        <div className='p-2 rounded-full'>
            <Link to="/signup" className='text-base text-black bg-blue-300 px-10 py-3 rounded-full hover:bg-blue-500 transition-colors duration-200 font-semibold'>Get Started</Link>
        </div>
        {/* <div className='p-2'>
            <Link to="/logout" className='text-sm font-semibold'>Login</Link>
        </div> */}
        </div>
        <div className='md:hidden whitespace-nowrap'>
            <Link 
                to="/signup" 
                className='text-sm sm:text-base font-semibold text-black bg-blue-300 px-4 py-2 sm:px-6 sm:py-3 rounded-full hover:bg-blue-500 transition-colors duration-200'
            >
                Get Started
            </Link>
        </div>
    </nav>
  )
}

export default Navbar
