// components/PrivacyPolicy.jsx or PrivacyPolicy.tsx

import React from 'react';
import Navbar from './Navbar';

const PrivacyPolicy = () => {
  return (
    <>
      <Navbar />
      <section className="px-6 py-20 text-gray-800 dark:text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-6 text-center">Privacy Policy</h1>

          <p className="mb-6 text-gray-600 dark:text-gray-300">
            At SocioHub, we are committed to protecting your privacy and ensuring a safe user experience. This Privacy Policy outlines how we collect, use, and safeguard your personal information.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-4">1. Information We Collect</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            When you use SocioHub, we may collect the following types of information:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-6">
            <li>Your name, email address, and profile details from connected social accounts</li>
            <li>OAuth tokens necessary for scheduling and publishing content</li>
            <li>Usage data such as post frequency, engagement metrics, and preferences</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-10 mb-4">2. How We Use Your Information</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            The data we collect is used solely to improve your experience on SocioHub. This includes:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-6">
            <li>Allowing you to post and schedule content across platforms</li>
            <li>Providing analytics and performance insights</li>
            <li>Customizing the user interface based on your preferences</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-10 mb-4">3. Data Storage & Protection</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            All collected data is securely stored using encryption and industry-standard practices. OAuth tokens and other sensitive information are hashed or encrypted to prevent unauthorized access.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-4">4. Sharing of Information</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            We do not sell, trade, or rent your personal information to third parties. Your data is only used internally to provide core functionalities and improve the platform.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-4">5. Your Rights</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            You have the right to access, update, or request deletion of your data at any time. For such requests, please contact our support team through your account dashboard or via email.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-4">6. Cookies & Tracking</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            We use cookies to personalize your experience and collect anonymous usage statistics. You can disable cookies in your browser settings if preferred.
          </p>

          <h2 className="text-2xl font-semibold mt-10 mb-4">7. Changes to This Policy</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            SocioHub may update this Privacy Policy from time to time. We will notify you of significant changes via email or an in-app notification.
          </p>

          <p className="mt-10 text-sm text-gray-500 dark:text-gray-400 text-center">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </section>
    </>
  );
};

export default PrivacyPolicy;
