import { supabase } from '@/lib/supabaseClient';
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const { date, data } = req.body;

  if (!date || !data) {
    console.error("❌ Missing date or data in request body");
    return res.status(400).json({ error: "Missing date or data" });
  }

  try {
    // 1. Сохраняем текущую дату в Supabase
    const { error: upsertError } = await supabase
      .from('schedules')
      .upsert({
        date,
        columns: data.columns || [],
        schedule: data.schedule || {},
        colors: data.colors || {},
      }, {
        onConflict: ['date']
      });

    if (upsertError) {
      console.error("❌ Error during upsert:", upsertError.message);
      return res.status(500).json({ error: upsertError.message });
    }

    // 2. Получаем все даты
    const { data: allSchedules, error: fetchError } = await supabase
      .from('schedules')
      .select();

    if (fetchError) {
      console.error("❌ Error fetching all schedules:", fetchError.message);
      return res.status(500).json({ error: fetchError.message });
    }

    const newColumns = data.columns || [];
    const updates = [];

    for (const sched of allSchedules) {
      if (sched.date === date) continue;

      const existingCols = sched.columns || [];
      const colsToAdd = newColumns.filter((col) => !existingCols.includes(col));
      if (colsToAdd.length === 0) continue;

      const updatedCols = [...existingCols, ...colsToAdd];
      const updatedSchedule = {};

      for (let hour = 8; hour <= 22; hour++) {
        const time = hour.toString().padStart(2, '0') + ':00';
        const row = sched.schedule?.[time] || Array(existingCols.length).fill('');
        updatedSchedule[time] = [...row, ...Array(colsToAdd.length).fill('')];
      }

      updates.push({
        date: sched.date,
        columns: updatedCols,
        schedule: updatedSchedule,
        colors: sched.colors || {},
      });
    }

    if (updates.length > 0) {
      const { error: updateError } = await supabase
        .from('schedules')
        .upsert(updates, {
          onConflict: ['date']
        });

      if (updateError) {
        console.error("❌ Error updating other dates:", updateError.message);
        return res.status(500).json({ error: updateError.message });
      }
    }

    // ✅ СИНХРОНИЗАЦИЯ ЛОКАЛЬНО
    try {
      const filePath = path.join(process.cwd(), 'data', 'schedule.json');
      const allData = {};

      const fullSchedules = [...allSchedules]; // уже загруженные
      if (!fullSchedules.find(s => s.date === date)) {
        fullSchedules.push({ date, ...data });
      }

      for (const item of fullSchedules) {
        allData[item.date] = {
          columns: item.columns,
          schedule: item.schedule,
          colors: item.colors,
        };
      }

      fs.writeFileSync(filePath, JSON.stringify(allData, null, 2), 'utf-8');
    } catch (err) {
      console.error('❌ Error writing local JSON:', err.message);
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("❌ Uncaught error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
