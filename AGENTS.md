<laravel-boost-guidelines>
=== .ai/inertia-react-forms rules ===

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

=== .ai/react-eslint-best-practices rules ===

# React & JSX ESLint Guidelines

## Overview

This document provides guidance for writing React and JSX code that passes ESLint validation in this project. Follow these patterns to avoid common errors.

## Common ESLint Errors and Prevention

### 1. **Unclosed JSX Tags / Fragment Structure**

**Error Message:** `Parsing error: Expected corresponding closing tag for JSX fragment`

**Problem:** JSX fragments, divs, or elements are not properly closed, leading to unbalanced tag structure.

**Common Causes:**
- Missing opening `<div>` or wrapper element
- Incorrectly nested JSX elements
- Forgetting to close a container before starting a new section

**Solution Pattern:**

```jsx
// ❌ WRONG - Missing opening div wrapper for email section
<div className="divider">
    <span>Or continue with email</span>
</div>
    <Label htmlFor="email">Email</Label>  // ← No wrapper!
    <Input />
</div>  // ← Closing div with no opening match

// ✅ CORRECT - Proper wrapper structure
<div className="divider">
    <span>Or continue with email</span>
</div>

<div className="grid gap-2">
    <Label htmlFor="email">Email</Label>
    <Input />
</div>
```

**Prevention Checklist:**
- [ ] Count opening and closing tags in your JSX
- [ ] Ensure every `<div>`, `<section>`, `<>` has a matching closing tag
- [ ] Use IDE's code folding to verify tag matching
- [ ] When restructuring JSX, verify all wrapper divs have both opening and closing tags

---

### 2. **Form Input Structure**

When building forms in React/Inertia, always wrap related fields in a container div:

**Pattern for Form Fields:**

```jsx
// ✅ CORRECT - Each field group has its own wrapper
<form>
    {/* Email Section */}
    <div className="grid gap-2">
        <Label htmlFor="email">Email address</Label>
        <Input
            id="email"
            type="email"
            name="email"
            required
            placeholder="email@example.com"
        />
        <InputError message={errors.email} />
    </div>

    {/* Password Section */}
    <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <PasswordInput
            id="password"
            name="password"
            required
            placeholder="Password"
        />
        <InputError message={errors.password} />
    </div>

    {/* Submit */}
    <Button type="submit">Submit</Button>
</form>
```

**Key Points:**
- Each input field should be wrapped in `<div className="grid gap-2">`
- Related elements (label, input, error) stay together in the wrapper
- Don't mix different field groups without proper wrapper containers

---

### 3. **Authentication Forms with OAuth Integration**

When adding OAuth buttons (Google, GitHub, etc.) to authentication pages:

**Pattern:**

```jsx
<Form {...formConfig}>
    {({ processing, errors }) => (
        <>
            <Head title="Log in" />
            
            <div className="grid gap-6">
                {/* OAuth Section */}
                <a href="/auth/google">
                    <Button type="button" variant="outline" className="w-full">
                        <svg>...</svg>
                        Sign in with Google
                    </Button>
                </a>

                {/* Divider */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-background px-2">Or continue with email</span>
                    </div>
                </div>

                {/* Email Field Group */}
                <div className="grid gap-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input id="email" type="email" name="email" required />
                    <InputError message={errors.email} />
                </div>

                {/* Password Field Group */}
                <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <PasswordInput id="password" name="password" required />
                    <InputError message={errors.password} />
                </div>

                {/* Checkbox Field */}
                <div className="flex items-center space-x-3">
                    <Checkbox id="remember" name="remember" />
                    <Label htmlFor="remember">Remember me</Label>
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full">
                    Log in
                </Button>
            </div>
        </>
    )}
</Form>
```

---

## Structure Verification Checklist

Before committing React/JSX code, verify:

- [ ] Every opening tag `<` has a matching closing tag `>`
- [ ] Fragment `<>...</>` pairs are balanced
- [ ] All container `<div>` elements have opening and closing tags
- [ ] Related form elements are grouped in wrapper divs
- [ ] No orphaned elements outside their intended containers
- [ ] Run `npx eslint resources/js` before committing
- [ ] If adding OAuth buttons, ensure proper spacing and dividers between sections

---

## IDE Tips for Prevention

### VS Code

1. Use the **ESLint extension** to see errors in real-time
2. Enable **Format on Save** with ESLint fix
3. Use **Bracket Pair Colorizer** to visualize tag matching
4. Hover over opening tags to see their closing pair

### ESLint Commands

```bash

# Check for errors

npx eslint resources/js

# Check specific file

npx eslint resources/js/pages/auth/login.tsx

# Auto-fix fixable errors

npx eslint resources/js --fix
```

---

## Related Files

- **Login Component:** `resources/js/pages/auth/login.tsx`
- **ESLint Config:** `eslint.config.js`
- **TypeScript Config:** `tsconfig.json`

---

## Quick Reference: Common Patterns

### Input Field Pattern

```jsx
<div className="grid gap-2">
    <Label htmlFor="fieldName">Field Label</Label>
    <Input id="fieldName" name="fieldName" type="text" />
    <InputError message={errors.fieldName} />
</div>
```

### Button Group Pattern

```jsx
<div className="grid gap-2">
    <Button type="submit">Primary Action</Button>
    <Button type="button" variant="outline">Secondary Action</Button>
</div>
```

### Section Divider Pattern

```jsx
<div className="relative">
    <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t" />
    </div>
    <div className="relative flex justify-center">
        <span className="bg-background px-2 text-sm">Divider Text</span>
    </div>
</div>
```

---

## Resources

- [React Documentation](https://react.dev)
- [ESLint Documentation](https://eslint.org)
- [JSX Rules](https://react.dev/learn/writing-markup-with-jsx)
- [Inertia React Documentation](https://inertiajs.com/client-side-setup)

=== .ai/review-controllers rules ===

# Controller Refactoring Guide

## Overview

This guide provides a systematic approach to refactoring Laravel controllers following best practices and SOLID principles. Use this as a checklist when reviewing and refactoring each controller in the application.

---

## Core Principles

### Controllers Should ONLY:

1. ✅ Handle HTTP requests and responses
2. ✅ Validate incoming data
3. ✅ Delegate business logic to services
4. ✅ Return views/JSON responses
5. ✅ Handle redirects with appropriate messages

### Controllers Should NEVER:

1. ❌ Contain complex business logic
2. ❌ Directly manipulate multiple models
3. ❌ Handle database transactions
4. ❌ Contain validation logic in closures
5. ❌ Have methods longer than 20-30 lines
6. ❌ Directly send emails/notifications (delegate to services)

---

## Refactoring Checklist

### Step 1: Identify Code Smells

Review each controller method for these red flags:

- [ ] **Fat Methods**: Methods with 30+ lines of code
- [ ] **Database Transactions**: `DB::transaction()` or `DB::beginTransaction()` in controller
- [ ] **Multiple Model Operations**: Creating/updating 3+ models in one method
- [ ] **Complex Validation**: Validation rules with closures or custom logic
- [ ] **Business Logic**: Calculations, data transformations, complex conditionals
- [ ] **Direct Email/Notifications**: Sending emails directly in controller
- [ ] **Query Builder Usage**: Raw queries or complex Eloquent operations
- [ ] **Error Handling**: Try-catch blocks with complex error handling logic

### Step 2: Extract to Appropriate Layers

Based on what you find, extract code to:

#### A. Service Classes (`app/Services/`)

**When to use:**
- Complex business operations involving multiple steps
- Operations that coordinate multiple models
- Database transactions
- Third-party API interactions
- Complex calculations or data transformations

**Example:**
```php
// app/Services/TenantCreationService.php
namespace App\Services;

class TenantCreationService
{
    public function createTenant(array $data): Tenant
    {
        return DB::transaction(function () use ($data) {
            // Complex tenant creation logic
        });
    }
}
```

#### B. Actions (`app/Actions/`)

**When to use:**
- Single, focused operations (Single Responsibility Principle)
- Reusable operations across multiple contexts
- Simple, atomic business operations

**Example:**
```php
// app/Actions/SendWelcomeEmail.php
namespace App\Actions;

class SendWelcomeEmail
{
    public function execute(User $user, string $password): void
    {
        $user->notify(new WelcomeCredentials($password));
    }
}
```

#### C. Custom Request Classes (`app/Http/Requests/`)

**When to use:**
- Complex validation rules
- Validation with closures
- Authorization logic
- Conditional validation

**Example:**
```php
// app/Http/Requests/StoreSubscriptionRequest.php
namespace App\Http\Requests;

class StoreSubscriptionRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'domain' => ['required', 'string', new UniqueTenantDomain()],
            // ... other rules
        ];
    }
    
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            // Complex validation logic
        });
    }
}
```

#### D. Custom Validation Rules (`app/Rules/`)

**When to use:**
- Reusable validation logic
- Complex validation that doesn't fit in a rule string
- Database-dependent validation

**Example:**
```php
// app/Rules/UniqueTenantDomain.php
namespace App\Rules;

class UniqueTenantDomain implements Rule
{
    public function passes($attribute, $value): bool
    {
        // Validation logic
    }
}
```

#### E. Model Methods

**When to use:**
- Data manipulation specific to that model
- Accessors/Mutators
- Query scopes
- Relationships
- Simple helper methods about the model's state

**Example:**
```php
// In Tenant.php model
public function isActive(): bool
{
    return $this->subscription_status === 'active';
}

public function scopeActive($query)
{
    return $query->where('subscription_status', 'active');
}
```

#### F. Traits (`app/Traits/`)

**When to use:**
- Shared functionality across multiple models
- Reusable behavior patterns
- Cross-cutting concerns

**Example:**
```php
// app/Traits/HasSubscription.php
namespace App\Traits;

trait HasSubscription
{
    public function isSubscriptionActive(): bool { }
    public function renewSubscription(): void { }
    public function cancelSubscription(): void { }
}
```

---

## Step-by-Step Refactoring Process

### For Each Controller:

#### 1. **Analyze Current State**

```bash

# Review the controller

- Count lines per method
- Identify dependencies
- List all operations performed
- Note any external service calls
```

#### 2. **Plan the Refactoring**

```markdown
Create a refactoring plan:
- [ ] What needs to move to services?
- [ ] What validation needs extraction?
- [ ] What can move to model methods?
- [ ] What traits could be created?
- [ ] What actions are needed?
```

#### 3. **Create New Files**

```bash

# Generate necessary files

php artisan make:service TenantCreationService
php artisan make:request StoreSubscriptionRequest
php artisan make:rule UniqueTenantDomain
```

#### 4. **Move Code Systematically**

**Priority Order:**
1. Extract validation → Request classes or Rules
2. Extract business logic → Services or Actions
3. Extract model operations → Model methods
4. Extract shared behavior → Traits
5. Clean up controller → Keep only HTTP concerns

#### 5. **Update Controller**

**Before:**
```php
public function store(Request $request)
{
    $validated = $request->validate([...]);
    
    DB::beginTransaction();
    try {
        $tenant = Tenant::create([...]);
        $user = User::create([...]);
        $user->notify(new WelcomeEmail());
        DB::commit();
        return redirect('/success');
    } catch (\Exception $e) {
        DB::rollBack();
        return back()->withErrors(['error' => $e->getMessage()]);
    }
}
```

**After:**
```php
public function store(StoreSubscriptionRequest $request)
{
    try {
        $tenant = $this->tenantService->createTenant(
            $request->validated()
        );
        
        return redirect('/success')
            ->with('success', 'Account created!');
    } catch (\Exception $e) {
        Log::error('Tenant creation failed', [
            'error' => $e->getMessage()
        ]);
        
        return back()
            ->withInput()
            ->withErrors(['error' => 'Failed to create account.']);
    }
}
```

---

## Controller Method Templates

### Index Method

```php
public function index(Request $request)
{
    $items = $this->service->getPaginated(
        $request->query('filter'),
        $request->query('sort')
    );
    
    return view('items.index', compact('items'));
}
```

### Show Method

```php
public function show(Model $model)
{
    $this->authorize('view', $model);
    
    return view('items.show', compact('model'));
}
```

### Create Method

```php
public function create()
{
    $options = $this->service->getFormOptions();
    
    return view('items.create', compact('options'));
}
```

### Store Method

```php
public function store(StoreModelRequest $request)
{
    try {
        $model = $this->service->create($request->validated());
        
        return redirect()
            ->route('items.show', $model)
            ->with('success', 'Created successfully!');
    } catch (\Exception $e) {
        Log::error('Creation failed', ['error' => $e->getMessage()]);
        
        return back()
            ->withInput()
            ->withErrors(['error' => 'Creation failed.']);
    }
}
```

### Update Method

```php
public function update(UpdateModelRequest $request, Model $model)
{
    $this->authorize('update', $model);
    
    try {
        $this->service->update($model, $request->validated());
        
        return redirect()
            ->route('items.show', $model)
            ->with('success', 'Updated successfully!');
    } catch (\Exception $e) {
        Log::error('Update failed', ['error' => $e->getMessage()]);
        
        return back()
            ->withInput()
            ->withErrors(['error' => 'Update failed.']);
    }
}
```

### Destroy Method

```php
public function destroy(Model $model)
{
    $this->authorize('delete', $model);
    
    try {
        $this->service->delete($model);
        
        return redirect()
            ->route('items.index')
            ->with('success', 'Deleted successfully!');
    } catch (\Exception $e) {
        Log::error('Deletion failed', ['error' => $e->getMessage()]);
        
        return back()
            ->withErrors(['error' => 'Deletion failed.']);
    }
}
```

---

## Common Refactoring Patterns

### Pattern 1: Multi-Model Creation

**Before:**
```php
public function store(Request $request)
{
    $user = User::create($request->only('name', 'email'));
    $profile = Profile::create(['user_id' => $user->id, ...]);
    $settings = Settings::create(['user_id' => $user->id, ...]);
    // More operations...
}
```

**After:**
```php
// Controller
public function store(StoreUserRequest $request)
{
    $user = $this->userService->createWithProfile($request->validated());
    return redirect()->route('users.show', $user);
}

// Service
class UserCreationService
{
    public function createWithProfile(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = User::create($data);
            $this->createProfile($user, $data);
            $this->createSettings($user);
            return $user;
        });
    }
}
```

### Pattern 2: Complex Validation

**Before:**
```php
$request->validate([
    'domain' => [
        'required',
        function ($attribute, $value, $fail) {
            if (Domain::where('name', $value)->exists()) {
                $fail('Domain taken.');
            }
        },
    ],
]);
```

**After:**
```php
// Controller
$request->validate([
    'domain' => ['required', new UniqueDomain()],
]);

// Rule
class UniqueDomain implements Rule
{
    public function passes($attribute, $value): bool
    {
        return !Domain::where('name', $value)->exists();
    }
}
```

### Pattern 3: API Interactions

**Before:**
```php
public function process(Request $request)
{
    $response = Http::post('https://api.example.com/endpoint', [...]);
    $data = $response->json();
    // Process data...
}
```

**After:**
```php
// Controller
public function process(Request $request)
{
    $result = $this->apiService->processData($request->validated());
    return response()->json($result);
}

// Service
class ExternalApiService
{
    public function processData(array $data): array
    {
        $response = Http::post($this->endpoint, $data);
        return $this->transformResponse($response->json());
    }
}
```

---

## Testing Strategy

After refactoring, ensure you have tests for:

### Unit Tests

- [ ] Service classes
- [ ] Action classes
- [ ] Custom validation rules
- [ ] Model methods

### Feature Tests

- [ ] Controller endpoints
- [ ] End-to-end workflows
- [ ] Authentication/Authorization

### Example Service Test

```php
class TenantCreationServiceTest extends TestCase
{
    /** @test */
    public function it_creates_tenant_with_all_resources()
    {
        $service = new TenantCreationService();
        
        $tenant = $service->createTenant([
            'company_name' => 'Test Company',
            'domain' => 'test',
            // ...
        ]);
        
        $this->assertDatabaseHas('tenants', [
            'company_name' => 'Test Company'
        ]);
        $this->assertDatabaseHas('users', [
            'tenant_id' => $tenant->id
        ]);
    }
}
```

---

## Quality Metrics

After refactoring each controller, verify:

- [ ] **Method Length**: No method exceeds 25 lines
- [ ] **Cyclomatic Complexity**: Each method has complexity < 10
- [ ] **Dependencies**: Controller has 3 or fewer injected dependencies
- [ ] **Single Responsibility**: Each method does ONE thing
- [ ] **Testability**: Each method can be easily unit tested
- [ ] **Readability**: Code is self-documenting

---

## File Organization

Maintain this structure:

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── Api/
│   │   │   └── V1/
│   │   ├── Auth/
│   │   └── [FeatureControllers].php
│   └── Requests/
│       ├── [Feature]/
│       │   ├── Store[Feature]Request.php
│       │   └── Update[Feature]Request.php
│       └── [OtherRequests].php
├── Services/
│   ├── [Feature]/
│   │   └── [Feature]Service.php
│   └── [OtherServices].php
├── Actions/
│   └── [Feature]/
│       └── [Action].php
├── Rules/
│   └── [ValidationRule].php
├── Traits/
│   └── [BehaviorTrait].php
└── Models/
    └── [Model].php
```

---

## Common Mistakes to Avoid

1. ❌ **Over-engineering**: Don't create services for simple CRUD
2. ❌ **Service Layer Bloat**: Keep services focused on specific domains
3. ❌ **Circular Dependencies**: Services shouldn't depend on controllers
4. ❌ **Inconsistent Patterns**: Use the same pattern across similar features
5. ❌ **Premature Optimization**: Refactor when you see patterns, not before
6. ❌ **Ignoring Type Hints**: Always use return types and parameter types
7. ❌ **Poor Naming**: Use descriptive names that reveal intent

---

## Refactoring Priority

Prioritize controllers in this order:

1. **High Priority**: Controllers with security implications (Auth, Payment, User Management)
2. **Medium Priority**: Core business logic controllers (Orders, Subscriptions, Tenant Management)
3. **Low Priority**: Simple CRUD controllers with minimal logic
4. **Last**: Admin/Dashboard controllers with mostly read operations

---

## Review Checklist

Before marking a controller as "refactored," verify:

- [ ] All business logic moved to appropriate services/actions
- [ ] Complex validation extracted to Request classes or Rules
- [ ] Model-specific logic moved to models
- [ ] Shared behavior extracted to traits
- [ ] Controller methods are thin and readable
- [ ] Proper error handling and logging implemented
- [ ] Type hints added to all methods
- [ ] Tests updated or created
- [ ] Documentation updated
- [ ] Code review completed by peer

---

## Example: Complete Refactoring

### Original Controller (Bad)

```php
class OrderController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'payment_method' => 'required|in:card,paypal',
        ]);

        DB::beginTransaction();
        try {
            $total = 0;
            foreach ($request->items as $item) {
                $product = Product::find($item['product_id']);
                if ($product->stock < $item['quantity']) {
                    throw new \Exception('Insufficient stock');
                }
                $total += $product->price * $item['quantity'];
            }

            $order = Order::create([
                'user_id' => auth()->id(),
                'total' => $total,
                'status' => 'pending',
            ]);

            foreach ($request->items as $item) {
                $product = Product::find($item['product_id']);
                $order->items()->create([
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'price' => $product->price,
                ]);
                $product->decrement('stock', $item['quantity']);
            }

            if ($request->payment_method === 'card') {
                $payment = Stripe::charge([
                    'amount' => $total * 100,
                    'currency' => 'usd',
                    'source' => $request->token,
                ]);
            }

            Mail::to(auth()->user())->send(new OrderConfirmation($order));

            DB::commit();
            return redirect()->route('orders.show', $order);
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
```

### Refactored Version (Good)

**Controller:**
```php
class OrderController extends Controller
{
    public function __construct(
        private OrderService $orderService
    ) {}

    public function store(StoreOrderRequest $request)
    {
        try {
            $order = $this->orderService->createOrder(
                auth()->user(),
                $request->validated()
            );

            return redirect()
                ->route('orders.show', $order)
                ->with('success', 'Order placed successfully!');
        } catch (InsufficientStockException $e) {
            return back()
                ->withInput()
                ->withErrors(['error' => 'Some items are out of stock.']);
        } catch (PaymentFailedException $e) {
            return back()
                ->withInput()
                ->withErrors(['error' => 'Payment failed. Please try again.']);
        } catch (\Exception $e) {
            Log::error('Order creation failed', [
                'user_id' => auth()->id(),
                'error' => $e->getMessage()
            ]);

            return back()
                ->withInput()
                ->withErrors(['error' => 'Failed to create order.']);
        }
    }
}
```

**Request:**
```php
class StoreOrderRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => ['required', 'integer', 'min:1', new SufficientStock()],
            'payment_method' => 'required|in:card,paypal',
            'token' => 'required_if:payment_method,card',
        ];
    }
}
```

**Service:**
```php
class OrderService
{
    public function __construct(
        private PaymentService $paymentService,
        private NotificationService $notificationService
    ) {}

    public function createOrder(User $user, array $data): Order
    {
        return DB::transaction(function () use ($user, $data) {
            $total = $this->calculateTotal($data['items']);

            $order = Order::create([
                'user_id' => $user->id,
                'total' => $total,
                'status' => 'pending',
            ]);

            $this->createOrderItems($order, $data['items']);
            $this->updateProductStock($data['items']);

            $this->paymentService->processPayment(
                $order,
                $data['payment_method'],
                $data['token'] ?? null
            );

            $this->notificationService->sendOrderConfirmation($order);

            return $order;
        });
    }

    protected function calculateTotal(array $items): float
    {
        return collect($items)->sum(function ($item) {
            $product = Product::find($item['product_id']);
            return $product->price * $item['quantity'];
        });
    }

    protected function createOrderItems(Order $order, array $items): void
    {
        foreach ($items as $item) {
            $product = Product::find($item['product_id']);
            $order->items()->create([
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
                'price' => $product->price,
            ]);
        }
    }

    protected function updateProductStock(array $items): void
    {
        foreach ($items as $item) {
            Product::find($item['product_id'])
                ->decrement('stock', $item['quantity']);
        }
    }
}
```

---

## Conclusion

Use this guide as your refactoring blueprint. Work through controllers systematically, applying these patterns consistently. The goal is clean, maintainable code that follows Laravel best practices and SOLID principles.

Remember: **Refactor incrementally, test thoroughly, and commit frequently.**

=== .ai/spartie_roles_permission rules ===

# Spatie Laravel Permission - Comprehensive Guide for Generative AI Agents

## Package Information

- **Package Name**: `spatie/laravel-permission`
- **Version**: 6.x
- **Repository**: https://github.com/spatie/laravel-permission
- **Documentation**: https://spatie.be/docs/laravel-permission/v6

## What is Laravel Permission?

This package allows you to manage user permissions and roles in a database. It provides a flexible way to associate users with permissions and roles, where every role is associated with multiple permissions. All permissions are registered on Laravel's gate, allowing you to use Laravel's default authorization features.

## Core Concepts

### Roles

- Groupings of permissions
- Assigned to users
- Multiple roles per user supported
- Examples: `admin`, `writer`, `editor`, `manager`

### Permissions

- Specific actions users can perform
- Assigned to roles (recommended) or directly to users
- More granular than roles
- Examples: `edit articles`, `delete users`, `view dashboard`

### Best Practice Hierarchy

```
Users → Have → Roles → Have → Permissions
```

**Important**: Always check against **permissions** in your app logic, not roles. This provides maximum flexibility.

## Installation

### 1. Install via Composer

```bash
composer require spatie/laravel-permission
```

### 2. Publish Configuration and Migration

```bash
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
```

This creates:
- `config/permission.php` - Configuration file
- Migration file for creating permission tables

### 3. Important Pre-Migration Considerations

#### For UUID/ULID Support

If using UUIDs, modify migration and config BEFORE running migrations. See Advanced Usage → UUID section.

#### For Teams Feature

If using teams, update `config/permission.php` BEFORE migrating:
```php
'teams' => true,
'team_foreign_key' => 'team_id', // Optional: customize foreign key name
```

#### For MySQL 8+

Check migration files for index key length notes. Edit if you encounter `ERROR: 1071 Specified key was too long`.

#### For Database Cache Store

If using `CACHE_STORE=database`, install Laravel's cache migration first:
```bash
php artisan cache:table
php artisan migrate
```

### 4. Clear Config Cache

```bash
php artisan optimize:clear

# or

php artisan config:clear
```

### 5. Run Migrations

```bash
php artisan migrate
```

### 6. Add Trait to User Model

```php
use Illuminate\Foundation\Auth\User as Authenticatable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasRoles;
    
    // ...
}
```

## Database Tables Created

The package creates these tables:
- `roles` - Stores role definitions
- `permissions` - Stores permission definitions
- `model_has_permissions` - Pivot table for users with direct permissions
- `model_has_roles` - Pivot table for users with roles
- `role_has_permissions` - Pivot table for roles with permissions

## Basic Usage

### Creating Permissions and Roles

#### Create Permission

```php
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

// Create permission
$permission = Permission::create(['name' => 'edit articles']);

// Create role
$role = Role::create(['name' => 'writer']);
```

#### Assign Permission to Role

```php
// Method 1: From role
$role->givePermissionTo($permission);
$role->givePermissionTo('edit articles');

// Method 2: From permission
$permission->assignRole($role);
$permission->assignRole('writer');
```

#### Sync Permissions to Role

```php
// Replace all permissions
$role->syncPermissions(['edit articles', 'delete articles']);
$permission->syncRoles(['writer', 'editor']);
```

#### Remove Permission from Role

```php
$role->revokePermissionTo('edit articles');
$permission->removeRole('writer');
```

### Assigning Roles to Users

#### Assign Role

```php
// Single role
$user->assignRole('writer');

// Multiple roles at once
$user->assignRole('writer', 'admin');
$user->assignRole(['writer', 'admin']);
```

#### Remove Role

```php
$user->removeRole('writer');
```

#### Sync Roles

```php
// Replace all current roles
$user->syncRoles(['writer', 'admin']);
```

### Direct Permissions to Users

**Best Practice**: Assign permissions to roles, then roles to users. Only use direct permissions when necessary.

#### Give Direct Permission

```php
$user->givePermissionTo('edit articles');

// Multiple permissions
$user->givePermissionTo('edit articles', 'delete articles');
$user->givePermissionTo(['edit articles', 'delete articles']);
```

#### Revoke Direct Permission

```php
$user->revokePermissionTo('edit articles');
```

#### Sync Direct Permissions

```php
$user->syncPermissions(['edit articles', 'delete articles']);
```

## Checking Permissions and Roles

### Using Laravel's Native Can Method (Recommended)

```php
// In controllers
if ($user->can('edit articles')) {
    //
}

// In Blade
@can('edit articles')
    <!-- Show edit button -->
@endcan

@cannot('edit articles')
    <!-- Show read-only message -->
@endcannot

@canany(['edit articles', 'delete articles'])
    <!-- User can do at least one -->
@endcanany
```

### Checking Permissions

```php
// Single permission
$user->hasPermissionTo('edit articles');
$user->hasPermissionTo(1); // By ID
$user->hasPermissionTo($permission); // By object

// Any of array
$user->hasAnyPermission(['edit articles', 'publish articles']);

// All of array
$user->hasAllPermissions(['edit articles', 'publish articles']);
```

### Checking Roles

```php
// Single role
$user->hasRole('writer');
$user->hasRole(['editor', 'moderator']); // Has at least one

// Any of roles
$user->hasAnyRole(['writer', 'reader']);
$user->hasAnyRole('writer', 'reader');

// All of roles
$user->hasAllRoles(Role::all());

// Exact roles (only these, no more)
$user->hasExactRoles(['writer', 'editor']);
```

### Checking Direct Permissions

```php
// Has specific direct permission (not via role)
$user->hasDirectPermission('edit articles');

// Has all direct permissions
$user->hasAllDirectPermissions(['edit articles', 'delete articles']);

// Has any direct permission
$user->hasAnyDirectPermission(['create articles', 'delete articles']);
```

### Getting User Permissions and Roles

```php
// Get permission names
$permissionNames = $user->getPermissionNames(); // Collection of strings

// Get permission objects
$permissions = $user->permissions; // Collection

// Get all permissions (direct + via roles)
$user->getAllPermissions();

// Get only direct permissions
$user->getDirectPermissions();

// Get permissions via roles
$user->getPermissionsViaRoles();

// Get role names
$roleNames = $user->getRoleNames(); // Collection of strings

// Get role objects  
$roles = $user->roles; // Collection
```

### Querying Roles and Permissions

```php
// Get all permissions for a role
$role->permissions; // Collection
$role->permissions->pluck('name'); // Just names
count($role->permissions);

// Check if role has permission
$role->hasPermissionTo('edit articles');
```

## Blade Directives

### Permission Directives (Recommended)

```php
@can('edit articles')
    <!-- User can edit articles -->
@endcan

@can('edit articles', 'api') // Specify guard
    <!-- User can edit articles on api guard -->
@endcan

@cannot('edit articles')
    <!-- User cannot edit articles -->
@endcannot

@canany(['edit articles', 'delete articles'])
    <!-- User has at least one permission -->
@endcanany

// Package-specific directive
@haspermission('edit articles')
    <!-- Alternative to @can -->
@endhaspermission
```

### Role Directives (Use Sparingly)

**Best Practice**: Check permissions, not roles!

```php
@role('writer')
    <!-- User has writer role -->
@else
    <!-- User doesn't have writer role -->
@endrole

@hasrole('writer')
    <!-- Same as @role -->
@endhasrole

@hasanyrole(['writer', 'admin'])
    <!-- User has at least one role -->
@endhasanyrole

@hasanyrole('writer|admin') // Pipe-separated
    <!-- User has at least one role -->
@endhasanyrole

@hasallroles(['writer', 'admin'])
    <!-- User has all roles -->
@endhasallroles

@hasexactroles('writer|admin')
    <!-- User has exactly these roles, no more -->
@endhasexactroles

@unlessrole('admin')
    <!-- User doesn't have admin role -->
@endunlessrole
```

## Middleware

### Built-in Laravel Middleware

For single permission checks, use Laravel's built-in `Authorize` middleware:

```php
Route::group(['middleware' => ['can:publish articles']], function () {
    //
});

// Laravel 10.9+ static method
use Illuminate\Auth\Middleware\Authorize;

Route::group(['middleware' => [Authorize::using('publish articles')]], function () {
    //
});
```

### Package Middleware

The package provides three middleware classes:
- `RoleMiddleware` - Check for roles
- `PermissionMiddleware` - Check for permissions
- `RoleOrPermissionMiddleware` - Check for either role or permission

#### Register Middleware Aliases

**Laravel 11+** in `/bootstrap/app.php`:
```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
        'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
        'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
    ]);
})
```

**Laravel 9-10** in `app/Http/Kernel.php`:
```php
protected $middlewareAliases = [
    // ... other middleware
    'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
    'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
    'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
];
```

#### Using Middleware in Routes

```php
// Single role
Route::group(['middleware' => ['role:manager']], function () {
    //
});

// Single permission
Route::group(['middleware' => ['permission:publish articles']], function () {
    //
});

// Role or permission
Route::group(['middleware' => ['role_or_permission:publish articles']], function () {
    //
});

// With guard
Route::group(['middleware' => ['role:manager,api']], function () {
    //
});

// Multiple using OR (pipe)
Route::group(['middleware' => ['role:manager|writer']], function () {
    //
});

Route::group(['middleware' => ['permission:publish articles|edit articles']], function () {
    //
});

// Multiple middleware (AND)
Route::group(['middleware' => ['role:manager', 'permission:publish articles']], function () {
    //
});
```

#### Using Middleware in Controllers

**Laravel 11** (with `HasMiddleware` interface):
```php
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class ArticleController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            'role_or_permission:manager|edit articles',
            new Middleware('role:author', only: ['index']),
            new Middleware(\Spatie\Permission\Middleware\RoleMiddleware::using('manager'), except: ['show']),
            new Middleware(\Spatie\Permission\Middleware\PermissionMiddleware::using('delete records,api'), only: ['destroy']),
        ];
    }
}
```

**Laravel 10 and older**:
```php
public function __construct()
{
    $this->middleware(['role:manager', 'permission:publish articles|edit articles']);
    $this->middleware(['role_or_permission:manager|edit articles,api']);
}
```

#### Static Method Usage

```php
use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;

Route::group(['middleware' => [RoleMiddleware::using('manager')]], function () {
    //
});

Route::group(['middleware' => [PermissionMiddleware::using('publish articles|edit articles')]], function () {
    //
});

Route::group(['middleware' => [RoleOrPermissionMiddleware::using(['manager', 'edit articles'])]], function () {
    //
});
```

## Eloquent Scopes and Queries

### Scopes

```php
// Users with specific role
$users = User::role('writer')->get();

// Users without role
$nonEditors = User::withoutRole('editor')->get();

// Users with permission (direct or via role)
$users = User::permission('edit articles')->get();

// Users without permission
$users = User::withoutPermission('edit articles')->get();
```

### Eloquent Queries

```php
// All users with all their roles
$users = User::with('roles')->get();

// All users with all their direct permissions
$users = User::with('permissions')->get();

// All role names
$allRoles = Role::all()->pluck('name');

// Users without any roles
$usersWithoutRoles = User::doesntHave('roles')->get();

// Roles except certain ones
$roles = Role::whereNotIn('name', ['role A', 'role B'])->get();

// Count users with specific role
$managersCount = User::with('roles')->get()->filter(
    fn ($user) => $user->roles->where('name', 'Manager')->toArray()
)->count();
```

## Multiple Guards

### What are Guards?

Laravel guards define how users are authenticated (web, api, admin, etc.). This package supports multiple guards.

### Setting Guard Name

When using multiple guards, specify `guard_name` when creating permissions/roles:

```php
// Create permission for specific guard
Permission::create(['name' => 'edit articles', 'guard_name' => 'api']);
Permission::create(['name' => 'edit articles', 'guard_name' => 'web']);

// Create role for specific guard
Role::create(['name' => 'writer', 'guard_name' => 'api']);
```

### Default Guard

If you don't specify `guard_name`, it uses the default from `config/auth.php`.

### Assigning with Guards

```php
// Assign role with guard
$user->assignRole('writer'); // Uses default guard
$user->assignRole('api-writer'); // If role has api guard

// Give permission with guard
$user->givePermissionTo('edit articles'); // Uses default guard
```

### Checking with Guards

```php
// Check permission with specific guard
$user->hasPermissionTo('edit articles', 'api');

// In Blade
@can('edit articles', 'api')
    //
@endcan
```

## Teams Permissions

Teams permissions allow scoping permissions to specific teams/organizations.

### Enabling Teams

**BEFORE running migrations**, update `config/permission.php`:
```php
'teams' => true,
'team_foreign_key' => 'team_id', // Optional custom foreign key
```

### Upgrading Existing Installation

If already migrated, run:
```bash
php artisan permission:setup-teams
php artisan migrate
```

### Setting Active Team

Create middleware to set active team:

```php
namespace App\Http\Middleware;

class TeamsPermission
{
    public function handle($request, \Closure $next)
    {
        if (!empty(auth()->user())) {
            // Set from session (set on login)
            setPermissionsTeamId(session('team_id'));
        }
        
        return $next($request);
    }
}
```

**Important**: Set middleware priority BEFORE `SubstituteBindings` in Laravel 11.27+:

```php
// AppServiceProvider
use Illuminate\Foundation\Http\Kernel;
use Illuminate\Routing\Middleware\SubstituteBindings;

public function boot(): void
{
    $kernel = app()->make(Kernel::class);
    $kernel->addToMiddlewarePriorityBefore(
        \App\Http\Middleware\TeamsPermission::class,
        SubstituteBindings::class
    );
}
```

### Creating Roles with Teams

```php
// Global role (null team_id, can be assigned to any team)
Role::create(['name' => 'writer', 'team_id' => null]);

// Team-specific role (can have same name on different teams)
Role::create(['name' => 'reader', 'team_id' => 1]);
Role::create(['name' => 'reader', 'team_id' => 2]);

// Role takes current team_id if not specified
Role::create(['name' => 'reviewer']);
```

### Switching Teams

When switching teams, reset cached relations:

```php
// Set new team
setPermissionsTeamId($new_team_id);

// Reset cached relations
$user->unsetRelation('roles')->unsetRelation('permissions');

// Now check permissions/roles for new team
$user->hasRole('manager');
$user->can('edit articles');
```

### Super-Admin on Teams

When creating new team, assign global role to super-admin:

```php
// In Team model
protected static function boot()
{
    parent::boot();
    
    self::created(function ($model) {
        $session_team_id = getPermissionsTeamId();
        setPermissionsTeamId($model->id);
        
        User::find($superAdminId)->assignRole('Super Admin');
        
        setPermissionsTeamId($session_team_id);
    });
}
```

## Wildcard Permissions

Wildcard permissions allow pattern matching for permissions.

### Enabling Wildcards

In `config/permission.php`:
```php
'enable_wildcard_permission' => true,
```

### Using Wildcards

```php
// Create wildcard permission
Permission::create(['name' => 'articles.*']);
Permission::create(['name' => 'articles.*.id']); // Can use multiple wildcards

// Give to user
$user->givePermissionTo('articles.*');

// Check permission
$user->can('articles.create'); // true
$user->can('articles.edit'); // true
$user->can('articles.delete'); // true
```

### Wildcard Patterns

```php
// Match any
'articles.*' matches: 'articles.create', 'articles.edit', 'articles.delete'

// Match with prefix
'admin.*' matches: 'admin.users', 'admin.settings', 'admin.reports'

// Multiple wildcards
'*.articles.*' matches: 'blog.articles.edit', 'news.articles.delete'
```

## Super-Admin

### Defining Super-Admin

Use Laravel's `Gate::before()` to create super-admin that bypasses all permission checks:

```php
// In AuthServiceProvider
use Illuminate\Support\Facades\Gate;

public function boot()
{
    // Implicitly grant "Super Admin" role all permissions
    Gate::before(function ($user, $ability) {
        return $user->hasRole('Super Admin') ? true : null;
    });
}
```

**Important**: Return `null` for non-super-admins to allow normal permission checks.

### Alternative: Check Specific Attribute

```php
Gate::before(function ($user, $ability) {
    return $user->is_super_admin ? true : null;
});
```

## Artisan Commands

### Create Permission

```bash
php artisan permission:create-permission "edit articles"
php artisan permission:create-permission "edit articles" api  # with guard

```

### Create Role

```bash
php artisan permission:create-role writer
php artisan permission:create-role writer api  # with guard

```

### Assign Permission to Role

```bash
php artisan permission:assign-permission-to-role "edit articles" writer
```

### Assign Role to User

```bash
php artisan permission:assign-role-to-user writer 1  # user ID

php artisan permission:assign-role-to-user writer admin@example.com  # email

```

### Cache Management

```bash

# Reset cache

php artisan permission:cache-reset

# Show permissions

php artisan permission:show

# Setup teams (for existing installations)

php artisan permission:setup-teams
```

## Cache Management

### Automatic Cache Reset

Cache automatically resets when using built-in methods:

```php
// These automatically reset cache
$role->givePermissionTo('edit articles');
$role->revokePermissionTo('edit articles');
$permission->assignRole('writer');
$permission->removeRole('writer');
```

**Note**: User role/permission assignments are kept in-memory (v4.4.0+), so no cache reset needed:

```php
// These do NOT trigger cache reset (in-memory)
$user->assignRole('writer');
$user->removeRole('writer');
$user->syncRoles([...]);
$user->givePermissionTo('edit articles');
```

### Manual Cache Reset

```php
// In code
app()->make(\Spatie\Permission\PermissionRegistrar::class)->forgetCachedPermissions();

// Via artisan
php artisan permission:cache-reset
```

### Cache Configuration

In `config/permission.php`:

```php
'cache' => [
    // Expiration time (default: 24 hours)
    'expiration_time' => \DateInterval::createFromDateString('24 hours'),
    
    // Cache key
    'key' => 'spatie.permission.cache',
    
    // Cache store (use any from config/cache.php)
    'store' => 'default',
],
```

### Custom Cache Store

Set custom cache store:
```php
'cache' => [
    'store' => 'redis', // or 'memcached', 'database', etc.
],
```

### Disabling Cache

Set cache store to `array` to disable caching:
```php
'cache' => [
    'store' => 'array',
],
```

Or in `.env` (development only):
```
CACHE_DRIVER=array
```

### Multitenancy Cache Considerations

For multitenancy, set unique cache prefix in `/config/cache.php`:
```php
'prefix' => env('CACHE_PREFIX', 'tenant_'.tenant('id')),
```

When switching tenants/cache config:
```php
app()->make(\Spatie\Permission\PermissionRegistrar::class)->initializeCache();
```

## Database Seeding

### Simple Seeding

```php
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use App\Models\User;

// Create permissions
$permissions = [
    'view articles',
    'create articles',
    'edit articles',
    'delete articles',
];

foreach ($permissions as $permission) {
    Permission::create(['name' => $permission]);
}

// Create roles and assign permissions
$role = Role::create(['name' => 'writer']);
$role->givePermissionTo(['create articles', 'edit articles']);

$role = Role::create(['name' => 'admin']);
$role->givePermissionTo(Permission::all());

// Assign roles to users
$user = User::find(1);
$user->assignRole('admin');
```

### Advanced Seeding with Guards

```php
// Reset cache
app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

// Create permissions for web guard
Permission::create(['name' => 'edit articles', 'guard_name' => 'web']);
Permission::create(['name' => 'delete articles', 'guard_name' => 'web']);

// Create permissions for api guard
Permission::create(['name' => 'edit articles', 'guard_name' => 'api']);
Permission::create(['name' => 'delete articles', 'guard_name' => 'api']);

// Create roles and assign permissions
$role = Role::create(['name' => 'writer', 'guard_name' => 'web']);
$role->givePermissionTo(['edit articles', 'delete articles']);

$role = Role::create(['name' => 'admin', 'guard_name' => 'api']);
$role->givePermissionTo(['edit articles', 'delete articles']);
```

## Testing

### Setup for Tests

```php
use Spatie\Permission\PermissionServiceProvider;

protected function getPackageProviders($app)
{
    return [
        PermissionServiceProvider::class,
    ];
}

protected function setUp(): void
{
    parent::setUp();
    
    // Run migrations
    $this->artisan('migrate');
    
    // Seed permissions
    Permission::create(['name' => 'edit articles']);
    Role::create(['name' => 'admin']);
}
```

### Testing Permissions

```php
/** @test */
public function user_can_have_permission()
{
    $user = User::factory()->create();
    $user->givePermissionTo('edit articles');
    
    $this->assertTrue($user->can('edit articles'));
    $this->assertTrue($user->hasPermissionTo('edit articles'));
}

/** @test */
public function user_can_have_role()
{
    $user = User::factory()->create();
    $user->assignRole('admin');
    
    $this->assertTrue($user->hasRole('admin'));
}

/** @test */
public function middleware_blocks_unauthorized_access()
{
    $user = User::factory()->create();
    
    $response = $this->actingAs($user)->get('/admin');
    
    $response->assertStatus(403);
    
    $user->givePermissionTo('access admin');
    
    $response = $this->actingAs($user)->get('/admin');
    
    $response->assertStatus(200);
}
```

## Events

The package fires events when permissions/roles change:

```php
// Role events
Spatie\Permission\Events\RoleCreated
Spatie\Permission\Events\RoleUpdated
Spatie\Permission\Events\RoleDeleted

// Permission events  
Spatie\Permission\Events\PermissionCreated
Spatie\Permission\Events\PermissionUpdated
Spatie\Permission\Events\PermissionDeleted
```

### Listening to Events

```php
// In EventServiceProvider
protected $listen = [
    \Spatie\Permission\Events\RoleCreated::class => [
        \App\Listeners\RoleCreatedListener::class,
    ],
];
```

### Event Example

```php
namespace App\Listeners;

use Spatie\Permission\Events\RoleCreated;

class RoleCreatedListener
{
    public function handle(RoleCreated $event)
    {
        $role = $event->role;
        
        // Do something with the role
        logger("Role created: {$role->name}");
    }
}
```

## Extending Models

### Custom Role Model

```php
namespace App\Models;

use Spatie\Permission\Models\Role as SpatieRole;

class Role extends SpatieRole
{
    // Add custom methods or properties
    public function users()
    {
        return $this->belongsToMany(User::class, 'model_has_roles', 'role_id', 'model_id')
            ->where('model_type', User::class);
    }
}
```

Update config:
```php
// config/permission.php
'models' => [
    'role' => App\Models\Role::class,
],
```

### Custom Permission Model

```php
namespace App\Models;

use Spatie\Permission\Models\Permission as SpatiePermission;

class Permission extends SpatiePermission
{
    // Add custom methods
    public function category()
    {
        return $this->belongsTo(PermissionCategory::class);
    }
}
```

Update config:
```php
'models' => [
    'permission' => App\Models\Permission::class,
],
```

## UUID/ULID Support

### Setup for UUID

1. Update migration BEFORE running it:
```php
// In migration file
Schema::create('permissions', function (Blueprint $table) {
    $table->uuid('id')->primary(); // Change from bigIncrements
    // ...
});
```

2. Update models to use UUID:
```php
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Permission extends Model
{
    use HasUuids;
    
    public $incrementing = false;
    protected $keyType = 'string';
}
```

3. Update config:
```php
'column_names' => [
    'model_morph_key' => 'model_uuid', // if using UUIDs on User model
],
```

## Best Practices

### 1. Always Check Permissions, Not Roles

**Good**:
```php
@can('edit articles')
    <!-- Edit button -->
@endcan

if ($user->can('edit articles')) {
    // Allow editing
}
```

**Bad**:
```php
@if($user->hasRole('editor'))
    <!-- Edit button -->
@endif
```

**Why?** Checking permissions is more flexible and allows role changes without code updates.

### 2. Granular Permissions

**Good**:
```php
Permission::create(['name' => 'view articles']);
Permission::create(['name' => 'create articles']);
Permission::create(['name' => 'edit articles']);
Permission::create(['name' => 'delete articles']);
```

**Bad**:
```php
Permission::create(['name' => 'manage articles']);
```

**Why?** Granular permissions provide fine-grained control.

### 3. Use Roles to Group Permissions

```php
// Create permissions
$permissions = [
    'view articles',
    'create articles',
    'edit articles',
    'delete articles',
];

// Create role and assign relevant permissions
$writer = Role::create(['name' => 'writer']);
$writer->givePermissionTo(['view articles', 'create articles', 'edit articles']);

$admin = Role::create(['name' => 'admin']);
$admin->givePermissionTo($permissions); // All permissions
```

### 4. Avoid Direct Permissions

Assign permissions to roles, then roles to users:

```php
// Good
$role = Role::create(['name' => 'editor']);
$role->givePermissionTo(['edit articles', 'publish articles']);
$user->assignRole('editor');

// Avoid (unless necessary)
$user->givePermissionTo('edit articles');
```

### 5. Use Gates and Policies

Combine with Laravel's authorization:

```php
// In AuthServiceProvider
Gate::define('update-article', function ($user, $article) {
    return $user->can('edit articles') && $user->id === $article->user_id;
});

// In Policy
public function update(User $user, Article $article)
{
    return $user->can('edit articles') && $user->owns($article);
}
```

### 6. Permission Naming Convention

Use clear, consistent naming:

```php
// Resource-based
'view articles'
'create articles'
'edit articles'
'delete articles'

// Action-based
'publish article'
'approve comment'
'manage users'

// Feature-based
'access admin panel'
'use api'
'export data'
```

## Performance Tips

### 1. Eager Load Relationships

```php
// Bad (N+1 problem)
$users = User::all();
foreach ($users as $user) {
    $user->roles; // N+1 queries
}

// Good
$users = User::with('roles', 'permissions')->get();
```

### 2. Cache Permission Checks

```php
// Cache expensive checks
$canEdit = Cache::remember("user_{$user->id}_can_edit_articles", 3600, function () use ($user) {
    return $user->can('edit articles');
});
```

### 3. Use Scopes Efficiently

```php
// Efficient
$writers = User::role('writer')->with('permissions')->get();

// Less efficient
$writers = User::all()->filter(fn($u) => $u->hasRole('writer'));
```

### 4. Limit Wildcard Usage

Wildcards are powerful but can impact performance. Use specific permissions when possible.

## Common Patterns

### Admin Panel Access

```php
// Create admin permission
Permission::create(['name' => 'access admin']);

// Middleware on admin routes
Route::prefix('admin')->middleware(['auth', 'permission:access admin'])->group(function () {
    // Admin routes
});
```

### Resource-Based Permissions

```php
// Create CRUD permissions for resource
$resources = ['articles', 'users', 'categories'];
$actions = ['view', 'create', 'edit', 'delete'];

foreach ($resources as $resource) {
    foreach ($actions as $action) {
        Permission::create(['name' => "$action $resource"]);
    }
}
```

### Dynamic Permission Checking

```php
public function can($action, $resource)
{
    return auth()->user()->can("$action $resource");
}

// Usage
if ($this->can('edit', 'articles')) {
    //
}
```

### Team-Scoped Permissions

```php
// Set team context
setPermissionsTeamId($request->user()->current_team_id);

// Check permission in team context
if ($user->can('manage projects')) {
    // User can manage projects in current team
}
```

## Troubleshooting

### Issue: "Call to undefined method can()"

**Solution**: Ensure `HasRoles` trait is added to User model:
```php
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasRoles;
}
```

### Issue: Permissions not updating

**Solution**: Reset cache:
```bash
php artisan permission:cache-reset
```

Or in code:
```php
app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();
```

### Issue: "Table not found" errors

**Solution**: Run migrations:
```bash
php artisan migrate
```

### Issue: 403 when expected 404

**Solution**: Check middleware priority. Permission middleware should run before `SubstituteBindings`:
```php
// Laravel 11.27+
$kernel->addToMiddlewarePriorityBefore(
    \Spatie\Permission\Middleware\PermissionMiddleware::class,
    \Illuminate\Routing\Middleware\SubstituteBindings::class
);
```

### Issue: Role/Permission not working with multiple guards

**Solution**: Specify guard name:
```php
Permission::create(['name' => 'edit articles', 'guard_name' => 'api']);
$user->hasPermissionTo('edit articles', 'api');
```

### Issue: Cached permissions showing for wrong team

**Solution**: Reset cached relations when switching teams:
```php
setPermissionsTeamId($newTeamId);
$user->unsetRelation('roles')->unsetRelation('permissions');
```

### Issue: Database cache store errors

**Solution**: Install Laravel cache table:
```bash
php artisan cache:table
php artisan migrate
```

## Security Considerations

### 1. Never Trust User Input

```php
// Bad
$permission = request('permission');
$user->givePermissionTo($permission);

// Good
$allowedPermissions = ['view articles', 'edit articles'];
$permission = request('permission');
if (in_array($permission, $allowedPermissions)) {
    $user->givePermissionTo($permission);
}
```

### 2. Validate Role/Permission Assignment

```php
// Validate before assignment
$validator = Validator::make($request->all(), [
    'role' => 'required|exists:roles,name',
]);

if ($validator->fails()) {
    return back()->withErrors($validator);
}

$user->assignRole($request->role);
```

### 3. Use Policies for Model-Specific Authorization

```php
// ArticlePolicy
public function update(User $user, Article $article)
{
    return $user->can('edit articles') && $user->id === $article->user_id;
}
```

### 4. Log Permission Changes

```php
// In EventServiceProvider
use Spatie\Permission\Events\RoleCreated;

Event::listen(RoleCreated::class, function ($event) {
    Log::info('Role created', ['role' => $event->role->name]);
});
```

## Quick Reference

### Most Common Methods

```php
// User methods
$user->assignRole('writer');
$user->removeRole('writer');
$user->syncRoles(['writer', 'admin']);
$user->hasRole('writer');
$user->can('edit articles');
$user->givePermissionTo('edit articles');
$user->revokePermissionTo('edit articles');

// Role methods
$role->givePermissionTo('edit articles');
$role->revokePermissionTo('edit articles');
$role->syncPermissions(['edit articles', 'delete articles']);
$role->hasPermissionTo('edit articles');

// Permission methods
$permission->assignRole('writer');
$permission->removeRole('writer');
$permission->syncRoles(['writer', 'editor']);

// Checking
$user->hasPermissionTo('edit articles');
$user->hasAnyPermission(['edit articles', 'delete articles']);
$user->hasAllPermissions(['edit articles', 'delete articles']);
```

### Configuration Locations

- **Config file**: `config/permission.php`
- **Cache config**: `config/cache.php`
- **Guard config**: `config/auth.php`

### Useful Artisan Commands

```bash
php artisan permission:create-permission "permission name"
php artisan permission:create-role "role name"
php artisan permission:cache-reset
php artisan permission:show
php artisan permission:setup-teams
```

---

## Summary

The Spatie Laravel Permission package provides a robust, flexible system for managing roles and permissions in Laravel applications. Key takeaways:

1. **Always check permissions, not roles** in application logic
2. **Permissions are assigned to roles**, roles are assigned to users
3. **Use granular permissions** for maximum flexibility
4. **Leverage Laravel's native `can()` and `@can`** directives
5. **Cache is automatically managed** when using built-in methods
6. **Teams feature** enables multi-tenant permission scoping
7. **Multiple guards** are fully supported
8. **Extends seamlessly** with custom models and logic

For the latest updates and detailed examples, always refer to the official documentation at https://spatie.be/docs/laravel-permission/v6.

=== foundation rules ===

# Laravel Boost Guidelines

The Laravel Boost guidelines are specifically curated by Laravel maintainers for this application. These guidelines should be followed closely to ensure the best experience when building Laravel applications.

## Foundational Context

This application is a Laravel application and its main Laravel ecosystems package & versions are below. You are an expert with them all. Ensure you abide by these specific packages & versions.

- php - 8.4
- inertiajs/inertia-laravel (INERTIA_LARAVEL) - v3
- laravel/fortify (FORTIFY) - v1
- laravel/framework (LARAVEL) - v13
- laravel/prompts (PROMPTS) - v0
- laravel/socialite (SOCIALITE) - v5
- laravel/wayfinder (WAYFINDER) - v0
- laravel/boost (BOOST) - v2
- laravel/mcp (MCP) - v0
- laravel/pail (PAIL) - v1
- laravel/pint (PINT) - v1
- laravel/sail (SAIL) - v1
- pestphp/pest (PEST) - v4
- phpunit/phpunit (PHPUNIT) - v12
- @inertiajs/react (INERTIA_REACT) - v3
- react (REACT) - v19
- tailwindcss (TAILWINDCSS) - v4
- @laravel/vite-plugin-wayfinder (WAYFINDER_VITE) - v0
- eslint (ESLINT) - v9
- prettier (PRETTIER) - v3

## Skills Activation

This project has domain-specific skills available. You MUST activate the relevant skill whenever you work in that domain—don't wait until you're stuck.

- `fortify-development` — ACTIVATE when the user works on authentication in Laravel. This includes login, registration, password reset, email verification, two-factor authentication (2FA/TOTP/QR codes/recovery codes), profile updates, password confirmation, or any auth-related routes and controllers. Activate when the user mentions Fortify, auth, authentication, login, register, signup, forgot password, verify email, 2FA, or references app/Actions/Fortify/, CreateNewUser, UpdateUserProfileInformation, FortifyServiceProvider, config/fortify.php, or auth guards. Fortify is the frontend-agnostic authentication backend for Laravel that registers all auth routes and controllers. Also activate when building SPA or headless authentication, customizing login redirects, overriding response contracts like LoginResponse, or configuring login throttling. Do NOT activate for Laravel Passport (OAuth2 API tokens), Socialite (OAuth social login), or non-auth Laravel features.
- `laravel-best-practices` — Apply this skill whenever writing, reviewing, or refactoring Laravel PHP code. This includes creating or modifying controllers, models, migrations, form requests, policies, jobs, scheduled commands, service classes, and Eloquent queries. Triggers for N+1 and query performance issues, caching strategies, authorization and security patterns, validation, error handling, queue and job configuration, route definitions, and architectural decisions. Also use for Laravel code reviews and refactoring existing Laravel code to follow best practices. Covers any task involving Laravel backend PHP code patterns.
- `socialite-development` — Manages OAuth social authentication with Laravel Socialite. Activate when adding social login providers; configuring OAuth redirect/callback flows; retrieving authenticated user details; customizing scopes or parameters; setting up community providers; testing with Socialite fakes; or when the user mentions social login, OAuth, Socialite, or third-party authentication.
- `wayfinder-development` — Use this skill for Laravel Wayfinder which auto-generates typed functions for Laravel controllers and routes. ALWAYS use this skill when frontend code needs to call backend routes or controller actions. Trigger when: connecting any React/Vue/Svelte/Inertia frontend to Laravel controllers, routes, building end-to-end features with both frontend and backend, wiring up forms or links to backend endpoints, fixing route-related TypeScript errors, importing from @/actions or @/routes, or running wayfinder:generate. Use Wayfinder route functions instead of hardcoded URLs. Covers: wayfinder() vite plugin, .url()/.get()/.post()/.form(), query params, route model binding, tree-shaking. Do not use for backend-only task
- `pest-testing` — Use this skill for Pest PHP testing in Laravel projects only. Trigger whenever any test is being written, edited, fixed, or refactored — including fixing tests that broke after a code change, adding assertions, converting PHPUnit to Pest, adding datasets, and TDD workflows. Always activate when the user asks how to write something in Pest, mentions test files or directories (tests/Feature, tests/Unit, tests/Browser), or needs browser testing, smoke testing multiple pages for JS errors, or architecture tests. Covers: test()/it()/expect() syntax, datasets, mocking, browser testing (visit/click/fill), smoke testing, arch(), Livewire component tests, RefreshDatabase, and all Pest 4 features. Do not use for factories, seeders, migrations, controllers, models, or non-test PHP code.
- `inertia-react-development` — Develops Inertia.js v3 React client-side applications. Activates when creating React pages, forms, or navigation; using <Link>, <Form>, useForm, useHttp, setLayoutProps, or router; working with deferred props, prefetching, optimistic updates, instant visits, or polling; or when user mentions React with Inertia, React pages, React forms, or React navigation.
- `tailwindcss-development` — Always invoke when the user's message includes 'tailwind' in any form. Also invoke for: building responsive grid layouts (multi-column card grids, product grids), flex/grid page structures (dashboards with sidebars, fixed topbars, mobile-toggle navs), styling UI components (cards, tables, navbars, pricing sections, forms, inputs, badges), adding dark mode variants, fixing spacing or typography, and Tailwind v3/v4 work. The core use case: writing or fixing Tailwind utility classes in HTML templates (Blade, JSX, Vue). Skip for backend PHP logic, database queries, API routes, JavaScript with no HTML/CSS component, CSS file audits, build tool configuration, and vanilla CSS.
- `laravel-permission-development` — Build and work with Spatie Laravel Permission features, including roles, permissions, middleware, policies, teams, and Blade directives.

## Conventions

- You must follow all existing code conventions used in this application. When creating or editing a file, check sibling files for the correct structure, approach, and naming.
- Use descriptive names for variables and methods. For example, `isRegisteredForDiscounts`, not `discount()`.
- Check for existing components to reuse before writing a new one.

## Verification Scripts

- Do not create verification scripts or tinker when tests cover that functionality and prove they work. Unit and feature tests are more important.

## Application Structure & Architecture

- Stick to existing directory structure; don't create new base folders without approval.
- Do not change the application's dependencies without approval.

## Frontend Bundling

- If the user doesn't see a frontend change reflected in the UI, it could mean they need to run `npm run build`, `npm run dev`, or `composer run dev`. Ask them.

## Documentation Files

- You must only create documentation files if explicitly requested by the user.

## Replies

- Be concise in your explanations - focus on what's important rather than explaining obvious details.

=== boost rules ===

# Laravel Boost

## Tools

- Laravel Boost is an MCP server with tools designed specifically for this application. Prefer Boost tools over manual alternatives like shell commands or file reads.
- Use `database-query` to run read-only queries against the database instead of writing raw SQL in tinker.
- Use `database-schema` to inspect table structure before writing migrations or models.
- Use `get-absolute-url` to resolve the correct scheme, domain, and port for project URLs. Always use this before sharing a URL with the user.
- Use `browser-logs` to read browser logs, errors, and exceptions. Only recent logs are useful, ignore old entries.

## Searching Documentation (IMPORTANT)

- Always use `search-docs` before making code changes. Do not skip this step. It returns version-specific docs based on installed packages automatically.
- Pass a `packages` array to scope results when you know which packages are relevant.
- Use multiple broad, topic-based queries: `['rate limiting', 'routing rate limiting', 'routing']`. Expect the most relevant results first.
- Do not add package names to queries because package info is already shared. Use `test resource table`, not `filament 4 test resource table`.

### Search Syntax

1. Use words for auto-stemmed AND logic: `rate limit` matches both "rate" AND "limit".
2. Use `"quoted phrases"` for exact position matching: `"infinite scroll"` requires adjacent words in order.
3. Combine words and phrases for mixed queries: `middleware "rate limit"`.
4. Use multiple queries for OR logic: `queries=["authentication", "middleware"]`.

## Artisan

- Run Artisan commands directly via the command line (e.g., `php artisan route:list`). Use `php artisan list` to discover available commands and `php artisan [command] --help` to check parameters.
- Inspect routes with `php artisan route:list`. Filter with: `--method=GET`, `--name=users`, `--path=api`, `--except-vendor`, `--only-vendor`.
- Read configuration values using dot notation: `php artisan config:show app.name`, `php artisan config:show database.default`. Or read config files directly from the `config/` directory.
- To check environment variables, read the `.env` file directly.

## Tinker

- Execute PHP in app context for debugging and testing code. Do not create models without user approval, prefer tests with factories instead. Prefer existing Artisan commands over custom tinker code.
- Always use single quotes to prevent shell expansion: `php artisan tinker --execute 'Your::code();'`
  - Double quotes for PHP strings inside: `php artisan tinker --execute 'User::where("active", true)->count();'`

=== php rules ===

# PHP

- Always use curly braces for control structures, even for single-line bodies.
- Use PHP 8 constructor property promotion: `public function __construct(public GitHub $github) { }`. Do not leave empty zero-parameter `__construct()` methods unless the constructor is private.
- Use explicit return type declarations and type hints for all method parameters: `function isAccessible(User $user, ?string $path = null): bool`
- Use TitleCase for Enum keys: `FavoritePerson`, `BestLake`, `Monthly`.
- Prefer PHPDoc blocks over inline comments. Only add inline comments for exceptionally complex logic.
- Use array shape type definitions in PHPDoc blocks.

=== deployments rules ===

# Deployment

- Laravel can be deployed using [Laravel Cloud](https://cloud.laravel.com/), which is the fastest way to deploy and scale production Laravel applications.

=== tests rules ===

# Test Enforcement

- Every change must be programmatically tested. Write a new test or update an existing test, then run the affected tests to make sure they pass.
- Run the minimum number of tests needed to ensure code quality and speed. Use `php artisan test --compact` with a specific filename or filter.

=== inertia-laravel/core rules ===

# Inertia

- Inertia creates fully client-side rendered SPAs without modern SPA complexity, leveraging existing server-side patterns.
- Components live in `resources/js/pages` (unless specified in `vite.config.js`). Use `Inertia::render()` for server-side routing instead of Blade views.
- ALWAYS use `search-docs` tool for version-specific Inertia documentation and updated code examples.
- IMPORTANT: Activate `inertia-react-development` when working with Inertia client-side patterns.

# Inertia v3

- Use all Inertia features from v1, v2, and v3. Check the documentation before making changes to ensure the correct approach.
- New v3 features: standalone HTTP requests (`useHttp` hook), optimistic updates with automatic rollback, layout props (`useLayoutProps` hook), instant visits, simplified SSR via `@inertiajs/vite` plugin, custom exception handling for error pages.
- Carried over from v2: deferred props, infinite scroll, merging props, polling, prefetching, once props, flash data.
- When using deferred props, add an empty state with a pulsing or animated skeleton.
- Axios has been removed. Use the built-in XHR client with interceptors, or install Axios separately if needed.
- `Inertia::lazy()` / `LazyProp` has been removed. Use `Inertia::optional()` instead.
- Prop types (`Inertia::optional()`, `Inertia::defer()`, `Inertia::merge()`) work inside nested arrays with dot-notation paths.
- SSR works automatically in Vite dev mode with `@inertiajs/vite` - no separate Node.js server needed during development.
- Event renames: `invalid` is now `httpException`, `exception` is now `networkError`.
- `router.cancel()` replaced by `router.cancelAll()`.
- The `future` configuration namespace has been removed - all v2 future options are now always enabled.

=== laravel/core rules ===

# Do Things the Laravel Way

- Use `php artisan make:` commands to create new files (i.e. migrations, controllers, models, etc.). You can list available Artisan commands using `php artisan list` and check their parameters with `php artisan [command] --help`.
- If you're creating a generic PHP class, use `php artisan make:class`.
- Pass `--no-interaction` to all Artisan commands to ensure they work without user input. You should also pass the correct `--options` to ensure correct behavior.

### Model Creation

- When creating new models, create useful factories and seeders for them too. Ask the user if they need any other things, using `php artisan make:model --help` to check the available options.

## APIs & Eloquent Resources

- For APIs, default to using Eloquent API Resources and API versioning unless existing API routes do not, then you should follow existing application convention.

## URL Generation

- When generating links to other pages, prefer named routes and the `route()` function.

## Testing

- When creating models for tests, use the factories for the models. Check if the factory has custom states that can be used before manually setting up the model.
- Faker: Use methods such as `$this->faker->word()` or `fake()->randomDigit()`. Follow existing conventions whether to use `$this->faker` or `fake()`.
- When creating tests, make use of `php artisan make:test [options] {name}` to create a feature test, and pass `--unit` to create a unit test. Most tests should be feature tests.

## Vite Error

- If you receive an "Illuminate\Foundation\ViteException: Unable to locate file in Vite manifest" error, you can run `npm run build` or ask the user to run `npm run dev` or `composer run dev`.

=== wayfinder/core rules ===

# Laravel Wayfinder

Use Wayfinder to generate TypeScript functions for Laravel routes. Import from `@/actions/` (controllers) or `@/routes/` (named routes).

=== pint/core rules ===

# Laravel Pint Code Formatter

- If you have modified any PHP files, you must run `vendor/bin/pint --dirty --format agent` before finalizing changes to ensure your code matches the project's expected style.
- Do not run `vendor/bin/pint --test --format agent`, simply run `vendor/bin/pint --format agent` to fix any formatting issues.

=== pest/core rules ===

## Pest

- This project uses Pest for testing. Create tests: `php artisan make:test --pest {name}`.
- Run tests: `php artisan test --compact` or filter: `php artisan test --compact --filter=testName`.
- Do NOT delete tests without approval.

=== inertia-react/core rules ===

# Inertia + React

- IMPORTANT: Activate `inertia-react-development` when working with Inertia React client-side patterns.

</laravel-boost-guidelines>
