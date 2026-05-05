import { useState } from 'react';
import { toast } from 'react-toastify';
import { User, Lock, Save } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import styles from './Profile.module.css';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', profile);
      updateUser(data.user);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    setSaving(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success('Password changed');
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.avatar}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className={styles.name}>{user?.name}</h1>
            <p className={styles.email}>{user?.email}</p>
            <span className={styles.role}>{user?.role}</span>
          </div>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${tab === 'profile' ? styles.activeTab : ''}`}
            onClick={() => setTab('profile')}
          >
            <User size={15} /> Profile
          </button>
          <button
            className={`${styles.tab} ${tab === 'password' ? styles.activeTab : ''}`}
            onClick={() => setTab('password')}
          >
            <Lock size={15} /> Security
          </button>
        </div>

        <div className={styles.content}>
          {tab === 'profile' && (
            <form onSubmit={handleProfileSave} className={styles.form}>
              <h2 className={styles.formTitle}>Personal Information</h2>
              <div className={styles.field}>
                <label className={styles.label}>Full name</label>
                <input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className={styles.input}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <input value={user?.email} disabled className={`${styles.input} ${styles.disabledInput}`} />
                <p className={styles.hint}>Email cannot be changed</p>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Phone</label>
                <input
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className={styles.input}
                />
              </div>
              <button type="submit" disabled={saving} className={styles.saveBtn}>
                <Save size={15} />
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </form>
          )}

          {tab === 'password' && (
            <form onSubmit={handlePasswordSave} className={styles.form}>
              <h2 className={styles.formTitle}>Change Password</h2>
              <div className={styles.field}>
                <label className={styles.label}>Current password</label>
                <input
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  className={styles.input}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>New password</label>
                <input
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  className={styles.input}
                  minLength={6}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Confirm new password</label>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  className={styles.input}
                  required
                />
              </div>
              <button type="submit" disabled={saving} className={styles.saveBtn}>
                <Lock size={15} />
                {saving ? 'Saving…' : 'Update password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
