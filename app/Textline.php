<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Textline extends Model
{
    public function conversation()
    {
        return $this->hasOne('App\Conversation', 'conversationId');
    }
    public function line()
    {
        return $this->hasOne('App\Conversation', 'lineId');
    }
}
