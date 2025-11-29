<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private array $adminPermissions = [
        'repair roads',
        'post announcements',
    ];

    private array $userPermissions = [
        'post photos',
        'like posts',
        'post comments',
    ];

    public function up()
    {
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $user  = Role::firstOrCreate(['name' => 'user']);

        foreach ($this->adminPermissions as $perm) {
            $p = Permission::firstOrCreate(['name' => $perm]);
            $admin->givePermissionTo($p);
        }

        foreach ($this->userPermissions as $perm) {
            $p = Permission::firstOrCreate(['name' => $perm]);
            $user->givePermissionTo($p);
        }
    }

    public function down()
    {
        Schema::disableForeignKeyConstraints();

        Permission::whereIn('name', [
            ...$this->adminPermissions,
            ...$this->userPermissions
        ])->delete();

        Role::whereIn('name', ['admin', 'user'])->delete();

        Schema::enableForeignKeyConstraints();
    }
};
