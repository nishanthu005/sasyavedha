import React, { useEffect, useMemo, useState } from 'react';
import { FiEdit2, FiSave, FiShield, FiUserX, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { getUsers, updateUserAccess } from '../context/api';

const roles = ['owner', 'admin', 'manager', 'supervisor', 'user'];

export default function TeamManagement() {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [editingMember, setEditingMember] = useState(null);
  const [form, setForm] = useState({ role: 'user', is_active: true });
  const [message, setMessage] = useState('');
  const canManage = ['owner', 'admin'].includes(user?.role);
  const isAdmin = user?.role === 'admin';

  const loadMembers = async () => {
    try {
      const response = await getUsers();
      setMembers(response.data.users);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to load team members.');
    }
  };

  useEffect(() => { if (canManage) loadMembers(); }, [canManage]);

  const stats = useMemo(() => ({
    total: members.length,
    active: members.filter(member => member.is_active).length,
    admins: members.filter(member => member.role === 'admin').length,
    managers: members.filter(member => member.role === 'manager').length,
  }), [members]);

  const openEdit = (member) => {
    setEditingMember(member);
    setForm({ role: member.role, is_active: member.is_active });
    setMessage('');
  };

  const saveMember = async (event) => {
    event.preventDefault();
    try {
      const response = await updateUserAccess(editingMember.id, form);
      setMembers(prev => prev.map(member => member.id === editingMember.id ? response.data.user : member));
      setEditingMember(null);
      setMessage(`${response.data.user.username}'s access was updated.`);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to update user access.');
    }
  };

  if (!canManage) {
    return <RestrictedPage title="Team Management" user={user} />;
  }

  const editableRoles = isAdmin ? roles : ['manager', 'supervisor', 'user'];
  const ownerRestricted = !isAdmin && editingMember && ['owner', 'admin'].includes(editingMember.role);

  return (
    <div className="fade-in">
      <div className="page-header"><div><div className="page-title">Team Management</div><div className="page-sub">Manage member roles and account access</div></div></div>
      {message && <div className="soft-row mb-20" style={{ borderColor: 'var(--cyan)' }}>{message}</div>}
      <div className="grid-4">
        <div className="card"><div className="stat-value">{stats.total}</div><div className="stat-label">Total Members</div></div>
        <div className="card"><div className="stat-value" style={{ color: 'var(--green)' }}>{stats.active}</div><div className="stat-label">Active Members</div></div>
        <div className="card"><div className="stat-value" style={{ color: 'var(--blue)' }}>{stats.admins}</div><div className="stat-label">Admins</div></div>
        <div className="card"><div className="stat-value" style={{ color: 'var(--purple)' }}>{stats.managers}</div><div className="stat-label">Managers</div></div>
      </div>
      <div className="card"><div className="section-title">Team Members</div><div style={{ display: 'grid', gap: '12px' }}>
        {members.map(member => <div key={member.id} className="soft-row" style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'center' }}>
          <div><div style={{ fontWeight: 800, marginBottom: '4px' }}>{member.username}</div><div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{member.email} / {member.role}</div><div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '4px' }}>Joined {member.created_at.slice(0, 10)}</div></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><span className={`status-pill ${member.is_active ? 'status-success' : 'status-danger'}`}>{member.is_active ? 'Active' : 'Inactive'}</span><button className="btn btn-secondary" onClick={() => openEdit(member)}><FiEdit2 /> Edit access</button></div>
        </div>)}
      </div></div>
      {editingMember && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.62)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}><form className="card" onSubmit={saveMember} style={{ maxWidth: '500px', width: '92%' }}>
        <div className="section-title">Edit {editingMember.username}</div>
        {ownerRestricted ? <div className="soft-row">Only an admin can change owner or admin access.</div> : <div style={{ display: 'grid', gap: '12px' }}><div><label>Role</label><select className="select" value={form.role} onChange={e => setForm(prev => ({ ...prev, role: e.target.value }))}>{editableRoles.map(role => <option key={role} value={role}>{role[0].toUpperCase() + role.slice(1)}</option>)}</select></div><label className="soft-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textTransform: 'none' }}><span><FiUserX /> Account status</span><select className="select" value={String(form.is_active)} onChange={e => setForm(prev => ({ ...prev, is_active: e.target.value === 'true' }))}><option value="true">Active</option><option value="false">Inactive</option></select></label></div>}
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}><button type="button" className="btn btn-secondary" onClick={() => setEditingMember(null)}><FiX /> Cancel</button>{!ownerRestricted && <button type="submit" className="btn btn-blue"><FiSave /> Save access</button>}</div>
      </form></div>}
    </div>
  );
}

export function RestrictedPage({ title, user }) {
  return <div className="fade-in"><div className="page-header"><div><div className="page-title">{title}</div><div className="page-sub">Owner or administrator access is required</div></div></div><div className="card" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}><FiShield size={28} color="var(--orange)" /><div><div style={{ fontWeight: 800, marginBottom: '4px' }}>Restricted workspace area</div><div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Your current role is {user?.role || 'user'}.</div></div></div></div>;
}
