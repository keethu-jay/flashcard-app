import React from 'react';
import Flashcard from '../components/Flashcard';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

// No more styled-components import here!
// import styled from 'styled-components';

// --- No more styled components definitions for layout, title, or button! ---

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

const Home: React.FC = () => {
    const navigate = useNavigate(); // Initialize useNavigate hook

    const handleStartClick = () => {
        navigate('/library'); // Navigate to the /library route
    };

    return (
        // MainLayoutContainer converted to div
        <div className="flex min-h-screen bg-[#303030] box-border
                        md:flex-col md:items-center"> {/* Media query for smaller screens */}

            {/* LeftContentContainer converted to div */}
            <div className="flex-[2] flex flex-col justify-center items-start p-10 box-border overflow-hidden
                            lg:flex-[1.5] lg:p-4 /* Adjust flex/padding for slightly smaller screens */
                            md:flex-none md:w-full md:p-5 md:items-center md:text-center md:min-h-0 /* Media query for smaller screens */">

                {/* Title converted to h1 */}
                <h1 className="font-jua text-[#9370DB] text-5xl leading-tight m-0 max-w-xl
                                lg:text-3xl /* Adjust font size for slightly smaller screens */
                                md:text-2xl /* Adjust font size for smaller screens */
                                sm:text-xl /* Adjust font size for very small screens */">
                    Make studying more efficient by generating flashcards made just for you
                </h1>

                {/* StartButton converted to button */}
                <button
                    onClick={handleStartClick}
                    className="bg-[#F5F5DC] text-[#FFA500] font-jua text-2xl
                                px-8 py-4 border-none rounded-full cursor-pointer
                                transition-all duration-300 ease-in-out
                                mt-10 shadow-lg self-center w-max
                                hover:bg-[#FFA500] hover:text-[#F8F8F8] hover:shadow-xl
                                active:translate-y-px active:shadow-md
                                md:text-xl md:px-6 md:py-3 /* Responsive sizes */
                                sm:text-lg sm:px-5 sm:py-2 /* Responsive sizes */">
                    START NOW
                </button>
            </div>

            {/* RightContentContainer converted to div */}
            <div className="flex-1 flex justify-center items-center p-2.5 box-border overflow-hidden
                            md:flex-none md:w-full md:min-h-screen /* Media query for smaller screens */">

                {/* AppContainer (Flashcard Grid) converted to div */}
                <div className="grid grid-cols-3 gap-2.5 max-w-4xl w-full transform -rotate-6
                                md:grid-cols-2 /* 2 columns on smaller screens */
                                sm:grid-cols-1 sm:transform-none /* 1 column, no rotation on very small screens */">

                    {flashcards.map((card, index) => (
                        // Apply nth-child staggering using the plugin's variants
                        // Note: If the plugin isn't working perfectly for nested divs,
                        // you might need to apply a class to Flashcard component directly
                        // or resort to a very small styled-component wrapper for these specific transforms.
                        <div key={index} className={`
                                        ${index % 3 === 1 ? 'md:translate-y-[50px]' : ''} /* Second column shifted for 3 cols*/
                                        ${index % 3 === 2 ? 'md:translate-y-[100px]' : ''} /* Third column shifted for 3 cols*/
                                        ${index % 2 === 1 && (index % 3 !== 1 && index % 3 !== 2) ? 'sm:translate-y-[50px]' : ''} /* Second column shifted for 2 cols*/
                                        ${index % 1 === 0 && (index % 2 !== 1) ? 'sm:translate-y-0' : ''} /* No stagger for 1 col */
                                        `}>
                            <Flashcard word={card.word} definition={card.definition} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;