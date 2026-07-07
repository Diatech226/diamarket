import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  AdminUser,
  AdminRole,
  AdminStatus,
  SystemLog
} from '../types';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  Key,
  Power,
  X,
  Check,
  Edit2,
  Trash2,
  Settings,
  Activity,
  Info,
  Lock,
  Unlock,
  AlertTriangle,
  UserX,
  UserCheck,
  Sparkles,
  TrendingUp,
  History
} from 'lucide-react';

interface UserManagementScreenProps {
  users: AdminUser[];
  onAddUser: (user: AdminUser) => void;
  onUpdateUser: (userId: string, updatedFields: Partial<AdminUser>) => void;
  onDeleteUser: (userId: string) => void;
  onAddSystemLog: (category: SystemLog['category'], type: SystemLog['type'], message: string) => void;
}

const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: 'Super Admin',
  treasury_manager: 'Treasury Manager',
  compliance_officer: 'Compliance Officer',
  support_specialist: 'Support Specialist',
  developer: 'Developer'
};

const STATUS_LABELS: Record<AdminStatus, string> = {
  active: 'Active',
  suspended: 'Suspended',
  pending_activation: 'Pending Activation'
};

const TEAMS_LIST = ['SecOps', 'Treasury Pool', 'Lagos Node', 'Nairobi Node', 'Compliance Audit', 'Core Dev', 'Support Tier 2'];

// Generate past 30 days of trends dynamically for high-fidelity visualization
const generate30DayTrend = () => {
  const data = [];
  const today = new Date(2026, 6, 6); // July 6, 2026 based on metadata
  
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Logins: Weekdays around 80-120, weekends around 30-55
    const baseLogins = isWeekend ? 35 : 95;
    const loginRandomness = Math.floor(Math.sin(i * 0.6) * 15) + Math.floor(Math.random() * 20);
    const logins = Math.max(18, baseLogins + loginRandomness);

    // Administrative Actions: Weekdays around 15-35, weekends around 2-8
    const baseActions = isWeekend ? 4 : 22;
    const actionRandomness = Math.floor(Math.cos(i * 0.5) * 6) + Math.floor(Math.random() * 12);
    const actions = Math.max(1, baseActions + actionRandomness);

    // Format date as e.g. "Jun 12"
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    data.push({
      date: dateStr,
      logins,
      actions
    });
  }
  return data;
};

const TREND_DATA = generate30DayTrend();

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl shadow-xl font-sans text-xs">
        <p className="font-extrabold text-slate-100 mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-6">
              <span className="flex items-center gap-1.5 text-slate-400 font-semibold">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: item.color || item.stroke }}
                ></span>
                {item.name === 'logins' ? 'Operator Logins' : 'Admin Actions'}
              </span>
              <span className="font-mono font-black text-slate-200">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export default function UserManagementScreen({
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  onAddSystemLog
}: UserManagementScreenProps) {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Bulk selection and action state
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [bulkRole, setBulkRole] = useState<AdminRole | ''>('');

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Form states (Add / Edit)
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<AdminRole>('support_specialist');
  const [formStatus, setFormStatus] = useState<AdminStatus>('active');
  const [formMfaEnabled, setFormMfaEnabled] = useState(true);
  const [formTeams, setFormTeams] = useState<string[]>([]);
  const [formError, setFormError] = useState('');

  // Bulk / action status alerts
  const [securityActionUser, setSecurityActionUser] = useState<{ user: AdminUser; action: 'reset_mfa' | 'terminate_sessions' | 'suspend' | 'activate' | 'delete' } | null>(null);

  // Selection & Bulk Handlers
  const handleSelectAllFiltered = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const filteredIds = filteredUsers.map(u => u.id);
      setSelectedUserIds(prev => {
        const union = new Set([...prev, ...filteredIds]);
        return Array.from(union);
      });
    } else {
      const filteredIds = filteredUsers.map(u => u.id);
      setSelectedUserIds(prev => prev.filter(id => !filteredIds.includes(id)));
    }
  };

  const handleSelectUser = (userId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedUserIds(prev => [...prev, userId]);
    } else {
      setSelectedUserIds(prev => prev.filter(id => id !== userId));
    }
  };

  const applyBulkRoleChange = () => {
    if (selectedUserIds.length === 0 || !bulkRole) return;

    selectedUserIds.forEach(id => {
      onUpdateUser(id, { role: bulkRole });
    });

    onAddSystemLog(
      'merchant',
      'success',
      `BULK ROLE UPDATE: Successfully assigned "${ROLE_LABELS[bulkRole]}" role to ${selectedUserIds.length} operators at once.`
    );

    setSelectedUserIds([]);
    setBulkRole('');
  };

  const handleBatchSuspend = () => {
    if (selectedUserIds.length === 0) return;
    selectedUserIds.forEach(id => {
      onUpdateUser(id, { status: 'suspended' });
    });
    onAddSystemLog(
      'merchant',
      'error',
      `BULK SUSPEND: Instantly suspended access for ${selectedUserIds.length} operators under system security guidelines.`
    );
    setSelectedUserIds([]);
  };

  const handleBatchRestore = () => {
    if (selectedUserIds.length === 0) return;
    selectedUserIds.forEach(id => {
      onUpdateUser(id, { status: 'active', lastActive: 'Active Now' });
    });
    onAddSystemLog(
      'merchant',
      'success',
      `BULK RESTORE: Restored access and set status to active for ${selectedUserIds.length} operators.`
    );
    setSelectedUserIds([]);
  };

  const handleBatchForceMfaReset = () => {
    if (selectedUserIds.length === 0) return;
    selectedUserIds.forEach(id => {
      onUpdateUser(id, { mfaEnabled: true });
    });
    onAddSystemLog(
      'routing',
      'warning',
      `BULK MFA RESET: Forced multi-factor authentication enrollment reset for ${selectedUserIds.length} operators.`
    );
    setSelectedUserIds([]);
  };

  // Handlers for Add User
  const handleOpenAddModal = () => {
    setFormName('');
    setFormEmail('');
    setFormRole('support_specialist');
    setFormStatus('active');
    setFormMfaEnabled(true);
    setFormTeams(['Support Tier 2']);
    setFormError('');
    setAddModalOpen(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formName.trim() || !formEmail.trim()) {
      setFormError('Name and Email are required.');
      return;
    }

    if (!formEmail.includes('@') || !formEmail.includes('.')) {
      setFormError('Please enter a valid corporate email address.');
      return;
    }

    // Check if email already exists
    if (users.some(u => u.email.toLowerCase() === formEmail.toLowerCase())) {
      setFormError('An operator with this email address already exists in the connection pool.');
      return;
    }

    const newUser: AdminUser = {
      id: `usr-${Date.now()}`,
      name: formName.trim(),
      email: formEmail.trim().toLowerCase(),
      role: formRole,
      status: formStatus,
      lastActive: formStatus === 'active' ? 'Active Now' : 'Never',
      mfaEnabled: formMfaEnabled,
      teams: formTeams
    };

    onAddUser(newUser);
    onAddSystemLog(
      'merchant',
      'success',
      `USER PROVISIONED: Added new operator "${newUser.name}" (${ROLE_LABELS[newUser.role]}) assigned to [${newUser.teams.join(', ')}].`
    );
    setAddModalOpen(false);
  };

  // Handlers for Edit User
  const handleOpenEditModal = (user: AdminUser) => {
    setSelectedUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormStatus(user.status);
    setFormMfaEnabled(user.mfaEnabled);
    setFormTeams(user.teams);
    setFormError('');
    setEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedUser) return;

    if (!formName.trim() || !formEmail.trim()) {
      setFormError('Name and Email are required.');
      return;
    }

    // Check email uniqueness, excluding currently selected user
    if (users.some(u => u.email.toLowerCase() === formEmail.toLowerCase() && u.id !== selectedUser.id)) {
      setFormError('An operator with this email address already exists.');
      return;
    }

    const updatedFields: Partial<AdminUser> = {
      name: formName.trim(),
      email: formEmail.trim().toLowerCase(),
      role: formRole,
      status: formStatus,
      mfaEnabled: formMfaEnabled,
      teams: formTeams
    };

    onUpdateUser(selectedUser.id, updatedFields);
    onAddSystemLog(
      'merchant',
      'info',
      `USER COMPLIANCE UPDATE: Operator "${formName}" permissions or details modified by Security Officer.`
    );
    setEditModalOpen(false);
  };

  // Quick action executions
  const executeSecurityAction = () => {
    if (!securityActionUser) return;
    const { user, action } = securityActionUser;

    if (action === 'reset_mfa') {
      onUpdateUser(user.id, { mfaEnabled: true });
      onAddSystemLog(
        'routing',
        'warning',
        `MFA KEY ROTATED: Security keys for administrator "${user.name}" were revoked and re-generated.`
      );
    } else if (action === 'terminate_sessions') {
      onUpdateUser(user.id, { lastActive: 'Session Revoked' });
      onAddSystemLog(
        'routing',
        'error',
        `SESSION TERMINATED: Instantly evicted all active access tokens for operator "${user.name}".`
      );
    } else if (action === 'suspend') {
      onUpdateUser(user.id, { status: 'suspended' });
      onAddSystemLog(
        'merchant',
        'error',
        `ACCESS SUSPENDED: Administrative rights revoked for operator "${user.name}". Account marked SUSPENDED.`
      );
    } else if (action === 'activate') {
      onUpdateUser(user.id, { status: 'active', lastActive: 'Active Now' });
      onAddSystemLog(
        'merchant',
        'success',
        `ACCESS RESTORED: Administrative rights reactivated for operator "${user.name}".`
      );
    } else if (action === 'delete') {
      onDeleteUser(user.id);
      onAddSystemLog(
        'merchant',
        'warning',
        `OPERATOR DE-PROVISIONED: Permanently purged "${user.name}" email ${user.email} from BantuPay Admin Pool.`
      );
    }

    setSecurityActionUser(null);
  };

  const handleTeamCheckboxChange = (team: string) => {
    if (formTeams.includes(team)) {
      setFormTeams(prev => prev.filter(t => t !== team));
    } else {
      setFormTeams(prev => [...prev, team]);
    }
  };

  // Computations for Admin Metrics
  const totalOperators = users.length;
  const mfaEnforcedCount = users.filter(u => u.mfaEnabled).length;
  const mfaRate = totalOperators > 0 ? Math.round((mfaEnforcedCount / totalOperators) * 100) : 0;
  const activeCount = users.filter(u => u.status === 'active').length;
  const suspendedCount = users.filter(u => u.status === 'suspended').length;
  const pendingCount = users.filter(u => u.status === 'pending_activation').length;

  // Filter & Search Logic
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Get Avatar background based on Role
  const getAvatarStyle = (role: AdminRole) => {
    switch (role) {
      case 'super_admin':
        return 'bg-rose-500/15 text-rose-500 border-rose-500/25';
      case 'treasury_manager':
        return 'bg-blue-500/15 text-blue-500 border-blue-500/25';
      case 'compliance_officer':
        return 'bg-amber-500/15 text-amber-500 border-amber-500/25';
      case 'developer':
        return 'bg-cyan-500/15 text-cyan-500 border-cyan-500/25';
      case 'support_specialist':
      default:
        return 'bg-emerald-500/15 text-emerald-500 border-emerald-500/25';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in" id="user-management-screen">
      {/* Top Header Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20 inline-block font-semibold">
            BantuPay System Control Node
          </span>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 mt-2 flex items-center gap-2">
            <Users className="h-7 w-7 text-indigo-500" />
            Admins & Team Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Enforce role-based access control (RBAC), audit security credentials, and supervise regional payment routing operators.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all duration-150 flex items-center gap-2.5 shadow-lg shadow-indigo-600/10 shrink-0 self-start md:self-center"
        >
          <UserPlus className="h-4.5 w-4.5" /> Provision Operator
        </button>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Personnel</span>
            <p className="text-2xl font-black text-slate-800 mt-1">{totalOperators}</p>
            <p className="text-[10px] text-slate-500 mt-1">
              <span className="text-emerald-500 font-bold">{activeCount} active</span> &bull; {pendingCount} pending
            </p>
          </div>
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-500">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">MFA Enforcement</span>
            <p className="text-2xl font-black text-slate-800 mt-1">{mfaRate}%</p>
            <p className="text-[10px] text-slate-500 mt-1">
              <span className="text-emerald-500 font-bold">{mfaEnforcedCount} secure</span> &bull; {totalOperators - mfaEnforcedCount} weak keys
            </p>
          </div>
          <div className={`p-3 rounded-2xl border ${mfaRate === 100 ? 'bg-emerald-50 border-emerald-100 text-emerald-500' : 'bg-amber-50 border-amber-100 text-amber-500'}`}>
            {mfaRate === 100 ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5 animate-pulse" />}
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Suspended Operators</span>
            <p className={`text-2xl font-black mt-1 ${suspendedCount > 0 ? 'text-rose-600' : 'text-slate-800'}`}>{suspendedCount}</p>
            <p className="text-[10px] text-slate-500 mt-1">
              {suspendedCount > 0 ? 'Immediate action required' : 'Zero restricted policies'}
            </p>
          </div>
          <div className={`p-3 rounded-2xl border ${suspendedCount > 0 ? 'bg-rose-50 border-rose-100 text-rose-500' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
            <UserX className="h-5 w-5" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Node Sessions</span>
            <p className="text-2xl font-black text-slate-800 mt-1">{users.filter(u => u.lastActive === 'Active Now').length}</p>
            <p className="text-[10px] text-slate-500 mt-1">
              Concurrent console access
            </p>
          </div>
          <div className="p-3 bg-cyan-50 border border-cyan-100 rounded-2xl text-cyan-600">
            <Activity className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Activity Trends Chart */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <History className="h-4.5 w-4.5 text-indigo-500" />
              Operator Activity & Governance Trends
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Comparative view of operator login sessions and administrative actions executed over the last 30 days.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500"></span>
              Daily Logins
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
              Admin Actions
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={TREND_DATA}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                dx={-5}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="logins"
                name="logins"
                stroke="#6366f1"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="actions"
                name="actions"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Main Table & Filter Controls Card */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-xs overflow-hidden">
        
        {/* Search & Filters Ribbon */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search operators by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-2xl text-xs font-semibold placeholder:text-slate-400 text-slate-700 transition"
            />
          </div>

          {/* Filter switches */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 border border-slate-200 rounded-2xl">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none pr-2 cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="treasury_manager">Treasury Manager</option>
                <option value="compliance_officer">Compliance Officer</option>
                <option value="support_specialist">Support Specialist</option>
                <option value="developer">Developer</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 border border-slate-200 rounded-2xl">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none pr-2 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="suspended">Suspended Only</option>
                <option value="pending_activation">Pending Activation</option>
              </select>
            </div>

            {(searchQuery || roleFilter !== 'all' || statusFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setRoleFilter('all');
                  setStatusFilter('all');
                }}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Bulk Action Controls Bar */}
        {selectedUserIds.length > 0 && (
          <div className="px-6 py-4 bg-indigo-50/70 border-b border-indigo-100/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 text-white rounded-xl">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-indigo-950">
                  {selectedUserIds.length} {selectedUserIds.length === 1 ? 'operator' : 'operators'} selected
                </p>
                <p className="text-[10px] text-indigo-700/80 mt-0.5">
                  Execute batch role assignments for the highlighted accounts.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 border border-indigo-200 rounded-2xl shadow-xs">
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Change Role:</span>
                <select
                  value={bulkRole}
                  onChange={(e) => setBulkRole(e.target.value as AdminRole | '')}
                  className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none pr-2 cursor-pointer"
                >
                  <option value="">Select new role...</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="treasury_manager">Treasury Manager</option>
                  <option value="compliance_officer">Compliance Officer</option>
                  <option value="support_specialist">Support Specialist</option>
                  <option value="developer">Developer</option>
                </select>
              </div>

              <button
                type="button"
                onClick={applyBulkRoleChange}
                disabled={!bulkRole}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-bold rounded-2xl tracking-wider uppercase transition flex items-center gap-1.5 shadow-sm"
              >
                <Check className="h-3.5 w-3.5" /> Apply Update
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedUserIds([]);
                  setBulkRole('');
                }}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-2xl tracking-wider uppercase transition"
              >
                Cancel Selection
              </button>
            </div>
          </div>
        )}

        {/* Operators Table Grid */}
        <div className="overflow-x-auto">
          {filteredUsers.length === 0 ? (
            <div className="p-16 text-center">
              <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <Users className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-slate-700">No operators match query</p>
              <p className="text-xs text-slate-400 mt-1">Try resetting the status or role filters to broaden search parameters.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/20 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="pl-6 pr-2 py-4 text-center w-12">
                    <input
                      type="checkbox"
                      checked={filteredUsers.length > 0 && filteredUsers.every(u => selectedUserIds.includes(u.id))}
                      onChange={handleSelectAllFiltered}
                      className="h-4 w-4 rounded bg-slate-50 border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </th>
                  <th className="px-4 py-4">Operator Info</th>
                  <th className="px-6 py-4">Assigned Role</th>
                  <th className="px-6 py-4">Teams</th>
                  <th className="px-6 py-4 text-center">MFA Key Status</th>
                  <th className="px-6 py-4">Last Active</th>
                  <th className="px-6 py-4">Access Status</th>
                  <th className="px-6 py-4 text-right">Gate Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => {
                  const nameInitials = user.name
                    .split(' ')
                    .map(word => word[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase();

                  const avatarStyle = getAvatarStyle(user.role);

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/40 transition-colors text-slate-700 text-xs font-semibold">
                      
                      {/* Selection Checkbox */}
                      <td className="pl-6 pr-2 py-4.5 text-center w-12">
                        <input
                          type="checkbox"
                          checked={selectedUserIds.includes(user.id)}
                          onChange={(e) => handleSelectUser(user.id, e.target.checked)}
                          className="h-4 w-4 rounded bg-slate-50 border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                      </td>

                      {/* Name & Email Profile info */}
                      <td className="px-4 py-4.5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold tracking-tight text-sm shrink-0 shadow-xs ${avatarStyle}`}>
                            {nameInitials}
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 leading-tight">{user.name}</p>
                            <p className="text-[10px] text-slate-400 leading-tight mt-0.5 font-mono">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Assigned Role */}
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                            user.role === 'super_admin'
                              ? 'bg-rose-50 border-rose-100 text-rose-700'
                              : user.role === 'treasury_manager'
                              ? 'bg-blue-50 border-blue-100 text-blue-700'
                              : user.role === 'compliance_officer'
                              ? 'bg-amber-50 border-amber-100 text-amber-700'
                              : user.role === 'developer'
                              ? 'bg-cyan-50 border-cyan-100 text-cyan-700'
                              : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                          }`}>
                            {ROLE_LABELS[user.role]}
                          </span>

                          {/* Role Permissions Tooltip */}
                          <div className="relative group flex items-center">
                            <Info className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600 cursor-pointer transition" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-slate-900 border border-slate-800 text-white rounded-2xl shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 scale-95 group-hover:scale-100 transition-all duration-200 z-50 text-left font-sans">
                              <p className="font-extrabold text-[10px] uppercase tracking-wider text-slate-400 mb-1 border-b border-slate-850 pb-1">
                                {ROLE_LABELS[user.role]} Permissions
                              </p>
                              <p className="text-[10px] text-slate-200 font-medium leading-relaxed">
                                {user.role === 'super_admin' && 'Can manage all system infrastructure, gateway connections, and administrative rights.'}
                                {user.role === 'treasury_manager' && 'Can manage regional nodes, cashout pools, treasury floats, and exchange rates.'}
                                {user.role === 'compliance_officer' && 'Can manage KYC verifications, audit merchants, and supervise system compliance.'}
                                {user.role === 'developer' && 'Can inspect system operations logs, debug payment routes, and configure integrations.'}
                                {user.role === 'support_specialist' && 'Can view logs, manage transaction status, and process support tickets.'}
                              </p>
                              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900"></div>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Assigned Teams */}
                      <td className="px-6 py-4.5">
                        <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                          {user.teams.length === 0 ? (
                            <span className="text-[10px] text-slate-400 font-medium">None</span>
                          ) : (
                            user.teams.map((team, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded text-[9px] font-semibold"
                              >
                                {team}
                              </span>
                            ))
                          )}
                        </div>
                      </td>

                      {/* Multi Factor Auth */}
                      <td className="px-6 py-4.5 text-center">
                        <div className="flex items-center justify-center">
                          {user.mfaEnabled ? (
                            <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 border border-emerald-150 px-2.5 py-1 rounded-lg" title="MFA Protection Enforced">
                              <ShieldCheck className="h-4 w-4" />
                              <span className="text-[10px] font-bold uppercase tracking-wide">SECURE</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-rose-500 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-lg animate-pulse" title="Security policy breach - MFA not configured">
                              <ShieldAlert className="h-4 w-4" />
                              <span className="text-[10px] font-bold uppercase tracking-wide">VULNERABLE</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Last Active Timestamp */}
                      <td className="px-6 py-4.5 font-mono text-[10px] text-slate-500">
                        {user.lastActive === 'Active Now' ? (
                          <span className="text-emerald-500 font-bold flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                            ACTIVE NOW
                          </span>
                        ) : (
                          user.lastActive
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4.5">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${
                          user.status === 'active'
                            ? 'text-emerald-500'
                            : user.status === 'suspended'
                            ? 'text-rose-500'
                            : 'text-amber-500'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            user.status === 'active'
                              ? 'bg-emerald-500'
                              : user.status === 'suspended'
                              ? 'bg-rose-500'
                              : 'bg-amber-500 animate-pulse'
                          }`}></span>
                          {STATUS_LABELS[user.status]}
                        </span>
                      </td>

                      {/* Quick Gate Actions */}
                      <td className="px-6 py-4.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(user)}
                            className="p-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-lg transition"
                            title="Edit Operator Settings & Teams"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          {user.status === 'active' ? (
                            <button
                              onClick={() => setSecurityActionUser({ user, action: 'suspend' })}
                              className="p-1.5 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                              title="Revoke and Suspend Access"
                            >
                              <UserX className="h-3.5 w-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => setSecurityActionUser({ user, action: 'activate' })}
                              className="p-1.5 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 text-emerald-600 rounded-lg transition"
                              title="Restore Administrative Access"
                            >
                              <UserCheck className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {/* Security Options Popover Dropdown */}
                          <button
                            onClick={() => setSecurityActionUser({ user, action: 'reset_mfa' })}
                            className="p-1.5 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-600 rounded-lg transition"
                            title="Revoke & Reset MFA Device Key"
                          >
                            <Key className="h-3.5 w-3.5" />
                          </button>

                          {user.lastActive === 'Active Now' && (
                            <button
                              onClick={() => setSecurityActionUser({ user, action: 'terminate_sessions' })}
                              className="p-1.5 bg-amber-50 border border-amber-100 hover:bg-amber-100 text-amber-600 rounded-lg transition"
                              title="Instantly Kill All Active Sessions"
                            >
                              <Power className="h-3.5 w-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => setSecurityActionUser({ user, action: 'delete' })}
                            className="p-1.5 bg-slate-50 hover:bg-rose-600 hover:text-white border border-slate-200 hover:border-rose-600 rounded-lg transition text-slate-400"
                            title="De-provision Operator Permanently"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ----------------------------------------------------
          MODAL 1: PROVISION NEW OPERATOR
          ---------------------------------------------------- */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-scale-up my-8">
            <div className="p-6 bg-slate-950 border-b border-slate-850 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-950 border border-indigo-900 rounded-xl text-indigo-400">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base">Provision New Operator</h3>
                  <p className="text-[10px] text-slate-400 uppercase font-mono tracking-widest mt-0.5">
                    Assign Role & Network Teams
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-950/40 border border-rose-900 text-rose-400 rounded-xl text-xs flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Oluwaseun Adesanya"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Corporate Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="oluwaseun@bantupay.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Grid: Role & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gateway Role</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as AdminRole)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="treasury_manager">Treasury Manager</option>
                    <option value="compliance_officer">Compliance Officer</option>
                    <option value="support_specialist">Support Specialist</option>
                    <option value="developer">Developer</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Activation Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as AdminStatus)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="active">Active Now</option>
                    <option value="pending_activation">Pending Invitation</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {/* MFA Switch */}
              <div className="p-3 bg-slate-950 border border-slate-850 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-indigo-400" /> Multi-Factor Auth (MFA)
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Enforce hardware token on next session login.</p>
                </div>
                <input
                  type="checkbox"
                  checked={formMfaEnabled}
                  onChange={(e) => setFormMfaEnabled(e.target.checked)}
                  className="h-4 w-4 rounded bg-slate-900 border-slate-800 text-indigo-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
              </div>

              {/* Teams List */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Regional Nodes / Teams</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-850 max-h-[110px] overflow-y-auto scrollbar-thin">
                  {TEAMS_LIST.map((team) => (
                    <label key={team} className="flex items-center gap-2 text-[11px] text-slate-300 font-medium cursor-pointer py-1">
                      <input
                        type="checkbox"
                        checked={formTeams.includes(team)}
                        onChange={() => handleTeamCheckboxChange(team)}
                        className="h-3.5 w-3.5 rounded bg-slate-900 border-slate-800 text-indigo-500 focus:ring-0"
                      />
                      <span>{team}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-850 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-white font-bold rounded-xl text-xs uppercase tracking-wider transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition"
                >
                  Confirm Provisioning
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          MODAL 2: EDIT OPERATOR PROFILE
          ---------------------------------------------------- */}
      {editModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl animate-scale-up my-8">
            <div className="p-6 bg-slate-950 border-b border-slate-850 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-950 border border-emerald-900 rounded-xl text-emerald-400">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base">Edit Operator Access Pool</h3>
                  <p className="text-[10px] text-slate-400 uppercase font-mono tracking-widest mt-0.5">
                    Operator Code ID: {selectedUser.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-950/40 border border-rose-900 text-rose-400 rounded-xl text-xs flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Corporate Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="Email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Grid: Role & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gateway Role</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as AdminRole)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="treasury_manager">Treasury Manager</option>
                    <option value="compliance_officer">Compliance Officer</option>
                    <option value="support_specialist">Support Specialist</option>
                    <option value="developer">Developer</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Activation Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as AdminStatus)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="active">Active Now</option>
                    <option value="pending_activation">Pending Invitation</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              {/* MFA Switch */}
              <div className="p-3 bg-slate-950 border border-slate-850 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-indigo-400" /> Multi-Factor Auth (MFA)
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Enforce hardware token on next session login.</p>
                </div>
                <input
                  type="checkbox"
                  checked={formMfaEnabled}
                  onChange={(e) => setFormMfaEnabled(e.target.checked)}
                  className="h-4 w-4 rounded bg-slate-900 border-slate-800 text-indigo-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                />
              </div>

              {/* Teams List */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assigned Regional Nodes / Teams</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-850 max-h-[110px] overflow-y-auto scrollbar-thin">
                  {TEAMS_LIST.map((team) => (
                    <label key={team} className="flex items-center gap-2 text-[11px] text-slate-300 font-medium cursor-pointer py-1">
                      <input
                        type="checkbox"
                        checked={formTeams.includes(team)}
                        onChange={() => handleTeamCheckboxChange(team)}
                        className="h-3.5 w-3.5 rounded bg-slate-900 border-slate-800 text-indigo-500 focus:ring-0"
                      />
                      <span>{team}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-850 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-white font-bold rounded-xl text-xs uppercase tracking-wider transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition"
                >
                  Update Authorization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------
          MODAL 3: SECURITY CONFIRMATION DIALOG (SUSPEND/ACTIVATE/MFA RESET)
          ---------------------------------------------------- */}
      {securityActionUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-scale-up">
            <div className="p-6 bg-slate-950 border-b border-slate-850 flex items-center gap-3">
              <div className={`p-2 rounded-xl border ${
                securityActionUser.action === 'delete' || securityActionUser.action === 'suspend'
                  ? 'bg-rose-950/50 border-rose-900 text-rose-400'
                  : 'bg-indigo-950/50 border-indigo-900 text-indigo-400'
              }`}>
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-black text-white text-sm uppercase tracking-wider">Security Policy Confirmation</h3>
                <p className="text-[10px] text-slate-500 font-mono tracking-wider">AUTHORIZATION OVERRIDE REQUIRED</p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                You are executing a remote security control operation on operator{' '}
                <strong className="text-white">"{securityActionUser.user.name}"</strong> ({ROLE_LABELS[securityActionUser.user.role]}).
              </p>

              <div className="p-4.5 bg-slate-950 border border-slate-850 rounded-2xl text-[11px] font-mono space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Security Action:</span>
                  <span className="text-amber-500 font-bold uppercase tracking-wider">
                    {securityActionUser.action.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Node Operator:</span>
                  <span className="text-slate-300 font-bold">{securityActionUser.user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Regional Team:</span>
                  <span className="text-slate-300">{securityActionUser.user.teams.join(', ') || 'No regional nodes'}</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 leading-relaxed flex items-start gap-1.5">
                <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>This action is logged instantly to the central audit log pool under PCI compliance guidelines.</span>
              </p>

              {/* Confirmation Actions */}
              <div className="pt-4 border-t border-slate-850 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSecurityActionUser(null)}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-white font-bold rounded-xl text-xs uppercase tracking-wider transition"
                >
                  Dismiss
                </button>
                <button
                  type="button"
                  onClick={executeSecurityAction}
                  className={`px-5 py-2.5 font-black rounded-xl text-xs uppercase tracking-wider transition ${
                    securityActionUser.action === 'delete' || securityActionUser.action === 'suspend'
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950'
                  }`}
                >
                  Authorize Action
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Bar for Batch Operations */}
      <AnimatePresence>
        {selectedUserIds.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-950/95 border border-slate-800 text-white shadow-2xl rounded-3xl p-4 flex flex-col md:flex-row md:items-center gap-4 max-w-2xl w-[calc(100%-2rem)] backdrop-blur-md"
          >
            <div className="flex items-center gap-3 shrink-0">
              <div className="h-10 w-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-black text-white">
                  Batch Operations
                </p>
                <p className="text-[10px] text-slate-400 font-medium">
                  {selectedUserIds.length} operators selected
                </p>
              </div>
            </div>

            <div className="hidden md:block h-8 w-px bg-slate-800 shrink-0" />

            <div className="flex flex-wrap items-center gap-2 w-full justify-end">
              <button
                type="button"
                onClick={handleBatchRestore}
                className="flex-1 md:flex-none px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/30 font-bold rounded-2xl text-[10px] uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserCheck className="h-3.5 w-3.5" /> Restore
              </button>

              <button
                type="button"
                onClick={handleBatchSuspend}
                className="flex-1 md:flex-none px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/30 font-bold rounded-2xl text-[10px] uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserX className="h-3.5 w-3.5" /> Suspend
              </button>

              <button
                type="button"
                onClick={handleBatchForceMfaReset}
                className="flex-1 md:flex-none px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 hover:border-amber-500/30 font-bold rounded-2xl text-[10px] uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Key className="h-3.5 w-3.5" /> Force MFA Reset
              </button>

              <button
                type="button"
                onClick={() => setSelectedUserIds([])}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl text-[10px] uppercase tracking-wider transition cursor-pointer"
                title="Cancel Selection"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
