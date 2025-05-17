import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabaseClient';
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <Button variant="custom" onClick={handleLogout} className="logout">
      Выйти
    </Button>
  );
}
