import { Form, Head } from '@inertiajs/react';
import { LoaderCircle, MailCheck, ArrowLeft } from 'lucide-react';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { logout } from '@/routes';
import { send } from '@/routes/verification';

export default function VerifyEmail({ status }: { status?: string }) {
    const formProps = {
        method: 'post' as const,
        action: send.url(),
    };

    return (
        <>
            <Head title="Email verification" />

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
                                        <span className="text-8xl">✉️</span>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Pet Emojis */}
                            <div className="absolute -top-4 -right-4 text-6xl animate-bounce" style={{ animationDuration: '2s' }}>🐕</div>
                            <div className="absolute -bottom-8 -left-8 text-5xl animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>🐱</div>
                            <div className="absolute top-1/2 -right-12 text-4xl animate-bounce" style={{ animationDuration: '3s', animationDelay: '1s' }}>🦜</div>
                        </div>
                    </div>

                    {/* Text Content */}
                    <div className="absolute bottom-12 left-12 right-12">
                        <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
                            Check Your Email
                        </h2>
                        <p className="text-white/90 text-lg drop-shadow-md">
                            We've sent you a verification link to confirm your account.
                        </p>
                    </div>
                </div>

                {/* Right Side - Verify Email Form */}
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
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-100 to-rose-100 dark:from-orange-900/30 dark:to-rose-900/30 flex items-center justify-center">
                                    <MailCheck className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                    Verify Your Email
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    Thanks for signing up! Please verify your email address to continue.
                                </p>
                            </div>

                            {/* Status Message */}
                            {status === 'verification-link-sent' && (
                                <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm text-center">
                                    A new verification link has been sent to your email address.
                                </div>
                            )}

                            <Form {...formProps} className="space-y-6">
                                {({ processing }) => (
                                    <>
                                        <Button
                                            type="submit"
                                            variant="outline"
                                            disabled={processing}
                                            className="w-full h-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-500 hover:bg-orange-50/50 dark:hover:bg-gray-800 transition-all duration-300"
                                        >
                                            {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                            Resend verification email
                                        </Button>

                                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                                            <TextLink
                                                href={logout()}
                                                className="mx-auto block text-center text-sm text-gray-500 hover:text-orange-600 dark:text-gray-400 dark:hover:text-orange-400"
                                            >
                                                <span className="flex items-center justify-center">
                                                    <ArrowLeft className="w-4 h-4 mr-1" />
                                                    Log out
                                                </span>
                                            </TextLink>
                                        </div>
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

VerifyEmail.layout = {
    title: '',
    description: '',
};
