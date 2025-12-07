import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useVideomanagementController() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // TODO: Add hooks and methods based on controllers from spec

  const navigate = (route: string) => {
    router.push(route);
  };

  return {
    navigate,
  };
}
