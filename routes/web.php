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
    
    // API endpoint for returning citizen pre-fill
    Route::get('/api/citizen/{cnic}', [PublicComplaintController::class, 'getCitizenByCnic'])->name('complaints.api.citizen');
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
    Route::get('/complaints/{id}/investigate', [\App\Http\Controllers\FocalPerson\FocalPersonInvestigationController::class, 'show'])->name('fp.complaints.investigate');
    Route::post('/complaints/{id}/duplicates/{matchId}/confirm', [\App\Http\Controllers\FocalPerson\FocalPersonInvestigationController::class, 'confirmDuplicate'])->name('fp.complaints.duplicates.confirm');
    Route::post('/complaints/{id}/duplicates/{matchId}/dismiss', [\App\Http\Controllers\FocalPerson\FocalPersonInvestigationController::class, 'dismissDuplicate'])->name('fp.complaints.duplicates.dismiss');
    Route::post('/complaints/{id}/classify', [\App\Http\Controllers\FocalPerson\FocalPersonInvestigationController::class, 'classify'])->name('fp.complaints.classify');
    
    // Action/Resolution Screen (Module 4)
    Route::get('/complaints/{id}/resolve', [\App\Http\Controllers\FocalPerson\FocalPersonInvestigationController::class, 'resolveForm'])->name('fp.complaints.resolve');
    Route::post('/complaints/{id}/progress-note', [\App\Http\Controllers\FocalPerson\FocalPersonInvestigationController::class, 'addProgressNote'])->name('fp.complaints.progress-note');
    Route::post('/complaints/{id}/resolve', [\App\Http\Controllers\FocalPerson\FocalPersonInvestigationController::class, 'resolve'])->name('fp.complaints.resolve.store');
    
    // Reassignment (Module 4)
    Route::post('/complaints/{id}/reassign', [\App\Http\Controllers\FocalPerson\FocalPersonInvestigationController::class, 'requestReassignment'])->name('fp.complaints.reassign');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
