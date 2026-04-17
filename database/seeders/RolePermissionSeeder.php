<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $accessDashboard = Permission::findOrCreate('access_dashboard');
        $manageUser = Permission::findOrCreate('manage_user');

        // Create roles and assign permissions
        $freeRole = Role::findOrCreate('free_user');
        $vipRole = Role::findOrCreate('vip_user');
        $svipRole = Role::findOrCreate('svip_user');
        $adminRole = Role::findOrCreate('admin');

        $freeRole->givePermissionTo($accessDashboard);
        $vipRole->givePermissionTo($accessDashboard);
        $svipRole->givePermissionTo($accessDashboard);

        $adminRole->givePermissionTo([$accessDashboard, $manageUser]);

        $legacyRole = Role::query()->where('name', 'user')->first();
        if ($legacyRole !== null) {
            User::role('user')->each(function (User $user) use ($freeRole) {
                $user->syncRoles([$freeRole->name]);
            });

            $legacyRole->delete();
        }
    }
}
