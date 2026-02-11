export enum EPaymentMethod {
    EFECTIVO = "EFECTIVO",
    TARJETA_CREDITO = "TARJETA_CREDITO",
    TARJETA_DEBITO = "TARJETA_DEBITO",
    YAPE = "YAPE",
    PLIN = "PLIN",
    TUNKI = "TUNKI",
    LUKITA = "LUKITA",
    PAYPAL = "PAYPAL",
    MERCADO_PAGO = "MERCADO_PAGO",
    IZIPAY = "IZIPAY",
    CULQI = "CULQI",
    NIUBIZ = "NIUBIZ",
    TRANSFERENCIA_BANCARIA = "TRANSFERENCIA_BANCARIA",
    DEPOSITO_BANCARIO = "DEPOSITO_BANCARIO",
    PAGO_CONTRA_ENTREGA = "PAGO_CONTRA_ENTREGA"
}

export interface SaleEntity {
    id?: number;
    receiptNumber: string;
    paymentMethod: EPaymentMethod;
    totalAmount: number;
    createdAt: Date;
}
