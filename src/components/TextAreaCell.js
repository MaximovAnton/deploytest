import { useEffect, useRef } from 'react';

export default function TextAreaCell({ value, onChange, color, syncTrigger }) {
  const ref = useRef();

  const syncRowHeight = () => {
    const textarea = ref.current;
    if (!textarea) return;

    const tr = textarea.closest('tr');
    if (!tr) return;

    const allTextareas = Array.from(tr.querySelectorAll('textarea'));

    // Шаг 1 — сброс высоты, чтобы scrollHeight был реальным
    allTextareas.forEach((t) => {
      t.style.height = 'auto';
    });

    // Шаг 2 — найти максимальный scrollHeight
    const maxHeight = Math.max(...allTextareas.map((t) => t.scrollHeight));
    console.log(maxHeight);
    // Шаг 3 — задать одинаковую высоту
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
        backgroundColor: color || 'white',
      }}
    />
  );
}
