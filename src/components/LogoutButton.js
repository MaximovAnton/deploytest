import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <button onClick={handleLogout} className="logout">
      🚪 Выйти
    </button>
  );
}
