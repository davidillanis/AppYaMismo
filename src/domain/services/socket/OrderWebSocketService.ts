import { baseURL } from '@/src/infrastructure/configuration/http/apiClient';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import Toast from 'react-native-toast-message';
import SockJS from 'sockjs-client';
import { OrderCreateRequestDTO } from '../../entities/OrderEntity';
import { ResponseStatusDTO } from '../../types/ResponseStatusDTO';

// src/domain/entities/OrderSocketEntity.ts

export enum EOrderStatus {
    PENDIENTE = 'PENDIENTE',
    EN_CAMINO = 'EN_CAMINO',
    ENTREGADO = 'ENTREGADO',
    RECHAZADO = 'RECHAZADO',
    CANCELADO = 'CANCELADO'
}

export interface OrderSocketDTO {
    id: number;
    status: EOrderStatus;
    total: number;
    latitude: number;
    longitude: number;

    orderDetails: OrderDetailsSocketDTO[];
    customer: CustomerSocketDTO;
    customerId: number;
    dealerId?: number;
}

export interface OrderDetailsSocketDTO {
    id: number;
    amount: number;
    unitPrice: number;
    product: ProductSocketDTO;
}

export interface ProductSocketDTO {
    id: number;
    name: string;
    urlImage: string;
    restaurant?: {
        name: string;
        latitude: number;
        longitude: number;
    }
}
export interface UserSocketDTO {
    id: number;
    name: string;
    phone: string;
    address: string;
}
export interface CustomerSocketDTO {
    id: number;
    userEntity: UserSocketDTO;
}


export interface OrderStatusUpdateDTO {
    orderId: number;
    dealerId: number;
    status: EOrderStatus;
}

class OrderWebSocketService {
    private client: Client | null = null;
    private subscription?: StompSubscription;

    onDealerOrdersUpdate?: (order: OrderSocketDTO) => void;
    onOrderError?: (error: ResponseStatusDTO<null>) => void;

    get connected(): boolean {
        return !!this.client?.connected;
    }


    connect(dealerId: number, token?: string) {
        this.client = new Client({
            webSocketFactory: () => new SockJS(`${baseURL}/ws`),
            reconnectDelay: 5000,
            connectHeaders: token ? {
                Authorization: `Bearer ${token}`
            } : {},
        });

        this.client.onConnect = () => {
            this.subscription = this.client!.subscribe(
                `/topic/orders/list`,
                (msg: IMessage) => {
                    const order: OrderSocketDTO = JSON.parse(msg.body);
                    this.onDealerOrdersUpdate?.(order);
                }
            );

            this.client!.subscribe(
                `/queue/orders/errors/${dealerId}`,
                (msg: IMessage) => {
                    const error = JSON.parse(msg.body);
                    this.onOrderError?.(error);
                }
            );
        };

        this.client.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };

        this.client.activate();
    }

    /** CREAR ORDEN */
    createOrder(order: OrderCreateRequestDTO) {
        if (!this.client) return;

        this.client.publish({
            destination: '/app/order.create',
            body: JSON.stringify(order)
        });
    }

    /** ACTUALIZAR ESTADO */
    updateStatus(order: OrderStatusUpdateDTO) {
        if (!this.connected) {
            Toast.show({
                type: "warning",
                text1: "No Conectado",
                text2: "STOMP no conectado aún, no se puede actualizar estado",
                visibilityTime: 3000,
                topOffset: 60,
            });
            return;
        }
        this.client?.publish({
            destination: '/app/order.status.update',
            body: JSON.stringify(order)
        });
    }

    disconnect() {
        this.subscription?.unsubscribe();
        this.client?.deactivate();
        this.client = null;
    }
}

export default OrderWebSocketService;
