import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';
import { useApp } from '../../store/AppContext';
import Modal from '../../components/Modal';
import { AddressVO } from '../../types';

export default function AddressManagePage() {
  const { user, updateUser } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();
  const [showAdd, setShowAdd] = useState(false);
  const [editingAddr, setEditingAddr] = useState<AddressVO | null>(null);

  if (!user) { navigate('/login'); return null; }

  const addresses = user.addresses;

  const setDefault = (addrId: string) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.addressId === addrId,
    }));
    updateUser({ addresses: updated });
    showToast('success', '已更新默认地址');
  };

  const deleteAddress = (addrId: string) => {
    if (!window.confirm('确定要删除该地址吗？')) return;
    updateUser({
      addresses: addresses.filter((a) => a.addressId !== addrId),
    });
    showToast('success', '地址已删除');
  };

  return (
    <div className="container">
      <div style={{ marginBottom: 16, fontSize: 13, color: '#8c8c8c' }}>
        <span style={{ cursor: 'pointer' }} onClick={() => navigate('/profile')}>个人中心</span>
        {' > '}
        <span style={{ color: '#1f1f1f' }}>收货地址簿</span>
      </div>

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2 className="page-title">📍 收货地址簿</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>
          + 新增地址
        </button>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {addresses.map((addr) => (
          <div key={addr.addressId} className="card" style={{
            border: addr.isDefault ? '2px solid #ff6600' : undefined,
            background: addr.isDefault ? '#fff3e8' : undefined,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  {addr.name} {addr.phone}
                  {addr.isDefault && <span className="badge badge-primary" style={{ marginLeft: 8 }}>默认</span>}
                  {addr.label && <span className="tag" style={{ marginLeft: 4 }}>{addr.label}</span>}
                </div>
                <div style={{ fontSize: 14, color: '#8c8c8c' }}>
                  {addr.province}{addr.city}{addr.district} {addr.detail}
                </div>
                {addr.storeCode && (
                  <div style={{ fontSize: 12, color: '#bfbfbf', marginTop: 2 }}>
                    门店编号：{addr.storeCode}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {!addr.isDefault && (
                  <button className="btn btn-outline btn-sm" onClick={() => setDefault(addr.addressId)}>
                    设为默认
                  </button>
                )}
                <button className="btn btn-ghost btn-sm" onClick={() => {
                  setEditingAddr(addr);
                  setShowAdd(true);
                }}>
                  编辑
                </button>
                {!addr.isDefault && addresses.length > 1 && (
                  <button className="btn btn-ghost btn-sm" style={{ color: '#ff4d4f' }} onClick={() => deleteAddress(addr.addressId)}>
                    删除
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {addresses.length >= 20 && (
        <div style={{ marginTop: 12, fontSize: 13, color: '#faad14' }}>
          ⚠️ 地址已达上限（20个）
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        open={showAdd}
        title={editingAddr ? '编辑地址' : '新增地址'}
        onClose={() => { setShowAdd(false); setEditingAddr(null); }}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => { setShowAdd(false); setEditingAddr(null); }}>取消</button>
            <button className="btn btn-primary" onClick={() => {
              showToast('success', editingAddr ? '地址已更新' : '地址已添加');
              setShowAdd(false);
              setEditingAddr(null);
            }}>保存</button>
          </>
        }
      >
        <div className="form-row">
          <div className="form-group">
            <label className="form-label"><span className="required">*</span>收件人姓名</label>
            <input className="form-input" defaultValue={editingAddr?.name || ''} />
          </div>
          <div className="form-group">
            <label className="form-label"><span className="required">*</span>联系电话</label>
            <input className="form-input" defaultValue={editingAddr?.phone || ''} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label"><span className="required">*</span>省/市/区</label>
          <div className="form-row">
            <select className="form-select"><option>请选择省</option></select>
            <select className="form-select"><option>请选择市</option></select>
            <select className="form-select"><option>请选择区</option></select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label"><span className="required">*</span>详细地址</label>
          <input className="form-input" placeholder="街道/门牌号" defaultValue={editingAddr?.detail || ''} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">门店编号</label>
            <input className="form-input" defaultValue={editingAddr?.storeCode || ''} />
          </div>
          <div className="form-group">
            <label className="form-label">地址标签</label>
            <select className="form-select" defaultValue={editingAddr?.label || ''}>
              <option value="">无</option>
              <option value="总仓">总仓</option>
              <option value="分店A">分店A</option>
              <option value="维修车间">维修车间</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
