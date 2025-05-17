import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/router';

export function useAuthRedirect() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
      } else {
        setSession(session);
        setLoading(false);
      }
    };

    checkSession();
  }, [router]);

  return { loading, session };
}
