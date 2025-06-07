import React, { useState } from 'react';
import styled from 'styled-components';

const CardContainer = styled.div`
  perspective: 1000px;
  width: 250px;
  height: 150px;
  margin: 20px;
  position: absolute;
  transform: rotate(-15deg);
`;

const Card = styled.div<{ flipped: boolean }>`
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  transform: ${({ flipped }) => (flipped ? 'rotateY(180deg)' : 'rotateY(0deg)')};
`;

const CardFace = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.2em;
  background-color: #fff;
  border: 1px solid #ccc;
`;

const CardFront = styled(CardFace)`
  background-color: #f8d7da;
`;

const CardBack = styled(CardFace)`
  background-color: #d4edda;
  transform: rotateY(180deg);
`;

const Flashcard: React.FC<{ word: string; definition: string }> = ({ word, definition }) => {
    const [flipped, setFlipped] = useState(false);

    return (
        <CardContainer onClick={() => setFlipped(!flipped)}>
            <Card flipped={flipped}>
                <CardFront>{word}</CardFront>
                <CardBack>{definition}</CardBack>
            </Card>
        </CardContainer>
    );
};

export default Flashcard;
