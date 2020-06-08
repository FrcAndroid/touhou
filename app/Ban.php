<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Ban extends Model
{
    use Notifiable;

    protected $fillable = [
        'user', 'bannedBy', 'reason','status',
    ];
}
