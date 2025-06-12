import React, { useState } from "react";
// Remove styled-components import as it's no longer used
// import styled from "styled-components";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const GenerationInput: React.FC = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        topic: "",
        test: "",
        depth: "casual learning", // Set a default value for 'depth'
    });

    const [showPopup, setShowPopup] = useState({
        topic: false,
        test: false,
        depth: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const togglePopup = (questionName: 'topic' | 'test' | 'depth') => {
        setShowPopup(prev => ({
            topic: false,
            test: false,
            depth: false,
            [questionName]: !prev[questionName], // Then toggle the selected one
        }));
    };

    const exampleAnswers = {
        topic: "e.g., 'Quantum Physics', 'World War 2 History', 'React Hooks', 'Human Anatomy'",
        test: "e.g., 'Biology AP Exam', 'AWS Certified Developer Associate', 'Midterm for Intro to Psychology', 'No specific test, just general learning'",
        depth: "Choose from: 'Casual learning' (brief, introductory, 5 cards), 'Personal education' (moderately in-depth, 10 cards), 'Comprehensive test prep' (detailed, exam-focused, 15 cards).",
    };

    const handleSubmit = async () => {
        console.log("Form Data Submitted:", formData);

        try {
            const response = await axios.post('http://localhost:5000/generate_flashcards', {
                topic: formData.topic,
                test: formData.test === '' ? null : formData.test,
                depth: formData.depth,
            });

            console.log("Flashcards generated and stored:", response.data);
            alert("Flashcards generated and stored successfully!");
            navigate('/edit-cards');

        } catch (error) {
            console.error("Error generating flashcards:", error);
            if (axios.isAxiosError(error) && error.response) {
                alert(`Failed to generate flashcards: ${error.response.data.error || error.response.statusText}`);
                console.error("Backend response:", error.response.data);
            } else if (error instanceof Error) {
                alert(`An unexpected error occurred: ${error.message}`);
            } else {
                alert("An unknown error occurred during flashcard generation.");
            }
        }
    };

    return (
        // PageContainer converted to div
        <div className="bg-[#303030] min-h-screen flex justify-center items-center p-5 box-border">
            {/* ContentBox converted to div */}
            <div className="bg-[#404040] border-4 border-[#00ba92] rounded-xl p-10 w-full max-w-3xl shadow-2xl flex flex-col gap-8
                            md:p-6 md:max-w-[90%] sm:p-4 sm:rounded-lg">

                <h1 className="font-jua text-[#F5F5DC] text-center text-2xl md:text-xl sm:text-lg mb-5">
                    Generate Your Flashcards
                </h1>

                {/* Question 1: What topic would you like to study? */}
                {/* QuestionGroup converted to div */}
                <div className="flex flex-col relative">
                    {/* QuestionRow converted to div */}
                    <div className="flex items-center gap-2.5 mb-2.5">
                        {/* QuestionText converted to label */}
                        <label htmlFor="topic" className="font-jua text-[#9370DB] text-xl font-bold
                                                        md:text-lg sm:text-base">
                            What topic would you like to study?
                        </label>
                        {/* HelpIcon converted to span */}
                        <span onClick={() => togglePopup('topic')}
                              className="font-jua text-[#9370DB] text-lg cursor-pointer font-bold w-6 h-6 flex justify-center items-center border-2 border-[#9370DB] rounded-full select-none transition-colors duration-200 ease-in
                                         hover:bg-[#9370DB] hover:text-[#F5F5DC]">
                            ?
                        </span>
                        {showPopup.topic && (

                            <div className="absolute top-0 left-full translate-x-2 translate-y-0
                                            bg-[#505050] text-[#F5F5DC] font-sans text-sm p-4 rounded-lg shadow-xl whitespace-pre-wrap z-10 min-w-[200px] max-w-[300px] border border-[#00ba92]
                                            md:top-auto md:bottom-full md:left-0 md:-translate-y-2 md:w-full md:max-w-none">
                        {exampleAnswers.topic}
                    </div>
                    )}
                </div>
                {/* InputBox converted to input */}
                <input
                    type="text"
                    name="topic"
                    id="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    placeholder="e.g., 'Biology'"
                    className="bg-[#F5F5DC] text-black font-jua text-lg px-5 py-3 border-2 border-transparent rounded-full w-full box-border outline-none transition-all duration-300 ease-in
                                    focus:border-[#FFA500] focus:shadow-md focus:shadow-orange-400/60
                                    placeholder:text-[#888]
                                    md:text-base md:px-4 md:py-2.5"
                />
            </div>

            {/* Question 2: What's the purpose of this flashcard set? (REMOVED) */}
            {/* This entire QuestionGroup block has been removed */}

            {/* Question 3: Is there a specific test you would like to study for? */}
            <div className="flex flex-col relative">
                <div className="flex items-center gap-2.5 mb-2.5">
                    <label htmlFor="test" className="font-jua text-[#9370DB] text-xl font-bold
                                                        md:text-lg sm:text-base">
                        Is there a specific test you would like to study for?
                    </label>
                    <span onClick={() => togglePopup('test')}
                          className="font-jua text-[#9370DB] text-lg cursor-pointer font-bold w-6 h-6 flex justify-center items-center border-2 border-[#9370DB] rounded-full select-none transition-colors duration-200 ease-in
                                         hover:bg-[#9370DB] hover:text-[#F5F5DC]">
                            ?
                        </span>
                    {showPopup.test && (
                        <div className="absolute top-0 left-full translate-x-2 translate-y-0
                                            bg-[#505050] text-[#F5F5DC] font-sans text-sm p-4 rounded-lg shadow-xl whitespace-pre-wrap z-10 min-w-[200px] max-w-[300px] border border-[#00ba92]
                                            md:top-auto md:bottom-full md:left-0 md:-translate-y-2 md:w-full md:max-w-none">
                            {exampleAnswers.test}
                        </div>
                    )}
                </div>
                <input
                    type="text"
                    name="test"
                    id="test"
                    value={formData.test}
                    onChange={handleChange}
                    placeholder="optional'"
                    className="bg-[#F5F5DC] text-black font-jua text-lg px-5 py-3 border-2 border-transparent rounded-full w-full box-border outline-none transition-all duration-300 ease-in
                                    focus:border-[#FFA500] focus:shadow-md focus:shadow-orange-400/60
                                    placeholder:text-[#888]
                                    md:text-base md:px-4 md:py-2.5"
                />
            </div>

            {/* Question 4: How in depth would you like the flashcard set to be? (UPDATED with RadioGroup) */}
            <div className="flex flex-col relative">
                <div className="flex items-center gap-2.5 mb-2.5">
                    <label htmlFor="depth" className="font-jua text-[#9370DB] text-xl font-bold
                                                        md:text-lg sm:text-base">
                        How in depth would you like the flashcard set to be?
                    </label>
                    <span onClick={() => togglePopup('depth')}
                          className="font-jua text-[#9370DB] text-lg cursor-pointer font-bold w-6 h-6 flex justify-center items-center border-2 border-[#9370DB] rounded-full select-none transition-colors duration-200 ease-in
                                         hover:bg-[#9370DB] hover:text-[#F5F5DC]">
                            ?
                        </span>
                    {showPopup.depth && (
                        <div className="absolute top-0 left-full translate-x-2 translate-y-0
                                            bg-[#505050] text-[#F5F5DC] font-sans text-sm p-4 rounded-lg shadow-xl whitespace-pre-wrap z-10 min-w-[200px] max-w-[300px] border border-[#00ba92]
                                            md:top-auto md:bottom-full md:left-0 md:-translate-y-2 md:w-full md:max-w-none">
                            {exampleAnswers.depth}
                        </div>
                    )}
                </div>
                {/* RadioGroup converted to div */}
                <div className="flex flex-wrap gap-5 mt-1.5
                                    sm:flex-col"> {/* Mobile: Stack options vertically */}
                    {/* RadioOption converted to label */}
                    <label htmlFor="depth_casual" className="flex items-center cursor-pointer font-jua text-[#F5F5DC] text-lg select-none">
                        <input
                            type="radio"
                            name="depth"
                            value="casual learning"
                            checked={formData.depth === 'casual learning'}
                            onChange={handleChange}
                            id="depth_casual"
                            className="appearance-none border-2 border-[#00ba92] rounded-full w-5 h-5 mr-2.5 outline-none transition-colors duration-200 ease-in flex-shrink-0
                                            checked:bg-[#FFA500] checked:border-[#FFA500]
                                            focus:shadow-lg focus:shadow-purple-400/50"
                        />
                        <span className="transition-colors duration-200 ease-in checked:text-[#FFA500]">Casual learning</span>
                    </label>
                    <label htmlFor="depth_personal_education" className="flex items-center cursor-pointer font-jua text-[#F5F5DC] text-lg select-none">
                        <input
                            type="radio"
                            name="depth"
                            value="personal education"
                            checked={formData.depth === 'personal education'}
                            onChange={handleChange}
                            id="depth_personal_education"
                            className="appearance-none border-2 border-[#00ba92] rounded-full w-5 h-5 mr-2.5 outline-none transition-colors duration-200 ease-in flex-shrink-0
                                            checked:bg-[#FFA500] checked:border-[#FFA500]
                                            focus:shadow-lg focus:shadow-purple-400/50"
                        />
                        <span className="transition-colors duration-200 ease-in checked:text-[#FFA500]">Personal education</span>
                    </label>
                    <label htmlFor="depth_comprehensive_test_prep" className="flex items-center cursor-pointer font-jua text-[#F5F5DC] text-lg select-none">
                        <input
                            type="radio"
                            name="depth"
                            value="comprehensive test prep"
                            checked={formData.depth === 'comprehensive test prep'}
                            onChange={handleChange}
                            id="depth_comprehensive_test_prep"
                            className="appearance-none border-2 border-[#00ba92] rounded-full w-5 h-5 mr-2.5 outline-none transition-colors duration-200 ease-in flex-shrink-0
                                            checked:bg-[#FFA500] checked:border-[#FFA500]
                                            focus:shadow-lg focus:shadow-purple-400/50"
                        />
                        <span className="transition-colors duration-200 ease-in checked:text-[#FFA500]">Comprehensive test prep</span>
                    </label>
                </div>
            </div>

            {/* SubmitButton converted to button */}
            <button
                onClick={handleSubmit}
                className="bg-[#FFA500] text-[#F8F8F8] font-jua text-2xl
                                px-8 py-4 border-none rounded-full cursor-pointer
                                transition-all duration-300 ease-in-out
                                mt-10 shadow-md self-center w-max
                                hover:bg-[#FF8C00] hover:shadow-xl
                                active:translate-y-px active:shadow-md
                                md:text-xl md:px-6 md:py-3 /* Responsive sizes */
                                sm:text-lg sm:px-5 sm:py-2 /* Responsive sizes */">
                CREATE MY STUDY SET
            </button>
        </div>
</div>
);
};

export default GenerationInput;