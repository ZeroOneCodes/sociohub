// Contact.jsx or Contact.tsx

import React from 'react';
import { Link } from 'react-router-dom'
import Navbar from './Navbar';
const Contact = () => {
  return (
    <>
    <Navbar />
    <section id="contact" className="px-6 py-20   text-gray-800 dark:text-white">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
        <p className="mb-10 text-gray-600 dark:text-gray-300">
          Have questions or want to collaborate? Fill out the form below or reach out via email.
        </p>

        <form className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Your Name"
              className="w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              required
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="Your Email"
              className="w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              required
            />
          </div>
          <div>
            <textarea
              rows="5"
              placeholder="Your Message"
              className="w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              required
            ></textarea>
          </div>
          <button
            type="submit"
            className="bg-blue-300 hover:bg-blue-700 text-black font-semibold px-6 py-2 rounded-md transition duration-200"
          >
            Send Message
          </button>
        </form>
      </div>
    </section>
    </>
  );
};

export default Contact;
