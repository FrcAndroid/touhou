<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEventsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        //all the events that are triggered in this game
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('eventCode');
            $table->string('eventType');
            $table->integer('eventIdTrigger');
            $table->string('internalText');
            $table->string('mapChange')->nullable();
            $table->string('callableDefault');
            $table->string('conversationTrigger')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('events');
    }
}
