import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface Card {
  id: number;
  front: string;
  back: string;
}

interface SetInfo {
    name: string;
}

const Memorize: React.FC = () => {
  const { setId } = useParams<{ setId: string }>();
  const [setInfo, setSetInfo] = useState<SetInfo | null>(null)
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [progress, setProgress] = useState<Record<number, number>>({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const fetchSetData = useCallback(async () => {
    if (!setId) return;
    try {
      setLoading(true);
      const [setData, progressData] = await Promise.all([
        axios.get(`http://localhost:5001/get_flashcards_by_set/${setId}`, { withCredentials: true }),
        axios.get(`http://localhost:5001/progress/set/${setId}`, { withCredentials: true })
      ]);
      
      setCards(setData.data.flashcards);
      setSetInfo(setData.data.set_info);
      
      const progressMap: Record<number, number> = {};
      setData.data.flashcards.forEach((card: Card) => {
        progressMap[card.id] = progressData.data[card.id] || 0;
      });
      setProgress(progressMap);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [setId]);

  useEffect(() => {
    fetchSetData();
  }, [fetchSetData]);

  const masteredCardsCount = useMemo(() => {
    return Object.values(progress).filter(p => p >= 3).length;
  }, [progress]);

  const generateOptions = useCallback(() => {
    if (cards.length === 0) return;
    const currentCard = cards[currentCardIndex];
    const otherCards = cards.filter((_, index) => index !== currentCardIndex);
    const shuffled = otherCards.sort(() => 0.5 - Math.random());
    const randomOptions = shuffled.slice(0, 3).map(c => c.front);
    const allOptions = [...randomOptions, currentCard.front].sort(() => 0.5 - Math.random());
    setOptions(allOptions);
  }, [cards, currentCardIndex])

  useEffect(() => {
    if (cards.length > 0) {
      generateOptions();
    }
  }, [cards, generateOptions]);
  
  const handleOptionClick = async (option: string) => {
    setSelectedAnswer(option);
    setShowAnswer(true);
    const currentCard = cards[currentCardIndex];
    if (option === currentCard.front) {
      setProgress(prev => ({...prev, [currentCard.id]: (prev[currentCard.id] || 0) + 1}));
      try {
        await axios.post(`http://localhost:5001/progress/card/${currentCard.id}`, {}, {
          withCredentials: true
        });
      } catch (error) {
        console.error("Failed to update progress", error);
        // Optionally revert progress state on failure
        setProgress(prev => ({...prev, [currentCard.id]: (prev[currentCard.id] || 1) - 1}));
      }
    }
  };
  
  const goToNextCard = () => {
    setShowAnswer(false);
    setSelectedAnswer(null);
    if(currentCardIndex < cards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
    } else {
        // finished, for now just restart
        setCurrentCardIndex(0);
        // Optionally refetch data to ensure sync with db
        fetchSetData();
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (cards.length === 0) return <div>No cards in this set.</div>;

  const currentCard = cards[currentCardIndex];
  const isCorrect = selectedAnswer === currentCard.front;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Studying: {setInfo?.name} - Memorize</h1>
      <div className="mb-4">
        <p>Progress: {masteredCardsCount} / {cards.length} cards mastered</p>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(masteredCardsCount / cards.length) * 100}%` }}></div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-lg">
          <p className="text-gray-500 mb-2">Guess the front of the card:</p>
          <div className="text-xl mb-4 p-8 border rounded-md min-h-[100px] bg-gray-50">{currentCard.back}</div>
          
          <div className="grid grid-cols-2 gap-4">
              {options.map(option => (
                  <button
                      key={option}
                      onClick={() => handleOptionClick(option)}
                      disabled={showAnswer}
                      className={`p-4 border rounded-md text-left transition-colors
                          ${showAnswer && option === currentCard.front ? 'bg-green-200 border-green-500' : ''}
                          ${showAnswer && option !== currentCard.front && option === selectedAnswer ? 'bg-red-200 border-red-500' : ''}
                          ${!showAnswer ? 'hover:bg-gray-100' : 'cursor-not-allowed'}
                      `}
                  >
                      {option}
                  </button>
              ))}
          </div>
          
          {showAnswer && (
              <div className="mt-4 text-center">
                  <p className={`font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {isCorrect ? 'Correct!' : 'Incorrect!'}
                  </p>
                  <button 
                      onClick={goToNextCard}
                      className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                      Next Card
                  </button>
              </div>
          )}
      </div>
    </div>
  );
};

export default Memorize; 