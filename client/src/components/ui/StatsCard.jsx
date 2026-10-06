import React, { useEffect, useState } from 'react';
import { useSettingsStore } from '../../store/useSettingsStore';

export default function StatsCard({ icon: Icon, label, value, suffix = '', duration = 1.5, deltaHint }) {
  const { reduceMotion } = useSettingsStore();
  const [count, setCount] = useState(0);

  const isZeroState = value === 0 || value === '0' || value === '0m' || value === '0%';

  useEffect(() => {
    const parsedValue = parseFloat(String(value).replace(/[^0-9.]/g, ''));
    if (isNaN(parsedValue) || reduceMotion) {
      setCount(value);
      return;
    }

    const isFloat = String(value).includes('.');
    let startTimestamp = null;
    const startValue = 0;
    const endValue = parsedValue;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      
      const easeOutQuad = progress * (2 - progress);
      const currentVal = startValue + easeOutQuad * (endValue - startValue);

      if (isFloat) {
        setCount(Number(currentVal.toFixed(1)));
      } else {
        setCount(Math.floor(currentVal));
      }

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(value);
      }
    };

    window.requestAnimationFrame(step);
  }, [value, duration, reduceMotion]);

  const displayValue = typeof count === 'number' ? count.toLocaleString() : count;

  return (
    <div className="bg-bg-raised border border-border-subtle hover:border-border-default rounded-2xl p-5 flex flex-col justify-between h-full relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 shadow-xl">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-accent-dim rounded-full blur-2xl pointer-events-none" />
      
      <div>
        {/* Top: Icon top-left */}
        {Icon && (
          <div className="w-9 h-9 bg-accent-dim text-accent rounded-xl border border-border-subtle flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4" />
          </div>
        )}

        {/* Eyebrow Label */}
        <p className="font-mono text-[11px] tracking-[0.08em] uppercase text-text-tertiary mt-3 font-semibold">
          {label}
        </p>

        {/* Large 40px Number */}
        <h3 className={`text-[40px] font-semibold tracking-tight leading-none mt-2 font-display ${isZeroState ? 'text-text-secondary' : 'text-text-primary'}`}>
          {displayValue}{suffix}
        </h3>
      </div>

      {/* Delta chip or Zero-state hint */}
      <div className="mt-4 pt-3 border-t border-border-subtle/50 flex items-center justify-between text-[11px] font-medium">
        {isZeroState ? (
          <span className="text-text-tertiary">Start a class to track progress</span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-teal-dim text-accent-teal font-mono text-[10px] font-bold">
            {deltaHint || 'Live Class'}
          </span>
        )}
      </div>
    </div>
  );
}
