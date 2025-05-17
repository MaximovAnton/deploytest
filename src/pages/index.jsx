import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]; // 📆 формат YYYY-MM-DD
    router.replace(`/${today}`);
  }, []);

  return <p>Загрузка...</p>;
}
