'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Tooltip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Avatar,
} from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable, ColumnDef } from '../components/common/DataTable';
import { RightSidebarDrawer } from '../components/common/RightSidebarDrawer';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { UserDetailsModal } from '../components/modals/UserDetailsModal';
import { VolunteerPatientsModal } from '../components/modals/VolunteerPatientsModal';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const UsersView: React.FC = () => {
  const { showToast } = useToast();

  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [tempRoleFilter, setTempRoleFilter] = useState('ALL');
  const [filterActive, setFilterActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Filter drawer
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Add/Edit user drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'ADD' | 'EDIT'>('ADD');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'TEAM' | 'VOLUNTEER' | 'CUSTOMER'>('VOLUNTEER');
  const [mobile, setMobile] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // View modal
  const [viewUserId, setViewUserId] = useState<string | null>(null);

  // Volunteer patients modal
  const [volunteerForPatients, setVolunteerForPatients] = useState<any | null>(null);

  // Delete dialog
  const [deleteUser, setDeleteUser] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [page, limit, search, roleFilter]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.getUsers({
        search: search.trim(),
        role: roleFilter,
        page,
        limit,
      });
      setUsers(res.data || []);
      setTotal(res.pagination?.total || (res.data || []).length);
    } catch (err: any) {
      showToast(err.message || 'Failed to load users list', 'ERROR');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setDrawerMode('ADD');
    setSelectedUser(null);
    setName('');
    setUsername('');
    setPassword('');
    setRole('VOLUNTEER');
    setMobile('');
    setErrors({});
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (user: any) => {
    setDrawerMode('EDIT');
    setSelectedUser(user);
    setName(user.name || '');
    setUsername(user.username || '');
    setPassword('');
    setRole(user.role || 'VOLUNTEER');
    setMobile(user.mobile || '');
    setErrors({});
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedUser(null);
    setName('');
    setUsername('');
    setPassword('');
    setMobile('');
    setErrors({});
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name is required.';
    if (drawerMode === 'ADD') {
      if (!username.trim()) errs.username = 'Username is required.';
      else if (username.trim().length < 3)
        errs.username = 'Username must be at least 3 characters.';
      if (!password.trim()) errs.password = 'Password is required.';
      else if (password.trim().length < 4)
        errs.password = 'Password must be at least 4 characters.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveUser = async () => {
    if (!validateForm()) return;
    setIsSaving(true);
    try {
      if (drawerMode === 'ADD') {
        const payload: any = {
          name: name.trim(),
          username: username.trim(),
          password: password.trim(),
          role,
        };
        if (mobile.trim()) payload.mobile = mobile.trim();
        const res = await api.createUser(payload);
        if (res.success) {
          showToast(`User ${name} created successfully!`, 'SUCCESS');
          handleCloseDrawer();
          fetchUsers();
        }
      } else {
        const payload: any = {
          name: name.trim(),
          role,
        };
        if (password.trim()) payload.password = password.trim();
        const res = await api.updateUser(selectedUser.id, payload);
        if (res.success) {
          showToast(`User ${name} updated successfully!`, 'SUCCESS');
          handleCloseDrawer();
          fetchUsers();
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to save user', 'ERROR');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteUser) return;
    setIsDeleting(true);
    try {
      const res = await api.deleteUser(deleteUser.id);
      if (res.success) {
        showToast(`User @${deleteUser.username} removed successfully`, 'SUCCESS');
        setDeleteUser(null);
        fetchUsers();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete user', 'ERROR');
    } finally {
      setIsDeleting(false);
    }
  };

  const getRoleBadge = (roleStr: string) => {
    switch (roleStr) {
      case 'ADMIN':
        return {
          label: 'Admin',
          bg: 'rgba(217, 119, 6, 0.12)',
          color: '#d97706',
          border: 'rgba(217, 119, 6, 0.3)',
        };
      case 'TEAM':
        return {
          label: 'Staff Team',
          bg: 'rgba(37, 99, 235, 0.12)',
          color: '#2563eb',
          border: 'rgba(37, 99, 235, 0.3)',
        };
      case 'VOLUNTEER':
        return {
          label: 'Volunteer',
          bg: 'rgba(22, 163, 74, 0.12)',
          color: '#16a34a',
          border: 'rgba(22, 163, 74, 0.3)',
        };
      case 'PATIENT':
        return {
          label: 'Patient Account',
          bg: 'rgba(13, 148, 136, 0.12)',
          color: '#0d9488',
          border: 'rgba(13, 148, 136, 0.3)',
        };
      default:
        return {
          label: roleStr,
          bg: 'rgba(124, 58, 237, 0.12)',
          color: '#7c3aed',
          border: 'rgba(124, 58, 237, 0.3)',
        };
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      id: 'name',
      label: 'NAME',
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{
              width: 34,
              height: 34,
              fontSize: '0.875rem',
              fontWeight: 700,
              backgroundColor: 'primary.main',
              color: '#ffffff',
            }}
          >
            {(row.name || 'U').charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <span style={{ fontWeight: 600, fontSize: '0.875rem', display: 'block' }}>
              {row.name}
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>@{row.username}</span>
          </Box>
        </Box>
      ),
    },
    {
      id: 'role',
      label: 'ROLE',
      render: (row) => {
        const badge = getRoleBadge(row.role);
        return (
          <Chip
            label={badge.label}
            size="small"
            sx={{
              fontWeight: 700,
              fontSize: '0.75rem',
              borderRadius: '6px',
              backgroundColor: badge.bg,
              color: badge.color,
              border: 1,
              borderColor: badge.border,
            }}
          />
        );
      },
    },
    {
      id: 'id',
      label: 'USER ID',
      render: (row) => (
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: '0.78rem',
            color: '#64748b',
          }}
        >
          {row.id ? `${row.id.slice(0, 12)}...` : '—'}
        </span>
      ),
    },
    {
      id: 'created',
      label: 'JOINED DATE',
      render: (row) => (
        <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
          {row.created ? new Date(row.created).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      id: 'actions',
      label: 'ACTIONS',
      align: 'right',
      width: 140,
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
          <Tooltip title="View User Profile" arrow>
            <IconButton
              size="small"
              onClick={() => setViewUserId(row.id || row.username)}
              sx={{ color: 'primary.main', borderRadius: '8px' }}
            >
              <VisibilityOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit User" arrow>
            <IconButton
              size="small"
              onClick={() => handleOpenEdit(row)}
              sx={{ color: 'primary.main', borderRadius: '8px' }}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {row.username !== 'admin' && row.username !== 'self_patient' && (
            <Tooltip title="Delete User" arrow>
              <IconButton
                size="small"
                onClick={() => setDeleteUser(row)}
                sx={{ color: 'error.main', borderRadius: '8px' }}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Users"
        count={total}
        countLabel={`Total Registered Platform Users: ${total}`}
        onRefresh={fetchUsers}
        isRefreshing={isLoading}
      />

      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={setLimit}
        searchPlaceholder="Search users by name or username..."
        searchValue={search}
        onSearchChange={setSearch}
        onAddClick={handleOpenAdd}
        addLabel="Add User"
        filterActive={filterActive}
        onOpenFilter={() => {
          setTempRoleFilter(roleFilter);
          setIsFilterOpen(true);
        }}
        onClearFilter={() => {
          setRoleFilter('ALL');
          setTempRoleFilter('ALL');
          setFilterActive(false);
        }}
        emptyMessage="No users registered in the system."
      />

      {/* Right Sidebar: Add / Edit User */}
      <RightSidebarDrawer
        open={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={drawerMode === 'ADD' ? 'Add New User' : 'Edit User'}
        subtitle={
          drawerMode === 'ADD'
            ? 'Create an account for staff or volunteer'
            : `Updating user record @${selectedUser?.username}`
        }
        onSave={handleSaveUser}
        saveLabel={drawerMode === 'ADD' ? 'Create User' : 'Save Changes'}
        isSaving={isSaving}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Full Name"
            placeholder="e.g. John Doe"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
            }}
            required
            fullWidth
            size="small"
            error={!!errors.name}
            helperText={errors.name}
          />

          <FormControl fullWidth size="small">
            <InputLabel id="role-select-label">Account Role</InputLabel>
            <Select
              labelId="role-select-label"
              value={role}
              label="Account Role"
              onChange={(e) => setRole(e.target.value as any)}
            >
              <MenuItem value="VOLUNTEER">VOLUNTEER (Camp Registration)</MenuItem>
              <MenuItem value="TEAM">TEAM (Staff Member)</MenuItem>
              <MenuItem value="ADMIN">ADMIN (System Administrator)</MenuItem>
              <MenuItem value="CUSTOMER">CUSTOMER</MenuItem>
            </Select>
          </FormControl>

          {drawerMode === 'ADD' && (
            <TextField
              label="Username"
              placeholder="e.g. johndoe"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                if (errors.username) setErrors((prev) => ({ ...prev, username: '' }));
              }}
              required
              fullWidth
              size="small"
              error={!!errors.username}
              helperText={errors.username || 'Min 3 chars, lowercase alphanumeric'}
            />
          )}

          <TextField
            label={drawerMode === 'ADD' ? 'Password' : 'New Password (Optional)'}
            placeholder={
              drawerMode === 'ADD' ? 'Enter account password' : 'Leave empty to keep current'
            }
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
            }}
            required={drawerMode === 'ADD'}
            fullWidth
            size="small"
            error={!!errors.password}
            helperText={errors.password}
          />

          {drawerMode === 'ADD' && (
            <TextField
              label="Mobile Number (Optional)"
              placeholder="10-digit mobile number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              fullWidth
              size="small"
            />
          )}
        </Box>
      </RightSidebarDrawer>

      {/* Right Sidebar: Role Filter */}
      <RightSidebarDrawer
        open={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter Users"
        subtitle="Filter user accounts by role"
        onSave={() => {
          setRoleFilter(tempRoleFilter);
          setFilterActive(tempRoleFilter !== 'ALL');
          setIsFilterOpen(false);
          setPage(1);
        }}
        saveLabel="Apply Filter"
      >
        <FormControl fullWidth size="small">
          <InputLabel id="filter-role-label">User Role</InputLabel>
          <Select
            labelId="filter-role-label"
            value={tempRoleFilter}
            label="User Role"
            onChange={(e) => setTempRoleFilter(e.target.value)}
          >
            <MenuItem value="ALL">All Roles</MenuItem>
            <MenuItem value="ADMIN">ADMIN</MenuItem>
            <MenuItem value="TEAM">TEAM</MenuItem>
            <MenuItem value="VOLUNTEER">VOLUNTEER</MenuItem>
            <MenuItem value="PATIENT">PATIENT</MenuItem>
            <MenuItem value="CUSTOMER">CUSTOMER</MenuItem>
          </Select>
        </FormControl>
      </RightSidebarDrawer>

      {/* User Details Modal */}
      <UserDetailsModal
        open={!!viewUserId}
        userId={viewUserId}
        onClose={() => setViewUserId(null)}
        onViewPatients={(userObj) => {
          setVolunteerForPatients(userObj);
        }}
      />

      {/* Volunteer Patients Modal */}
      <VolunteerPatientsModal
        open={!!volunteerForPatients}
        volunteer={volunteerForPatients}
        onClose={() => setVolunteerForPatients(null)}
      />

      {/* Delete User Confirm Dialog */}
      <ConfirmDialog
        open={!!deleteUser}
        title="Delete User Account?"
        message={`Are you sure you want to permanently delete user account "${deleteUser?.name}" (@${deleteUser?.username})? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteUser(null)}
        confirmLabel="Delete User"
        isLoading={isDeleting}
      />
    </Box>
  );
};
