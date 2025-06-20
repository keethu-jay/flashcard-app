import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark-blue text-white font-jua pb-1.5 py-4 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold mb-2">FlashCard App</h3>
            <p className="text-gray-300 text-2xl font-jua">
              Create, study, and master your knowledge with AI-powered flashcards
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
            <div>
              <h4 className="font-semibold py-4 mb-2">Features</h4>
              <ul className="text-sm font-jua text-gray-300 space-y-1">
                <li>AI-Generated Flashcards</li>
                <li>Custom Study Sets</li>
                <li>Progress Tracking</li>
                <li>Multiple Subjects</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold py-4 mb-2">Support</h4>
              <ul className="text-sm font-jua text-gray-300 space-y-1">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="border-t border-dark-blue mt-8 pt-6 text-center">
          <p className="text-gray-400 font-jua text-sm">
            © 2024 FlashCard App. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 