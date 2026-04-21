import { usePage } from '@inertiajs/react';
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import MobileNav from '@/components/mobile-nav';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    const { url } = usePage();
    const currentPath = url.split('?')[0];
    const isDiscoverRoute = currentPath === '/discover';
    const isChatDetailRoute = currentPath.startsWith('/chat/') && currentPath !== '/chat';

    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent
                variant="sidebar"
                className={`overflow-x-visible md:overflow-x-hidden ${
                    isDiscoverRoute || isChatDetailRoute ? 'pb-0 overflow-hidden' : 'pb-20 md:pb-0'
                }`}
            >
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
            </AppContent>
            {!isChatDetailRoute && <MobileNav />}
        </AppShell>
    );
}
