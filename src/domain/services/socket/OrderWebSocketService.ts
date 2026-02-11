import { baseURL } from '@/src/infrastructure/configuration/http/apiClient';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
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


    connect(dealerId: number) {
        this.client = new Client({
            webSocketFactory: () => new SockJS(`${baseURL}/ws`),
            reconnectDelay: 5000,
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
        if (!this.client) return;
        this.client.publish({
            destination: '/app/order.status.update',
            body: JSON.stringify(order)
        });
    }

    disconnect() {
        this.subscription?.unsubscribe();
        this.client?.deactivate();
    }
}

export default OrderWebSocketService;
