'use client';

import React, { useEffect, useState } from 'react';
import { Box, TextField, IconButton, Tooltip, Chip } from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import { PageHeader } from '../components/common/PageHeader';
import { DataTable, ColumnDef } from '../components/common/DataTable';
import { RightSidebarDrawer } from '../components/common/RightSidebarDrawer';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { PharmacyLogsModal } from '../components/modals/PharmacyLogsModal';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const PharmacyView: React.FC = () => {
  const { showToast } = useToast();

  const [pharmacyItems, setPharmacyItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name_asc');
  const [isLoading, setIsLoading] = useState(false);

  // Add/Edit drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'ADD' | 'EDIT'>('ADD');
  const [selectedMed, setSelectedMed] = useState<any | null>(null);

  // Form fields
  const [medName, setMedName] = useState('');
  const [medQty, setMedQty] = useState<number | string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Logs modal
  const [logMedicine, setLogMedicine] = useState<any | null>(null);

  // Delete dialog
  const [deleteItem, setDeleteItem] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchPharmacy();
  }, [page, limit, search, sortBy]);

  const fetchPharmacy = async () => {
    setIsLoading(true);
    try {
      let apiSortBy: string | undefined;
      let apiOrder: string | undefined;
      if (sortBy === 'name_asc') {
        apiSortBy = 'name';
        apiOrder = 'asc';
      } else if (sortBy === 'name_desc') {
        apiSortBy = 'name';
        apiOrder = 'desc';
      } else if (sortBy === 'qty_desc') {
        apiSortBy = 'qty';
        apiOrder = 'desc';
      } else if (sortBy === 'qty_asc') {
        apiSortBy = 'qty';
        apiOrder = 'asc';
      } else if (sortBy === 'updated_desc') {
        apiSortBy = 'updated';
        apiOrder = 'desc';
      }

      const res = await api.getPharmacy({
        search: search.trim(),
        sortBy: apiSortBy,
        order: apiOrder,
        page,
        limit,
      });
      setPharmacyItems(res.data || []);
      setTotal(res.pagination?.total || (res.data || []).length);
    } catch (err: any) {
      showToast(err.message || 'Failed to load pharmacy medications', 'ERROR');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setDrawerMode('ADD');
    setSelectedMed(null);
    setMedName('');
    setMedQty('');
    setErrors({});
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setDrawerMode('EDIT');
    setSelectedMed(item);
    setMedName(item.name || '');
    setMedQty(item.qty !== undefined ? item.qty : '');
    setErrors({});
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedMed(null);
    setMedName('');
    setMedQty('');
    setErrors({});
  };

  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!medName.trim() || medName.trim().length < 3 || medName.trim().length > 50) {
      errs.name = 'Medicine name must be between 3 and 50 characters.';
    }
    if (medQty === '' || isNaN(Number(medQty)) || Number(medQty) < 0) {
      errs.qty = 'Quantity is mandatory and must be a non-negative number.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSavePharmacy = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const payload = {
        name: medName.trim(),
        qty: Number(medQty),
      };

      if (drawerMode === 'ADD') {
        const res = await api.createPharmacy(payload);
        if (res.success) {
          showToast(`Medicine "${medName.trim()}" added with stock ${medQty}!`, 'SUCCESS');
          handleCloseDrawer();
          fetchPharmacy();
        }
      } else if (drawerMode === 'EDIT' && selectedMed) {
        const res = await api.updatePharmacy(selectedMed.id, payload);
        if (res.success) {
          showToast(`Medicine "${medName.trim()}" updated successfully!`, 'SUCCESS');
          handleCloseDrawer();
          fetchPharmacy();
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to save pharmacy medication.', 'ERROR');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteItem) return;
    setIsDeleting(true);
    try {
      const res = await api.deletePharmacy(deleteItem.id);
      if (res.success) {
        showToast(`Medicine "${deleteItem.name}" deleted from pharmacy stock.`, 'SUCCESS');
        setDeleteItem(null);
        fetchPharmacy();
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete pharmacy medication.', 'ERROR');
    } finally {
      setIsDeleting(false);
    }
  };

  const sortOptions = [
    { label: 'Name (A to Z)', value: 'name_asc' },
    { label: 'Name (Z to A)', value: 'name_desc' },
    { label: 'Quantity (High to Low)', value: 'qty_desc' },
    { label: 'Quantity (Low to High)', value: 'qty_asc' },
    { label: 'Recently Updated', value: 'updated_desc' },
  ];

  const columns: ColumnDef<any>[] = [
    {
      id: 'name',
      label: 'NAME',
      render: (row) => <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{row.name}</span>,
    },
    {
      id: 'qty',
      label: 'QUANTITY',
      render: (row) => (
        <Chip
          label={`${row.qty} units in stock`}
          size="small"
          sx={{
            fontWeight: 700,
            backgroundColor:
              row.qty > 10
                ? 'rgba(25, 136, 71, 0.12)'
                : row.qty > 0
                  ? 'rgba(245, 158, 11, 0.12)'
                  : 'rgba(239, 68, 68, 0.12)',
            color: row.qty > 10 ? '#198847' : row.qty > 0 ? '#d97706' : '#ef4444',
          }}
        />
      ),
    },
    {
      id: 'actions',
      label: 'ACTION',
      align: 'right',
      width: 140,
      render: (row) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
          <Tooltip title="View Dispensation Logs" arrow>
            <IconButton
              size="small"
              onClick={() => setLogMedicine(row)}
              sx={{ color: '#198847', borderRadius: 1.5 }}
            >
              <ReceiptLongOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Medicine Stock" arrow>
            <IconButton
              size="small"
              onClick={() => handleOpenEdit(row)}
              sx={{ color: 'primary.main', borderRadius: 1.5 }}
            >
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete Medicine" arrow>
            <IconButton
              size="small"
              onClick={() => setDeleteItem(row)}
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
        title="Pharmacy"
        count={total}
        countLabel={`Total pharmaceutical catalogue items: ${total}`}
        onRefresh={fetchPharmacy}
        isRefreshing={isLoading}
      />

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={pharmacyItems}
        isLoading={isLoading}
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={setLimit}
        searchPlaceholder="Search medication by name..."
        searchValue={search}
        onSearchChange={setSearch}
        sortOptions={sortOptions}
        currentSort={sortBy}
        onSortChange={setSortBy}
        onAddClick={handleOpenAdd}
        addLabel="Add Pharmacy"
        emptyMessage="No medicines found in pharmacy catalogue."
      />

      {/* Reusable Common Right Sidebar: ADD / EDIT Pharmacy */}
      <RightSidebarDrawer
        open={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={drawerMode === 'ADD' ? 'Add Pharmacy Medication' : 'Edit Medication'}
        subtitle={
          drawerMode === 'ADD'
            ? 'Add medicine and initial warehouse stock'
            : `Updating medicine #${selectedMed?.id?.slice(0, 8)}`
        }
        onSave={handleSavePharmacy}
        saveLabel={drawerMode === 'ADD' ? 'Save Medicine' : 'Update Medicine'}
        isSaving={isSaving}
      >
        <TextField
          label="Medicine Name"
          placeholder="e.g. Paracetamol 500mg, Amoxicillin 250mg"
          value={medName}
          onChange={(e) => {
            setMedName(e.target.value);
            if (errors.name) setErrors({ ...errors, name: '' });
          }}
          required
          fullWidth
          size="small"
          autoFocus
          error={!!errors.name}
          helperText={errors.name || 'Mandatory: min 3, max 50 characters.'}
        />

        <TextField
          label="Quantity"
          type="number"
          placeholder="e.g. 100"
          value={medQty}
          onChange={(e) => {
            setMedQty(e.target.value);
            if (errors.qty) setErrors({ ...errors, qty: '' });
          }}
          required
          fullWidth
          size="small"
          error={!!errors.qty}
          helperText={errors.qty || 'Mandatory: units currently in stock.'}
        />
      </RightSidebarDrawer>

      {/* Pharmacy Transaction Logs Modal (UI Requirement) */}
      <PharmacyLogsModal
        open={!!logMedicine}
        onClose={() => setLogMedicine(null)}
        medicine={logMedicine}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={!!deleteItem}
        title="Delete Medication?"
        message={`Are you sure you want to delete "${deleteItem?.name}" from the pharmacy inventory?`}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeleteItem(null)}
        isLoading={isDeleting}
      />
    </Box>
  );
};
