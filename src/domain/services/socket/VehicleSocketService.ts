import { baseURL } from '@/src/infrastructure/configuration/http/apiClient';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ERole } from '../../entities/UserEntity';

export interface LocationData {
    truckID: string;
    latitude: number;
    longitude: number;
    status: string;
    timestamp: number;
}


export class MonitoringWebSocketService {
    private client: Client | null = null;
    private connected = false;
    private userRole: ERole | null = null;
    private truckID: string | null = null;
    private subscriptions: StompSubscription[] = [];
    private serverUrl = `${baseURL}/ws`;

    onLocationUpdate?: (data: LocationData) => void;
    onStatusUpdate?: (data: LocationData) => void;
    onCollectionUpdate?: (data: LocationData) => void;

    connect(userRole: ERole, truckID = '') {
        this.userRole = userRole;
        this.truckID = truckID;

        this.client = new Client({
            webSocketFactory: () => new SockJS(this.serverUrl),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            debug: (msg) => console.log('[STOMP]', msg),
        });

        this.client.onConnect = () => {
            this.connected = true;
            console.log('Conectado como:', userRole);
            this.setupSubscriptions();
            if (userRole === ERole.REPARTIDOR && truckID) {
                this.registerTruck(truckID);
            }
        };

        this.client.onStompError = (frame) => {
            console.error('STOMP error:', frame.headers['message']);
            this.connected = false;
        };

        this.client.onDisconnect = () => {
            this.connected = false;
            console.log('Desconectado');
        };

        this.client.activate();
    }

    private setupSubscriptions() {
        if (!this.client) return;

        // Limpiar suscripciones previas
        this.subscriptions.forEach((sub) => sub.unsubscribe());
        this.subscriptions = [];

        const subscribe = (topic: string, callback: (data: any) => void) => {
            const sub = this.client!.subscribe(topic, (msg: IMessage) => callback(JSON.parse(msg.body)));
            this.subscriptions.push(sub);
        };

        switch (this.userRole) {
            case ERole.REPARTIDOR:
                subscribe('/topic/trucks/status', this.onStatusUpdate!);
                subscribe('/topic/trucks', this.onLocationUpdate!);
                break;

            case ERole.CLIENTE:
                subscribe('/topic/trucks', this.onLocationUpdate!);
                break;

            case ERole.ADMINISTRADOR:
                subscribe('/topic/trucks', this.onLocationUpdate!);
                subscribe('/topic/trucks/status', this.onStatusUpdate!);
                subscribe('/topic/collections', this.onCollectionUpdate!);
                break;
        }
    }

    sendLocation(latitude: number, longitude: number, status = 'MANUAL') {
        if (!this.connected || !this.client || ![ERole.REPARTIDOR, ERole.CLIENTE].includes(this.userRole!)) return;

        const payload: LocationData = {
            truckID: this.truckID || 'VECINO',
            latitude,
            longitude,
            status,
            timestamp: Date.now(),
        };

        this.client.publish({ destination: '/app/location.update', body: JSON.stringify(payload) });
    }

    updateStatus(status: string, latitude?: number, longitude?: number) {
        if (!this.connected || !this.client || this.userRole !== ERole.REPARTIDOR) return;

        const payload: LocationData = {
            truckID: this.truckID!,
            status,
            latitude: latitude!,
            longitude: longitude!,
            timestamp: Date.now(),
        };

        this.client.publish({ destination: '/app/truck.status', body: JSON.stringify(payload) });
    }

    registerTruck(truckID: string) {
        if (!this.connected || !this.client) return;

        const payload: LocationData = { truckID, status: 'ONLINE', timestamp: Date.now(), latitude: 0, longitude: 0 };
        this.client.publish({ destination: '/app/truck.connect', body: JSON.stringify(payload) });
    }

    subscribeToTruck(truckID: string, callback: (data: LocationData) => void) {
        if (!this.connected || !this.client) return;
        this.client.subscribe(`/topic/truck/${truckID}`, (msg) => callback(JSON.parse(msg.body)));
    }

    disconnect() {
        if (this.client && this.connected) {
            this.client.deactivate();
            this.connected = false;
        }
    }

    isConnected() {
        return this.connected;
    }
}

export default new MonitoringWebSocketService();