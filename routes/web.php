<?php

use Illuminate\Support\Facades\Route;

// Serve the React expenses tracker mounted in resources/views/app.blade.php
Route::view('/', 'app')->name('home');
