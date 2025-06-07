import React from 'react';
import Flashcard from '../components/Flashcard';
import styled from 'styled-components';

const AppContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #282c34;
`;

const flashcards = [
    { word: 'React', definition: 'A JavaScript library for UI' },
    { word: 'TypeScript', definition: 'A typed superset of JavaScript' },
    { word: 'Node.js', definition: 'JavaScript runtime outside the browser' },
];
const Home: React.FC = () => (
    <AppContainer>
        {flashcards.map((card, index) => (
            <Flashcard key={index} word={card.word} definition={card.definition} />
        ))}
    </AppContainer>
);

export default Home;