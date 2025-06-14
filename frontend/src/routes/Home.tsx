import React from 'react';
import Flashcard from '../components/Flashcard';
import styled from 'styled-components'; // Re-import styled-components
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

// --- Page Layout and Background ---
const MainLayoutContainer = styled.div`
    display: flex; /* Use flexbox to arrange children horizontally */
    min-height: 100vh; /* Ensure it covers the full viewport height */
    background-color: #303030; /* Dark gray background for the entire page */
    box-sizing: border-box; /* Include padding/border in total size */

    @media (max-width: 768px) {
        flex-direction: column; /* Stack content vertically on smaller screens */
        align-items: center; /* Center items when stacked */
    }
`;

// This container holds the title and will occupy the left section
const LeftContentContainer = styled.div`
    flex: 2; /* Takes 2 parts of the available space, e.g., ~66% */
    display: flex;
    flex-direction: column;
    justify-content: center; /* Vertically center the title */
    align-items: flex-start; /* Align title to the left */
    padding: 20px 40px; /* Padding for the text content */
    box-sizing: border-box;
    overflow: hidden; /* Hide overflow if text is too long */

    @media (max-width: 1024px) {
        flex: 1.5; /* Adjust flex for slightly smaller screens */
        padding: 10px;
    }

    @media (max-width: 768px) {
        flex: none; /* Don't take up dynamic space */
        width: 100%; /* Take full width on smaller screens */
        padding: 20px;
        align-items: center; /* Center text on smaller screens */
        text-align: center;
        min-height: auto; /* Allow height to collapse */
    }
`;

const Title = styled.h1`
    font-family: "Jua", sans-serif;
    color: #9370DB; /* Bright purple */
    font-size: 3em;
    line-height: 1.2;
    margin: 0; /* Remove default margin */
    max-width: 600px; /* Limit title width for readability */

    @media (max-width: 1024px) {
        font-size: 2.2em;
    }
    @media (max-width: 768px) {
        font-size: 2em;
    }
    @media (max-width: 480px) {
        font-size: 1.6em;
    }
`;

const StartButton = styled.button`
    /* Initial state */
    background-color: #F5F5DC; /* Off-white */
    color: #FFA500; /* Bright orange text */
    font-family: "Jua", sans-serif;
    font-size: 1.6em;
    padding: 15px 30px;
    border: none;
    border-radius: 50px; /* Highly rounded corners */
    cursor: pointer;
    transition: background-color 0.3s ease, color 0.3s ease, transform 0.1s ease; /* Smooth transitions */
    margin-top: 40px; /* Space above the button, below the title */
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2); /* Subtle shadow */

    /* Hover state */
    &:hover {
        background-color: #FFA500; /* Bright orange background */
        color: #F8F8F8; /* Off-white text */
        box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.3); /* Slightly larger shadow on hover */
    }

    /* Active (pressed) state */
    &:active {
        transform: translateY(2px); /* Slight push-down effect */
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2); /* Reduced shadow on press */
    }

    @media (max-width: 768px) {
        font-size: 1.4em;
        padding: 12px 25px;
    }

    @media (max-width: 480px) {
        font-size: 1.2em;
        padding: 10px 20px;
    }
`;

// This container holds the flashcard grid and will occupy the right section (1/3 viewport)
const RightContentContainer = styled.div`
    flex: 1; /* Takes 1 part of the available space, e.g., ~33% */
    display: flex;
    justify-content: center; /* Center the grid horizontally within its container */
    align-items: center; /* Vertically center the grid */
    padding: 10px; /* Padding around the grid */
    box-sizing: border-box;
    overflow: hidden; /* Hide overflow from rotated cards */

    @media (max-width: 768px) {
        flex: none; /* Don't take up dynamic space */
        width: 100%; /* Take full width on smaller screens */
        min-height: 100vh; /* Ensure grid section has height */
        /* To stack below the title, we'll change flex-direction on MainLayoutContainer */
    }
`;

const AppContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr); /* Default 3 columns */
    gap: 10px;
    /* No absolute positioning here, it flows within RightContentContainer */
    max-width: 900px; /* Limit the width of the grid */
    width: 100%; /* Take full width up to max-width */
    transform: rotate(-10deg);

    div:nth-child(3n + 2) { transform: translateY(50px); } /* Second column shifted */
    div:nth-child(3n + 3) { transform: translateY(100px); }

    /* Responsive adjustments for the grid itself */
    @media (max-width: 768px) {
        grid-template-columns: repeat(2, 1fr); /* 2 columns on smaller screens */
        div:nth-child(2n + 2) { transform: translateY(50px); }
        div:nth-child(2n + 3) { transform: translateY(0px); }
    }

    @media (max-width: 480px) {
        grid-template-columns: 1fr; /* 1 column on very small screens */
        transform: rotate(0deg); /* No rotation on very small screens */
        div:nth-child(n) { transform: translateY(0px); } /* No stagger on 1 column */
    }
`;

// FlashcardDisplayWrapper (This was an inner div in Tailwind version, now a styled component)
const FlashcardDisplayWrapper = styled.div`
    transform: rotate(${() => Math.random() * 20 - 10}deg); /* Random initial rotation */
    transition: transform 0.3s ease-in-out;

    &:hover {
        transform: rotate(${() => Math.random() * 10 - 5}deg); /* Slight random rotation on hover */
    }
`;


const flashcards = [
    // ... your flashcard data remains the same ...
    { word: 'Cell', definition: 'The basic unit of structure and function in all living things.' },
    { word: 'Cell Membrane', definition: 'A cell structure that controls which substances can enter or leave the cell.' },
    { word: 'In Python, a comma-separated sequence of data items that are enclosed in a set of brackets is called a _____.', definition: 'list' },
    { word: 'The first line in the while loop is referred to as the condition clause.', definition: 'True' },
    { word: 'A computer is a single device that performs different types of tasks for its users.', definition: 'False' },
    { word: 'Code', definition: 'Lines written in a particular programming language' },
    { word: 'Eukaryotes', definition: 'Cells that contain nuclei.' },
    { word: 'Prokaryotes', definition: 'Cells that do not contain nuclei.' },
    { word: 'Model', definition: 'A simplified description, especially a mathematical one, of a system or process, to' +
            'assist calculations and predictions.' },
    { word: 'What is Deep Learning?', definition: 'An umbrella term for machine learning approaches based on (deep) neural networks.' },
    { word: 'Generative AI', definition: 'AI that can generate original content such as texts, image, videos' },
    { word: 'Computer Vision', definition: 'A branch of AI that recognise meaningful information from images and videos.' },
    { word: 'What century was the Song Dynasty in?', definition: '1200s' },
    { word: 'How did Islam effect trade?', definition: 'Islam created trade connections.' },
    { word: 'Who were the Aztecs?', definition: 'The Mexican ethnic group in Meso America' },
];

const Home: React.FC = () => {
    const navigate = useNavigate(); // Initialize useNavigate hook

    const handleStartClick = () => {
        navigate('/generation-input'); // Navigate to the /library route (which will be GenerationInput)
    };

    return (
        <MainLayoutContainer>
            <LeftContentContainer>
                <Title>Make studying more efficient by generating flashcards made just for you</Title>
                <StartButton onClick={handleStartClick}>
                    START NOW
                </StartButton>
            </LeftContentContainer>
            <RightContentContainer>
                <AppContainer>
                    {flashcards.map((card, index) => (
                        <FlashcardDisplayWrapper key={index}> {/* Use the styled wrapper here */}
                            <Flashcard word={card.word} definition={card.definition} />
                        </FlashcardDisplayWrapper>
                    ))}
                </AppContainer>
            </RightContentContainer>
        </MainLayoutContainer>
    );
};

export default Home;