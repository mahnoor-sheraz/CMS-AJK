<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PublicComplaintController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Public Citizen Portal Routes
Route::get('/', [PublicComplaintController::class, 'create'])->name('home');

Route::prefix('complaints')->group(function () {
    Route::get('/new', [PublicComplaintController::class, 'create'])->name('complaints.new');
    Route::post('/', [PublicComplaintController::class, 'store'])->name('complaints.store');
    Route::get('/confirmation/{complaint_number}', [PublicComplaintController::class, 'confirmation'])->name('complaints.confirmation');
    Route::get('/track', [PublicComplaintController::class, 'trackForm'])->name('complaints.track');
    Route::post('/track', [PublicComplaintController::class, 'track'])->name('complaints.track.search');
});

// Auth Dashboards
Route::get('/dashboard', function () {
    $user = auth()->user();

    if ($user->role === 'admin') {
        return redirect()->route('admin.dashboard');
    }

    if ($user->role === 'focal_person') {
        return redirect()->route('fp.dashboard');
    }

    return redirect()->route('complaints.new');
})->middleware(['auth'])->name('dashboard');

// Admin Route Group
Route::middleware(['auth', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', \App\Http\Controllers\Admin\AdminDashboardController::class)->name('admin.dashboard');
});

// Focal Person Route Group
Route::middleware(['auth', 'role:focal_person,director'])->prefix('fp')->group(function () {
    Route::get('/dashboard', \App\Http\Controllers\FocalPerson\FocalPersonDashboardController::class)->name('fp.dashboard');
    Route::get('/complaints/{id}', [\App\Http\Controllers\InternalComplaintController::class, 'show'])->name('fp.complaints.show');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
