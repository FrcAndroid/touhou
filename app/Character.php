<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Character extends Model
{
    protected $fillable = [
        'user', 'healthPointsCurrent', 'staminaPointsCurrent','level','exp','position','owner'
    ];

    protected $guarded = [];
}
