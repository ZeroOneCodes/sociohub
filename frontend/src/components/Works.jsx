import React from 'react';

const steps = [
  {
    id: '1',
    title: 'Connect Accounts',
    description: 'Securely link your Twitter and LinkedIn profiles to SocioHub.',
  },
  {
    id: '2',
    title: 'Create Content',
    description: 'Compose your post once in our intuitive editor with platform-specific previews.',
  },
  {
    id: '3',
    title: 'Share & Analyze',
    description: 'Publish immediately or schedule for later, then track performance.',
  },
];

const Works = () => {
  return (
    <section className="py-16 ">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl sm:text-5xl font-semibold text-center mb-4">
          How SocioHub Works
        </h2>
        <p className="text-lg sm:text-xl text-center  dark:text-gray-400 mb-12">
          Three simple steps to streamline your social media workflow
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div
              key={step.id}
              className="  shadow-md rounded-lg p-6 text-center hover:shadow-lg transition-shadow duration-300"
            >
              <div className="w-12 h-12 flex items-center justify-center mx-auto mb-4 text-white text-lg font-bold rounded-full bg-blue-500">
                {step.id}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Works;
