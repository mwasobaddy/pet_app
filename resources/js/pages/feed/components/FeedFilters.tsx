interface FeedFiltersProps {
    sortMode: 'latest' | 'popular' | 'following';
    selectedPetCategory: string;
    selectedTags: number[];
    filteringEnabled: boolean;
    allowedSortModes: string[];
    petCategories: { id: number; name: string; icon: string | null }[];
    tags: { id: number; name: string }[];
    onSortChange: (mode: 'latest' | 'popular' | 'following') => void;
    onPetCategoryChange: (category: string) => void;
    onTagAdd: (tagId: number) => void;
    onTagRemove: (tagId: number) => void;
}

export default function FeedFilters({
    sortMode,
    selectedPetCategory,
    selectedTags,
    filteringEnabled,
    allowedSortModes,
    petCategories,
    tags,
    onSortChange,
    onPetCategoryChange,
    onTagAdd,
    onTagRemove,
}: FeedFiltersProps) {
    return (
        <section className="flex flex-wrap items-center gap-2">
            {(['latest', 'popular', 'following'] as const)
                .filter((mode) => allowedSortModes.includes(mode))
                .map((mode) => (
                    <button
                        key={mode}
                        type="button"
                        onClick={() => onSortChange(mode)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                            sortMode === mode
                                ? 'bg-gray-900 text-white dark:bg-white dark:text-black'
                                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
                        }`}
                    >
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                ))}

            {filteringEnabled && (
                <>
                    <select
                        value={selectedPetCategory}
                        onChange={(event) => onPetCategoryChange(event.target.value)}
                        className="rounded-lg border-0 bg-gray-100 px-3 py-1.5 text-xs text-gray-700 focus:outline-none dark:bg-gray-800 dark:text-gray-200"
                    >
                        <option value="">All pets</option>
                        {petCategories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.icon ?? '🐾'} {category.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value=""
                        onChange={(event) => {
                            const nextId = Number(event.target.value);

                            if (!nextId) {
                                return;
                            }

                            onTagAdd(nextId);
                        }}
                        className="rounded-lg border-0 bg-gray-100 px-3 py-1.5 text-xs text-gray-700 focus:outline-none dark:bg-gray-800 dark:text-gray-200"
                    >
                        <option value="">+ Tags</option>
                        {tags
                            .filter((tag) => !selectedTags.includes(tag.id))
                            .map((tag) => (
                                <option key={tag.id} value={tag.id}>{tag.name}</option>
                            ))}
                    </select>
                </>
            )}

            {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {selectedTags.map((tagId) => {
                        const tag = tags.find((entry) => entry.id === tagId);

                        return (
                            <button
                                key={tagId}
                                type="button"
                                onClick={() => onTagRemove(tagId)}
                                className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200"
                            >
                                #{tag?.name ?? tagId} ×
                            </button>
                        );
                    })}
                </div>
            )}
        </section>
    );
}