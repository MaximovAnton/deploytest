import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import TextAreaCell from './TextAreaCell';
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

export default function TimeTable({ data, date }) {
  const router = useRouter();
  const [schedule, setSchedule] = useState({});
  const [columns, setColumns] = useState([]);
  const [colors, setColors] = useState({});
  const [existingDates, setExistingDates] = useState([]);
  const [syncTrigger, setSyncTrigger] = useState(0);

  const formatDate = (d) =>
    
    new Date(d).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  useEffect(() => {
    setSchedule(data.schedule || {});
    setColumns(data.columns || []);
    setColors(data.colors || {});
  }, [data]);

  useEffect(() => {
    fetch('/api/listDates')
      .then(res => res.json())
      .then(setExistingDates);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetch('/api/saveSchedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, data: { columns, schedule, colors } }),
      });
    }, 500);
    return () => clearTimeout(timeout);
  }, [schedule, columns, colors, date]);

  useEffect(() => {
    if (Object.keys(schedule).length === 0 && columns.length > 0) {
      const newSchedule = {};
      for (let hour = 8; hour <= 22; hour++) {
        const time = hour.toString().padStart(2, '0') + ':00';
        newSchedule[time] = Array(columns.length).fill('');
      }
      setSchedule(newSchedule);
    }
  }, [columns]);

  const handleChange = (time, colIndex, value) => {
    const updated = { ...schedule };
    if (!updated[time]) updated[time] = Array(columns.length).fill('');
    updated[time][colIndex] = value;
    setSchedule(updated);
    setSyncTrigger(prev => prev + 1);
  };

  const handleColorChange = (time, colIndex, color) => {
    const updatedColors = { ...colors };
    if (!updatedColors[time]) updatedColors[time] = {};
    updatedColors[time][colIndex] = color;
    setColors(updatedColors);
  };

  const handleAddColumn = async () => {
    const newColumnName = prompt('Название нового столбца:');
    if (!newColumnName) return;

    const newCols = [...columns, newColumnName];
    const newSchedule = {};

    for (let hour = 8; hour <= 22; hour++) {
      const time = hour.toString().padStart(2, '0') + ':00';
      const row = schedule[time] || Array(columns.length).fill('');
      newSchedule[time] = [...row, ''];
    }

    const updatedData = {
      columns: newCols,
      schedule: newSchedule,
      colors,
    };

    setColumns(newCols);
    setSchedule(newSchedule);

    await fetch('/api/saveSchedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date,
        data: updatedData,
      }),
    });
  };

  const handleDeleteColumn = async (colIndex) => {
    if (!confirm(`Удалить столбец "${columns[colIndex]}" во всех датах?`)) return;

    const newCols = columns.filter((_, idx) => idx !== colIndex);
    const newSchedule = {};
    const newColors = {};

    for (const time in schedule) {
      const row = schedule[time];
      newSchedule[time] = row.filter((_, idx) => idx !== colIndex);

      if (colors[time]) {
        const rowColors = colors[time];
        const updatedColors = {};
        for (const idx in rowColors) {
          const i = parseInt(idx);
          if (i < colIndex) updatedColors[i] = rowColors[i];
          if (i > colIndex) updatedColors[i - 1] = rowColors[i];
        }
        newColors[time] = updatedColors;
      }
    }

    setColumns(newCols);
    setSchedule(newSchedule);
    setColors(newColors);

    await fetch('/api/saveSchedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date,
        data: {
          columns: newCols,
          schedule: newSchedule,
          colors: newColors,
        },
      }),
    });

    await fetch('/api/deleteColumnEverywhere', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ colIndex }),
    });
  };

  const handleCreateDate = async () => {
  // Получаем последнюю доступную дату
  const res = await fetch('/api/listDates');
  const allDates = await res.json();

  let baseDate = new Date();
  if (allDates.length > 0) {
    baseDate = new Date(allDates[allDates.length - 1]);
  }

  // +1 день от последней даты
  const nextDate = new Date(baseDate);
  nextDate.setDate(baseDate.getDate() + 1);
  const defaultDate = nextDate.toISOString().split('T')[0];

  const newDate = prompt("Введите дату в формате YYYY-MM-DD", defaultDate);
  if (!newDate) return;

  // Получаем колонки из последней доступной даты
  let clonedColumns = [];
  if (allDates.length > 0) {
    const lastDate = allDates[allDates.length - 1];
    const r = await fetch(`/api/loadSchedule?date=${lastDate}`);
    const j = await r.json();
    clonedColumns = j.columns || [];
  }

  // Гарантия: если колонок нет, создаём хотя бы одну
  if (clonedColumns.length === 0) {
    clonedColumns = ['Заметка 1'];
  }

  const emptySchedule = {};
  for (let hour = 9; hour <= 23; hour += 2) {
    const time = hour.toString().padStart(2, '0') + ':00';
    emptySchedule[time] = Array(clonedColumns.length).fill('');
  }

  await fetch('/api/saveSchedule', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      date: newDate,
      data: {
        columns: clonedColumns,
        schedule: emptySchedule,
        colors: {},
      },
    }),
  });

  router.push('/' + newDate);
};


  const times = Array.from({ length: 5 }, (_, i) => {
  const start = 9 + i * 2;
  const end = start + 2;
  return `${start.toString().padStart(2, '0')}:00 ${end.toString().padStart(2, '0')}:00`;
});

  const colorOptions = ["", "#f88f97", "#80cedb", "#57e077",];
  
  return (
    <div>
      <Button variant="custom" onClick={handleAddColumn}>➕ Добавить столбец</Button>
      <Button variant="custom" onClick={handleCreateDate} style={{ marginLeft: '10px' }}>📅 Создать дату</Button>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Время</th>
              {columns.map((col, colIdx) => (
                <th key={colIdx} style={{ minWidth: '150px', position: 'relative' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    width: '100%',
                    padding: '4px 8px 4px 8px'
                  }}>
                    {columns[colIdx]}
                    <Button
                      variant="custom"
                      onClick={() => handleDeleteColumn(colIdx)}
                      style={{
                        position: 'absolute',
                        right: '0px',
                        top: '51%',
                        transform: 'translateY(-50%)',
                        border: 'none',
                        fontSize: '12px',
                        cursor: 'pointer',
                        padding: '2px 5px',
                      }}
                    >
                      ✕
                    </Button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {times.map((time) => (
              <tr key={time}>
                <td style={{ fontWeight: 'bold', textAlign: 'center' }}>{time}</td>
                {columns.map((_, colIdx) => {
                  const bgColor = colors[time]?.[colIdx] || '';
                  return (
                    <td key={colIdx} style={{ position: 'relative' }}>
                      <TextAreaCell
                        value={schedule[time]?.[colIdx] || ''}
                        onChange={(e) => handleChange(time, colIdx, e.target.value)}
                        color={bgColor}
                        syncTrigger={syncTrigger}
                      />
                      <select
                        className='glass-select'
                        value={bgColor}
                        onChange={(e) => handleColorChange(time, colIdx, e.target.value)}
                      >
                        <option value="">🎨</option>
                        {colorOptions.map((c) => (
                          <option key={c} value={c} style={{ backgroundColor: c }}>
                            
                          </option>
                        ))}
                      </select>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <div className="dataBlock">
  {existingDates.map((d) => {
    const isActive = d === date;

    return (
      <Button
        variant={isActive ? "customactive" : "custom"} // или "custom" если у вас свой стиль
        className={`buttonDate ${isActive ? "active-date" : ""}`}
        key={d}
        onClick={() => router.push('/' + d)}
        style={{ marginRight: '10px' }}
      >
        {formatDate(d)}
      </Button>
    );
  })}
</div>
      </div>
    </div>
  );
}
