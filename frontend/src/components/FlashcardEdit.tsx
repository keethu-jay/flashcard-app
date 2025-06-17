import React, { useState } from 'react';
import styled from 'styled-components';

const CardContainer = styled.div`
    perspective: 1000px;
    width: 100%;
    max-width: 600px;
    height: 300px;
    margin: 20px auto;
    position: relative;
    cursor: pointer;
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
    padding: 20px;
    justify-content: center;
    align-items: center;
    font-size: 1.5em;
    border-radius: 20px;
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
    transform: rotateY(180deg);
`;

interface FlashcardEditProps {
    word: string;
    definition: string;
    onEdit?: (side: 'front' | 'back', value: string) => void;
}

const FlashcardEdit: React.FC<FlashcardEditProps> = ({ word, definition, onEdit }) => {
    const [flipped, setFlipped] = useState(false);

    const handleClick = () => {
        setFlipped(prevFlipped => !prevFlipped);
    };

    return (
        <CardContainer onClick={handleClick}>
            <Card $flipped={flipped}>
                <CardFront>{word}</CardFront>
                <CardBack>{definition}</CardBack>
            </Card>
        </CardContainer>
    );
};

export default FlashcardEdit;
