import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { date, data } = req.body;
  const filePath = path.join(process.cwd(), 'data', 'schedule.json');

  let allData = {};
  if (fs.existsSync(filePath)) {
    try {
      allData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (err) {
      allData = {err};
    }
  }

  // Сохраняем текущую дату
  allData[date] = data;

  // Если появились новые колонки — добавим их во все даты
  const newColumns = data.columns || [];

  for (const d in allData) {
    if (d === date) continue; // текущую дату не трогаем
    const existing = allData[d];
    const existingCols = existing.columns || [];
    const colsToAdd = newColumns.filter(col => !existingCols.includes(col));

    if (colsToAdd.length > 0) {
      const updatedCols = [...existingCols, ...colsToAdd];

      // Обновим schedule
      const updatedSchedule = {};
      for (let hour = 8; hour <= 22; hour++) {
        const time = hour.toString().padStart(2, '0') + ':00';
        const row = existing.schedule?.[time] || Array(existingCols.length).fill('');
        updatedSchedule[time] = [...row, ...Array(colsToAdd.length).fill('')];
      }

      // Обновим colors
      const updatedColors = {};
      for (const time in existing.colors || {}) {
        const row = existing.colors[time];
        updatedColors[time] = { ...row };
      }

      allData[d] = {
        columns: updatedCols,
        schedule: updatedSchedule,
        colors: updatedColors,
      };
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(allData, null, 2), 'utf-8');

  res.status(200).json({ success: true });
}
