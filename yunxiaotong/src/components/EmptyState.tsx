import React from 'react';

interface Props {
  icon?: string;
  text: string;
  actionText?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon = '📭', text, actionText, onAction }: Props) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <div className="empty-text">{text}</div>
      {actionText && onAction && (
        <button className="btn btn-primary" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
}
