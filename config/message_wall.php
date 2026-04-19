<?php

return [
    'filtering_enabled' => env('MESSAGE_WALL_FILTERING_ENABLED', true),
    'allowed_sort_modes' => ['latest', 'popular', 'following'],
    'default_sort_mode' => 'latest',
    'per_page' => (int) env('MESSAGE_WALL_PER_PAGE', 10),
];
