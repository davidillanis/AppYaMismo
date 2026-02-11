import { EOrderStatus } from "@/src/domain/entities/OrderEntity";

export const getOrderStatusColor = (status: EOrderStatus) => {
  switch (status) {
    case EOrderStatus.PENDIENTE:
      return {
        bg: "#FFF8E1",
        text: "#F57C00",
        label: "Pendiente",
        icon: "time",
      }; // Naranja
    case EOrderStatus.EN_CAMINO:
      return {
        bg: "#E3F2FD",
        text: "#1976D2",
        label: "En Camino",
        icon: "bicycle",
      }; // Azul
    case EOrderStatus.ENTREGADO:
      return {
        bg: "#E8F5E9",
        text: "#388E3C",
        label: "Entregado",
        icon: "checkmark-circle",
      }; // Verde
    case EOrderStatus.CANCELADO:
      return {
        bg: "#FFEBEE",
        text: "#D32F2F",
        label: "Cancelado",
        icon: "close-circle",
      }; // Rojo
    case EOrderStatus.RECHAZADO:
      return {
        bg: "#FFEBEE",
        text: "#C62828",
        label: "Rechazado",
        icon: "alert-circle",
      }; // Rojo Oscuro
    default:
      return {
        bg: "#F5F5F5",
        text: "#616161",
        label: status,
        icon: "help-circle",
      }; // Gris
  }
};

export const formatDate = (dateString: string | Date) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
