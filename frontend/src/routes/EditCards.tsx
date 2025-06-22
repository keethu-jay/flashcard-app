import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faStar as faStarSolid, faRotate } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';

interface FlashcardData {
  id: number;
  front: string;
  back: string;
  star_status: boolean;
  created_at: string;
}

const EditCards: React.FC = () => {
  const { setId } = useParams<{ setId: string }>();
  const [setName, setSetName] = useState('');
  const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState<{ front: string; back: string } | null>(null);

  useEffect(() => {
    const fetchFlashcards = async () => {
      if (!setId) {
        setError("No set ID provided.");
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`http://localhost:5001/get_flashcards_by_set/${setId}`, {
          withCredentials: true
        });
        setFlashcards(response.data.flashcards);
        setSetName(response.data.set_info.name);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching flashcards:', err);
        if (axios.isAxiosError(err) && err.response) {
          setError(`Failed to load flashcards: ${err.response.status} - ${err.response.statusText}`);
        } else if (err instanceof Error) {
          setError(`Failed to load flashcards: ${err.message}`);
        } else {
          setError('Failed to load flashcards. Please ensure the backend is running.');
        }
        setLoading(false);
      }
    };
    fetchFlashcards();
  }, [setId]);

  const handleSaveSetName = async () => {
    if (!setId || !setName.trim()) return;
    try {
      await axios.put(`http://localhost:5001/update_set_name/${setId}`, {
        name: setName
      }, {
        withCredentials: true
      });
      alert('Set name updated successfully!');
    } catch (err) {
      console.error('Error updating set name:', err);
      alert('Failed to update set name.');
    }
  };

  const handleEdit = (cardId: number) => {
    const card = flashcards.find(c => c.id === cardId);
    if (card) {
      setEditingCard(cardId);
      setEditedContent({ front: card.front, back: card.back });
    }
  };

  const handleSave = async (cardId: number) => {
    if (!editedContent) return;
    try {
      await axios.put(`http://localhost:5001/update_flashcard/${cardId}`, {
        front: editedContent.front,
        back: editedContent.back,
      }, {
        withCredentials: true
      });
      setFlashcards(cards =>
        cards.map(card =>
          card.id === cardId
            ? { ...card, front: editedContent.front, back: editedContent.back }
            : card
        )
      );
      setEditingCard(null);
      setEditedContent(null);
    } catch (err) {
      console.error('Error updating flashcard:', err);
      alert('Failed to update flashcard. Please try again.');
    }
  };

  const handleStar = async (cardId: number) => {
    try {
      const card = flashcards.find(c => c.id === cardId);
      if (!card) return;
      await axios.put(`http://localhost:5001/toggle_star/${cardId}`, {
        star_status: !card.star_status,
      }, {
        withCredentials: true
      });
      setFlashcards(cards =>
        cards.map(c =>
          c.id === cardId ? { ...c, star_status: !c.star_status } : c
        )
      );
    } catch (err) {
      console.error('Error toggling star status:', err);
      alert('Failed to update star status. Please try again.');
    }
  };

  const handleFlip = async (cardId: number) => {
    try {
      const card = flashcards.find(c => c.id === cardId);
      if (!card) return;
      const newFrontText = card.back;
      const newBackText = card.front;
      await axios.put(`http://localhost:5001/update_flashcard/${cardId}`, {
        front: newFrontText,
        back: newBackText,
      }, {
        withCredentials: true
      });
      setFlashcards(cards =>
        cards.map(c =>
          c.id === cardId
            ? { ...c, front: newFrontText, back: newBackText }
            : c
        )
      );
      if (editingCard === cardId && editedContent) {
        setEditedContent({
          front: newFrontText,
          back: newBackText,
        });
      }
    } catch (err) {
      console.error('Error flipping flashcard:', err);
      alert('Failed to flip flashcard. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-grey flex items-center justify-center">
        <h1 className="text-3xl font-jua text-off-white">Loading your Flashcards...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-grey flex items-center justify-center">
        <h1 className="text-3xl font-jua text-red-400">Error: {error}</h1>
        <p className="text-off-white text-center mt-4">Please ensure the backend Flask server is running and your PostgreSQL database is accessible.</p>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-dark-grey flex items-center justify-center">
        <div className="bg-light-grey border-2 border-teal rounded-3xl shadow-xl p-10 flex flex-col items-center">
          <h1 className="text-3xl font-jua text-off-white mb-4">No Flashcards Found!</h1>
          <p className="text-off-white text-center">
            It looks like you haven't generated any flashcards yet. <br />
            Go to the <a href="/library" className="text-purple underline">Library page</a> to create your first set!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-grey flex flex-col items-center py-10 px-2">
      <div className="w-full max-w-3xl mb-8">
        <label htmlFor="setName" className="block text-2xl font-jua text-off-white mb-2">Set Name</label>
        <div className="flex gap-2">
          <input 
            id="setName"
            type="text"
            value={setName}
            onChange={(e) => setSetName(e.target.value)}
            className="w-full p-3 rounded-xl border-2 border-teal bg-light-grey text-off-white font-jua text-lg outline-none focus:ring-2 focus:ring-teal"
          />
          <button
            onClick={handleSaveSetName}
            className="bg-teal hover:bg-teal-dark text-off-white font-jua text-lg rounded-xl px-6 py-2 shadow-md transition duration-200 font-bold"
          >
            Save Name
          </button>
        </div>
      </div>
      <h1 className="text-4xl font-jua text-off-white mb-10 text-center font-bold drop-shadow-lg">Edit Flashcards</h1>
      <div className="w-full max-w-3xl flex flex-col gap-8">
        {flashcards.map((card, index) => (
          <div key={card.id} className="bg-light-grey border-2 border-teal rounded-3xl shadow-xl p-8 relative">
            <h2 className="font-jua text-2xl text-off-white mb-4">Flashcard {index + 1}</h2>
            <div className="absolute top-6 right-6 flex gap-4">
              <button
                className="text-off-white hover:text-purple transition"
                onClick={() => handleEdit(card.id)}
                title="Edit"
              >
                <FontAwesomeIcon icon={faPen} size="lg" />
              </button>
              <button
                className="text-off-white hover:text-purple transition"
                onClick={() => handleFlip(card.id)}
                title="Flip"
              >
                <FontAwesomeIcon icon={faRotate} size="lg" />
              </button>
              <button
                className={
                  card.star_status
                    ? 'text-orange hover:text-orange-hover transition'
                    : 'text-off-white hover:text-amber-400 transition'
                }
                onClick={() => handleStar(card.id)}
                title="Star"
              >
                <FontAwesomeIcon icon={card.star_status ? faStarSolid : faStarRegular} size="lg" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-lg font-jua text-off-white mb-2">Front:</label>
              {editingCard === card.id ? (
                <textarea
                  value={editedContent?.front || ''}
                  onChange={e => setEditedContent(prev => ({ ...prev!, front: e.target.value }))}
                  className="w-full min-h-[60px] p-3 rounded-xl border-2 border-teal bg-beige-100 text-dark-blue font-jua text-lg outline-none focus:ring-2 focus:ring-teal mb-2"
                />
              ) : (
                <div className="p-4 bg-off-white text-dark-blue font-jua text-lg rounded-xl border-2 border-teal">
                  {card.front}
                </div>
              )}
            </div>
            <div className="mb-4">
              <label className="block text-lg font-jua text-off-white mb-2">Back:</label>
              {editingCard === card.id ? (
                <textarea
                  value={editedContent?.back || ''}
                  onChange={e => setEditedContent(prev => ({ ...prev!, back: e.target.value }))}
                  className="w-full min-h-[60px] p-3 rounded-xl border-2 border-teal bg-beige-100 text-light-blue font-jua text-lg outline-none focus:ring-2 focus:ring-teal mb-2"
                />
              ) : (
                <div className="p-4 bg-off-white text-light-blue font-jua text-lg rounded-xl border-2 border-teal">
                  {card.back}
                </div>
              )}
            </div>
            {editingCard === card.id && (
              <button
                className="bg-teal hover:bg-teal text-off-white font-jua text-lg rounded-xl px-6 py-2 mt-2 shadow-md transition duration-200 font-bold"
                onClick={() => handleSave(card.id)}
              >
                Save Changes
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EditCards;