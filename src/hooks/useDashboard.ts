import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getOptimizedDashboardData, 
  getUserStats,
  clearAllCaches 
} from '@/lib/optimized-firebase';
import { showError, showSuccess } from '@/components/common/NotificationSystem';

// Hook for dashboard data
export function useDashboardData(userId: string) {
  return useQuery({
    queryKey: ['dashboard', userId],
    queryFn: () => getOptimizedDashboardData(userId),
    enabled: !!userId,
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook for user stats
export function useUserStats(userId: string) {
  return useQuery({
    queryKey: ['userStats', userId],
    queryFn: () => getUserStats(userId),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Hook for clearing cache
export function useClearCache() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      clearAllCaches();
      return true;
    },
    onSuccess: () => {
      // Invalidate all queries to force refetch
      queryClient.invalidateQueries();
      showSuccess('Cache Cleared', 'All cached data has been cleared');
    },
    onError: (error) => {
      showError('Cache Clear Failed', 'Failed to clear cache');
      console.error('Cache clear error:', error);
    },
  });
}

// Hook for refreshing dashboard
export function useRefreshDashboard(userId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      // Clear cache and refetch
      await clearAllCaches();
      return getOptimizedDashboardData(userId);
    },
    onSuccess: (data) => {
      // Update the dashboard query with fresh data
      queryClient.setQueryData(['dashboard', userId], data);
      showSuccess('Dashboard Refreshed', 'Data has been updated');
    },
    onError: (error) => {
      showError('Refresh Failed', 'Failed to refresh dashboard data');
      console.error('Dashboard refresh error:', error);
    },
  });
}
