<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\PotholeAnalysisController;
use App\Http\Controllers\PhotoUploadController;
use App\Http\Controllers\RoadController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    
    Route::get('api/roads', [RoadController::class, 'index'])
        ->name('roads.index');
    
    Route::post('api/analyze-pothole', [PotholeAnalysisController::class, 'analyze'])
        ->name('pothole.analyze');
    
    Route::post('api/upload-photo', [PhotoUploadController::class, 'store'])
        ->name('photo.upload');
});

require __DIR__.'/settings.php';
