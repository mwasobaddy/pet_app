<?php

return [
    'max_upload_mb' => env('CHAT_MAX_UPLOAD_MB', 25),
    'allowed_image_mimes' => [
        'image/jpeg',
        'image/png',
        'image/webp',
    ],
    'allowed_video_mimes' => [
        'video/mp4',
        'video/quicktime',
        'video/webm',
    ],
];
