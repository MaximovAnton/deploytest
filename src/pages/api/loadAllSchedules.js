import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Интервалы времени как в интерфейсе
const timeBlocks = [
  "09:00 11:00",
  "11:00 13:00",
  "13:00 15:00",
  "15:00 17:00",
  "17:00 19:00"
];

export default async function handler(req, res) {
  try {
    const { data, error } = await supabase
      .from('schedules')
      .select('date, schedule, columns');

    if (error) {
      console.error('❌ Ошибка загрузки:', error);
      return res.status(500).json({ error: 'Ошибка Supabase' });
    }

    const formatted = {};

    data.forEach(({ date, schedule, columns }) => {
      const rows = [];

      // Формируем каждую строку таблицы по фиксированным интервалам
      timeBlocks.forEach((block) => {
        const row = { Время: block };

        const subjects = schedule[block] || [];

        columns.forEach((col, idx) => {
          row[col] = subjects[idx]?.trim() || '';
        });

        rows.push(row);
      });

      formatted[date] = rows;
    });

    res.status(200).json(formatted);
  } catch (err) {
    console.error('❌ Внутренняя ошибка:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
}
