import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import TimeTable from '../components/TimeTable';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';
import LogoutButton from '../components/LogoutButton';
import * as XLSX from 'xlsx';
import { Button } from "@/components/ui/button";

export default function SchedulePage() {
  const router = useRouter();
  const { date } = router.query;
  const { loading: authLoading } = useAuthRedirect(); // авторизация

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

 const handleDownloadXLSX = async () => {
    const res = await fetch('/api/loadAllSchedules');
    const allData = await res.json();

    const wb = XLSX.utils.book_new();

    Object.entries(allData)
      .sort(([a], [b]) => new Date(a) - new Date(b)) // СОРТИРУЕМ ДАТЫ ПО ВРЕМЕНИ
      .forEach(([dateKey, scheduleArray]) => {
        const ws = XLSX.utils.json_to_sheet(scheduleArray);
        XLSX.utils.book_append_sheet(wb, ws, dateKey.replace(/\s/g, '_'));
      });

    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `расписание.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (authLoading || !isLoaded) return <p>Загрузка...</p>;
  if (!data) return <p>❌ Дата «{date}» не найдена.</p>;

  return (
    <div className="container">
      <div className="header">
        <div></div>
        <h1 className="date">{formatDate(date)}</h1>
        <div>
          <LogoutButton />
          <Button variant="custom" onClick={handleDownloadXLSX}>⬇️XLSX</Button>
        </div>
      </div>
      <TimeTable key={date} data={data} date={date} />
    </div>
  );
}
