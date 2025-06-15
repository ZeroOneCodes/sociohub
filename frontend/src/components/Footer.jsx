import React from 'react';
import { Twitter, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">

          <div className="flex space-x-6 mt-6 md:mt-0">
            <Link to="/contact" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition">
              Contact
            </Link>
            <Link to="/terms" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition">
              Terms & Conditions
            </Link>
            <span className="text-gray-600 dark:text-gray-300 hidden md:inline">|</span>
            <span className="text-gray-600 dark:text-gray-300">Made with <span className="text-red-500">❤️</span> by <a href="https://twitter.com/TanujChaganti" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Tanuj Chaganti</a></span>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center md:text-left">
            © 2025 SocioHub. All rights reserved.
          </p>

          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="https://twitter.com/TanujChaganti" target="_blank" rel="noopener noreferrer">
              <Twitter className="h-5 w-5 text-gray-400 hover:text-[#1DA1F2] cursor-pointer transition" />
            </a>
            <a href="https://www.linkedin.com/in/tanuj-chaganti/" target="_blank" rel="noopener noreferrer">
              <Linkedin className="h-5 w-5 text-gray-400 hover:text-[#0077B5] cursor-pointer transition" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
