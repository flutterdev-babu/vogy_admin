import { io, Socket } from 'socket.io-client';
import { TOKEN_KEYS } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
// socket.io connects to the base server url, not /api
const SOCKET_URL = API_BASE_URL.replace('/api', '');

class SocketService {
    private socket: Socket | null = null;
    private listeners: Map<string, Function[]> = new Map();

    connect(tokenKey: string = TOKEN_KEYS.partner) {
        if (this.socket?.connected) return;

        if (typeof window !== 'undefined') {
            const token = localStorage.getItem(tokenKey);

            this.socket = io(SOCKET_URL, {
                auth: {
                    token: token ? `Bearer ${token}` : undefined
                },
                transports: ['websocket', 'polling']
            });

            this.socket.on('connect', () => {
                console.log('Socket connected:', this.socket?.id);
            });

            this.socket.on('disconnect', () => {
                console.log('Socket disconnected');
            });

            // Register all events we want to forward
            const eventsToForward = [
                'ride:created',
                'ride:new_request',
                'ride:assigned',
                'ride:status_changed',
                'ride:new_scheduled'
            ];

            eventsToForward.forEach(event => {
                this.socket?.on(event, (data) => {
                    this.triggerListeners(event, data);
                });
            });
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    on(event: string, callback: Function) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)?.push(callback);
    }

    off(event: string, callback: Function) {
        if (!this.listeners.has(event)) return;
        const callbacks = this.listeners.get(event) || [];
        this.listeners.set(event, callbacks.filter(cb => cb !== callback));
    }

    private triggerListeners(event: string, data: any) {
        const callbacks = this.listeners.get(event) || [];
        callbacks.forEach(cb => cb(data));
    }
}

export const socketService = new SocketService();
