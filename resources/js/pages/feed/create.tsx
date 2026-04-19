import { Head } from '@inertiajs/react';
import { useState } from 'react';
import messageWallRoutes from '@/routes/message-wall';
import LeftSidebar from './components/LeftSidebar';
import PostComposer from './components/PostComposer';
import RightSidebar from './components/RightSidebar';

export default function Create() {
    const [newPostBody, setNewPostBody] = useState('');
    const [newPostLocation, setNewPostLocation] = useState('');
    const [newPostTags, setNewPostTags] = useState('');
    const [newPostMedia, setNewPostMedia] = useState<File | null>(null);

    const submitPost = async () => {
        if (!newPostBody.trim() && !newPostMedia) {
            return;
        }

        const formData = new FormData();
        formData.append('body', newPostBody);

        if (newPostLocation.trim()) {
            formData.append('location', newPostLocation);
        }

        if (newPostTags.trim()) {
            newPostTags
                .split(',')
                .map((value) => value.trim())
                .filter(Boolean)
                .forEach((tag) => formData.append('tags[]', tag));
        }

        if (newPostMedia) {
            formData.append('media', newPostMedia);
        }

        try {
            await fetch(messageWallRoutes.posts.store.url(), {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: formData,
            });

            setNewPostBody('');
            setNewPostLocation('');
            setNewPostTags('');
            setNewPostMedia(null);

            // Redirect to feed
            window.location.href = '/feed';
        } catch (error) {
            console.error('Failed to create post:', error);
        }
    };

    return (
        <>
            <Head title="Create Post" />

            <div className="min-h-screen bg-linear-to-br from-orange-50/40 via-white to-pink-50/20 px-4 py-6 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 md:px-6">
                <div className="mx-auto flex max-w-7xl gap-6">
                    {/* Left Sidebar */}
                    <LeftSidebar />

                    {/* Main Content */}
                    <main className="flex-1 space-y-6">
                        <PostComposer
                            newPostBody={newPostBody}
                            newPostLocation={newPostLocation}
                            newPostTags={newPostTags}
                            newPostMedia={newPostMedia}
                            onUpdateBody={setNewPostBody}
                            onUpdateLocation={setNewPostLocation}
                            onUpdateTags={setNewPostTags}
                            onUpdateMedia={setNewPostMedia}
                            onSubmit={submitPost}
                        />
                    </main>

                    {/* Right Sidebar */}
                    <RightSidebar />
                </div>
            </div>
        </>
    );
}

Create.layout = {
    breadcrumbs: [
        {
            title: 'Feed',
            href: '/feed',
        },
        {
            title: 'Create Post',
            href: '/feed/create',
        },
    ],
};