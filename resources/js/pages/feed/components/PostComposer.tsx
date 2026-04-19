import { Send } from 'lucide-react';

interface PostComposerProps {
    newPostBody: string;
    newPostLocation: string;
    newPostTags: string;
    newPostMedia: File | null;
    onUpdateBody: (value: string) => void;
    onUpdateLocation: (value: string) => void;
    onUpdateTags: (value: string) => void;
    onUpdateMedia: (file: File | null) => void;
    onSubmit: () => void;
}

export default function PostComposer({
    newPostBody,
    newPostLocation,
    newPostTags,
    newPostMedia,
    onUpdateBody,
    onUpdateLocation,
    onUpdateTags,
    onUpdateMedia,
    onSubmit,
}: PostComposerProps) {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        onUpdateMedia(file);
    };

    const isValid = newPostBody.trim() || newPostMedia;

    return (
        <div className="space-y-4">
            {/* Post Body */}
            <div>
                <label htmlFor="post-body" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    What&apos;s on your mind?
                </label>
                <textarea
                    id="post-body"
                    value={newPostBody}
                    onChange={(e) => onUpdateBody(e.target.value)}
                    placeholder="Share something about your pet..."
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                    rows={4}
                />
            </div>

            {/* Location */}
            <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location (optional)
                </label>
                <input
                    id="location"
                    type="text"
                    value={newPostLocation}
                    onChange={(e) => onUpdateLocation(e.target.value)}
                    placeholder="Where are you? e.g., Central Park, New York"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                />
            </div>

            {/* Tags */}
            <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags (optional, comma-separated)
                </label>
                <input
                    id="tags"
                    type="text"
                    value={newPostTags}
                    onChange={(e) => onUpdateTags(e.target.value)}
                    placeholder="e.g., cute, playtime, adventure"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                />
            </div>

            {/* Media Upload */}
            <div>
                <label htmlFor="media" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Add a photo or video (optional)
                </label>
                <div className="relative">
                    <input
                        id="media"
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <label
                        htmlFor="media"
                        className="flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-8 cursor-pointer transition-colors hover:border-orange-400 hover:bg-orange-50 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-orange-400 dark:hover:bg-gray-700"
                    >
                        <div className="text-center">
                            <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                />
                            </svg>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                {newPostMedia ? (
                                    <span className="font-medium text-orange-600 dark:text-orange-400">
                                        {newPostMedia.name}
                                    </span>
                                ) : (
                                    <>
                                        <span className="font-medium text-gray-900 dark:text-gray-200">Click to upload</span>
                                        {' or drag and drop'}
                                    </>
                                )}
                            </p>
                            {!newPostMedia && (
                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">PNG, JPG, GIF, MP4 up to 10MB</p>
                            )}
                        </div>
                    </label>
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onSubmit}
                    disabled={!isValid}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-3 font-semibold text-white transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send className="h-4 w-4" />
                    Post Now
                </button>
            </div>
        </div>
    );
}
