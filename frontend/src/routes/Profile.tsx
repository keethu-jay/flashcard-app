import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface UserProfile {
    username: string;
    email: string;
    bio: string;
    profile_image_url: string;
}

const Profile: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [bio, setBio] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get('http://localhost:5001/profile', {
                    withCredentials: true,
                });
                setProfile(response.data);
                setBio(response.data.bio || '');
                setImageUrl(response.data.profile_image_url || '');
            } catch (err) {
                setError('Failed to fetch profile data.');
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async () => {
        try {
            await axios.put('http://localhost:5001/profile', {
                bio,
                profile_image_url: imageUrl
            }, {
                withCredentials: true,
            });
            alert('Profile updated successfully!');
        } catch (err) {
            alert('Failed to update profile.');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading profile...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <div className="flex items-center space-x-6 mb-8">
                    <img 
                        src={imageUrl || 'https://via.placeholder.com/150'} 
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover"
                    />
                    <div>
                        <h1 className="text-3xl font-bold">{profile?.username}</h1>
                        <p className="text-gray-600">{profile?.email}</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Profile Image URL</label>
                        <input
                            type="text"
                            id="imageUrl"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="https://example.com/image.png"
                        />
                    </div>
                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Biography</label>
                        <textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            rows={4}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Tell us about yourself..."
                        />
                    </div>
                    <div>
                        <button
                            onClick={handleSave}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Save Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile; 