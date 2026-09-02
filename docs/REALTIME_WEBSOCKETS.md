# Real-Time WebSocket Integration Guide (Laravel Reverb + Inertia React)

This guide documents how real-time items (live complaint alerts, dashboard counter updates, duplicate detection warnings) work in CMCC-AJK.

---

## ⚡ Architecture Flow

```
[ Controller / Job ] -> [ Dispatches ShouldBroadcast Event ] 
                     -> [ Laravel Reverb WebSockets ] 
                     -> [ Private Channel: private-department.{id} ] 
                     -> [ React Layout (Laravel Echo Listener) ] 
                     -> [ Inertia Partial Reload ]
```

---

## 🛠️ Step-by-Step Setup Instructions

### 1. Enable Reverb & Broadcasting

```bash
php artisan install:broadcasting
npm install --save-dev laravel-echo pusher-js
```

### 2. Event Example (`app/Events/ComplaintAssigned.php`)

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

### 3. Frontend React Listener (`resources/js/Layouts/AuthenticatedLayout.jsx`)

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
                // Partial reload updates complaints list & stats without losing UI state
                router.reload({ only: ['complaints', 'stats'] });
            });

        return () => channel.stopListening('ComplaintAssigned');
    }, [auth.user]);

    return <div>{children}</div>;
}
```
