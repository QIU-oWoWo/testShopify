import React from 'react';
import { LogisticsNode } from '../types';

interface Props {
  nodes: LogisticsNode[];
  currentIndex?: number;
}

export default function LogisticsTimeline({ nodes, currentIndex = 0 }: Props) {
  return (
    <div className="timeline">
      {nodes.map((node, i) => (
        <div
          key={i}
          className={`timeline-item ${i === currentIndex ? 'active' : ''} ${
            node.status.includes('异常') ? 'error' : ''
          }`}
        >
          <div className="timeline-dot" />
          <div className="timeline-time">{node.time}</div>
          <div className="timeline-desc">
            {node.status === '异常' && '⚠️ '}
            {node.description}
          </div>
          <div className="timeline-location">📍 {node.location}</div>
        </div>
      ))}
    </div>
  );
}
