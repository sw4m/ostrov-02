<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\PotholeAnalysisController;
use App\Http\Controllers\RoadController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

// Public API routes for roads
Route::get('api/roads', [RoadController::class, 'index'])
    ->name('roads.index');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::post('api/analyze-pothole', [PotholeAnalysisController::class, 'analyze'])
        ->name('pothole.analyze');
});

require __DIR__.'/settings.php';
