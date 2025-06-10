import React, { useState } from "react";
import styled from "styled-components";

// --- Page Layout and Background ---
const PageContainer = styled.div`
    background-color: #303030; /* Dark gray background */
    min-height: 100vh; /* Full viewport height */
    display: flex;
    justify-content: center; /* Center horizontally */
    align-items: center; /* Center vertically */
    padding: 20px; /* Padding around the central box */
    box-sizing: border-box;
`;

// --- Central Content Box ---
const ContentBox = styled.div`
    background-color: #404040; /* Slightly lighter gray for the box */
    border: 4px solid #00ba92; /* Green border from your flashcards */
    border-radius: 20px; /* Rounded corners for the box */
    padding: 40px;
    width: 100%;
    max-width: 700px; /* Max width for the box */
    box-shadow: 0px 8px 20px rgba(0, 0, 0, 0.4); /* Deeper shadow for prominence */
    display: flex;
    flex-direction: column;
    gap: 30px; /* Space between question groups */

    @media (max-width: 768px) {
        padding: 25px;
        max-width: 90%; /* Adjust width for smaller screens */
    }

    @media (max-width: 480px) {
        padding: 15px;
        border-radius: 15px;
    }
`;

// --- Question Group Styling ---
const QuestionGroup = styled.div`
    display: flex;
    flex-direction: column;
    position: relative; /* For positioning the HelpIcon and PopupBox */
`;

const QuestionRow = styled.div`
    display: flex;
    align-items: center;
    gap: 10px; /* Space between question text and icon */
    margin-bottom: 10px;
`;

const QuestionText = styled.label` /* Use label for accessibility */
    font-family: "Jua", sans-serif;
    color: #9370DB; /* Bright purple */
    font-size: 1.5em;
    font-weight: bold;

    @media (max-width: 768px) {
        font-size: 1.3em;
    }
    @media (max-width: 480px) {
        font-size: 1.1em;
    }
`;

// --- Input Box Styling ---
const InputBox = styled.input`
    background-color: #F5F5DC; /* Off-white, same as Home button */
    color: #000; /* Black text */
    font-family: "Jua", sans-serif;
    font-size: 1.1em;
    padding: 12px 20px;
    border: 2px solid transparent; /* Transparent border initially */
    border-radius: 30px; /* Rounded input box */
    width: 100%;
    box-sizing: border-box; /* Include padding/border in width */
    outline: none; /* Remove default focus outline */
    transition: border-color 0.3s ease, box-shadow 0.3s ease;

    &:focus {
        border-color: #FFA500; /* Bright orange outline on focus */
        box-shadow: 0 0 8px rgba(255, 165, 0, 0.6); /* Subtle glow */
    }

    &::placeholder {
        color: #888; /* Placeholder text color */
    }

    @media (max-width: 768px) {
        font-size: 1em;
        padding: 10px 15px;
    }
`;

// --- Help Icon Styling ---
const HelpIcon = styled.span`
    font-family: "Jua", sans-serif;
    color: #9370DB; /* Bright purple */
    font-size: 1.2em;
    cursor: pointer;
    font-weight: bold;
    width: 24px; /* Fixed width for consistent alignment */
    height: 24px; /* Fixed height */
    display: flex;
    justify-content: center;
    align-items: center;
    border: 2px solid #9370DB; /* Purple border for the circle */
    border-radius: 50%; /* Make it a circle */
    user-select: none; /* Prevent text selection */
    transition: background-color 0.2s ease, color 0.2s ease;

    &:hover {
        background-color: #9370DB; /* Purple background on hover */
        color: #F5F5DC; /* Off-white text on hover */
    }
`;

// --- Popup Box Styling ---
const PopupBox = styled.div`
    position: absolute;
    top: 0; /* Position relative to QuestionGroup */
    left: 100%; /* To the right of the icon/question */
    transform: translateX(10px); /* Small offset from the icon */
    background-color: #505050; /* Darker background for popup */
    color: #F5F5DC; /* Off-white text */
    font-family: Arial, sans-serif; /* Simpler font for popup text */
    font-size: 0.9em;
    padding: 10px 15px;
    border-radius: 8px;
    box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.5);
    white-space: pre-wrap; /* Preserve line breaks in example answers */
    z-index: 10; /* Ensure it's above other elements */
    min-width: 200px;
    max-width: 300px; /* Limit popup width */
    border: 1px solid #00ba92; /* Green border */

    @media (max-width: 768px) {
        top: auto; /* Reset top positioning */
        bottom: 100%; /* Position above on smaller screens */
        left: 0; /* Align left with the question */
        transform: translateY(-10px); /* Offset upwards */
        width: 100%; /* Take full width below on smaller screens */
        max-width: none; /* Remove max-width restriction */
    }
`;
const SubmitButton = styled.button`
    /* Initial state: Bright orange background, off-white text */
    background-color: #FFA500; /* Bright orange */
    color: #F8F8F8; /* Off-white text, matching CardFront background */
    font-family: "Jua", sans-serif;
    font-size: 1.6em;
    padding: 15px 30px;
    border: none;
    border-radius: 50px; /* Highly rounded corners */
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.1s ease, box-shadow 0.3s ease; /* Smooth transitions */
    margin-top: 40px; /* Space above the button, below the last input */
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2); /* Subtle shadow */
    align-self: center; /* Center the button within the flex column ContentBox */
    width: fit-content; /* Make button only as wide as its content */

    /* Hover state (optional: you could make it slightly darker orange or scale up) */
    &:hover {
        background-color: #FF8C00; /* Darker orange on hover */
        box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.3); /* Slightly larger shadow on hover */
    }

    /* Active (pressed) state */
    &:active {
        transform: translateY(2px); /* Slight push-down effect */
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2); /* Reduced shadow on press */
    }

    @media (max-width: 768px) {
        font-size: 1.4em;
        padding: 12px 25px;
    }

    @media (max-width: 480px) {
        font-size: 1.2em;
        padding: 10px 20px;
    }
`;

const GenerationInput: React.FC = () => {
    // State to hold input values
    const [formData, setFormData] = useState({
        topic: "",
        purpose: "",
        test: "",
        depth: "",
    });

    // State to manage popup visibility
    const [showPopup, setShowPopup] = useState({
        topic: false,
        purpose: false,
        test: false,
        depth: false,
    });

    // Handler for input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handler for toggling popup visibility
    const togglePopup = (questionName: keyof typeof showPopup) => {
        setShowPopup(prev => ({
            topic: false,    // Explicitly set all to false first
            purpose: false,
            test: false,
            depth: false,
            [questionName]: !prev[questionName], // Then toggle the selected one
        }));
    };

    // Example answers for popups
    const exampleAnswers = {
        topic: "example inputs: 'Quantum Physics', 'World War 2 History', 'React Hooks', 'Human Anatomy'",
        purpose: "example inputs:, 'To prepare for a midterm exam', 'To learn new concepts quickly', 'To review material before an interview', 'For general knowledge acquisition'",
        test: "example inputs:, 'Biology AP Exam', 'AWS Certified Developer Associate', 'Midterm for Intro to Psychology', 'No specific test, just general learning'",
        depth: "example inputs:, 'Basic definitions and key terms', 'In-depth explanations with examples', 'A comprehensive overview suitable for advanced study', 'Surface-level introduction'",
    };
    const handleSubmit = () => {
        console.log("Form Data Submitted:", formData);
        // In a real app, you'd send formData to your AI API here
        // e.g., trigger flashcard generation, navigate to a results page
    };

    return (
        <PageContainer>
            <ContentBox>
                <h1 style={{ fontFamily: '"Jua", sans-serif', color: '#F5F5DC', textAlign: 'center', fontSize: '2em', marginBottom: '20px' }}>
                    Generate Your Flashcards
                </h1>

                {/* Question 1: What topic would you like to study? */}
                <QuestionGroup>
                    <QuestionRow>
                        <QuestionText htmlFor="topic">What topic would you like to study?</QuestionText>
                        <HelpIcon onClick={() => togglePopup('topic')}>?</HelpIcon>
                        {showPopup.topic && <PopupBox>{exampleAnswers.topic}</PopupBox>}
                    </QuestionRow>
                    <InputBox
                        type="text"
                        name="topic"
                        id="topic"
                        value={formData.topic}
                        onChange={handleChange}
                        placeholder="e.g., 'Biology'"
                    />
                </QuestionGroup>

                {/* Question 2: What's the purpose of this flashcard set? */}
                <QuestionGroup>
                    <QuestionRow>
                        <QuestionText htmlFor="purpose">What's the purpose of this flashcard set?</QuestionText>
                        <HelpIcon onClick={() => togglePopup('purpose')}>?</HelpIcon>
                        {showPopup.purpose && <PopupBox>{exampleAnswers.purpose}</PopupBox>}
                    </QuestionRow>
                    <InputBox
                        type="text"
                        name="purpose"
                        id="purpose"
                        value={formData.purpose}
                        onChange={handleChange}
                        placeholder="e.g., 'Exam preparation'"
                    />
                </QuestionGroup>

                {/* Question 3: Is there a specific test you would like to study for? */}
                <QuestionGroup>
                    <QuestionRow>
                        <QuestionText htmlFor="test">Is there a specific test you would like to study for?</QuestionText>
                        <HelpIcon onClick={() => togglePopup('test')}>?</HelpIcon>
                        {showPopup.test && <PopupBox>{exampleAnswers.test}</PopupBox>}
                    </QuestionRow>
                    <InputBox
                        type="text"
                        name="test"
                        id="test"
                        value={formData.test}
                        onChange={handleChange}
                        placeholder="optional'"
                    />
                </QuestionGroup>

                {/* Question 4: How in depth would you like the flashcard set to be? */}
                <QuestionGroup>
                    <QuestionRow>
                        <QuestionText htmlFor="depth">How in depth would you like the flashcard set to be?</QuestionText>
                        <HelpIcon onClick={() => togglePopup('depth')}>?</HelpIcon>
                        {showPopup.depth && <PopupBox>{exampleAnswers.depth}</PopupBox>}
                    </QuestionRow>
                    <InputBox
                        type="text"
                        name="depth"
                        id="depth"
                        value={formData.depth}
                        onChange={handleChange}
                        placeholder="e.g., 'Comprehensive'"
                    />
                </QuestionGroup>

                <SubmitButton onClick={handleSubmit}>
                    CREATE MY STUDY SET
                </SubmitButton>
            </ContentBox>
        </PageContainer>
    );
};

export default GenerationInput;