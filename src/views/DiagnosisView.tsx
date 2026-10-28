'use client';

import React, { useEffect, useState } from 'react';
import { Box, TextField, IconButton, Tooltip } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable, ColumnDef } from '../components/common/DataTable';
import { RightSidebarDrawer } from '../components/common/RightSidebarDrawer';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { DiagnosisLogsModal } from '../components/modals/DiagnosisLogsModal';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const DiagnosisView: React.FC = () => {
  const { showToast } = useToast();

  const [diagnosisList, setDiagnosisList] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Add/Edit drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'ADD' | 'EDIT'>('ADD');
  const [selectedDiag, setSelectedDiag] = useState<any | null>(null);

  // Form
  const [diagName, setDiagName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Logs modal
  const [logDiagnosis, setLogDiagnosis] = useState<any | null>(null);

  // Delete dialog
  const [deleteDiag, setDeleteDiag] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchDiagnosis();
  }, [page, limit, search]);

  const fetchDiagnosis = async () => {
    setIsLoading(true);
    try {
      const res = await api.getDiagnosis({
        search: search.trim(),
        page,
        limit,
      });
      setDiagnosisList(res.data || []);
      setTotal(res.pagination?.total || (res.data || []).length);
    } catch (err: any) {
      showToast(err.message || 'Failed to load diagnosis tests', 'ERROR');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setDrawerMode('ADD');
    setSelectedDiag(null);
    setDiagName('');
    setFormError('');
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (diag: any) => {
    setDrawerMode('EDIT');
    setSelectedDiag(diag);
    setDiagName(diag.name || '');
    setFormError('');
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedDiag(null);
    setDiagName('');
    setFormError('');
  };

  const handleSaveDiagnosis = async () => {
    const trimmed = diagName.trim();
    if (!trimmed || trimmed.length < 3 || trimmed.length > 50) {
      setFormError('Diagnosis test name must be between 3 and 50 characters.');
      return;
    }

    setIsSaving(true);
    setFormError('');
    try {
      if (drawerMode === 'ADD') {
        const res = await api.createDiagnosis({ name: trimmed });
        if (res.success) {
          showToast(`Diagnostic test "${trimmed}" created!`, 'SUCCESS');
          handleCloseDrawer();
          fetchDiagnosis();
        }
      } else if (drawerMode === 'EDIT' && selectedDiag) {
        const res = await api.updateDiagnosis(selectedDiag.id, { name: trimmed });
        if (res.success) {
          showToast(`Diagnostic test updated to "${trimmed}"!`, 'SUCCESS');
          handleCloseDrawer();
          fetchDiagnosis();
        }
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to save diagnosis test.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteDiag) return;
    setIsDeleting(true);
    try {
      const res = await api.deleteDiagnosis(deleteDiag.id);
      if (res.success) {
        showToast(`Diagnostic test "${deleteDiag.name}" deleted.`, 'SUCCESS');
        setDeleteDiag(null);
        fetchDiagnosis();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete diagnosis test.', 'ERROR');
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
      width: 140,
      render: (row) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
          <Tooltip title="View Test Order Logs" arrow>
            <IconButton
              size="small"
              onClick={() => setLogDiagnosis(row)}
              sx={{ color: '#7c3aed', borderRadius: 1.5 }}
            >
              <ScienceOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Diagnostic Test" arrow>
            <IconButton
              size="small"
              onClick={() => handleOpenEdit(row)}
              sx={{ color: 'primary.main', borderRadius: 1.5 }}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Diagnostic Test" arrow>
            <IconButton
              size="small"
              onClick={() => setDeleteDiag(row)}
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
        title="Diagnosis"
        count={total}
        countLabel={`Total laboratory diagnostic investigations: ${total}`}
        onRefresh={fetchDiagnosis}
        isRefreshing={isLoading}
      />

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={diagnosisList}
        isLoading={isLoading}
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={setLimit}
        searchPlaceholder="Search diagnostic test by name..."
        searchValue={search}
        onSearchChange={setSearch}
        onAddClick={handleOpenAdd}
        addLabel="Add Diagnosis"
        emptyMessage="No diagnostic tests found in the master list."
      />

      {/* Reusable Common Right Sidebar: ADD / EDIT Diagnosis */}
      <RightSidebarDrawer
        open={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={drawerMode === 'ADD' ? 'Add Diagnostic Test' : 'Edit Diagnostic Test'}
        subtitle={
          drawerMode === 'ADD'
            ? 'Add a laboratory diagnosis or investigation to camp catalog'
            : `Editing diagnostic record #${selectedDiag?.id?.slice(0, 8)}`
        }
        onSave={handleSaveDiagnosis}
        saveLabel={drawerMode === 'ADD' ? 'Save Test' : 'Update Test'}
        isSaving={isSaving}
        isSaveDisabled={!diagName.trim()}
      >
        <TextField
          label="Diagnostic Test Name"
          placeholder="e.g. Complete Blood Count (CBC), Lipid Profile, ECG"
          value={diagName}
          onChange={(e) => {
            setDiagName(e.target.value);
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

      {/* Diagnosis Order Logs Modal (UI Requirement) */}
      <DiagnosisLogsModal
        open={!!logDiagnosis}
        onClose={() => setLogDiagnosis(null)}
        diagnosis={logDiagnosis}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteDiag}
        title="Delete Diagnostic Test?"
        message={`Are you sure you want to delete "${deleteDiag?.name}" from diagnosis catalog?`}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteDiag(null)}
        isLoading={isDeleting}
      />
    </Box>
  );
};
