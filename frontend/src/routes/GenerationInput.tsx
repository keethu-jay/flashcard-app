import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const GenerationInput: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [test, setTest] = useState('');
  const [depth, setDepth] = useState('casual');
  const [context, setContext] = useState('');
  const [customCount, setCustomCount] = useState('');
  const [useCustomCount, setUseCustomCount] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const requestData: any = {
        topic: topic.trim(),
        test_name: test.trim() || null,
        intensity_level: depth,
        context: context.trim() || ''
      };

      // Add custom count if user wants to use it
      if (useCustomCount && customCount.trim()) {
        const count = parseInt(customCount.trim());
        if (count > 0) {
          requestData.custom_count = count;
        }
      }

      const response = await axios.post('http://localhost:5001/generate_flashcards', requestData, {
        withCredentials: true
      });

      console.log('Flashcards generated:', response.data);
      
      // Store the set_id in localStorage for the edit cards page
      if (response.data.set_id) {
        localStorage.setItem('currentSetId', response.data.set_id);
      }
      
      // Navigate to the edit cards page to see the generated flashcards
      navigate('/edit-cards');
    } catch (err) {
      console.error('Error generating flashcards:', err);
      if (axios.isAxiosError(err) && err.response) {
        setError(`Failed to generate flashcards: ${err.response.data?.error || err.response.statusText}`);
      } else if (err instanceof Error) {
        setError(`Failed to generate flashcards: ${err.message}`);
      } else {
        setError('Failed to generate flashcards. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getCardCountInfo = () => {
    switch (depth) {
      case 'casual':
        return '50 cards';
      case 'personal':
        return '80 cards';
      case 'comprehensive':
        return '120 cards';
      default:
        return '50 cards';
    }
  };

  return (
    <div className="min-h-screen bg-dark-grey flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-light-grey border-2 border-emerald-400 rounded-3xl shadow-2xl p-8 md:p-12 flex flex-col items-center">
        <h1 className="text-3xl md:text-4xl font-jua text-beige-100 mb-10 text-center font-bold">Generate Your Flashcards</h1>

        {/* Error Message */}
        {error && (
          <div className="w-full mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Topic Input */}
        <div className="w-full mb-8">
          <label className="block text-xl md:text-2xl font-jua text-purple-500 mb-3" htmlFor="topic">
            What topic would you like to study? <span className="align-super text-base">?</span>
          </label>
          <input
            id="topic"
            type="text"
            className="w-full bg-beige-100 text-orange font-jua text-lg rounded-full px-6 py-3 outline-none focus:ring-2 focus:ring-emerald-400 placeholder-gray-400"
            placeholder="e.g., 'Biology'"
            value={topic}
            onChange={e => setTopic(e.target.value)}
          />
        </div>

        {/* Test Input */}
        <div className="w-full mb-8">
          <label className="block text-xl md:text-2xl font-jua text-purple-500 mb-3" htmlFor="test">
            Is there a specific test you would like to study for? <span className="align-super text-base">?</span>
          </label>
          <input
            id="test"
            type="text"
            className="w-full bg-beige-100 font-jua text-lg rounded-full px-6 py-3 outline-none focus:ring-2 focus:ring-emerald-400 placeholder-gray-400"
            placeholder="optional"
            value={test}
            onChange={e => setTest(e.target.value)}
          />
        </div>

        {/* Depth Selection */}
        <div className="w-full mb-8">
          <label className="block text-xl md:text-2xl font-jua mb-3">
            How in depth would you like the flashcard set to be? <span className="align-super text-base">?</span>
          </label>
          <div className="flex flex-wrap gap-6 items-center">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="depth"
                value="casual"
                checked={depth === 'casual'}
                onChange={() => setDepth('casual')}
                className="accent-teal w-5 h-5 mr-2"
              />
              <span className="text-off-white font-jua text-lg">Casual learning ({getCardCountInfo()})</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="depth"
                value="personal"
                checked={depth === 'personal'}
                onChange={() => setDepth('personal')}
                className="accent-teal w-5 h-5 mr-2"
              />
              <span className="text-off-white font-jua text-lg">Personal education ({getCardCountInfo()})</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="depth"
                value="comprehensive"
                checked={depth === 'comprehensive'}
                onChange={() => setDepth('comprehensive')}
                className="accent-teal w-5 h-5 mr-2"
              />
              <span className="text-off-white font-jua text-lg">Comprehensive test prep ({getCardCountInfo()})</span>
            </label>
          </div>
        </div>

        {/* Custom Count Input */}
        <div className="w-full mb-8">
          <label className="flex items-center cursor-pointer mb-3">
            <input
              type="checkbox"
              checked={useCustomCount}
              onChange={() => setUseCustomCount(!useCustomCount)}
              className="accent-teal w-5 h-5 mr-2"
            />
            <span className="text-xl md:text-2xl font-jua text-purple-500">Use custom number of cards</span>
          </label>
          {useCustomCount && (
            <input
              type="number"
              min="1"
              max="500"
              className="w-full bg-beige-100 font-jua text-lg rounded-full px-6 py-3 outline-none focus:ring-2 focus:ring-emerald-400 placeholder-gray-400"
              placeholder="Enter number of cards (1-500)"
              value={customCount}
              onChange={e => setCustomCount(e.target.value)}
            />
          )}
        </div>

        {/* Context Input */}
        <div className="w-full mb-8">
          <label className="block text-xl md:text-2xl font-jua text-purple-500 mb-3" htmlFor="context">
            Add context, syllabus, or study guide (optional)
          </label>
          <textarea
            id="context"
            className="w-full bg-beige-100 text-gray-700 font-jua text-lg rounded-2xl px-6 py-3 outline-none focus:ring-2 focus:ring-emerald-400 placeholder-gray-400 min-h-[100px]"
            placeholder="Paste your syllabus, study guide, or any extra context here..."
            value={context}
            onChange={e => setContext(e.target.value)}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full font-jua text-2xl rounded-xl py-4 mt-2 shadow-lg transition duration-200 font-bold ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-orange hover:bg-orange-hover text-off-white'
          }`}
        >
          {loading ? 'GENERATING...' : 'CREATE MY STUDY SET'}
        </button>
      </div>
    </div>
  );
};

export default GenerationInput;