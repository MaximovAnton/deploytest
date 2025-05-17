import { useEffect, useRef } from 'react';

export default function TextAreaCell({ value, onChange, color, syncTrigger }) {
  const ref = useRef();

  const syncRowHeight = () => {
    const textarea = ref.current;
    if (!textarea) return;

    const tr = textarea.closest('tr');
    if (!tr) return;

    const allTextareas = Array.from(tr.querySelectorAll('textarea'));

    // Сброс высоты
    allTextareas.forEach((t) => {
      t.style.height = 'auto';
    });

    // Максимальная высота по всем ячейкам строки
    const maxHeight = Math.max(...allTextareas.map((t) => t.scrollHeight));

    // Установка одинаковой высоты
    allTextareas.forEach((t) => {
      t.style.height = maxHeight + 'px';
    });
  };

  const handleInput = (e) => {
    onChange(e);
    syncRowHeight();
  };

  useEffect(() => {
    const ta = ref.current;
    if (!ta) return;
    ta.addEventListener('mouseup', syncRowHeight);
    return () => ta.removeEventListener('mouseup', syncRowHeight);
  }, []);

  useEffect(() => {
    syncRowHeight();
  }, [syncTrigger]);

  return (
    <textarea
      ref={ref}
      value={value}
      onInput={handleInput}
      style={{
        width: '100%',
        border: 'none',
        fontSize: '14px',
        fontFamily: 'inherit',
        resize: 'none',
        overflow: 'hidden',
        height: '100%',
        boxSizing: 'border-box',
        backgroundColor: color || 'white',
        padding: '5px',
      }}
    />
  );
}
