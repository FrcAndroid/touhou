<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCharacterListTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('characterlist', function (Blueprint $table) {
            $table->id(); // item id
            $table->string('name');
            $table->integer('maxExp');
            $table->string('skill');
            $table->string('type');
            $table->integer('atkMax');
            $table->integer('defMax');
            $table->integer('speedMax');
            $table->integer('expMax');
            $table->integer('healthPoints');
            $table->integer('staminaPoints');
            $table->string('sprite');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('characterlist');
    }
}
