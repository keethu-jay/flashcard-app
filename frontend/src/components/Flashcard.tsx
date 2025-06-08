import React, { useState, useEffect } from 'react';
import styled from 'styled-components';


const CardContainer = styled.div.attrs(props => ({
    // Retaining this from previous discussions for initial random rotation
    // if you want the cards to start slightly angled on the home screen.
    // If you want them perfectly flat at start, remove this attrs block.
    style: {
        transform: `rotate(${Math.random() * 20 - 10}deg)`
    }
}))`
    perspective: 1000px; /* Crucial for 3D effect */
    width: 250px;
    height: 150px;
    margin: 20px;
    position: relative;
    transition: transform 0.4s ease-in-out; /* Smooth transition for initial rotation/hover */
    cursor: pointer; /* Add a pointer cursor to indicate it's clickable */

    &:hover {
        /* You can keep this for an additional hover effect, or remove if you only want random flips */
        transform: rotate(${() => Math.random() * 10 - 5}deg);
    }
`;

const Card = styled.div<{ $flipped: boolean }>`
    width: 100%;
    height: 100%;
    transition: transform 0.6s;
    transform-style: preserve-3d;

        transform: ${({ $flipped }) => ($flipped ? 'rotateY(180deg)' : 'rotateY(0deg)')};
`;

const CardFace = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    display: flex;
    padding: 10px;
    justify-content: center;
    align-items: center;
    font-size: 1.2em;
    border-radius: 86px;
    box-sizing: border-box;
    text-align: center;
    word-break: break-word;
    overflow: hidden;
`;

const CardFront = styled(CardFace)`
    background-color: #F8F8F8;
    color: #202854;
    font-family: "Jua", sans-serif;
    border: 4px solid #00ba92;
`;

const CardBack = styled(CardFace)`
    background-color: #303030;
    color: #006d91;
    font-family: "Jua", sans-serif;
    border: 4px solid #00ba92;
    //transform: rotateY(180deg); /* This ensures the back face is initially hidden */
`;

const Flashcard: React.FC<{ word: string; definition: string }> = ({ word, definition }) => {
    const [flipped, setFlipped] = useState(false);

    // --- REMOVE THIS useEffect BLOCK ---
    // useEffect(() => {
    //     const flipInterval = setInterval(() => {
    //         setFlipped(prevFlipped => !prevFlipped);
    //     }, Math.random() * 3000 + 2000);
    //
    //     return () => clearInterval(flipInterval);
    // }, []);
    // ------------------------------------

    // Keep the handleClick function for manual flipping
    const handleClick = () => {
        setFlipped(prevFlipped => !prevFlipped);
    };

    return (
        // Add the onClick handler to the CardContainer
        <CardContainer onClick={handleClick}>
            <Card $flipped={flipped}>
                <CardFront>{word}</CardFront>
                <CardBack>{definition}</CardBack>
            </Card>
        </CardContainer>
    );
};

export default Flashcard;