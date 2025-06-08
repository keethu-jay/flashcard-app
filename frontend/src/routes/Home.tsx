import React from 'react';
import Flashcard from '../components/Flashcard';
import styled from 'styled-components';

const AppContainer = styled.div`
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    position: absolute;
    right: 0;
    width: 45vw;  /* Covers right third of the viewport */
    height: 100vh;
    padding: 10px;
    transform: rotate(-10deg);
    overflow: hidden;
    div:nth-child(3n + 2) { transform: translateY(50px); } /* Second column shifted */
    div:nth-child(3n + 3) { transform: translateY(100px); }
`;


const flashcards = [
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
const Home: React.FC = () => (

    <AppContainer>
        {flashcards.map((card, index) => (
            <Flashcard key={index} word={card.word} definition={card.definition} />
        ))}
    </AppContainer>
);

export default Home;