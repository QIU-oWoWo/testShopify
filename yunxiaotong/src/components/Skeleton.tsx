import React from 'react';

interface Props {
  width?: number | string;
  height?: number;
  count?: number;
  style?: React.CSSProperties;
}

export default function Skeleton({ width = '100%', height = 16, count = 1, style }: Props) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="skeleton"
          style={{
            width: typeof width === 'number' ? `${width}px` : width,
            height: `${height}px`,
            marginBottom: count > 1 && i < count - 1 ? 8 : 0,
            ...style,
          }}
        />
      ))}
    </>
  );
}
