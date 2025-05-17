import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import TimeTable from '../components/TimeTable';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import LogoutButton from '../components/LogoutButton';

export default function SchedulePage() {
  const router = useRouter();
  const { date } = router.query;
  const { loading: authLoading } = useAuthRedirect(); // ⬅️ авторизация

  const [data, setData] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!date) return;

    setIsLoaded(false);

    fetch(`/api/loadSchedule?date=${date}`)
      .then((res) => res.json())
      .then((json) => {
        if (json && Object.keys(json).length > 0) {
          setData({
            columns: json.columns || [],
            schedule: json.schedule || {},
            colors: json.colors || {},
          });
        } else {
          setData(null);
        }
        setIsLoaded(true);
      })
      .catch((err) => {
        console.error("❌ Error loading schedule:", err);
        setData(null);
        setIsLoaded(true);
      });
  }, [date]);

  const formatDate = (d) => {
    try {
      return new Date(d).toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return d;
    }
  };

  if (authLoading || !isLoaded) return <p>Загрузка...</p>;
  if (!data) return <p>❌ Дата «{date}» не найдена.</p>;

  return (
    <div className="container">
      <div className="header">
        <h1 className="date">{formatDate(date)}</h1>
        <LogoutButton />
      </div>
      <TimeTable key={date} data={data} date={date} />
    </div>
  );
}