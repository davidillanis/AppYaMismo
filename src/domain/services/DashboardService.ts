import { EOrderStatus } from "../entities/OrderEntity";
import { ERole } from "../entities/UserEntity";
import { DashboardStatsDTO } from "../types/DashboardDTO";
import { listOrder } from "./OrderService";
import { listRestaurant } from "./RestaurnatService";
import { listUsers } from "./UserService";

export const getDashboardStats = async (): Promise<DashboardStatsDTO> => {
  const stats: DashboardStatsDTO = {
    totalOrdersToday: 0,
    activeRiders: 0,
    activeRestaurants: 0,
    pendingOrders: 0,
    statusDistribution: { "En espera": 0, "En proceso": 0, Entregado: 0 },
  };

  try {
    // 🔥 OPTIMIZACIÓN: Solo hacemos 3 llamadas.
    // 1. Usuarios (para motorizados)
    // 2. Restaurantes (para activos)
    // 3. Pedidos (Traemos un lote grande, ej: 100, para filtrar y calcular TODO en memoria)
    const results = await Promise.allSettled([
      listUsers({ page: 0, size: 100 }),
      listRestaurant({ page: 0, size: 100 }),
      listOrder({ page: 0, size: 100 }), // Sin sortBy para evitar error 404
    ]);

    const getData = (index: number) => {
      const result = results[index];
      return result.status === "fulfilled" ? result.value.data : null;
    };

    // 1. REPARTIDORES
    const usersResponse = getData(0);
    if (usersResponse?.content) {
      stats.activeRiders = usersResponse.content.filter((u: any) => {
        const isEnabled = u.enabled === true;
        let isRider = false;
        if (Array.isArray(u.roles)) {
          isRider = u.roles.some(
            (r: any) => r === ERole.REPARTIDOR || r?.role === ERole.REPARTIDOR,
          );
        } else {
          isRider = u.roles === ERole.REPARTIDOR;
        }
        return isRider && isEnabled;
      }).length;
    }

    // 2. RESTAURANTES
    const restResponse = getData(1);
    if (restResponse?.content) {
      stats.activeRestaurants = restResponse.content.filter(
        (r: any) => r.enabled === true,
      ).length;
    }

    // 3. PEDIDOS DE HOY Y DISTRIBUCIÓN (Lógica Unificada)
    const ordersResponse = getData(2);
    if (ordersResponse?.content) {
      const today = new Date();
      const todayDay = today.getDate();
      const todayMonth = today.getMonth();
      const todayYear = today.getFullYear();

      // Filtramos SOLO los pedidos de HOY
      const todayOrdersList = ordersResponse.content.filter((order: any) => {
        if (!order.createdAt) return false;
        const orderDate = new Date(order.createdAt);
        return (
          orderDate.getDate() === todayDay &&
          orderDate.getMonth() === todayMonth &&
          orderDate.getFullYear() === todayYear
        );
      });

      // A. Total del día
      stats.totalOrdersToday = todayOrdersList.length;

      // B. Calcular distribución SOLO con los pedidos de hoy
      let pending = 0;
      let process = 0;
      let delivered = 0;

      todayOrdersList.forEach((order: any) => {
        const status = order.orderStatus;

        if (status === EOrderStatus.PENDIENTE) {
          pending++;
        } else if (status === EOrderStatus.EN_CAMINO) {
          // OJO: Agrega aquí otros estados intermedios si existen (ej. COCINANDO)
          process++;
        } else if (status === EOrderStatus.ENTREGADO) {
          delivered++;
        }
      });

      stats.pendingOrders = pending;
      stats.statusDistribution = {
        "En espera": pending,
        "En proceso": process,
        Entregado: delivered,
      };
    }

    return stats;
  } catch (error) {
    console.error("Error Dashboard:", error);
    return stats;
  }
};
