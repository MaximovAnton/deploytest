import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import TimeTable from '../components/TimeTable';

export default function SchedulePage() {
  const router = useRouter();
  const { date } = router.query;
  const [data, setData] = useState({ columns: [], schedule: {}, colors: {} });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!date) return;

    setIsLoaded(false);
    fetch(`/api/loadSchedule?date=${date}`)
      .then(res => res.json())
      .then(json => {
        setData({
          columns: json.columns || [],
          schedule: json.schedule || {},
          colors: json.colors || {},
        });
        setIsLoaded(true);
      })
      .catch(() => {
        setData({ columns: [], schedule: {}, colors: {} });
        setIsLoaded(true);
      });
  }, [date]);

  if (!isLoaded) return <p>Загрузка...</p>;

  return (
    <div>
      <h1>{date}</h1>
      <TimeTable key={date} data={data} date={date} />
    </div>
  );
}
