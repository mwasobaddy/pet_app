# Inertia React Form & Authentication Patterns

## Overview
This document provides patterns and best practices for building forms and authentication components with Inertia React in this project.

## Form Structure in Inertia

### Basic Form Pattern

All forms in this project use Inertia's `<Form>` component with proper error handling:

```jsx
import { Form, Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import InputError from '@/components/input-error';

export default function MyForm() {
    return (
        <>
            <Head title="Form Page" />
            
            <Form method="post" action={route()}>
                {({ processing, errors }) => (
                    <div className="space-y-6">
                        {/* Form fields here */}
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                )}
            </Form>
        </>
    );
}
```

**Key Points:**
- Always wrap forms with `<Head>` for page title
- Use render props pattern `{({ processing, errors }) => (...)}`
- Access `processing` state to disable buttons during submission
- Use `errors` object for field-level validation feedback

---

## Authentication Form Layout

### Login Form with OAuth + Email

When building authentication forms, follow this structure:

```jsx
<Form {...store.form()} resetOnSuccess={['password']}>
    {({ processing, errors }) => (
        <>
            <Head title="Log in" />
            
            <div className="grid gap-6">
                {/* 1. OAuth Section */}
                <div className="space-y-3">
                    <a href="/auth/google">
                        <Button type="button" variant="outline" className="w-full">
                            <GoogleIcon className="mr-2 h-4 w-4" />
                            Sign in with Google
                        </Button>
                    </a>
                    {/* Other OAuth providers here */}
                </div>

                {/* 2. Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-muted-foreground/20" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                            Or continue with email
                        </span>
                    </div>
                </div>

                {/* 3. Email Field */}
                <div className="grid gap-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        required
                        autoFocus
                        placeholder="email@example.com"
                    />
                    <InputError message={errors.email} />
                </div>

                {/* 4. Password Field */}
                <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <TextLink href={route('password.request')}>
                            Forgot password?
                        </TextLink>
                    </div>
                    <PasswordInput
                        id="password"
                        name="password"
                        required
                        placeholder="Password"
                    />
                    <InputError message={errors.password} />
                </div>

                {/* 5. Remember Checkbox */}
                <div className="flex items-center space-x-3">
                    <Checkbox id="remember" name="remember" />
                    <Label htmlFor="remember">Remember me</Label>
                </div>

                {/* 6. Submit Button */}
                <Button type="submit" className="w-full" disabled={processing}>
                    {processing ? <Spinner className="mr-2" /> : null}
                    Log in
                </Button>
            </div>

            {/* 7. Sign Up Link */}
            <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <TextLink href={route('register')}>
                    Sign up
                </TextLink>
            </div>
        </>
    )}
</Form>
```

**Layout Structure Explanation:**
1. **OAuth Section** - Buttons for third-party authentication
2. **Divider** - Visual separator between OAuth and email
3. **Email Field** - Standard input with label and error
4. **Password Field** - Password input with optional forgot password link
5. **Remember Checkbox** - Session persistence option
6. **Submit Button** - Form submission with loading state
7. **Sign Up Link** - Link to registration for new users

---

## Form Field Input Patterns

### Standard Text Input
```jsx
<div className="grid gap-2">
    <Label htmlFor="name">Name</Label>
    <Input
        id="name"
        type="text"
        name="name"
        required
        placeholder="Full name"
        defaultValue={data.name}
    />
    <InputError message={errors.name} />
</div>
```

### Email Input
```jsx
<div className="grid gap-2">
    <Label htmlFor="email">Email</Label>
    <Input
        id="email"
        type="email"
        name="email"
        required
        autoComplete="email"
        placeholder="email@example.com"
    />
    <InputError message={errors.email} />
</div>
```

### Password Input
```jsx
<div className="grid gap-2">
    <Label htmlFor="password">Password</Label>
    <PasswordInput
        id="password"
        name="password"
        required
        autoComplete="new-password"
        placeholder="Enter password"
    />
    <InputError message={errors.password} />
</div>
```

### Checkbox Field
```jsx
<div className="flex items-center space-x-3">
    <Checkbox
        id="agree"
        name="agree_to_terms"
        required
    />
    <Label htmlFor="agree">
        I agree to the <TextLink href="/terms">Terms of Service</TextLink>
    </Label>
    <InputError message={errors.agree_to_terms} />
</div>
```

### Select/Dropdown
```jsx
<div className="grid gap-2">
    <Label htmlFor="role">Role</Label>
    <select
        id="role"
        name="role"
        required
        className="rounded-md border border-input bg-background px-3 py-2"
        defaultValue={data.role}
    >
        <option value="">Select a role</option>
        <option value="user">User</option>
        <option value="admin">Admin</option>
    </select>
    <InputError message={errors.role} />
</div>
```

---

## OAuth Integration Pattern

### Adding Google Sign-In

1. **Button Structure:**
```jsx
<a href="/auth/google">
    <Button type="button" variant="outline" className="w-full">
        <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            {/* Google SVG paths */}
        </svg>
        Sign in with Google
    </Button>
</a>
```

2. **Key Points:**
   - Use `<a>` tag instead of `<button>` for navigation
   - Set `type="button"` to prevent form submission
   - Use `variant="outline"` for secondary appearance
   - Add `className="w-full"` for full-width button
   - Include provider logo/icon before text

3. **Controller Handling:**
```php
// app/Http/Controllers/Auth/GoogleAuthController.php
public function callback() {
    $googleUser = Socialite::driver('google')->user();
    
    $user = User::updateOrCreate(
        ['email' => $googleUser->getEmail()],
        [
            'name' => $googleUser->getName(),
            'email' => $googleUser->getEmail(),
            'email_verified_at' => now(),
            'password' => bcrypt(str()->random(32)),
        ]
    );
    
    // Assign role to new users
    if ($user->wasRecentlyCreated) {
        $user->assignRole('user');
    }
    
    Auth::login($user, remember: true);
    return redirect()->intended('/dashboard');
}
```

---

## Error Handling

### Field-Level Errors
```jsx
{/* Always show error below input field */}
<div className="grid gap-2">
    <Input name="email" />
    <InputError message={errors.email} />
</div>
```

### Form-Level Errors
```jsx
{/* Show general errors at top */}
{errors.general && (
    <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
        {errors.general}
    </div>
)}
```

### Success Messages
```jsx
{/* Show flash message after form submission */}
{flash.success && (
    <div className="rounded-md bg-green-50 p-4 text-sm text-green-700">
        {flash.success}
    </div>
)}
```

---

## Inertia Form Imports

Always import these at the top of form components:

```jsx
// Core Inertia
import { Form, Head, Link } from '@inertiajs/react';
import { router } from '@inertiajs/react';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

// Custom Components
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';

// Routing
import { register, login } from '@/routes';
```

---

## Form Configuration

### Store Pattern
```jsx
// Configure form method, action, and default data
const store = {
    form: () => ({
        method: 'post',
        action: route('login.store'),
        data: {
            email: '',
            password: '',
            remember: false,
        },
    }),
};

// Usage
<Form {...store.form()}>
```

### Reset on Success
```jsx
// Reset password field after successful submission
<Form {...store.form()} resetOnSuccess={['password']}>
    {/* Form content */}
</Form>
```

---

## Accessibility Checklist

- [ ] All inputs have associated `<Label>` elements
- [ ] Labels use `htmlFor` matching input `id`
- [ ] Required fields marked with `required` attribute
- [ ] Error messages associated with inputs via `<InputError>`
- [ ] Form inputs have proper `autoComplete` values
- [ ] Focus management for multi-step forms
- [ ] Proper tab order (use `tabIndex` if needed)
- [ ] Sufficient color contrast for all text
- [ ] Form errors announced to screen readers

---

## Common Mistakes to Avoid

❌ **DON'T:**
- Forget to wrap inputs in `<div className="grid gap-2">`
- Miss `<InputError>` components for validation feedback
- Use incorrect `type` values on buttons
- Hardcode routes instead of using `route()` helper
- Forget `required` attributes on mandatory fields

✅ **DO:**
- Always pair inputs with labels
- Include error components below inputs
- Use render props pattern for form state
- Use Wayfinder's `route()` function for routes
- Apply proper spacing with `gap-` classes
- Test ESLint validation before committing

---

## ESLint Validation

Before committing form code:

```bash
# Check for errors
npx eslint resources/js/pages/auth/

# Fix auto-fixable errors
npx eslint resources/js --fix
```

---

## Related Components

- **InputError:** `resources/js/components/input-error.tsx`
- **PasswordInput:** `resources/js/components/password-input.tsx`
- **TextLink:** `resources/js/components/text-link.tsx`
- **Button:** `resources/js/components/ui/button.tsx`

---

## Resources

- [Inertia React Documentation](https://inertiajs.com/client-side-setup)
- [Form Handling with Inertia](https://inertiajs.com/forms)
- [Laravel Socialite Documentation](https://laravel.com/docs/socialite)
- [React Form Patterns](https://react.dev/learn)
