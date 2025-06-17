import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios'; // Import axios for making API requests
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faStar as faStarSolid, faRotate } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import FlashcardEdit from '../components/FlashcardEdit';

// --- Page Layout and Background ---
const PageContainer = styled.div`
    background-color: #303030; /* Dark gray background */
    min-height: 100vh; /* Full viewport height */
    padding: 40px 20px; /* Top/bottom padding for content */
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center; /* Center content horizontally */
`;

const PageTitle = styled.h1`
    font-family: "Jua", sans-serif;
    color: #F5F5DC; /* Off-white title */
    font-size: 2.5em;
    margin-bottom: 40px;
    text-align: center;

    @media (max-width: 768px) {
        font-size: 2em;
    }
`;

const FlashcardContainer = styled.div`
    background-color: #FFA500;
    border-radius: 20px;
    padding: 30px;
    margin: 20px 0;
    width: 100%;
    max-width: 800px;
    position: relative;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const FlashcardTitle = styled.h2`
    font-family: "Jua", sans-serif;
    color: #303030;
    font-size: 1.8em;
    margin-bottom: 20px;
`;

const ButtonContainer = styled.div`
    position: absolute;
    top: 20px;
    right: 20px;
    display: flex;
    gap: 15px;
`;

const IconButton = styled.button<{ $isActive?: boolean }>`
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    border-radius: 50%;
    transition: all 0.3s ease;
    color: ${props => props.$isActive ? '#FFD700' : '#303030'};
    
    &:hover {
        transform: scale(1.1);
        background-color: rgba(255, 255, 255, 0.2);
    }
    
    &:active {
        transform: scale(0.95);
    }
`;

const SaveButton = styled.button`
    background-color: #00ba92;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 10px;
    font-family: "Jua", sans-serif;
    font-size: 1.1em;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 20px;
    
    &:hover {
        background-color: #009d7a;
        transform: translateY(-2px);
    }
    
    &:active {
        transform: translateY(0);
    }
`;

const SideLabel = styled.div`
    font-family: "Jua", sans-serif;
    color: #303030;
    font-size: 1.2em;
    margin-bottom: 10px;
    font-weight: bold;
`;

// Define the interface for the data structure coming from your backend
interface FlashcardData {
    id: number;
    front: string;
    back: string;
    star_status: boolean;
    created_at: string;
}

const EditCards: React.FC = () => {
    const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [editingCard, setEditingCard] = useState<number | null>(null);
    const [editedContent, setEditedContent] = useState<{ front: string; back: string } | null>(null);

    // useEffect to fetch flashcards when the component mounts
    useEffect(() => {
        const fetchFlashcards = async () => {
            try {
                // Ensure your backend Flask server is running on port 5000
                const response = await axios.get('http://localhost:5000/get_flashcards');
                setFlashcards(response.data); // <-- Fix: backend returns array, not {flashcards: [...]}
                setLoading(false);
            } catch (err) {
                console.error("Error fetching flashcards:", err);
                // More detailed error checking for Axios
                if (axios.isAxiosError(err) && err.response) {
                    setError(`Failed to load flashcards: ${err.response.status} - ${err.response.statusText}`);
                } else if (err instanceof Error) {
                    setError(`Failed to load flashcards: ${err.message}`);
                } else {
                    setError("Failed to load flashcards. Please ensure the backend is running.");
                }
                setLoading(false);
            }
        };

        fetchFlashcards();
    }, []); // Empty dependency array means this runs once on mount

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
            await axios.put(`http://localhost:5000/update_flashcard/${cardId}`, {
                front: editedContent.front,
                back: editedContent.back
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
            console.error("Error updating flashcard:", err);
            alert("Failed to update flashcard. Please try again.");
        }
    };

    const handleStar = async (cardId: number) => {
        try {
            const card = flashcards.find(c => c.id === cardId);
            if (!card) return;

            await axios.put(`http://localhost:5000/toggle_star/${cardId}`, {
                star_status: !card.star_status
            });

            setFlashcards(cards =>
                cards.map(c =>
                    c.id === cardId
                        ? { ...c, star_status: !c.star_status }
                        : c
                )
            );
        } catch (err) {
            console.error("Error toggling star status:", err);
            alert("Failed to update star status. Please try again.");
        }
    };

    const handleFlip = async (cardId: number) => {
        try {
            const card = flashcards.find(c => c.id === cardId);
            if (!card) return;

            // Swap front and back text
            const newFrontText = card.back;
            const newBackText = card.front;

            // Update in database
            await axios.put(`http://localhost:5000/update_flashcard/${cardId}`, {
                front: newFrontText,
                back: newBackText
            });

            // Update in UI
            setFlashcards(cards =>
                cards.map(c =>
                    c.id === cardId
                        ? { ...c, front: newFrontText, back: newBackText }
                        : c
                )
            );

            // If we're currently editing this card, update the edited content too
            if (editingCard === cardId && editedContent) {
                setEditedContent({
                    front: newFrontText,
                    back: newBackText
                });
            }
        } catch (err) {
            console.error("Error flipping flashcard:", err);
            alert("Failed to flip flashcard. Please try again.");
        }
    };

    // --- Conditional Rendering based on loading/error/data ---
    if (loading) {
        return (
            <PageContainer>
                <PageTitle>Loading your Flashcards...</PageTitle>
            </PageContainer>
        );
    }

    if (error) {
        return (
            <PageContainer>
                <PageTitle style={{ color: 'red' }}>Error: {error}</PageTitle>
                <p style={{ color: '#F5F5DC', textAlign: 'center' }}>Please ensure the backend Flask server is running (check your terminal where `python app.py` is executed) and your PostgreSQL database is accessible.</p>
            </PageContainer>
        );
    }

    if (flashcards.length === 0) {
        return (
            <PageContainer>
                <PageTitle>No Flashcards Found!</PageTitle>
                <p style={{ color: '#F5F5DC', textAlign: 'center' }}>
                    It looks like you haven't generated any flashcards yet. <br />
                    Go to the <a href="/library" style={{ color: '#9370DB' }}>Library page</a> to create your first set!
                </p>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <PageTitle>Your Flashcards</PageTitle>
            {flashcards.map((card, index) => (
                <FlashcardContainer key={card.id}>
                    <FlashcardTitle>Flashcard {index + 1}</FlashcardTitle>
                    <ButtonContainer>
                        <IconButton onClick={() => handleEdit(card.id)}>
                            <FontAwesomeIcon icon={faPen} size="lg" />
                        </IconButton>
                        <IconButton onClick={() => handleFlip(card.id)}>
                            <FontAwesomeIcon icon={faRotate} size="lg" />
                        </IconButton>
                        <IconButton 
                            onClick={() => handleStar(card.id)}
                            $isActive={card.star_status}
                        >
                            <FontAwesomeIcon 
                                icon={card.star_status ? faStarSolid : faStarRegular} 
                                size="lg" 
                            />
                        </IconButton>
                    </ButtonContainer>
                    <div>
                        <SideLabel>Front:</SideLabel>
                        {editingCard === card.id ? (
                            <textarea
                                value={editedContent?.front || ''}
                                onChange={(e) => setEditedContent(prev => ({ ...prev!, front: e.target.value }))}
                                style={{
                                    width: '100%',
                                    minHeight: '100px',
                                    padding: '10px',
                                    borderRadius: '10px',
                                    border: '2px solid #00ba92',
                                    fontFamily: '"Jua", sans-serif',
                                    fontSize: '1.2em',
                                    marginBottom: '20px'
                                }}
                            />
                        ) : (
                            <div style={{
                                padding: '20px',
                                backgroundColor: '#F8F8F8',
                                borderRadius: '10px',
                                border: '4px solid #00ba92',
                                fontFamily: '"Jua", sans-serif',
                                fontSize: '1.2em',
                                marginBottom: '20px'
                            }}>
                                {card.front}
                            </div>
                        )}
                        <SideLabel>Back:</SideLabel>
                        {editingCard === card.id ? (
                            <textarea
                                value={editedContent?.back || ''}
                                onChange={(e) => setEditedContent(prev => ({ ...prev!, back: e.target.value }))}
                                style={{
                                    width: '100%',
                                    minHeight: '100px',
                                    padding: '10px',
                                    borderRadius: '10px',
                                    border: '2px solid #00ba92',
                                    fontFamily: '"Jua", sans-serif',
                                    fontSize: '1.2em'
                                }}
                            />
                        ) : (
                            <div style={{
                                padding: '20px',
                                backgroundColor: '#303030',
                                color: '#006d91',
                                borderRadius: '10px',
                                border: '4px solid #00ba92',
                                fontFamily: '"Jua", sans-serif',
                                fontSize: '1.2em'
                            }}>
                                {card.back}
                            </div>
                        )}
                    </div>
                    {editingCard === card.id && (
                        <SaveButton onClick={() => handleSave(card.id)}>
                            Save Changes
                        </SaveButton>
                    )}
                </FlashcardContainer>
            ))}
        </PageContainer>
    );
};

export default EditCards;