import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Flashcard from '../components/Flashcard';
import { useAuth } from '../contexts/AuthContext';

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
    const { isAuthenticated, login } = useAuth();
    const [flipped, setFlipped] = useState<boolean[]>(Array(flashcards.length).fill(false));
    const [showOverlay, setShowOverlay] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const gridRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLDivElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            const endpoint = authMode === 'login' ? '/login' : '/register';
            const payload = authMode === 'login' 
                ? { username: formData.username, password: formData.password }
                : formData;

            const response = await fetch(`http://localhost:5001${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                // Use the login function from AuthContext
                login(data.user);
                setShowAuthModal(false);
                setFormData({ username: '', email: '', password: '' });
                alert(authMode === 'login' ? 'Login successful!' : 'Registration successful!');
                // Navigate to generation input after successful auth
                navigate('/generate');
            } else {
                alert(data.error || 'Authentication failed');
            }
        } catch (error) {
            console.error('Auth error:', error);
            alert('Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    const openAuthModal = (mode: 'login' | 'register') => {
        setAuthMode(mode);
        setShowAuthModal(true);
        setFormData({ username: '', email: '', password: '' });
    };

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
        if (isAuthenticated) {
            navigate('/generate');
        } else {
            openAuthModal('login');
        }
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

            {/* Auth Modal */}
            {showAuthModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">
                                {authMode === 'login' ? 'Login' : 'Register'}
                            </h2>
                            <button
                                onClick={() => setShowAuthModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleAuth} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            {authMode === 'register' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? (
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {isLoading ? 'Loading...' : (authMode === 'login' ? 'Login' : 'Register')}
                            </button>
                        </form>

                        <div className="mt-4 text-center">
                            <button
                                onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                                className="text-blue-600 hover:text-blue-800"
                            >
                                {authMode === 'login' ? 'Need an account? Register' : 'Have an account? Login'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Home;