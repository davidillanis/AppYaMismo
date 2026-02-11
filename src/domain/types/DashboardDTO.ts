export interface DashboardStatsDTO {
  totalOrdersToday: number;
  activeRiders: number;
  activeRestaurants: number;
  pendingOrders: number;
  statusDistribution: {
    "En espera": number;
    "En proceso": number;
    Entregado: number;
  };
}
