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