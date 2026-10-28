'use client';

import React, { useEffect, useState } from 'react';
import { Box, TextField, IconButton, Tooltip } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable, ColumnDef } from '../components/common/DataTable';
import { RightSidebarDrawer } from '../components/common/RightSidebarDrawer';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const DepartmentsView: React.FC = () => {
  const { showToast } = useToast();

  const [departments, setDepartments] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Add/Edit Sidebar Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'ADD' | 'EDIT'>('ADD');
  const [selectedDept, setSelectedDept] = useState<any | null>(null);
  const [deptName, setDeptName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Delete dialog state
  const [deleteDept, setDeleteDept] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, [page, limit, search]);

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const res = await api.getDepartments({ search: search.trim(), page, limit });
      setDepartments(res.data || []);
      setTotal(res.pagination?.total || (res.data || []).length);
    } catch (err: any) {
      showToast(err.message || 'Failed to load departments', 'ERROR');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setDrawerMode('ADD');
    setSelectedDept(null);
    setDeptName('');
    setFormError('');
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (dept: any) => {
    setDrawerMode('EDIT');
    setSelectedDept(dept);
    setDeptName(dept.name || '');
    setFormError('');
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedDept(null);
    setDeptName('');
    setFormError('');
  };

  const handleSaveDepartment = async () => {
    const trimmed = deptName.trim();
    if (!trimmed) {
      setFormError('Department name is required.');
      return;
    }
    if (trimmed.length < 3) {
      setFormError('Department name must be at least 3 characters.');
      return;
    }
    if (trimmed.length > 50) {
      setFormError('Department name cannot exceed 50 characters.');
      return;
    }

    setIsSaving(true);
    setFormError('');
    try {
      if (drawerMode === 'ADD') {
        const res = await api.createDepartment({ name: trimmed });
        if (res.success) {
          showToast(`Department "${trimmed}" added successfully!`, 'SUCCESS');
          handleCloseDrawer();
          fetchDepartments();
        }
      } else if (drawerMode === 'EDIT' && selectedDept) {
        const res = await api.updateDepartment(selectedDept.id, { name: trimmed });
        if (res.success) {
          showToast(`Department updated to "${trimmed}" successfully!`, 'SUCCESS');
          handleCloseDrawer();
          fetchDepartments();
        }
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to save department.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteDept) return;
    setIsDeleting(true);
    try {
      const res = await api.deleteDepartment(deleteDept.id);
      if (res.success) {
        showToast(`Department "${deleteDept.name}" deleted.`, 'SUCCESS');
        setDeleteDept(null);
        fetchDepartments();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete department.', 'ERROR');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      id: 'name',
      label: 'NAME',
      render: (row) => <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{row.name}</span>,
    },
    {
      id: 'actions',
      label: 'ACTION',
      align: 'right',
      width: 120,
      render: (row) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
          <Tooltip title="Edit Department" arrow>
            <IconButton
              size="small"
              onClick={() => handleOpenEdit(row)}
              sx={{ color: 'primary.main', borderRadius: 1.5 }}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Department" arrow>
            <IconButton
              size="small"
              onClick={() => setDeleteDept(row)}
              sx={{ color: 'error.main', borderRadius: 1.5 }}
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      {/* UI Point 4: Container title on left, count tooltip & refresh icon on right */}
      <PageHeader
        title="Departments"
        count={total}
        countLabel={`Total registered departments: ${total}`}
        onRefresh={fetchDepartments}
        isRefreshing={isLoading}
      />

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={departments}
        isLoading={isLoading}
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={setLimit}
        searchPlaceholder="Search departments by name..."
        searchValue={search}
        onSearchChange={setSearch}
        onAddClick={handleOpenAdd}
        addLabel="Add Department"
        emptyMessage="No departments found. Click 'Add Department' to create one."
      />

      {/* Reusable Common Right Sidebar: ADD / EDIT Department */}
      <RightSidebarDrawer
        open={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={drawerMode === 'ADD' ? 'Add Department' : 'Edit Department'}
        subtitle={
          drawerMode === 'ADD'
            ? 'Create a new clinical discipline for the camp'
            : `Editing discipline record #${selectedDept?.id?.slice(0, 8)}`
        }
        onSave={handleSaveDepartment}
        saveLabel={drawerMode === 'ADD' ? 'Add Department' : 'Update Department'}
        isSaving={isSaving}
        isSaveDisabled={!deptName.trim()}
      >
        <TextField
          label="Department Name"
          placeholder="e.g. Cardiology, Ophthalmology, Pediatrics"
          value={deptName}
          onChange={(e) => {
            setDeptName(e.target.value);
            if (formError) setFormError('');
          }}
          required
          fullWidth
          size="small"
          autoFocus
          error={!!formError}
          helperText={formError || 'Mandatory: min 3, max 50 characters.'}
        />
      </RightSidebarDrawer>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteDept}
        title="Delete Department?"
        message={`Are you sure you want to delete "${deleteDept?.name}"? Any doctors or patients linked to this department will remain in system.`}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteDept(null)}
        isLoading={isDeleting}
      />
    </Box>
  );
};
