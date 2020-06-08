<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;

class Report extends Model
{
    use Notifiable;

    protected $fillable = [
        'reporter', 'reported', 'reason','status',
    ];

}
