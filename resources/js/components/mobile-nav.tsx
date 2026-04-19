import { Link, usePage } from '@inertiajs/react';
import { Zap, Archive, MessageCircle, Bell, User } from 'lucide-react';

const navItems = [
    {
        name: 'Discover',
        href: '/discover',
        icon: Zap,
        activeRoutes: ['/discover', '/'],
    },
    {
        name: 'Feed',
        href: '/feed',
        icon: Archive,
        activeRoutes: ['/feed'],
    },
    {
        name: 'Chat',
        href: '/chat',
        icon: MessageCircle,
        activeRoutes: ['/chat'],
    },
    {
        name: 'Notifications',
        href: '/notifications',
        icon: Bell,
        activeRoutes: ['/notifications'],
    },
    {
        name: 'Profile',
        href: '/profile',
        icon: User,
        activeRoutes: ['/profile'],
    },
];

export default function MobileNav() {
    const { url } = usePage();
    const currentPath = url.split('?')[0];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-around px-2">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.activeRoutes.includes(currentPath);

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex flex-col items-center justify-center py-3 px-4 min-w-[80px] rounded-t-2xl transition-all duration-200 ${
                                isActive
                                    ? 'text-orange-500 dark:text-orange-400'
                                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                        >
                            <Icon className="h-6 w-6 mb-1" />
                            <span className="text-xs font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
