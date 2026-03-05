<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Models\Expense;

Route::get('/expenses', function () {
    return Expense::orderByDesc('expenses_ID')->get();
});

Route::get('/expenses/{expenses_id}', function ($expenses_id) {
    return Expense::findOrFail($expenses_id);
})->whereNumber('expenses_id');

Route::post('/expenses', function (Request $request) {
    $data = $request->validate([
        'description' => 'required|string|max:255',
        'category' => 'required|string|in:Food,Transportation,Bills,Others',
        'amount' => 'required|numeric',
        'date' => 'required|date|before_or_equal:today',
    ]);

    $expense = Expense::create($data);

    return response()->json($expense, 201);
});

Route::put('/expenses/{expenses_id}', function (Request $request, $expenses_id) {
    $expense = Expense::findOrFail($expenses_id);

    $data = $request->validate([
        'description' => 'required|string|max:255',
        'category' => 'required|string|in:Food,Transportation,Bills,Others',
        'amount' => 'required|numeric',
        'date' => 'required|date|before_or_equal:today',
    ]);

    $expense->update($data);

    return $expense;
})->whereNumber('expenses_id');

Route::delete('/expenses/{expenses_id}', function ($expenses_id) {
    $expense = Expense::findOrFail($expenses_id);
    $expense->delete();

    return response()->noContent();
})->whereNumber('expenses_id');