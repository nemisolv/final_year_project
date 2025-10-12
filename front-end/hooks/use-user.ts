import { useEffect, useState } from 'react';
import { User } from '@/types';
import { userService } from '@/services';
import { toast } from 'sonner';

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await userService.getCurrentUser();
        setUser(userData);
      } catch (err) {
        setError(err as Error);
        console.error('Failed to fetch user:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const refetch = async () => {
    setIsLoading(true);
    try {
      const userData = await userService.getCurrentUser();
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err as Error);
      toast.error('Không thể tải thông tin người dùng');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { user, isLoading, error, refetch };
}
