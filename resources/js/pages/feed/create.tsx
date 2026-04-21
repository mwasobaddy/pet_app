import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { feed } from '@/routes';
import messageWallRoutes from '@/routes/message-wall';
import PostComposer from './components/PostComposer';

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

            router.visit(feed.url());
        } catch (error) {
            console.error('Failed to create post:', error);
        }
    };

    return (
        <>
            <Head title="Create Post" />

            <div className="min-h-screen bg-gray-50 dark:bg-black">
                <main className="mx-auto max-w-2xl px-4">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                            Create a Post
                        </h1>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
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
                    </div>
                </main>
            </div>
        </>
    );
}