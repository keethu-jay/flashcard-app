import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Card {
  front: string;
  back: string;
}

const CreateSet: React.FC = () => {
  const [title, setTitle] = useState('');
  const [cards, setCards] = useState<Card[]>([{ front: '', back: '' }]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleCardChange = (index: number, field: keyof Card, value: string) => {
    const newCards = [...cards];
    newCards[index][field] = value;
    setCards(newCards);
  };

  const addCard = () => {
    setCards([...cards, { front: '', back: '' }]);
  };

  const removeCard = (index: number) => {
    if (cards.length > 1) {
      const newCards = cards.filter((_, i) => i !== index);
      setCards(newCards);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || cards.some(card => !card.front.trim() || !card.back.trim())) {
      alert('Please fill out the title and all card fields.');
      return;
    }
    setIsLoading(true);

    try {
      // This endpoint needs to be created on the backend
      const response = await fetch('http://localhost:5001/create_manual_set', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name: title, cards }),
      });

      if (response.ok) {
        alert('Set created successfully!');
        navigate('/library');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to create set');
      }
    } catch (error) {
      console.error('Error creating set:', error);
      alert('An error occurred while creating the set.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Create a New Flashcard Set</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-lg font-medium text-gray-700 mb-2">
                Set Title
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., French Vocabulary"
                required
              />
            </div>

            <h2 className="text-2xl font-bold text-gray-800 border-t pt-6">Flashcards</h2>
            
            {cards.map((card, index) => (
              <div key={index} className="p-4 border rounded-md relative space-y-4">
                <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium">Card {index + 1}</span>
                    {cards.length > 1 && (
                        <button
                            type="button"
                            onClick={() => removeCard(index)}
                            className="text-red-500 hover:text-red-700"
                        >
                            Remove
                        </button>
                    )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Front
                  </label>
                  <textarea
                    value={card.front}
                    onChange={(e) => handleCardChange(index, 'front', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                    placeholder="e.g., Bonjour"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Back
                  </label>
                  <textarea
                    value={card.back}
                    onChange={(e) => handleCardChange(index, 'back', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                    placeholder="e.g., Hello"
                    required
                  />
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={addCard}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                + Add Card
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Set'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateSet; 