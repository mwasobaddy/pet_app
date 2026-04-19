// import { Link } from '@inertiajs/react';
// import AppLogoIcon from '@/components/app-logo-icon';
// import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background">
            <div className="w-full">
                <div>
                    <div className="text-center">
                        <h1 className="text-xl font-medium">{title}</h1>
                        <p className="text-center text-sm text-muted-foreground">
                            {description}
                        </p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
