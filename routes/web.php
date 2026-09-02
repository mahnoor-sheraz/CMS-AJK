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
    Route::get('/dashboard', function () {
        return Inertia::render('Admin/Dashboard');
    })->name('admin.dashboard');
});

// Focal Person Route Group
Route::middleware(['auth', 'role:focal_person'])->prefix('fp')->group(function () {
    Route::get('/dashboard', function () {
        return Inertia::render('FocalPerson/Dashboard');
    })->name('fp.dashboard');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
