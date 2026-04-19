import { useState } from 'react';

interface Story {
    id: number;
    user_name: string;
    pet_name: string | null;
    avatar_color: string;
    has_unread: boolean;
}

export default function StoriesBar() {
    const [stories] = useState<Story[]>([
        { id: 1, user_name: 'doggo_adventures', pet_name: 'Buddy', avatar_color: 'from-orange-400 to-pink-500', has_unread: true },
        { id: 2, user_name: 'cat_lover_99', pet_name: 'Luna', avatar_color: 'from-purple-400 to-blue-500', has_unread: true },
        { id: 3, user_name: 'birdie_world', pet_name: 'Charlie', avatar_color: 'from-green-400 to-teal-500', has_unread: false },
        { id: 4, user_name: 'fish_tank_pro', pet_name: 'Nemo', avatar_color: 'from-blue-400 to-cyan-500', has_unread: false },
        { id: 5, user_name: 'bunny_hop', pet_name: 'Snowball', avatar_color: 'from-pink-400 to-rose-500', has_unread: true },
        { id: 6, user_name: 'hamster_life', pet_name: 'Peanut', avatar_color: 'from-amber-400 to-orange-500', has_unread: false },
        { id: 7, user_name: 'pet_lover_daily', pet_name: 'Multiple', avatar_color: 'from-indigo-400 to-purple-500', has_unread: true },
    ]);

    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <div className="flex gap-4 overflow-x-auto scrollbar-hide">
                {/* Your Story */}
                <div className="flex flex-col items-center space-y-1">
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800">
                        <span className="text-2xl">📷</span>
                        <button
                            className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-white dark:bg-orange-600"
                            title="Add story"
                        >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Your story</span>
                </div>

                {/* Other Stories */}
                {stories.map((story) => (
                    <button
                        key={story.id}
                        type="button"
                        className="flex flex-col items-center space-y-1"
                    >
                        <div className={`relative flex h-16 w-16 items-center justify-center rounded-full border-2 bg-gradient-to-tr ${story.avatar_color} ${story.has_unread ? '' : 'border-gray-200 dark:border-gray-700'}`}>
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white dark:bg-gray-900">
                                <span className="text-xl">
                                    {story.pet_name === 'Buddy' && '🐕'}
                                    {story.pet_name === 'Luna' && '🐱'}
                                    {story.pet_name === 'Charlie' && '🐦'}
                                    {story.pet_name === 'Nemo' && '🐠'}
                                    {story.pet_name === 'Snowball' && '🐰'}
                                    {story.pet_name === 'Peanut' && '🐹'}
                                    {story.pet_name === 'Multiple' && '🐾'}
                                </span>
                            </div>
                        </div>
                        <span className="max-w-[72px] truncate text-xs text-gray-700 dark:text-gray-300">
                            {story.user_name}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
