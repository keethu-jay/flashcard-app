import React, { useState } from 'react';

interface FlashcardProps {
  word: string;
  definition: string;
  flipped?: boolean;
  setFlippedState?: (val: boolean) => void;
}

const Flashcard: React.FC<FlashcardProps> = ({
  word,
  definition,
  flipped: flippedProp,
  setFlippedState,
}) => {
  const [flipped, setFlipped] = useState(false);

  // Use prop if provided, otherwise use local state
  const isFlipped = flippedProp !== undefined ? flippedProp : flipped;

  const handleClick = () => {
    if (setFlippedState) {
      setFlippedState(!isFlipped);
    } else {
      setFlipped((prev) => !prev);
    }
  };

  return (
    <div
      className="w-64 h-40 m-5 cursor-pointer"
      onClick={handleClick}
      style={{ perspective: '1000px' }}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}
        style={{ transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
      >
        {/* Front */}
        <div
          className="absolute w-full h-full flex items-center justify-center bg-off-white text-dark-blue font-jua text-xl border-4 border-teal rounded-3xl shadow-lg backface-hidden p-6"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {word}
        </div>
        {/* Back */}
        <div
          className="absolute w-full h-full flex items-center justify-center bg-light-grey text-light-blue font-jua text-xl border-4 border-teal rounded-3xl shadow-lg backface-hidden p-6"
          style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}
        >
          {definition}
        </div>
      </div>
    </div>
  );
};

export default Flashcard;