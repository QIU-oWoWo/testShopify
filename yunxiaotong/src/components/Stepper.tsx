import React from 'react';

interface Props {
  value: number;
  min?: number;
  max?: number;
  onChange: (val: number) => void;
}

export default function Stepper({ value, min = 1, max = 9999, onChange }: Props) {
  return (
    <div className="stepper">
      <button
        className="stepper-btn"
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        −
      </button>
      <input
        className="stepper-input"
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => {
          const v = parseInt(e.target.value) || min;
          onChange(Math.max(min, Math.min(max, v)));
        }}
      />
      <button
        className="stepper-btn"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
      >
        +
      </button>
    </div>
  );
}
