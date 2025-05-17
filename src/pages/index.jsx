import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    const today = new Date().toISOString().split('T')[0];
    console.log("🔁 Переход на дату:", today);
    router.replace(`/${today}`);
  }, [router.isReady]);

  return <p>🔄 Загрузка страницы...</p>;
}