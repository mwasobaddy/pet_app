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
