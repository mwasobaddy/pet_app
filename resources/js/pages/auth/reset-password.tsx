import { Form, Head } from '@inertiajs/react';
import { KeyRound, ArrowLeft } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login } from '@/routes';
import { update } from '@/routes/password';

type Props = {
    token: string;
    email: string;
};

export default function ResetPassword({ token, email }: Props) {
    const formProps = {
        method: 'post' as const,
        action: update.url(),
    };

    return (
        <>
            <Head title="Reset password" />

            <div className="min-h-screen w-full flex dark bg-gray-950">
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
                                        <span className="text-8xl">🔑</span>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Pet Emojis */}
                            <div className="absolute -top-4 -right-4 text-6xl animate-bounce" style={{ animationDuration: '2s' }}>🐕</div>
                            <div className="absolute -bottom-8 -left-8 text-5xl animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>🐱</div>
                            <div className="absolute top-1/2 -right-12 text-4xl animate-bounce" style={{ animationDuration: '3s', animationDelay: '1s' }}>🐰</div>
                        </div>
                    </div>

                    {/* Text Content */}
                    <div className="absolute bottom-12 left-12 right-12">
                        <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
                            Create New Password
                        </h2>
                        <p className="text-white/90 text-lg drop-shadow-md">
                            Choose a strong password to keep your account secure.
                        </p>
                    </div>
                </div>

                {/* Right Side - Reset Password Form */}
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

                        {/* Back to Login */}
                        <div className="mb-6">
                            <TextLink
                                href={login()}
                                className="inline-flex items-center text-sm text-gray-500 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4 mr-1" />
                                Back to login
                            </TextLink>
                        </div>

                        {/* Form Card */}
                        <div className="">
                            {/* Header */}
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-100 to-rose-100 dark:from-orange-900/30 dark:to-rose-900/30 flex items-center justify-center">
                                    <KeyRound className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    Set New Password
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    Enter your new password below
                                </p>
                            </div>

                            <Form
                                {...formProps}
                                transform={(data) => ({ ...data, token, email })}
                                resetOnSuccess={['password', 'password_confirmation']}
                                className="space-y-5"
                            >
                                {({ processing, errors }) => (
                                    <>
                                        {/* Email Field (Read-only) */}
                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                Email
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                autoComplete="email"
                                                value={email}
                                                readOnly
                                                className="h-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-800/50 dark:text-gray-400 cursor-not-allowed"
                                            />
                                            <InputError message={errors.email} />
                                        </div>

                                        {/* Password Field */}
                                        <div className="space-y-2">
                                            <Label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                New Password
                                            </Label>
                                            <PasswordInput
                                                id="password"
                                                name="password"
                                                autoComplete="new-password"
                                                autoFocus
                                                placeholder="Enter new password"
                                                className="h-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-orange-400 focus:ring-orange-400/20"
                                            />
                                            <InputError message={errors.password} />
                                        </div>

                                        {/* Confirm Password Field */}
                                        <div className="space-y-2">
                                            <Label htmlFor="password_confirmation" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                Confirm Password
                                            </Label>
                                            <PasswordInput
                                                id="password_confirmation"
                                                name="password_confirmation"
                                                autoComplete="new-password"
                                                placeholder="Confirm new password"
                                                className="h-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-orange-400 focus:ring-orange-400/20"
                                            />
                                            <InputError message={errors.password_confirmation} />
                                        </div>

                                        {/* Submit Button */}
                                        <Button
                                            type="submit"
                                            className="w-full h-12 rounded-xl bg-gradient-to-r from-orange-500 via-orange-500 to-rose-500 hover:from-orange-600 hover:via-orange-600 hover:to-rose-600 text-white font-bold text-base shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                                            disabled={processing}
                                            data-test="reset-password-button"
                                        >
                                            {processing ? (
                                                <>
                                                    <Spinner className="mr-2" />
                                                    Resetting...
                                                </>
                                            ) : (
                                                'Reset Password'
                                            )}
                                        </Button>
                                    </>
                                )}
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

ResetPassword.layout = {
    title: '',
    description: '',
};
