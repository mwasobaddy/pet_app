<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $accessDiscover = Permission::findOrCreate('access_discover');
        $manageUser = Permission::findOrCreate('manage_user');

        // Create roles and assign permissions
        $freeRole = Role::findOrCreate('free_user');
        $vipRole = Role::findOrCreate('vip_user');
        $svipRole = Role::findOrCreate('svip_user');
        $adminRole = Role::findOrCreate('admin');

        $freeRole->givePermissionTo($accessDiscover);
        $vipRole->givePermissionTo($accessDiscover);
        $svipRole->givePermissionTo($accessDiscover);

        $adminRole->givePermissionTo([$accessDiscover, $manageUser]);

        $legacyRole = Role::query()->where('name', 'user')->first();
        if ($legacyRole !== null) {
            User::role('user')->each(function (User $user) use ($freeRole) {
                $user->syncRoles([$freeRole->name]);
            });

            $legacyRole->delete();
        }
    }
}
