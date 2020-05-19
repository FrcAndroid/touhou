<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateItemsListTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('items_list', function (Blueprint $table) {
            //lista fija de todos los items del juego
            $table->id();
            $table->string('name');
            $table->string('buyPrice');
            $table->string('sellPrice');
            $table->string('description');
            $table->string('category');
            $table->string('hexId');
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
        Schema::dropIfExists('items_list');
    }
}
