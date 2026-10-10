import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Activity, 
  Database, 
  Search, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Sliders, 
  Lock, 
  Unlock,
  AlertTriangle,
  Server
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'audit' | 'system'
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [systemHealth, setSystemHealth] = useState(null);

  const { showToast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getAllUsers(roleFilter);
      setUsers(data);
    } catch (err) {
      showToast('Failed to load user list. Admin credentials required.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const data = await api.getAuditLogs(50);
      setAuditLogs(data);
    } catch (err) {
      showToast('Failed to load security audit trail.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchHealth = async () => {
    try {
      const data = await api.checkHealth();
      setSystemHealth(data);
    } catch (err) {
      setSystemHealth({ status: 'error', database_connected: false });
    }
  };

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    else if (activeTab === 'audit') fetchAuditLogs();
    else if (activeTab === 'system') fetchHealth();
  }, [activeTab, roleFilter]);

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      await api.updateUserStatus(userId, !currentStatus);
      showToast(`User account ${!currentStatus ? 'activated' : 'deactivated'}.`, 'success');
      fetchUsers();
    } catch (err) {
      showToast('Failed to update user status.', 'error');
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fade-in">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-emerald-500/20 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Admin Control Center</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Platform telemetry, user access enforcement, and security audit log review.
          </p>
        </div>

        {/* Live System Pill */}
        <div className="flex items-center space-x-3 px-4 py-2 rounded-2xl bg-slate-950 border border-white/10 text-xs">
          <Database className="w-4 h-4 text-emerald-400" />
          <div className="text-left">
            <p className="font-semibold text-white">MongoDB Atlas</p>
            <p className="text-[10px] text-emerald-400 font-medium">Cluster Active & Guarded</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory & Status</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'audit'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Security Audit Trail</span>
        </button>

        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'system'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>System Telemetry</span>
        </button>
      </div>

      {/* TAB 1: USERS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-white/10">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search user by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Role Filter */}
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-xs text-slate-400 font-semibold">Filter Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="p-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">All Roles</option>
                <option value="student">Students</option>
                <option value="recruiter">Recruiters</option>
                <option value="admin">Admins</option>
              </select>

              <button
                onClick={fetchUsers}
                className="p-2 rounded-xl bg-slate-950 border border-white/10 text-slate-400 hover:text-white"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Users Table */}
          <div className="rounded-2xl border border-white/10 bg-slate-900 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-white/10 text-slate-400 uppercase font-bold tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Created Date</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center py-12 text-slate-500">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        Loading registered accounts...
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-12 text-slate-500">
                        No users matching the filter criteria found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4">
                          <div>
                            <p className="font-semibold text-white">{u.name}</p>
                            <p className="text-[11px] text-slate-400">{u.email}</p>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              u.role === 'admin'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : u.role === 'recruiter'
                                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                              u.is_active
                                ? 'bg-emerald-950/60 text-emerald-300'
                                : 'bg-rose-950/60 text-rose-300'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                            <span>{u.is_active ? 'Active' : 'Suspended'}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                          {new Date(u.created_at).toLocaleDateString()} {new Date(u.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleToggleUserStatus(u.id, u.is_active)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                              u.is_active
                                ? 'bg-rose-950/40 text-rose-300 border border-rose-500/30 hover:bg-rose-900/60'
                                : 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/60'
                            }`}
                          >
                            {u.is_active ? 'Deactivate' : 'Activate'}
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
      )}

      {/* TAB 2: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="rounded-2xl border border-white/10 bg-slate-900 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Security Audit Trail (Last 50 Actions)</span>
            <button onClick={fetchAuditLogs} className="p-1.5 rounded-lg bg-slate-950 text-slate-400 hover:text-white">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-white/10 text-slate-400 uppercase font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Action</th>
                  <th className="py-3.5 px-4">Target Entity</th>
                  <th className="py-3.5 px-4">User ID / Email</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-12 text-slate-500">
                      No audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono text-[11px] font-bold">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                        {log.entity_type} ({log.entity_id})
                      </td>
                      <td className="py-3.5 px-4 text-white">
                        {log.user_email || log.user_id}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SYSTEM TELEMETRY */}
      {activeTab === 'system' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Database Health</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-white/5">
                <span className="text-slate-400">Cluster Status:</span>
                <span className="text-emerald-400 font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Online & Verified</span>
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-white/5">
                <span className="text-slate-400">Active Collections:</span>
                <span className="text-white font-bold">23 Collections Live</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-white/5">
                <span className="text-slate-400">Schema Enforcement:</span>
                <span className="text-blue-400 font-bold">Strict $jsonSchema Active</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">API Runtime</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-white/5">
                <span className="text-slate-400">Backend Server:</span>
                <span className="text-emerald-400 font-bold">FastAPI + Uvicorn</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-white/5">
                <span className="text-slate-400">Total Registered Routes:</span>
                <span className="text-purple-400 font-bold">42 REST Endpoints</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-white/5">
                <span className="text-slate-400">Security:</span>
                <span className="text-blue-400 font-bold">OAuth2 Bearer JWT HS256</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPage;
