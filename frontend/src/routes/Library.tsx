import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface FlashcardSet {
  id: number;
  set_id: string;
  topic: string;
  intensity_level: string;
  card_count: number;
  created_at: string;
  name: string;
  user_id: number;
}

const Library: React.FC = () => {
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSets();
  }, []);

  const fetchSets = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/get_all_sets', {
        credentials: 'include'
      });

      if (response.status === 401) {
        setError('Please login to view your flashcard sets');
        setLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch sets');
      }

      const data = await response.json();
      setSets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your flashcard sets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <Link 
            to="/" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Your Flashcard Library</h1>
            <Link
              to="/create-set"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <span className="mr-2">+</span>
              Create New Set
            </Link>
          </div>

          {sets.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No flashcard sets yet</h3>
              <p className="text-gray-600 mb-6">Create your first set to get started!</p>
              <Link
                to="/create-set"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Set
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sets.map((set) => (
                <div
                  key={set.set_id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-gray-900 truncate">
                      {set.name}
                    </h3>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {set.card_count} cards
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-gray-600">
                      <span className="font-medium">Topic:</span> {set.topic}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Level:</span> {set.intensity_level}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Created: {formatDate(set.created_at)}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Link
                      to={`/learn/${set.set_id}`}
                      className="flex-1 bg-blue-600 text-white text-center py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                    >
                      Study
                    </Link>
                    <Link
                      to={`/edit-cards/${set.set_id}`}
                      className="bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 transition-colors"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Library;