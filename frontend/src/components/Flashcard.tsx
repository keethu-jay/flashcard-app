import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// Ensure your theme import is correct and theme is defined
// import theme from "../styles/theme";

const CardContainer = styled.div`
    perspective: 1000px; /* Crucial for 3D effect */
    width: 250px;
    height: 150px;
    margin: 20px;
    position: relative; /* If you plan on adding more absolute children */
    // Optional: add some initial random rotation for visual appeal
        // transform: rotate(${() => Math.random() * 20 - 10}deg);
    transition: transform 0.3s ease-in-out; /* Smooth transition for initial rotation/hover */

    &:hover {
        /* You can keep this for an additional hover effect, or remove if you only want random flips */
        transform: rotate(${() => Math.random() * 10 - 5}deg);
    }
`;

// This is the element that actually performs the 3D flip
const Card = styled.div<{ $flipped: boolean }>` // Change 'flipped' to '$flipped' here
    width: 100%;
    height: 100%;
    transition: transform 0.6s;
    transform-style: preserve-3d;
    transform: ${({ $flipped }) => ($flipped ? 'rotateY(180deg)' : 'rotateY(0deg)')}; // Change 'flipped' to '$flipped' here
`;

const CardFace = styled.div`
    position: absolute; /* Stack faces on top of each other */
    width: 100%;
    height: 100%;
    /* CRITICAL: Hides the back of the element when it's facing away */
    backface-visibility: hidden;
    display: flex;
    padding: 10px;
    justify-content: center;
    align-items: center;
    font-size: 1.2em;
    border-radius: 90px;
    box-sizing: border-box; /* Include padding and border in width/height */
    text-align: center; /* For multi-line text */
    word-break: break-word; /* Prevents long words from overflowing */
    overflow: hidden; /* Hide content that goes beyond the border-radius */
`;

const CardFront = styled(CardFace)`
    background-color: #F8F8F8;
    color: #202854;
    font-family: "Jua", sans-serif;
    border: 4px solid #00ba92;
    /* The front face needs no additional transform initially */
`;

const CardBack = styled(CardFace)`
    background-color: #303030;
    color: #006d91;
    font-family: "Jua", sans-serif;
    border: 4px solid #00ba92;
    /* CRITICAL: Initially rotate the back face so its "front" side is facing away */
    //transform: rotateY(180deg);
`;

const Flashcard: React.FC<{ word: string; definition: string }> = ({ word, definition }) => {
    const [flipped, setFlipped] = useState(false);

    useEffect(() => {
        const flipInterval = setInterval(() => {
            // Randomly decide if the card should be flipped or not
            setFlipped(prevFlipped => !prevFlipped); // This will toggle the flip
        }, Math.random() * 3000 + 2000); // Flips every 2-5 seconds randomly

        return () => clearInterval(flipInterval); // Clean up the interval on unmount
    }, []); // Empty dependency array means this runs once on mount

    // // Add an onClick handler to allow manual flipping too
    // const handleClick = () => {
    //     setFlipped(prevFlipped => !prevFlipped);
    // };

    // Flashcard.tsx
// ...
    return (
        <CardContainer>
            <Card $flipped={flipped}> {/* Change 'flipped' to '$flipped' here */}
                <CardFront>{word}</CardFront>
                <CardBack>{definition}</CardBack>
            </Card>
        </CardContainer>
    );
};
// ...

export default Flashcard;