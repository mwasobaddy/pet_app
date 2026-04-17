import { Head, useForm } from '@inertiajs/react';
import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import subscription from '@/routes/subscription';

interface Tier {
    id: number;
    name: string;
    slug: string;
    description: string;
    daily_swipe_limit: number;
    daily_super_like_limit: number;
    boost_limit: number;
    rewind_enabled: boolean;
    full_profile_visibility: boolean;
    who_likes_you: boolean;
    read_receipts: boolean;
    media_upload_limit_videos: number;
    badge_label: string;
    badge_color: string;
    priority: number;
    is_active: boolean;
}

export default function SelectSubscription({ tiers }: { tiers: Tier[] }) {
    return (
        <>
            <Head title="Choose Your Plan" />
            
            <div className="min-h-screen bg-gradient-to-b from-background to-muted/50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-4">
                            Choose Your Perfect Plan
                        </h1>
                        <p className="text-xl text-muted-foreground">
                            Select a subscription tier to unlock features and start connecting with pets
                        </p>
                    </div>

                    {/* Tier Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-6">
                        {tiers.map((tier) => (
                            <TierCard key={tier.id} tier={tier} />
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

function TierCard({ tier }: { tier: Tier }) {
    const { post, processing } = useForm();

    const handleSelectTier = () => {
        post(subscription.store.url({ tier: tier.id }));
    };

    return (
        <Card className="relative flex flex-col h-full overflow-hidden hover:shadow-lg transition-shadow">
            {/* Badge */}
            {tier.badge_label && (
                <div className="absolute top-0 right-0 z-10">
                    <Badge 
                        className="rounded-none rounded-bl-lg"
                        style={{ backgroundColor: tier.badge_color }}
                    >
                        {tier.badge_label}
                    </Badge>
                </div>
            )}

            <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
            </CardHeader>

            <CardContent className="flex-grow">
                <div className="space-y-4">
                    {/* Features List */}
                    <div className="space-y-3">
                        <FeatureItem 
                            label={`${tier.daily_swipe_limit} daily swipes`}
                            included={tier.daily_swipe_limit > 0}
                        />
                        <FeatureItem 
                            label={`${tier.daily_super_like_limit} super likes per day`}
                            included={tier.daily_super_like_limit > 0}
                        />
                        <FeatureItem 
                            label={`${tier.boost_limit} boosts per month`}
                            included={tier.boost_limit > 0}
                        />
                        <FeatureItem 
                            label="Rewind likes"
                            included={tier.rewind_enabled}
                        />
                        <FeatureItem 
                            label="Full profile visibility"
                            included={tier.full_profile_visibility}
                        />
                        <FeatureItem 
                            label="See who likes you"
                            included={tier.who_likes_you}
                        />
                        <FeatureItem 
                            label="Read receipts"
                            included={tier.read_receipts}
                        />
                        <FeatureItem 
                            label={`${tier.media_upload_limit_videos} video uploads`}
                            included={tier.media_upload_limit_videos > 0}
                        />
                    </div>
                </div>
            </CardContent>

            <CardFooter>
                <Button 
                    onClick={handleSelectTier}
                    disabled={processing}
                    className="w-full"
                >
                    {processing ? 'Selecting...' : `Choose ${tier.name}`}
                </Button>
            </CardFooter>
        </Card>
    );
}

function FeatureItem({ label, included }: { label: string; included: boolean }) {
    return (
        <div className="flex items-center gap-2">
            {included ? (
                <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
            ) : (
                <div className="h-5 w-5 flex-shrink-0" />
            )}
            <span className={included ? 'text-foreground' : 'text-muted-foreground line-through'}>
                {label}
            </span>
        </div>
    );
}
