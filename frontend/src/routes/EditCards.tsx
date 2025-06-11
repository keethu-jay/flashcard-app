import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import axios from 'axios'; // Import axios for making API requests
import Flashcard from '../components/Flashcard'; // Import your Flashcard component

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

const FlashcardsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); /* Responsive grid */
    gap: 25px; /* Space between cards */
    max-width: 1200px; /* Max width for the grid */
    width: 100%;
    justify-items: center; /* Center cards within their grid cells */
`;

const CardDisplayWrapper = styled.div`
    /* This wrapper is to apply initial rotation to each card */
    transform: rotate(${() => Math.random() * 20 - 10}deg); /* Random initial rotation */
    transition: transform 0.3s ease-in-out;

    &:hover {
        transform: rotate(${() => Math.random() * 10 - 5}deg); /* Slight random rotation on hover */
    }
`;


// Define the interface for the data structure coming from your backend
interface FlashcardData {
    id: number;
    set_id: string;
    topic: string;
    test_name: string | null;
    intensity_level: string;
    front_text: string; // Corresponds to 'front_text' column in DB
    back_text: string;  // Corresponds to 'back_text' column in DB
    created_at: string;
}

const EditCards: React.FC = () => {
    const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // useEffect to fetch flashcards when the component mounts
    useEffect(() => {
        const fetchFlashcards = async () => {
            try {
                // Ensure your backend Flask server is running on port 5000
                const response = await axios.get('http://localhost:5000/get_flashcards');
                setFlashcards(response.data.flashcards); // Assuming your Flask endpoint returns {"flashcards": [...]}
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
            <PageTitle>Your Generated Flashcards</PageTitle>
            <FlashcardsGrid>
                {flashcards.map((card) => (
                    // Wrap the Flashcard component to apply per-card transformations (like initial rotation)
                    // The key is essential for React list rendering
                    <CardDisplayWrapper key={card.id}>
                        {/* Pass the front_text and back_text from the database record */}
                        <Flashcard word={card.front_text} definition={card.back_text} />
                        {/* You would add edit/delete buttons/logic here later */}
                    </CardDisplayWrapper>
                ))}
            </FlashcardsGrid>
        </PageContainer>
    );
};

export default EditCards;