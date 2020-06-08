<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTextlinesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('textlines', function (Blueprint $table) {
            $table->id();
            $table->integer('lineId');
            $table->integer('character');
            $table->string('internalName');
            $table->string('lineContent');
            $table->integer('eventTrigger');
            $table->string('callAfterTrigger');
            $table->integer('animation');
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
        Schema::dropIfExists('messages');
    }
}
