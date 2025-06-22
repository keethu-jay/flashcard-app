"use client"

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Bar, BarChart, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"

interface SetInfo {
    name: string;
    card_count: number;
}

interface ProgressData {
    [cardId: number]: number;
}

const LearnDashboard: React.FC = () => {
    const { setId } = useParams<{ setId: string }>();
    const [setInfo, setSetInfo] = useState<SetInfo | null>(null);
    const [progress, setProgress] = useState<ProgressData>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!setId) return;
            try {
                setLoading(true);
                const [setInfoRes, progressRes] = await Promise.all([
                    axios.get(`http://localhost:5001/get_flashcards_by_set/${setId}`, { withCredentials: true }),
                    axios.get(`http://localhost:5001/progress/set/${setId}`, { withCredentials: true })
                ]);
                setSetInfo(setInfoRes.data.set_info);
                setProgress(progressRes.data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [setId]);

    const progressChartData = Object.entries(progress).map(([cardId, correctCount]) => ({
        name: `Card ${cardId}`,
        total: correctCount,
    }));
    
    const masteredCount = Object.values(progress).filter(count => count >= 3).length;

    if (loading) return <div className="p-8 text-center">Loading Dashboard...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Studying: {setInfo?.name}</h1>
                <p className="text-gray-600 mb-8">You have {setInfo?.card_count || 0} cards in this set. Choose a study mode to begin.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Overall Progress Stats */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Overall Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{masteredCount} / {setInfo?.card_count || 0}</div>
                            <p className="text-xs text-muted-foreground">Cards Mastered (3+ correct)</p>
                            <div className="h-[120px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={progressChartData}>
                                        <Bar dataKey="total" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Study Modes */}
                    <div className="md:col-span-2 grid grid-cols-1 gap-6">
                        <StudyModeCard
                            title="Memorize"
                            description="Recall the card front from the back."
                            link={`/learn/${setId}/memorize`}
                            progress={{completed: masteredCount, total: setInfo?.card_count || 0}}
                        />
                        <StudyModeCard
                            title="Matching"
                            description="Match terms with their definitions in a grid."
                            link={`/learn/${setId}/matching`}
                            progress={{completed: 0, total: setInfo?.card_count || 0}} // Placeholder
                        />
                        <StudyModeCard
                            title="Quiz"
                            description="Test your knowledge with multiple-choice questions."
                            link={`/learn/${setId}/quiz`}
                             progress={{completed: 0, total: setInfo?.card_count || 0}} // Placeholder
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

interface StudyModeCardProps {
    title: string;
    description: string;
    progress: { completed: number; total: number };
    link: string;
}

const StudyModeCard: React.FC<StudyModeCardProps> = ({ title, description, progress, link }) => {
    const progressPercent = progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;

    return (
        <Link to={link} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow flex flex-col justify-between">
            <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 mb-4">{description}</p>
            </div>
            <div>
                <div className="flex justify-between items-center text-sm text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{progress.completed} / {progress.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progressPercent}%` }}></div>
                </div>
            </div>
        </Link>
    );
}

export default LearnDashboard; 