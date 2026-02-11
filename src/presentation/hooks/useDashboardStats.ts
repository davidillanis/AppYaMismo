import { getDashboardStats } from "@/src/domain/services/DashboardService";
import { useQuery } from "@tanstack/react-query";

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: getDashboardStats,
    // Optimización: No refetching obsesivo, mantenemos datos frescos por 1 min
    staleTime: 1000 * 60,
    refetchOnWindowFocus: true,
  });
};
