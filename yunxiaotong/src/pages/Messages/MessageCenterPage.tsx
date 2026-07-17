import React, { useState } from 'react';
import { mockMessages } from '../../mock';
import { MessageType } from '../../types';
import EmptyState from '../../components/EmptyState';

const typeLabels: Record<MessageType | 'ALL', string> = {
  ALL: '全部',
  ORDER_STATUS: '订单通知',
  AFTER_SALE: '售后通知',
  PROMOTION: '促销活动',
  SYSTEM: '系统公告',
  CUSTOMER_SERVICE: '客服消息',
  RECONCILIATION: '对账提醒',
};

const typeIcons: Record<MessageType, string> = {
  ORDER_STATUS: '📦',
  AFTER_SALE: '🔄',
  PROMOTION: '🎉',
  SYSTEM: '📢',
  CUSTOMER_SERVICE: '💬',
  RECONCILIATION: '📄',
};

export default function MessageCenterPage() {
  const [activeType, setActiveType] = useState<MessageType | 'ALL'>('ALL');
  const [messages, setMessages] = useState(mockMessages);

  const filteredMessages = activeType === 'ALL'
    ? messages
    : messages.filter((m) => m.type === activeType);

  const unreadCount = messages.filter((m) => !m.isRead).length;

  const markAllRead = () => {
    setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
  };

  const markRead = (id: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.messageId === id ? { ...m, isRead: true } : m))
    );
  };

  const typeCounts = (type: MessageType | 'ALL') => {
    return type === 'ALL'
      ? messages.filter((m) => !m.isRead).length
      : messages.filter((m) => m.type === type && !m.isRead).length;
  };

  return (
    <div className="container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="page-title">消息中心</h2>
          <p className="page-subtitle">
            共 {messages.length} 条消息，{unreadCount} 条未读
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={markAllRead}>全部已读</button>
        </div>
      </div>

      {/* Type tabs */}
      <div className="tabs">
        {(['ALL', 'ORDER_STATUS', 'AFTER_SALE', 'PROMOTION', 'SYSTEM', 'CUSTOMER_SERVICE', 'RECONCILIATION'] as const).map((type) => (
          <button
            key={type}
            className={`tab-item ${activeType === type ? 'active' : ''}`}
            onClick={() => setActiveType(type)}
          >
            {typeLabels[type]}
            {typeCounts(type) > 0 && <span className="tab-count">{typeCounts(type)}</span>}
          </button>
        ))}
      </div>

      {/* Message list */}
      {filteredMessages.length > 0 ? (
        <div className="message-list">
          {filteredMessages.map((msg) => (
            <div
              key={msg.messageId}
              className={`message-item ${msg.isRead ? '' : 'unread'}`}
              onClick={() => markRead(msg.messageId)}
            >
              {!msg.isRead && <div className="message-dot" />}
              <span style={{ fontSize: 24, flexShrink: 0 }}>{typeIcons[msg.type] || '📌'}</span>
              <div className="message-content">
                <div className="message-title">
                  <span className="message-title-text">{msg.title}</span>
                  <span className="message-time">{msg.createTime}</span>
                </div>
                <div className="message-preview">{msg.content}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon="📭" text="暂无消息" />
      )}
    </div>
  );
}
