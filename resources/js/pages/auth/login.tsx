import { Form, Head } from '@inertiajs/react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import login from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
};

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: Props) {
    const [isHovered, setIsHovered] = useState(false);
    const formProps = {
        method: 'post' as const,
        action: login.store.url(),
    };

    return (
        <>
            <Head title="Log in" />

            <div className="min-h-screen w-full flex dark:bg-gray-950">
                {/* Left Side - Decorative/Pet Illustration */}
                <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                    {/* Gradient Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-400 via-pink-400 to-rose-500 dark:from-orange-600 dark:via-pink-700 dark:to-rose-800" />

                    {/* Pattern Overlay */}
                    <div className="absolute inset-0 opacity-10">
                        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="paw-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                                    <text x="10" y="40" fontSize="24" fill="white">🐾</text>
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#paw-pattern)" />
                        </svg>
                    </div>

                    {/* Floating Elements */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative">
                            {/* Main Circle */}
                            <div className="w-80 h-80 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                                <div className="w-64 h-64 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                                    <div className="w-48 h-48 rounded-full bg-white/30 backdrop-blur-lg flex items-center justify-center shadow-2xl">
                                        <span className="text-8xl">🐕</span>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Pet Emojis */}
                            <div className="absolute -top-4 -right-4 text-6xl animate-bounce" style={{ animationDuration: '2s' }}>🐱</div>
                            <div className="absolute -bottom-8 -left-8 text-5xl animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>🐰</div>
                            <div className="absolute top-1/2 -right-12 text-4xl animate-bounce" style={{ animationDuration: '3s', animationDelay: '1s' }}>🦜</div>
                            <div className="absolute bottom-1/4 -left-16 text-5xl animate-bounce" style={{ animationDuration: '2.8s', animationDelay: '0.3s' }}>🐹</div>
                        </div>
                    </div>

                    {/* Text Content */}
                    <div className="absolute bottom-12 left-12 right-12">
                        <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
                            Welcome to PawMatch
                        </h2>
                        <p className="text-white/90 text-lg drop-shadow-md">
                            Find your perfect furry companion and make a friend for life!
                        </p>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-gradient-to-b from-orange-50/50 via-white to-pink-50/30 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900">
                    <div className="w-full max-w-md">
                        {/* Mobile Logo */}
                        <div className="lg:hidden flex flex-col items-center mb-8">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center shadow-xl mb-4">
                                <span className="text-4xl">🐾</span>
                            </div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
                                PawMatch
                            </h1>
                        </div>

                        {/* Form Card */}
                        <div className="">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    Welcome back! 👋
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    Sign in to continue your pet journey
                                </p>
                            </div>

                            <Form
                                {...formProps}
                                resetOnSuccess={['password']}
                                className="space-y-6"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        {/* Google Sign-In Button */}
                                        <a
                                            href="/auth/google"
                                            className="block"
                                            onMouseEnter={() => setIsHovered(true)}
                                            onMouseLeave={() => setIsHovered(false)}
                                        >
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className={`w-full h-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-500 hover:bg-orange-50/50 dark:hover:bg-gray-800 transition-all duration-300 ${isHovered ? 'shadow-lg scale-[1.02]' : ''}`}
                                            >
                                                <svg
                                                    className="mr-3 h-5 w-5"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        fill="#4285F4"
                                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                    />
                                                    <path
                                                        fill="#34A853"
                                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                    />
                                                    <path
                                                        fill="#FBBC05"
                                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                                    />
                                                    <path
                                                        fill="#EA4335"
                                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                    />
                                                </svg>
                                                <span className="font-semibold text-gray-700 dark:text-gray-200">Continue with Google</span>
                                            </Button>
                                        </a>

                                        {/* Divider */}
                                        <div className="relative">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-gray-200 dark:border-gray-600" />
                                            </div>
                                            <div className="relative flex justify-center text-sm">
                                                <span className="px-4 bg-white/80 dark:bg-gray-900/80 text-gray-500 dark:text-gray-400 font-medium">
                                                    or sign in with email
                                                </span>
                                            </div>
                                        </div>

                                        {/* Email Field */}
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                Email address
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    name="email"
                                                    required
                                                    autoFocus
                                                    tabIndex={1}
                                                    autoComplete="email"
                                                    placeholder="hello@example.com"
                                                />
                                            </div>
                                            <InputError message={errors.email} />
                                        </div>

                                        {/* Password Field */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                    Password
                                                </Label>
                                                {canResetPassword && (
                                                    <TextLink
                                                        href={request()}
                                                        className="text-sm text-orange-600 hover:text-orange-500 font-medium"
                                                        tabIndex={5}
                                                    >
                                                        Forgot password?
                                                    </TextLink>
                                                )}
                                            </div>
                                            <PasswordInput
                                                id="password"
                                                name="password"
                                                required
                                                tabIndex={2}
                                                autoComplete="current-password"
                                                placeholder="Enter your password"
                                            />
                                            <InputError message={errors.password} />
                                        </div>

                                        {/* Remember Me */}
                                        <div className="flex items-center space-x-3">
                                            <Checkbox
                                                id="remember"
                                                name="remember"
                                                tabIndex={3}
                                                className="border-2 border-gray-300 dark:border-gray-600 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                                            />
                                            <Label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                                                Remember me for 30 days
                                            </Label>
                                        </div>

                                        {/* Submit Button */}
                                        <Button
                                            type="submit"
                                            className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 via-orange-500 to-rose-500 hover:from-orange-600 hover:via-orange-600 hover:to-rose-600 text-white font-bold text-base shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                                            tabIndex={4}
                                            disabled={processing}
                                            data-test="login-button"
                                        >
                                            {processing ? (
                                                <>
                                                    <Spinner className="mr-2" />
                                                    Signing in...
                                                </>
                                            ) : (
                                                'Sign In'
                                            )}
                                        </Button>

                                        {/* Register Link */}
                                        {canRegister && (
                                            <div className="text-center pt-4 border-t border-gray-100 dark:border-gray-700">
                                                <p className="text-gray-600 dark:text-gray-400">
                                                    Don't have an account?{' '}
                                                    <TextLink
                                                        href={register()}
                                                        tabIndex={5}
                                                        className="font-bold text-orange-600 hover:text-orange-500"
                                                    >
                                                        Create one free
                                                    </TextLink>
                                                </p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </Form>
                        </div>

                        {/* Footer */}
                        <p className="text-center text-sm text-gray-400 dark:text-gray-500 mt-8">
                            By signing in, you agree to our{' '}
                            <a href="#" className="text-orange-600 dark:text-orange-400 hover:underline">Terms</a>
                            {' '}and{' '}
                            <a href="#" className="text-orange-600 dark:text-orange-400 hover:underline">Privacy Policy</a>
                        </p>
                    </div>
                </div>
            </div>

            {status && (
                <div className="fixed top-4 right-4 z-50 px-6 py-4 bg-green-500 text-white rounded-xl shadow-lg animate-in slide-in-from-right">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: '',
    description: '',
};
