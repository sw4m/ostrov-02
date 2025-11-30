<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\PotholeAnalysisController;
use App\Http\Controllers\PhotoUploadController;
use App\Http\Controllers\RoadController;

// Public API routes for roads
Route::get('api/roads', [RoadController::class, 'index'])
    ->name('roads.index');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/', function () {
    return Inertia::render('dashboard', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('api/roads', [RoadController::class, 'index'])
        ->name('roads.index');

    Route::post('api/analyze-pothole', [PotholeAnalysisController::class, 'analyze'])
        ->name('pothole.analyze');

    Route::post('api/upload-photo', [PhotoUploadController::class, 'store'])
        ->name('photo.upload');

    Route::post('api/confirm-road-selection', [PhotoUploadController::class, 'confirmRoadSelection'])
        ->name('photo.confirm-road');

    Route::put('api/reports/{report}', [PhotoUploadController::class, 'update'])
        ->name('report.update');

    // Announcements CRUD (authenticated)
    Route::apiResource('api/announcements', App\Http\Controllers\AnnouncementController::class);
});

require __DIR__.'/settings.php';
