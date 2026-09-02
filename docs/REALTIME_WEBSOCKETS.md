# Real-Time WebSockets Architecture: First-Party Laravel Reverb

CMCC-AJK uses **Laravel Reverb** — Laravel's official first-party, high-performance WebSocket server — out of the box to deliver real-time complaint updates, live dashboard counter refreshes, and immediate department assignment notifications without relying on third-party SaaS services.

---

## ⚡ Why Laravel Reverb Out of the Box?

1. **First-Party Integration**: Built into Laravel 13 (`laravel/reverb`). No external SaaS subscriptions (Pusher/Ably) required.
2. **Blazing Speed**: Asynchronous event loop built on ReactPHP capable of supporting thousands of persistent concurrent WebSocket connections.
3. **Native Broadcasting**: Seamless integration with Laravel events via `ShouldBroadcast` and private authorization channels in `routes/channels.php`.

---

## 🏗️ Architecture & Signal Flow

```
[ Citizen Action / Admin Assignment ]
                 |
                 v
     [ Controller Execution ]
                 |
                 v
   [ Dispatches ComplaintAssigned ]
                 |
                 v (Broadcasting via BROADCAST_CONNECTION=reverb)
     [ Laravel Reverb Server ] (Port 8080)
                 |
                 v (Private Channel: private-department.{department_id})
[ React 18 Layout (Laravel Echo Listener) ]
                 |
                 v
   [ Inertia Partial Reload: router.reload({ only: ['complaints', 'stats'] }) ]
```

---

## 🛠️ Step-by-Step Instructions

### 1. Start Reverb Server Locally

```bash
php artisan reverb:start
```

### 2. Environment Configuration (`.env`)

```env
BROADCAST_CONNECTION=reverb

REVERB_APP_ID=100001
REVERB_APP_KEY=cmcc_ajk_reverb_key
REVERB_APP_SECRET=cmcc_ajk_reverb_secret
REVERB_HOST="localhost"
REVERB_PORT=8080
REVERB_SCHEME="http"

VITE_REVERB_APP_KEY="${REVERB_APP_KEY}"
VITE_REVERB_HOST="${REVERB_HOST}"
VITE_REVERB_PORT="${REVERB_PORT}"
VITE_REVERB_SCHEME="${REVERB_SCHEME}"
```

---

### 3. Broadcaster Event (`app/Events/ComplaintAssigned.php`)

```php
namespace App\Events;

use App\Models\Complaint;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ComplaintAssigned implements ShouldBroadcast
{
    use Dispatchable, SerializesModels;

    public function __construct(public Complaint $complaint) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('department.'.$this->complaint->department_id),
        ];
    }
}
```

---

### 4. Private Channel Authorizations (`routes/channels.php`)

```php
Broadcast::channel('department.{departmentId}', function (User $user, int $departmentId) {
    return $user->role === 'admin' || (int) $user->department_id === $departmentId;
});
```

---

### 5. Frontend React Listener (`resources/js/Layouts/AuthenticatedLayout.jsx`)

```jsx
import { useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;
window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
});

export default function AuthenticatedLayout({ children }) {
    const { auth } = usePage().props;

    useEffect(() => {
        if (!auth.user) return;

        const channel = window.Echo.private(`department.${auth.user.department_id}`)
            .listen('ComplaintAssigned', (e) => {
                // Partial reload updates stats & complaint lists seamlessly
                router.reload({ only: ['complaints', 'stats'] });
            });

        return () => channel.stopListening('ComplaintAssigned');
    }, [auth.user]);

    return <div>{children}</div>;
}
```
