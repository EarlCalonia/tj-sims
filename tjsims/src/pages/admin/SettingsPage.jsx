import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../../components/admin/Navbar';
import { settingsAPI, usersAPI, authAPI } from '../../utils/api';
import { BsPlusLg, BsEye, BsEyeSlash } from 'react-icons/bs';
import '../../styles/SettingsPage.css';

const SettingsPage = () => {
  // Business Info
  const [storeName, setStoreName] = useState('');
  const [bizAddress, setBizAddress] = useState('');
  const [bizContact, setBizContact] = useState('');
  const [bizEmail, setBizEmail] = useState('');
  const [savingBiz, setSavingBiz] = useState(false);

  // Preferences
  const [cashEnabled, setCashEnabled] = useState(true);
  const [gcashEnabled, setGcashEnabled] = useState(true);
  const [codEnabled, setCodEnabled] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);

  // Users
  const [users, setUsers] = useState([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', email: '', role: 'staff', status: 'Active', password: '', avatarFile: null });
  const [savingUser, setSavingUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [editUser, setEditUser] = useState({ id: null, username: '', role: 'staff', status: 'Active', avatarFile: null });

  // Password management
  const [pwd, setPwd] = useState({ current: '', next: '', confirm: '' });
  const [showPwd, setShowPwd] = useState({ current: false, next: false, confirm: false });
  const [savingPwd, setSavingPwd] = useState(false);

  const isAdmin = useMemo(() => (localStorage.getItem('userRole') === 'admin'), []);
  const userId = useMemo(() => localStorage.getItem('userId'), []);

  useEffect(() => {
    loadSettings();
    loadUsers();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await settingsAPI.get();
      const s = res.data || {};
      setStoreName(s.store_name || '');
      setBizAddress(s.address || '');
      setBizContact(s.contact_number || '');
      setBizEmail(s.email || '');
      setCashEnabled(!!s.cash_enabled);
      setGcashEnabled(!!s.gcash_enabled);
      setCodEnabled(!!s.cod_enabled);
    } catch (e) {
      console.error('Load settings failed:', e);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await usersAPI.list();
      setUsers(res.data || []);
    } catch (e) {
      console.error('Load users failed:', e);
    }
  };

  const saveBusinessInfo = async () => {
    try {
      setSavingBiz(true);
      await settingsAPI.updateBusinessInfo({
        store_name: storeName,
        address: bizAddress,
        contact_number: bizContact,
        email: bizEmail
      });
      alert('Business information saved');
    } catch (e) {
      alert(e.message || 'Failed to save business information');
    } finally {
      setSavingBiz(false);
    }
  };

  const savePreferences = async () => {
    try {
      setSavingPrefs(true);
      await settingsAPI.updatePreferences({
        cash_enabled: cashEnabled,
        gcash_enabled: gcashEnabled,
        cod_enabled: codEnabled
      });
      alert('Preferences saved');
    } catch (e) {
      alert(e.message || 'Failed to save preferences');
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleAddUser = async () => {
    try {
      setSavingUser(true);
      if (!newUser.username || !newUser.email || !newUser.password) {
        alert('Please complete user fields');
        return;
      }
      const fd = new FormData();
      fd.append('username', newUser.username);
      fd.append('email', newUser.email);
      fd.append('password', newUser.password);
      fd.append('role', newUser.role);
      fd.append('status', newUser.status);
      if (newUser.avatarFile) fd.append('avatar', newUser.avatarFile);
      await usersAPI.create(fd);
      setShowAddUser(false);
      setNewUser({ username: '', email: '', role: 'staff', status: 'Active', password: '', avatarFile: null });
      await loadUsers();
    } catch (e) {
      alert(e.message || 'Failed to add user');
    } finally {
      setSavingUser(false);
    }
  };

  const openEdit = (u) => {
    setEditUser({ id: u.id, username: u.username || '', role: u.role || 'staff', status: u.status || 'Active', avatarFile: null });
    setShowEditUser(true);
  };

  const handleUpdateUser = async () => {
    try {
      setSavingUser(true);
      if (!editUser.id) return;
      const fd = new FormData();
      fd.append('username', editUser.username);
      fd.append('role', editUser.role);
      fd.append('status', editUser.status);
      if (editUser.avatarFile) fd.append('avatar', editUser.avatarFile);
      await usersAPI.update(editUser.id, fd);
      setShowEditUser(false);
      await loadUsers();
    } catch (e) {
      alert(e.message || 'Failed to update user');
    } finally {
      setSavingUser(false);
    }
  };

  const saveNewPassword = async () => {
    try {
      setSavingPwd(true);
      if (!pwd.current || !pwd.next || !pwd.confirm) {
        alert('Please fill out all password fields');
        return;
      }
      if (pwd.next !== pwd.confirm) {
        alert('New passwords do not match');
        return;
      }
      await authAPI.changePassword(userId, pwd.current, pwd.next);
      alert('Password updated');
      setPwd({ current: '', next: '', confirm: '' });
    } catch (e) {
      alert(e.message || 'Failed to update password');
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="settings-layout">
      <Navbar />
      <main className="settings-main">
        <div className="settings-container">
          <div className="settings-grid">
            <section className="card">
              <h2>Business Information</h2>
              <p className="section-sub">Update your store details and contact information</p>
              <div className="form-col">
                <label>Store Name</label>
                <input className="text-input" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
              </div>
              <div className="form-col">
                <label>Address</label>
                <input className="text-input" value={bizAddress} onChange={(e) => setBizAddress(e.target.value)} />
              </div>
              <div className="form-col">
                <label>Contact Number</label>
                <input className="text-input" value={bizContact} onChange={(e) => setBizContact(e.target.value)} />
              </div>
              <div className="form-col">
                <label>Email</label>
                <input className="text-input" value={bizEmail} onChange={(e) => setBizEmail(e.target.value)} />
              </div>
              <button className="primary-btn" onClick={saveBusinessInfo} disabled={savingBiz}>
                {savingBiz ? 'Saving...' : 'Save Business Information'}
              </button>
            </section>

            <section className="card">
              <div className="card-head">
                <h2>User Management</h2>
                {isAdmin && (
                  <button className="outline-btn" onClick={() => setShowAddUser(true)}>
                    <BsPlusLg /> Add User
                  </button>
                )}
              </div>
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>{u.username}</td>
                      <td><span className={`badge role-${(u.role||'').toLowerCase()}`}>{u.role}</span></td>
                      <td><span className={`badge status-${(u.status||'').toLowerCase()}`}>{u.status}</span></td>
                      <td>
                        <button className="outline-btn" onClick={() => openEdit(u)}>Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section className="card">
              <h2>System Preferences</h2>
              <p className="section-sub">Configure payments, and shipping options</p>
              <div className="switch-row">
                <label>Cash Payment</label>
                <input type="checkbox" checked={cashEnabled} onChange={(e) => setCashEnabled(e.target.checked)} />
              </div>
              <div className="switch-row">
                <label>GCash Payment</label>
                <input type="checkbox" checked={gcashEnabled} onChange={(e) => setGcashEnabled(e.target.checked)} />
              </div>
              <div className="switch-row">
                <label>Cash On Delivery</label>
                <input type="checkbox" checked={codEnabled} onChange={(e) => setCodEnabled(e.target.checked)} />
              </div>
              <button className="primary-btn" onClick={savePreferences} disabled={savingPrefs}>
                {savingPrefs ? 'Saving...' : 'Save Preferences'}
              </button>
            </section>

            <section className="card">
              <h2>Password Management</h2>
              <p className="section-sub">Update your account password for security</p>
              <div className="form-col">
                <label>Current Password</label>
                <div className="password-input">
                  <input type={showPwd.current ? 'text' : 'password'} placeholder="Enter your current password" value={pwd.current} onChange={(e)=>setPwd({...pwd, current: e.target.value})} />
                  <button type="button" onClick={()=>setShowPwd({...showPwd, current: !showPwd.current})}>{showPwd.current ? <BsEyeSlash/> : <BsEye/>}</button>
                </div>
              </div>
              <div className="form-col">
                <label>New Password</label>
                <div className="password-input">
                  <input type={showPwd.next ? 'text' : 'password'} placeholder="Enter your new password" value={pwd.next} onChange={(e)=>setPwd({...pwd, next: e.target.value})} />
                  <button type="button" onClick={()=>setShowPwd({...showPwd, next: !showPwd.next})}>{showPwd.next ? <BsEyeSlash/> : <BsEye/>}</button>
                </div>
              </div>
              <div className="form-col">
                <label>Confirm New Password</label>
                <div className="password-input">
                  <input type={showPwd.confirm ? 'text' : 'password'} placeholder="Confirm your new password" value={pwd.confirm} onChange={(e)=>setPwd({...pwd, confirm: e.target.value})} />
                  <button type="button" onClick={()=>setShowPwd({...showPwd, confirm: !showPwd.confirm})}>{showPwd.confirm ? <BsEyeSlash/> : <BsEye/>}</button>
                </div>
              </div>
              <button className="primary-btn" onClick={saveNewPassword} disabled={savingPwd}>
                {savingPwd ? 'Saving...' : 'Save New Password'}
              </button>
            </section>
          </div>
        </div>
      </main>

      {showAddUser && (
        <div className="modal-overlay" onClick={()=>setShowAddUser(false)}>
          <div className="modal-content" onClick={(e)=>e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add User</h3>
              <button onClick={()=>setShowAddUser(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-col">
                <label>Name</label>
                <input className="text-input" value={newUser.username} onChange={(e)=>setNewUser({...newUser, username: e.target.value})} />
              </div>
              <div className="form-col">
                <label>Email</label>
                <input className="text-input" value={newUser.email} onChange={(e)=>setNewUser({...newUser, email: e.target.value})} />
              </div>
              <div className="form-col">
                <label>Password</label>
                <input className="text-input" type="password" value={newUser.password} onChange={(e)=>setNewUser({...newUser, password: e.target.value})} />
              </div>
              <div className="form-col">
                <label>Avatar</label>
                <input className="text-input" type="file" accept="image/*" onChange={(e)=>setNewUser({...newUser, avatarFile: e.target.files?.[0] || null})} />
              </div>
              <div className="form-col">
                <label>Role</label>
                <select className="text-input" value={newUser.role} onChange={(e)=>setNewUser({...newUser, role: e.target.value})}>
                  <option value="admin">Admin</option>
                  <option value="driver">Driver</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
              <div className="form-col">
                <label>Status</label>
                <select className="text-input" value={newUser.status} onChange={(e)=>setNewUser({...newUser, status: e.target.value})}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="outline-btn" onClick={()=>setShowAddUser(false)}>Cancel</button>
              <button className="primary-btn" onClick={handleAddUser} disabled={savingUser}>{savingUser ? 'Saving...' : 'Add User'}</button>
            </div>
          </div>
        </div>
      )}

      {showEditUser && (
        <div className="modal-overlay" onClick={()=>setShowEditUser(false)}>
          <div className="modal-content" onClick={(e)=>e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit User</h3>
              <button onClick={()=>setShowEditUser(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-col">
                <label>Name</label>
                <input className="text-input" value={editUser.username} onChange={(e)=>setEditUser({...editUser, username: e.target.value})} />
              </div>
              <div className="form-col">
                <label>Role</label>
                <select className="text-input" value={editUser.role} onChange={(e)=>setEditUser({...editUser, role: e.target.value})}>
                  <option value="admin">Admin</option>
                  <option value="driver">Driver</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
              <div className="form-col">
                <label>Status</label>
                <select className="text-input" value={editUser.status} onChange={(e)=>setEditUser({...editUser, status: e.target.value})}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="form-col">
                <label>Avatar</label>
                <input className="text-input" type="file" accept="image/*" onChange={(e)=>setEditUser({...editUser, avatarFile: e.target.files?.[0] || null})} />
              </div>
            </div>
            <div className="modal-actions">
              <button className="outline-btn" onClick={()=>setShowEditUser(false)}>Cancel</button>
              <button className="primary-btn" onClick={handleUpdateUser} disabled={savingUser}>{savingUser ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
