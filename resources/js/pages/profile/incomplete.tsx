import { Head, Link, router, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { discover } from '@/routes';
import profile from '@/routes/profile';

export default function IncompleteProfile() {
    const { data, setData, patch, processing, errors } = useForm({
        first_name: '',
        other_names: '',
        mobile_number: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(profile.complete.url(), {
            onSuccess: () => router.visit(discover.url()),
        });
    };

    const isFormComplete =
        data.first_name &&
        data.other_names &&
        data.mobile_number &&
        data.password &&
        data.password_confirmation &&
        data.password === data.password_confirmation;

    return (
        <>
            <Head title="Welcome! Let's get started" />

            <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 dark:bg-blue-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100 dark:bg-indigo-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />

                <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                    <div className="w-full max-w-3xl">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-[2rem] shadow-[0_40px_80px_-40px_rgba(15,23,42,0.35)] overflow-hidden">
                            <div className="px-8 py-10 sm:px-12 sm:py-12">
                                <div className="flex flex-col gap-10">
                                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                                        <div className="flex items-center gap-5">
                                            <div>
                                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                                                    Personal Informations
                                                </h1>
                                                <p className="mt-2 max-w-xl text-sm text-slate-500 dark:text-slate-400">
                                                    Finish your profile so you can start discovering pets and connecting with other pet lovers.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid gap-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="first_name" className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                                    First Name
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
                                                />
                                                <InputError message={errors.first_name} />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="other_names" className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                                    Last Name
                                                </Label>
                                                <Input
                                                    id="other_names"
                                                    type="text"
                                                    name="other_names"
                                                    required
                                                    placeholder="e.g., Johnson"
                                                    value={data.other_names}
                                                    onChange={(e) => setData('other_names', e.target.value)}
                                                />
                                                <InputError message={errors.other_names} />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="mobile_number" className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                                    Mobile Number
                                                </Label>
                                                <Input
                                                    id="mobile_number"
                                                    type="tel"
                                                    name="mobile_number"
                                                    required
                                                    placeholder="+1 (555) 000-0000"
                                                    value={data.mobile_number}
                                                    onChange={(e) => setData('mobile_number', e.target.value)}
                                                />
                                                <InputError message={errors.mobile_number} />
                                            </div>

                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div className="grid gap-2">
                                                    <Label htmlFor="password" className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                                        Password
                                                    </Label>
                                                    <PasswordInput
                                                        id="password"
                                                        name="password"
                                                        required
                                                        placeholder="Create a password"
                                                        value={data.password}
                                                        onChange={(e) => setData('password', e.target.value)}
                                                    />
                                                    <InputError message={errors.password} />
                                                </div>

                                                <div className="grid gap-2">
                                                    <Label htmlFor="password_confirmation" className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                                        Confirm Password
                                                    </Label>
                                                    <PasswordInput
                                                        id="password_confirmation"
                                                        name="password_confirmation"
                                                        required
                                                        placeholder="Confirm your password"
                                                        value={data.password_confirmation}
                                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                                    />
                                                    <InputError message={errors.password_confirmation} />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-2">
                                            <Button
                                                type="submit"
                                                className="w-full h-16 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white text-lg font-semibold shadow-xl shadow-orange-500/20 transition-all active:scale-[0.98]"
                                                disabled={processing || !isFormComplete}
                                            >
                                                {processing ? 'Saving...' : 'Update'}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
                            Already completed your profile?{' '}
                            <Link href={discover.url()} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                                Go to discover
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
