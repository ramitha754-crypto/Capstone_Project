import React, { useEffect, useState } from 'react';
import { Users, Search, RefreshCw, Shield, Mail, UserPlus, X, Check } from 'lucide-react';

interface User {
  id: string;
  username: string;
  name: string;
  role: string;
  title: string;
  avatar: string;
  email: string;
  permissions: string[];
}

interface EditUserForm {
  name: string;
  title: string;
  role: string;
  email: string;
  avatar: string;
  permissions: string;
  password: string;
}

interface AddUserForm {
  name: string;
  username: string;
  title: string;
  role: string;
  email: string;
  avatar: string;
  permissions: string;
  password: string;
}

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Edit user state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<EditUserForm>({
    name: '',
    title: '',
    role: 'SUPPORT_SPECIALIST',
    email: '',
    avatar: '',
    permissions: '',
    password: '',
  });
  const [editError, setEditError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Add user state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState<AddUserForm>({
    name: '',
    username: '',
    title: '',
    role: 'CUSTOMER_REP',
    email: '',
    avatar: '',
    permissions: 'CREATE_FEEDBACK, SUBMIT_FEEDBACK, VIEW_OWN_FEEDBACK',
    password: '',
  });
  const [addError, setAddError] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const roleOptions = [
    'SUPPORT_SPECIALIST',
    'PRODUCT_MANAGER',
    'ENGINEERING_LEAD',
    'ENTERPRISE_ADMIN',
    'CUSTOMER_REP'
  ];

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/users', { 
        credentials: 'include',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setEditForm({
      name: user.name,
      title: user.title || '',
      role: user.role,
      email: user.email || '',
      avatar: user.avatar || '',
      permissions: (user.permissions || []).join(', '),
      password: '',
    });
    setEditError('');
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setEditForm({
      name: '',
      title: '',
      role: 'SUPPORT_SPECIALIST',
      email: '',
      avatar: '',
      permissions: '',
      password: '',
    });
    setEditError('');
  };

  const handleEditInput = (field: keyof EditUserForm, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddInput = (field: keyof AddUserForm, value: string) => {
    setAddForm((prev) => {
      const updated = { ...prev, [field]: value };
      // Auto-set default permissions when role changes
      if (field === 'role') {
        if (value === 'CUSTOMER_REP') {
          updated.permissions = 'CREATE_FEEDBACK, SUBMIT_FEEDBACK, VIEW_OWN_FEEDBACK';
          if (!updated.title) updated.title = 'Customer Representative';
        } else if (value === 'SUPPORT_SPECIALIST') {
          updated.permissions = 'CREATE_FEEDBACK, COMMENT_FEEDBACK';
        } else if (value === 'PRODUCT_MANAGER') {
          updated.permissions = 'ENCAPSULATE_FEEDBACK, TRANSITION_WORKFLOW, VIEW_ANALYTICS, ASSIGN_EPIC';
        } else if (value === 'ENGINEERING_LEAD') {
          updated.permissions = 'VIEW_ENCAPSULATIONS, COMMENT_FEEDBACK, ASSIGN_EPIC';
        }
      }
      return updated;
    });
  };

  const saveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const trimmedName = editForm.name.trim();
    if (!trimmedName) {
      setEditError('Name is required.');
      return;
    }

    const permissions = editForm.permissions
      .split(',')
      .map((permission) => permission.trim())
      .filter(Boolean);

    if (editForm.password && editForm.password.length > 0) {
      const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{16,}$/;
      if (!passwordPattern.test(editForm.password)) {
        setEditError('Password must be at least 16 characters and include upper/lowercase letters plus one special character.');
        return;
      }
    }

    setIsSaving(true);
    setEditError('');

    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: trimmedName,
          title: editForm.title.trim(),
          role: editForm.role,
          email: editForm.email.trim(),
          avatar: editForm.avatar.trim(),
          permissions,
          password: editForm.password || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save user');
      }

      setUsers((prevUsers) => prevUsers.map((user) => user.id === data.id ? data : user));
      closeEditModal();
    } catch (error: any) {
      setEditError(error.message || 'Failed to save user');
    } finally {
      setIsSaving(false);
    }
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = addForm.name.trim();
    const trimmedUsername = addForm.username.trim().toLowerCase();

    if (!trimmedName || !trimmedUsername || !addForm.password) {
      setAddError('Name, username, and password are required.');
      return;
    }

    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{16,}$/;
    if (!passwordPattern.test(addForm.password)) {
      setAddError('Password must be at least 16 characters and include upper/lowercase letters plus one special character.');
      return;
    }

    const permissions = addForm.permissions
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);

    let avatar = addForm.avatar.trim();
    if (!avatar) {
      const parts = trimmedName.split(/\s+/);
      avatar = parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : trimmedName.substring(0, 2).toUpperCase();
    }

    setIsAdding(true);
    setAddError('');

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: trimmedName,
          username: trimmedUsername,
          title: addForm.title.trim() || undefined,
          role: addForm.role,
          email: addForm.email.trim() || undefined,
          avatar,
          permissions,
          password: addForm.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      setUsers((prev) => [data, ...prev]);
      setIsAddModalOpen(false);
      setAddForm({
        name: '',
        username: '',
        title: '',
        role: 'CUSTOMER_REP',
        email: '',
        avatar: '',
        permissions: 'CREATE_FEEDBACK, SUBMIT_FEEDBACK, VIEW_OWN_FEEDBACK',
        password: '',
      });
    } catch (error: any) {
      setAddError(error.message || 'Failed to create user');
    } finally {
      setIsAdding(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users size={24} />
            <span>User Management</span>
            <span className="badge" style={{ backgroundColor: 'var(--bg-card-active)', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
              {users.length} Users
            </span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>
            Manage enterprise identities, customer representatives, and role-based permissions.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline" onClick={fetchUsers} disabled={isLoading}>
            <RefreshCw size={16} className={isLoading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>

          <button className="btn btn-primary" onClick={() => setIsAddModalOpen(true)}>
            <UserPlus size={16} />
            <span>Add User</span>
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '20px' }}>
        {/* Search */}
        <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="input" 
              placeholder="Search users by name, username, email, role..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
          </div>
        </div>

        {/* Add User Modal */}
        {isAddModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            padding: '16px',
            backdropFilter: 'blur(4px)'
          }}>
            <div className="glass-modal" style={{
              width: '100%',
              maxWidth: '540px',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)'
            }}>
              <div style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--border-medium)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Add New User Account
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Create an internal team member or external Customer Representative.
                  </p>
                </div>
                <button className="btn btn-ghost" onClick={() => setIsAddModalOpen(false)} style={{ padding: '8px' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={createUser} style={{ padding: '24px' }}>
                {addError && (
                  <div style={{
                    marginBottom: '16px',
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#ef4444',
                    fontSize: '0.85rem'
                  }}>
                    {addError}
                  </div>
                )}

                <div style={{ display: 'grid', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>Full Name *</label>
                      <input
                        className="input"
                        value={addForm.name}
                        onChange={(e) => handleAddInput('name', e.target.value)}
                        placeholder="e.g. David Chen"
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>Username *</label>
                      <input
                        className="input"
                        value={addForm.username}
                        onChange={(e) => handleAddInput('username', e.target.value)}
                        placeholder="e.g. david_chen"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>Email Address</label>
                    <input
                      type="email"
                      className="input"
                      value={addForm.email}
                      onChange={(e) => handleAddInput('email', e.target.value)}
                      placeholder="e.g. dchen@acmefinancial.com"
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>Role *</label>
                      <select
                        className="select"
                        value={addForm.role}
                        onChange={(e) => handleAddInput('role', e.target.value)}
                      >
                        {roleOptions.map((option) => (
                          <option key={option} value={option}>{option.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>Title</label>
                      <input
                        className="input"
                        value={addForm.title}
                        onChange={(e) => handleAddInput('title', e.target.value)}
                        placeholder="e.g. VP Technology"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>Permissions</label>
                    <input
                      className="input"
                      value={addForm.permissions}
                      onChange={(e) => handleAddInput('permissions', e.target.value)}
                    />
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Comma-separated permission strings.
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>Initial Password *</label>
                    <input
                      type="password"
                      className="input"
                      value={addForm.password}
                      onChange={(e) => handleAddInput('password', e.target.value)}
                      placeholder="Must be 16+ chars, mixed case, special char"
                      required
                    />
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Policy: 16+ characters, uppercase, lowercase, and special character.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setIsAddModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isAdding}>
                    {isAdding ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            padding: '16px',
            backdropFilter: 'blur(4px)'
          }}>
            <div className="glass-modal" style={{
              width: '100%',
              maxWidth: '540px',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)'
            }}>
              <div style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--border-medium)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Edit User: {editingUser.name}
                  </h2>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Update role, email, permissions, or reset the password.
                  </p>
                </div>
                <button className="btn btn-ghost" onClick={closeEditModal} style={{ padding: '8px' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={saveUser} style={{ padding: '24px' }}>
                {editError && (
                  <div style={{
                    marginBottom: '16px',
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    color: '#ef4444',
                    fontSize: '0.85rem'
                  }}>
                    {editError}
                  </div>
                )}

                <div style={{ display: 'grid', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>Full name</label>
                      <input
                        className="input"
                        value={editForm.name}
                        onChange={(e) => handleEditInput('name', e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>Username</label>
                      <input
                        className="input"
                        value={editingUser.username}
                        readOnly
                        style={{ opacity: 0.7 }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>Email address</label>
                    <input
                      type="email"
                      className="input"
                      value={editForm.email}
                      onChange={(e) => handleEditInput('email', e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>Role</label>
                      <select
                        className="select"
                        value={editForm.role}
                        onChange={(e) => handleEditInput('role', e.target.value)}
                      >
                        {roleOptions.map((option) => (
                          <option key={option} value={option}>{option.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>Title</label>
                      <input
                        className="input"
                        value={editForm.title}
                        onChange={(e) => handleEditInput('title', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>Permissions</label>
                    <input
                      className="input"
                      value={editForm.permissions}
                      onChange={(e) => handleEditInput('permissions', e.target.value)}
                      placeholder="CREATE_FEEDBACK, SUBMIT_FEEDBACK"
                    />
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Separate permissions with commas.
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '6px' }}>Reset password</label>
                    <input
                      type="password"
                      className="input"
                      value={editForm.password}
                      onChange={(e) => handleEditInput('password', e.target.value)}
                      placeholder="Leave blank to keep current password"
                    />
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Optional. Must be 16+ characters, mixed case, and include one special character.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                  <button type="button" className="btn btn-ghost" onClick={closeEditModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>User</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Username</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Role</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>Permissions</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background-color 0.15s ease' }}>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%',
                          backgroundColor: 'var(--bg-card-active)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 600, color: 'var(--text-primary)',
                          border: '1px solid var(--border-medium)'
                        }}>
                          {user.avatar}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{user.name}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Mail size={10} /> {user.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      @{user.username}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span className="badge" style={{
                        backgroundColor: user.role === 'ENTERPRISE_ADMIN' 
                          ? 'var(--text-primary)' 
                          : user.role === 'CUSTOMER_REP'
                          ? 'var(--bg-card-hover)'
                          : 'var(--bg-card-active)',
                        color: user.role === 'ENTERPRISE_ADMIN' ? 'var(--text-inverse)' : 'var(--text-primary)',
                        border: '1px solid var(--border-medium)',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        padding: '3px 8px'
                      }}>
                        {user.role.replace(/_/g, ' ')}
                      </span>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px' }}>{user.title}</div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {user.permissions && user.permissions.length > 0 ? user.permissions.map(p => (
                          <span key={p} className="badge" style={{ backgroundColor: 'var(--bg-card-active)', color: 'var(--text-secondary)', fontSize: '0.65rem' }}>
                            <Shield size={10} style={{ marginRight: '4px' }} />
                            {p.replace(/_/g, ' ')}
                          </span>
                        )) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>No special permissions</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => openEditModal(user)}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
