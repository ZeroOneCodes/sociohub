// components/Terms.jsx or Terms.tsx

import React from 'react';
import Navbar from './Navbar'
const Terms = () => {
  return (
    <>
    <Navbar />
    <section className="px-6 py-20  text-gray-800 dark:text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">Terms & Conditions</h1>
        
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          Welcome to SocioHub! By using our platform, you agree to the following terms and conditions.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4">1. Account Linking</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          SocioHub requires access to your Twitter and LinkedIn accounts to allow you to manage and publish content. 
          During the authentication process, we collect:
        </p>
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-6">
          <li>Your public profile information (name, username, profile picture)</li>
          <li>Your email address (if available)</li>
          <li>OAuth tokens required to post on your behalf</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-10 mb-4">2. Data Usage</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          The tokens and emails collected are securely stored using encryption and are only used for authorized API interactions 
          such as scheduling, posting, and performance analytics. Your credentials are never shared with third parties.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4">3. Security</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          SocioHub takes user data security seriously. We implement strict security measures including encryption, token hashing, 
          and secure storage practices to ensure your account and data are protected.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4">4. Data Retention & Deletion</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          You can request the deletion of your account and all associated data at any time. We will promptly remove your stored 
          tokens, emails, and any related content from our servers.
        </p>

        <h2 className="text-2xl font-semibold mt-10 mb-4">5. Updates to Terms</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          We may occasionally update these Terms & Conditions to reflect platform changes. If significant changes are made, you 
          will be notified via email or through a notice on our website.
        </p>

        <p className="mt-10 text-sm text-gray-500 dark:text-gray-400 text-center">
        Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
    </section>
    </>
  );
};

export default Terms;
