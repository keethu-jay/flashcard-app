import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Flashcard from '../components/Flashcard';

const flashcards = [
    { word: 'Cell', definition: 'The basic unit of structure and function in all living things.' },
    { word: 'Cell Membrane', definition: 'A cell structure that controls which substances can enter or leave the cell.' },
    { word: 'In Python, a comma-separated sequence of data items that are enclosed in a set of brackets is called a ', definition: 'list' },
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
    { word: 'What century was the Song Dynasty in?', definition: '1200s' },
    { word: 'How did Islam effect trade?', definition: 'Islam created trade connections.' },
    { word: 'Who were the Aztecs?', definition: 'The Mexican ethnic group in Meso America' },
];

const Home: React.FC = () => {
    const navigate = useNavigate();
    const [flipped, setFlipped] = useState<boolean[]>(Array(flashcards.length).fill(false));
    const [showOverlay, setShowOverlay] = useState(false);
    const gridRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            // Pick a random card index
            const idx = Math.floor(Math.random() * flashcards.length);

            // Flip it
            setFlipped((prev) => {
                const newFlipped = [...prev];
                newFlipped[idx] = true;
                return newFlipped;
            });

            // Flip it back after 1 second
            setTimeout(() => {
                setFlipped((prev) => {
                    const newFlipped = [...prev];
                    newFlipped[idx] = false;
                    return newFlipped;
                });
            }, 1000);
        }, 2000);

        // Check for overlap
        const checkOverlap = () => {
            if (!gridRef.current || !titleRef.current) return;
            const gridRect = gridRef.current.getBoundingClientRect();
            const titleRect = titleRef.current.getBoundingClientRect();

            // Check for overlap
            const overlap =
                gridRect.left < titleRect.right &&
                gridRect.right > titleRect.left &&
                gridRect.top < titleRect.bottom &&
                gridRect.bottom > titleRect.top;

            setShowOverlay(overlap);
        };

        checkOverlap();
        window.addEventListener('resize', checkOverlap);
        return () => {
            clearInterval(interval);
            window.removeEventListener('resize', checkOverlap);
        };
    }, []);

    const handleStartClick = () => {
        navigate('/generation-input');
    };

    return (
        <div className="relative w-full h-screen bg-dark-grey overflow-hidden">
            <div
                ref={gridRef}
                className="absolute top-0 left-0 overflow-visible"
                style={{
                    transform: 'rotate(17deg) translateY(-300px)',
                    transformOrigin: 'top left',
                    zIndex: 10,
                }}
            >
                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                    {flashcards.map((card, index) => (
                        <div key={index}>
                            <Flashcard
                                word={card.word}
                                definition={card.definition}
                                flipped={flipped[index]}
                                setFlippedState={(val: boolean) => {
                                    setFlipped((prev) => {
                                        const newFlipped = [...prev];
                                        newFlipped[index] = val;
                                        return newFlipped;
                                    });
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <div className="absolute right-0 top-0 h-full flex flex-col justify-center items-end pr-16 z-20 w-full md:w-auto">
                <div
                    ref={titleRef}
                    className={`max-w-md text-right transition-all duration-300 ${showOverlay ? 'bg-black bg-opacity-70 rounded-3xl px-8 py-10' : ''}`}
                >
                    <h1 className="text-4xl text-purple md:text-5xl font-bold text-beige-100 mb-8 font-jua drop-shadow-lg">
                        Make studying more efficient by generating flashcards made just for you!
                    </h1>
                    <button
                        className="bg-orange hover:bg-off-white text-white hover:text-orange font-bold py-3 px-8 rounded-3xl text-xl shadow-md transition duration-200"
                        onClick={handleStartClick}
                    >
                        START NOW
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Home;