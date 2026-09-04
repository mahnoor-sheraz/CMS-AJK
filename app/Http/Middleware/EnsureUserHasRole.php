<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (! $request->user() || (! empty($roles) && ! in_array($request->user()->role, $roles, true))) {
            if ($request->expectsJson()) {
                return response()->json([
                    'error_code' => 'ERR_FORBIDDEN_ROLE',
                    'message' => 'You do not have the required role permissions to access this portal.',
                ], 403);
            }

            abort(403, 'ERR_FORBIDDEN_ROLE: You do not have the required role permissions to access this portal.');
        }

        return $next($request);
    }
}
