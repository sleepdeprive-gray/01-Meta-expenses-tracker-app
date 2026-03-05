<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Expense extends Model
{
    protected $table = 'expenses_data';

    protected $primaryKey = 'expenses_ID';

    public $timestamps = false;

    protected $fillable = [
        'description',
        'amount',
        'category',
        'date'
    ];
}
