<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AnnouncementController extends Controller
{
    /**
     * Display a listing of the announcements.
     */
    public function index(Request $request): JsonResponse
    {
        $announcements = Announcement::with(['user', 'road'])->paginate(25);

        return response()->json($announcements);
    }

    /**
     * Store a newly created announcement.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'road_id' => 'required|exists:roads,id',
            'description' => 'required|string|max:10000',
        ]);

        $validated['user_id'] = auth()->id();

        $announcement = Announcement::create($validated);

        $announcement->load(['user', 'road']);

        return response()->json($announcement, 201);
    }

    /**
     * Display the specified announcement.
     */
    public function show(Announcement $announcement): JsonResponse
    {
        $announcement->load(['user', 'road']);

        return response()->json($announcement);
    }

    /**
     * Update the specified announcement.
     */
    public function update(Request $request, Announcement $announcement): JsonResponse
    {
        $validated = $request->validate([
            'description' => 'sometimes|required|string|max:10000',
        ]);

        // Only the creator or an admin can update
        if (!auth()->user()->hasRole('admin')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $announcement->update($validated);

        $announcement->load(['user', 'road']);

        return response()->json($announcement);
    }

    /**
     * Remove the specified announcement.
     */
    public function destroy(Announcement $announcement): JsonResponse
    {
        // Only the creator or an admin can delete
        if ($announcement->user_id !== auth()->id() && ! auth()->user()->hasRole('admin')) {
            return response()->json(['message' => 'Forbidden'], 403);
        }

        $announcement->delete();

        return response()->json(null, 204);
    }
}
