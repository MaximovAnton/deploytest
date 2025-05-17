import { supabase } from '@/lib/supabaseClient';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const { colIndex } = req.body;

  if (typeof colIndex !== 'number') {
    return res.status(400).json({ error: 'Missing or invalid colIndex' });
  }

  const { data: schedules, error } = await supabase.from('schedules').select();

  if (error) {
    console.error("❌ Error loading schedules:", error.message);
    return res.status(500).json({ error: error.message });
  }

  const updates = schedules.map((sched) => {
    const updatedCols = sched.columns.filter((_, i) => i !== colIndex);

    const updatedSchedule = {};
    for (const time in sched.schedule || {}) {
      const row = sched.schedule[time] || [];
      updatedSchedule[time] = row.filter((_, i) => i !== colIndex);
    }

    const updatedColors = {};
    for (const time in sched.colors || {}) {
      const row = sched.colors[time];
      const updated = {};
      for (const idx in row) {
        const i = parseInt(idx);
        if (i < colIndex) updated[i] = row[i];
        if (i > colIndex) updated[i - 1] = row[i];
      }
      updatedColors[time] = updated;
    }

    return {
      date: sched.date,
      columns: updatedCols,
      schedule: updatedSchedule,
      colors: updatedColors,
    };
  });

  const { error: updateError } = await supabase
    .from('schedules')
    .upsert(updates, { onConflict: ['date'] });

  if (updateError) {
    console.error("❌ Error during upsert:", updateError.message);
    return res.status(500).json({ error: updateError.message });
  }

  // ✅ ЛОКАЛЬНОЕ ДУБЛИРОВАНИЕ
  try {
    const filePath = path.join(process.cwd(), 'data', 'schedule.json');
    const allData = {};

    for (const item of updates) {
      allData[item.date] = {
        columns: item.columns,
        schedule: item.schedule,
        colors: item.colors,
      };
    }

    fs.writeFileSync(filePath, JSON.stringify(allData, null, 2), 'utf-8');
  } catch (err) {
    console.error('❌ Error writing to local JSON:', err.message);
  }

  res.status(200).json({ success: true });
}
