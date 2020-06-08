<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('nick')->unique();
            $table->string('email')->unique();
            $table->string('password');
            $table->date('created_at');
            $table->integer('position')->default('0');
            $table->integer('prevPosition')->default('0');
            $table->integer('progress')->default('0');
            $table->string('description')->nullable();
            $table->string('sprite')->nullable();
            $table->string('profilePicture')->default('default.png');
            $table->string('location')->nullable();
            $table->string('role')->default('USER');
            $table->integer('balance')->default(0);
            $table->string('status')->default('Active');
            $table->rememberToken();

        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('users');
    }
}
