import { useState, useRef } from "react";

export function useDraggableList(initial = []) {
  const [items, setItems] = useState(initial);
  const dragIdx = useRef(null);

  const onDragStart = (i) => { dragIdx.current = i; };

  const onDragOver = (e, i) => {
    e.preventDefault();
    if (dragIdx.current === null || dragIdx.current === i) return;
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIdx.current, 1);
      next.splice(i, 0, moved);
      dragIdx.current = i;
      return next;
    });
  };

  const onDragEnd = () => { dragIdx.current = null; };

  const removeItem = (i) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  return { items, setItems, onDragStart, onDragOver, onDragEnd, removeItem };
}
