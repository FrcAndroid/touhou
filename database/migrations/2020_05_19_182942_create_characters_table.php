<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCharactersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('characters', function (Blueprint $table) {
            $table->id(); // item id
            $table->string('name');
            $table->string('owner')->default('ADMIN');
            $table->integer('position');
            $table->integer('exp');
            $table->integer('level');
            $table->string('skill');
            $table->string('move1');
            $table->string('move2');
            $table->string('move3');
            $table->string('move4');
            $table->string('healthPointsCurrent');
            $table->string('staminaPointsCurrent');
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
        Schema::dropIfExists('characters');
    }
}
