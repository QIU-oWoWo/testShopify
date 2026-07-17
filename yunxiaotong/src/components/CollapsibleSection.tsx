import React, { useState, ReactNode } from 'react';

interface Props {
  title: string;
  icon?: string;
  badge?: ReactNode;
  summary: string;
  defaultExpanded?: boolean;
  children: ReactNode;
}

export default function CollapsibleSection({ title, icon, badge, summary, defaultExpanded = true, children }: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div style={{
      background: '#fff', borderRadius: 8, marginBottom: 16,
      border: '1px solid #f0f0f0', overflow: 'hidden',
    }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 20px', cursor: 'pointer', userSelect: 'none',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#fafafa')}
        onMouseLeave={(e) => (e.currentTarget.style.background = '')}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {icon && <span style={{ fontSize: 16, color: '#ff6600' }}>{icon}</span>}
          <span style={{ fontSize: 15, fontWeight: 600 }}>{title}</span>
          {badge}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: '#8c8c8c' }}>{summary}</span>
          <span style={{ fontSize: 12, color: '#bfbfbf', transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : undefined }}>
            ▼
          </span>
        </div>
      </div>
      {expanded && (
        <div style={{ borderTop: '1px solid #f0f0f0', padding: expanded ? 20 : 0 }}>
          {children}
        </div>
      )}
    </div>
  );
}
