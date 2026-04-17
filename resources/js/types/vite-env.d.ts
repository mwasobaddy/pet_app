/// <reference types="vite/client" />

import type Echo from 'laravel-echo';

declare global {
	interface Window {
		Echo?: Echo;
		Pusher?: unknown;
	}
}
