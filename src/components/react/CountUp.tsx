import { useEffect, useRef } from 'react';
import { animate, useInView, useReducedMotion } from 'motion/react';

// Counts from 0 to `value` the first time the number scrolls into view.
export default function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-10% 0px' });
  const reduce = useReducedMotion();
  const target = parseFloat(value);
  const decimals = value.includes('.') ? value.split('.')[1].length : 0;

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView || reduce || Number.isNaN(target)) return;
    const c = animate(0, target, {
      duration: 1.6,
      ease: [0.2, 0.7, 0.2, 1],
      onUpdate: (v) => (el.textContent = v.toFixed(decimals)),
    });
    return () => c.stop();
  }, [inView, reduce, target, decimals]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
