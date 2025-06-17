import React from 'react';
import { useNavigate } from 'react-router-dom';
import Flashcard from '../components/Flashcard';

const flashcards = [
    { word: 'Cell', definition: 'The basic unit of structure and function in all living things.' },
    { word: 'Cell Membrane', definition: 'A cell structure that controls which substances can enter or leave the cell.' },
    { word: 'In Python, a comma-separated sequence of data items that are enclosed in a set of brackets is called a _____.', definition: 'list' },
    { word: 'The first line in the while loop is referred to as the condition clause.', definition: 'True' },
    { word: 'A computer is a single device that performs different types of tasks for its users.', definition: 'False' },
    { word: 'Code', definition: 'Lines written in a particular programming language' },
    { word: 'Eukaryotes', definition: 'Cells that contain nuclei.' },
    { word: 'Prokaryotes', definition: 'Cells that do not contain nuclei.' },
    { word: 'Model', definition: 'A simplified description, especially a mathematical one, of a system or process, to assist calculations and predictions.' },
    { word: 'What is Deep Learning?', definition: 'An umbrella term for machine learning approaches based on (deep) neural networks.' },
    { word: 'Generative AI', definition: 'AI that can generate original content such as texts, image, videos' },
    { word: 'Computer Vision', definition: 'A branch of AI that recognises images and videos.' },
    { word: 'What century was the Song Dynasty in?', definition: '1200s' },
    { word: 'How did Islam effect trade?', definition: 'Islam created trade connections.' },
    { word: 'Who were the Aztecs?', definition: 'The Mexican ethnic group in Meso America' },
];

const Home: React.FC = () => {
    const navigate = useNavigate();

    const handleStartClick = () => {
        navigate('/generation-input');
    };

    return (
        <div className="min-h-screen bg-neutral-700 flex flex-col md:flex-row items-center justify-center p-6">
            {/* Left Content */}
            <div className="flex-1 flex flex-col items-center md:items-start justify-center mb-10 md:mb-0 md:mr-10">
                <h1 className="text-4xl text-violet-500 md:text-5xl font-bold text-beige-100 mb-8 font-jua text-center md:text-left drop-shadow-lg">
                    Make studying more efficient by generating flashcards made just for you
                </h1>
                <button
                    className="bg-amber-500 text-yellow-50 hover:bg-yellow-100 hover:text-amber-500 font-bold py-3 px-8 rounded-3xl text-xl shadow-md transition duration-200"
                    onClick={handleStartClick}
                >
                    START NOW
                </button>
            </div>

            {/* Right Content: Flashcards */}
            <div className="flex-1 flex flex-wrap justify-center items-center gap-6">
                {flashcards.map((card, index) => (
                    <div
                        key={index}
                        className="transform transition-transform duration-300 hover:rotate-2"
                        style={{ rotate: `${Math.random() * 20 - 10}deg` }}
                    >
                        <Flashcard word={card.word} definition={card.definition} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;