import React, { useState } from 'react';

interface FlashcardProps {
  word: string;
  definition: string;
}

const Flashcard: React.FC<FlashcardProps> = ({ word, definition }) => {
  const [flipped, setFlipped] = useState(false);

  const handleClick = () => {
    setFlipped((prev) => !prev);
  };

  return (
    <div
      className="w-64 h-40 m-5 cursor-pointer"
      onClick={handleClick}
      style={{ perspective: '1000px' }}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${flipped ? 'rotate-y-180' : ''}`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div
          className="absolute w-full h-full flex items-center justify-center bg-gray-100 text-blue-900 font-jua text-xl border-4 border-emerald-400 rounded-3xl shadow-lg backface-hidden p-6"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {word}
        </div>
        {/* Back */}
        <div
          className="absolute w-full h-full flex items-center justify-center bg-neutral-700 text-cyan-600 font-jua text-xl border-4 border-emerald-400 rounded-3xl shadow-lg backface-hidden p-6"
          style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
        >
          {definition}
        </div>
      </div>
    </div>
  );
};

export default Flashcard;