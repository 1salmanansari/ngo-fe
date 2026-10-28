'use client';

import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  useMediaQuery,
  useTheme,
  Chip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import CorporateFareOutlinedIcon from '@mui/icons-material/CorporateFareOutlined';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import LocalHospitalRoundedIcon from '@mui/icons-material/LocalHospitalRounded';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import WavingHandOutlinedIcon from '@mui/icons-material/WavingHandOutlined';
import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';

import { useAuth } from '../../context/AuthContext';
import { useAppTheme } from '../../theme/ThemeContext';
import { BreadcrumbsBar } from '../common/BreadcrumbsBar';
import { PatientProfileModal } from '../modals/PatientProfileModal';
import { EditProfileModal } from '../modals/EditProfileModal';

// Views
import { HomeView } from '../../views/HomeView';
import { DepartmentsView } from '../../views/DepartmentsView';
import { DoctorsView } from '../../views/DoctorsView';
import { PatientsView } from '../../views/PatientsView';
import { VolunteersView } from '../../views/VolunteersView';
import { UsersView } from '../../views/UsersView';
import { PharmacyView } from '../../views/PharmacyView';
import { DiagnosisView } from '../../views/DiagnosisView';
import { PrescriptionsView } from '../../views/PrescriptionsView';
import { TestsView } from '../../views/TestsView';
import { ReferralsView } from '../../views/ReferralsView';

const DRAWER_WIDTH = 250;

export type NavigationTab =
  | 'Home'
  | 'Departments'
  | 'Doctors'
  | 'Patients'
  | 'Volunteers'
  | 'Users'
  | 'Pharmacy'
  | 'Diagnosis'
  | 'Prescriptions'
  | 'Tests'
  | 'Referrals';

const navItems: { label: NavigationTab; icon: React.ReactElement }[] = [
  { label: 'Home', icon: <HomeOutlinedIcon /> },
  { label: 'Departments', icon: <CorporateFareOutlinedIcon /> },
  { label: 'Doctors', icon: <LocalHospitalOutlinedIcon /> },
  { label: 'Patients', icon: <PeopleAltOutlinedIcon /> },
  { label: 'Volunteers', icon: <VolunteerActivismOutlinedIcon /> },
  { label: 'Users', icon: <ManageAccountsOutlinedIcon /> },
  { label: 'Pharmacy', icon: <MedicationOutlinedIcon /> },
  { label: 'Diagnosis', icon: <ScienceOutlinedIcon /> },
  { label: 'Prescriptions', icon: <ReceiptLongOutlinedIcon /> },
  { label: 'Tests', icon: <AssignmentOutlinedIcon /> },
  { label: 'Referrals', icon: <ShareOutlinedIcon /> },
];

export const AppLayout: React.FC = () => {
  const { user, logout, openProfileModal } = useAuth();
  const { mode, toggleTheme } = useAppTheme();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [activeTab, setActiveTab] = useState<NavigationTab>('Home');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Profile avatar menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSelectTab = (tab: NavigationTab) => {
    setActiveTab(tab);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'Home':
        return <HomeView />;
      case 'Departments':
        return <DepartmentsView />;
      case 'Doctors':
        return <DoctorsView />;
      case 'Patients':
        return <PatientsView />;
      case 'Volunteers':
        return <VolunteersView />;
      case 'Users':
        return <UsersView />;
      case 'Pharmacy':
        return <PharmacyView />;
      case 'Diagnosis':
        return <DiagnosisView />;
      case 'Prescriptions':
        return <PrescriptionsView />;
      case 'Tests':
        return <TestsView />;
      case 'Referrals':
        return <ReferralsView />;
      default:
        return <HomeView />;
    }
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand Header */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2,
            backgroundColor: 'primary.main',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LocalHospitalRoundedIcon sx={{ fontSize: 22 }} />
        </Box>
        <Box>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 800, lineHeight: 1.1, fontSize: '0.95rem' }}
          >
            Pragati Camp
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
            Admin Control Center
          </Typography>
        </Box>
      </Box>

      {/* Nav List */}
      <List sx={{ px: 1.5, py: 2, flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {navItems.map((item) => {
          const isSelected = activeTab === item.label;
          return (
            <ListItem key={item.label} disablePadding>
              <ListItemButton
                onClick={() => handleSelectTab(item.label)}
                selected={isSelected}
                sx={{
                  borderRadius: 2,
                  py: 1,
                  px: 1.75,
                  backgroundColor: isSelected
                    ? mode === 'dark'
                      ? 'rgba(21, 86, 163, 0.22)'
                      : 'rgba(21, 86, 163, 0.08)'
                    : 'transparent',
                  color: isSelected ? 'primary.main' : 'text.secondary',
                  '&:hover': {
                    backgroundColor:
                      mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                    color: 'text.primary',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    color: isSelected ? 'primary.main' : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '0.875rem',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Bottom User Info */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{
              width: 34,
              height: 34,
              fontSize: '0.8125rem',
              fontWeight: 700,
              backgroundColor: 'primary.main',
              color: '#ffffff',
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </Avatar>
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.name || 'Administrator'}
            </Typography>
            <Chip
              label={user?.role || 'ADMIN'}
              size="small"
              sx={{
                height: 18,
                fontSize: '0.65rem',
                fontWeight: 700,
                backgroundColor: 'rgba(25, 136, 71, 0.1)',
                color: '#198847',
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Topbar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          backgroundColor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          color: 'text.primary',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
          {/* Mobile hamburger icon */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen(!mobileOpen)}
              sx={{ display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>

            {/* Logo on top-left for mobile */}
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                display: { xs: 'block', md: 'none' },
                color: 'primary.main',
              }}
            >
              Pragati Camp Admin
            </Typography>
          </Box>

          {/* Right Topbar actions: Theme toggle + Profile Avatar with Dropdown */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Tooltip title={`Switch to ${mode === 'dark' ? 'Light' : 'Dark'} mode`} arrow>
              <IconButton
                onClick={toggleTheme}
                size="small"
                sx={{ border: 1, borderColor: 'divider', borderRadius: 2 }}
              >
                {mode === 'dark' ? (
                  <Brightness7Icon sx={{ color: '#f59e0b', fontSize: 20 }} />
                ) : (
                  <Brightness4Icon sx={{ fontSize: 20 }} />
                )}
              </IconButton>
            </Tooltip>

            {/* Profile Menu Trigger */}
            <Tooltip title="Account Settings" arrow>
              <IconButton
                onClick={handleProfileMenuOpen}
                size="small"
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  p: 0.5,
                  borderRadius: 2,
                }}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    backgroundColor: 'primary.main',
                  }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                </Avatar>
              </IconButton>
            </Tooltip>

            {/* Profile Dropdown Menu */}
            <Menu
              anchorEl={anchorEl}
              open={isMenuOpen}
              onClose={handleProfileMenuClose}
              PaperProps={{
                sx: {
                  borderRadius: 2.5,
                  minWidth: 220,
                  mt: 1,
                  boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                  border: 1,
                  borderColor: 'divider',
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              {/* Option 1: Greetings */}
              <MenuItem
                disabled
                sx={{
                  opacity: '1 !important',
                  cursor: 'default',
                  py: 1.5,
                  borderBottom: 1,
                  borderColor: 'divider',
                }}
              >
                <ListItemIcon sx={{ color: '#1556A3' }}>
                  <WavingHandOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    Hello, {user?.name || 'Administrator'}!
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Role: {user?.role || 'ADMIN'}
                  </Typography>
                </Box>
              </MenuItem>

              {/* Option 2: Edit Profile */}
              <MenuItem
                onClick={() => {
                  handleProfileMenuClose();
                  openProfileModal();
                }}
                sx={{ py: 1.25, gap: 1.5 }}
              >
                <ListItemIcon>
                  <EditOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  Edit Profile
                </Typography>
              </MenuItem>

              {/* Option 3: Logout */}
              <MenuItem
                onClick={() => {
                  handleProfileMenuClose();
                  logout();
                }}
                sx={{ py: 1.25, gap: 1.5, color: 'error.main' }}
              >
                <ListItemIcon sx={{ color: 'error.main' }}>
                  <LogoutOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Logout
                </Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Responsive Navigation Drawer */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              backgroundColor: 'background.paper',
            },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop Permanent Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              backgroundColor: 'background.paper',
              borderRight: 1,
              borderColor: 'divider',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main Content Body */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 3.5 },
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8,
          overflowX: 'hidden',
        }}
      >
        {/* UI Point 6: Breadcrumbs Bar (e.g. Home / Patients) */}
        <BreadcrumbsBar
          items={
            activeTab === 'Home'
              ? []
              : [{ label: activeTab, onClick: () => handleSelectTab(activeTab), active: true }]
          }
          onHomeClick={() => handleSelectTab('Home')}
        />

        {/* Active Module View */}
        {renderActiveView()}
      </Box>

      {/* Universal Modals */}
      <PatientProfileModal />
      <EditProfileModal />
    </Box>
  );
};
