import { Head, Link, router, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function IncompleteProfile() {
    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        other_names: '',
        mobile_number: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('profile.update'), {
            onSuccess: () => router.visit(route('dashboard')),
        });
    };

    const isFormComplete = data.first_name && data.other_names;

    return (
        <>
            <Head title="Welcome! Let's get started" />

            <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 dark:bg-blue-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100 dark:bg-indigo-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />

                <div className="relative min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                    <div className="w-full max-w-2xl space-y-8">
                        {/* Header */}
                        <div className="text-center space-y-4">
                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40">
                                <span className="text-2xl">🐾</span>
                            </div>

                            <div className="space-y-2">
                                <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                                    Welcome to PetApp!
                                </h1>
                                <p className="text-lg text-slate-600 dark:text-slate-300">
                                    Let's complete your profile so you can start connecting with other pet lovers.
                                </p>
                            </div>

                            {/* Progress Indicator */}
                            <div className="flex justify-center gap-2 pt-2">
                                <div className="h-1.5 w-12 bg-blue-500 rounded-full" />
                                <div className="h-1.5 w-12 bg-blue-200 dark:bg-slate-700 rounded-full" />
                                <div className="h-1.5 w-12 bg-blue-200 dark:bg-slate-700 rounded-full" />
                            </div>
                        </div>

                        {/* Form Card */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl dark:shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700">
                            <div className="px-8 py-10">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* First Name */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                Step 1
                                            </span>
                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                Your Name
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Help us know who you are
                                        </p>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="first_name" className="text-sm font-medium">
                                            First Name *
                                        </Label>
                                        <Input
                                            id="first_name"
                                            type="text"
                                            name="first_name"
                                            required
                                            autoFocus
                                            placeholder="e.g., Sarah"
                                            value={data.first_name}
                                            onChange={(e) => setData('first_name', e.target.value)}
                                            className="h-10 text-base"
                                        />
                                        <InputError message={errors.first_name} />
                                    </div>

                                    {/* Other Names */}
                                    <div className="grid gap-2">
                                        <Label htmlFor="other_names" className="text-sm font-medium">
                                            Last Name *
                                        </Label>
                                        <Input
                                            id="other_names"
                                            type="text"
                                            name="other_names"
                                            required
                                            placeholder="e.g., Johnson"
                                            value={data.other_names}
                                            onChange={(e) => setData('other_names', e.target.value)}
                                            className="h-10 text-base"
                                        />
                                        <InputError message={errors.other_names} />
                                    </div>

                                    {/* Mobile Number */}
                                    <div className="space-y-2 pt-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                Step 2
                                            </span>
                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                                Contact Info
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                            Optional – helps other pet owners reach you
                                        </p>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="mobile_number" className="text-sm font-medium">
                                            Mobile Number
                                        </Label>
                                        <Input
                                            id="mobile_number"
                                            type="tel"
                                            name="mobile_number"
                                            placeholder="+1 (555) 000-0000"
                                            value={data.mobile_number}
                                            onChange={(e) => setData('mobile_number', e.target.value)}
                                            className="h-10 text-base"
                                        />
                                        <InputError message={errors.mobile_number} />
                                    </div>

                                    {/* Submit Button */}
                                    <div className="pt-4">
                                        <Button
                                            type="submit"
                                            className="w-full h-11 text-base font-semibold"
                                            disabled={processing || !isFormComplete}
                                        >
                                            {processing ? (
                                                <span className="flex items-center gap-2">
                                                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Saving...
                                                </span>
                                            ) : (
                                                'Continue to Next Step'
                                            )}
                                        </Button>
                                    </div>

                                    {/* Helper Text */}
                                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                                        First and last name are required to continue
                                    </p>
                                </form>
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="text-center space-y-2">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Already completed your profile?{' '}
                                <Link
                                    href={route('dashboard')}
                                    className="font-semibold text-blue-600 dark:text-blue-400 hover:underline transition-colors"
                                >
                                    Go to dashboard
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
