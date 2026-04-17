import { Head, useForm } from '@inertiajs/react';
import { Form } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import InputError from '@/components/input-error';

export default function IncompleteProfile() {
    const { data, setData, post, processing, errors } = useForm({
        first_name: '',
        other_names: '',
        mobile_number: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('profile.update'));
    };

    return (
        <>
            <Head title="Complete Your Profile" />

            <div className="min-h-screen bg-gradient-to-b from-background to-muted/50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-md">
                    <Card>
                        <CardHeader>
                            <CardTitle>Complete Your Profile</CardTitle>
                            <CardDescription>
                                Please fill in your basic information to get started
                            </CardDescription>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* First Name */}
                                <div className="grid gap-2">
                                    <Label htmlFor="first_name">First Name *</Label>
                                    <Input
                                        id="first_name"
                                        type="text"
                                        name="first_name"
                                        required
                                        autoFocus
                                        placeholder="Your first name"
                                        value={data.first_name}
                                        onChange={(e) => setData('first_name', e.target.value)}
                                    />
                                    <InputError message={errors.first_name} />
                                </div>

                                {/* Other Names */}
                                <div className="grid gap-2">
                                    <Label htmlFor="other_names">Last Name *</Label>
                                    <Input
                                        id="other_names"
                                        type="text"
                                        name="other_names"
                                        required
                                        placeholder="Your last name"
                                        value={data.other_names}
                                        onChange={(e) => setData('other_names', e.target.value)}
                                    />
                                    <InputError message={errors.other_names} />
                                </div>

                                {/* Mobile Number */}
                                <div className="grid gap-2">
                                    <Label htmlFor="mobile_number">Mobile Number</Label>
                                    <Input
                                        id="mobile_number"
                                        type="tel"
                                        name="mobile_number"
                                        placeholder="+1 (555) 000-0000"
                                        value={data.mobile_number}
                                        onChange={(e) => setData('mobile_number', e.target.value)}
                                    />
                                    <InputError message={errors.mobile_number} />
                                </div>

                                {/* Submit Button */}
                                <Button type="submit" className="w-full" disabled={processing}>
                                    {processing ? 'Saving...' : 'Continue to Pet Profile'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
