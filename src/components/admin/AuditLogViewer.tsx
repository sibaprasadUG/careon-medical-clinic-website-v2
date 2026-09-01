import React, { useState, useEffect } from 'react';
import { DataAccessLayer } from '../../lib/dal';
import { AuditLog } from '../../types';
import {
  ScrollText,
  Search,
  Filter,
  Clock,
  User,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

export const AuditLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEntityFilter, setSelectedEntityFilter] = useState<string>('all');

  const loadLogs = () => {
    setLogs(DataAccessLayer.getAuditLogs());
  };

  useEffect(() => {
    loadLogs();
    const handleUpdate = () => loadLogs();
    window.addEventListener('careon_data_updated', handleUpdate);
    return () => window.removeEventListener('careon_data_updated', handleUpdate);
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.adminEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.entityName && log.entityName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesEntity = selectedEntityFilter === 'all' || log.entityType === selectedEntityFilter;

    return matchesSearch && matchesEntity;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#0F172A] tracking-tight">
            Administrative Audit Trail
          </h2>
          <p className="text-xs text-slate-500">
            Immutable log of all content modifications, publication status updates, and coordinator actions.
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by action, email, doctor name..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
            />
          </div>

          <div>
            <select
              value={selectedEntityFilter}
              onChange={(e) => setSelectedEntityFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-[#007E70] focus:outline-none"
            >
              <option value="all">All Entity Types ({logs.length})</option>
              <option value="DOCTOR">Doctor Modifications</option>
              <option value="SERVICE">Service Modifications</option>
              <option value="DEPARTMENT">Department Modifications</option>
              <option value="PATIENT_STORY">Patient Stories</option>
              <option value="GALLERY">Gallery Assets</option>
              <option value="FAQ">FAQs</option>
              <option value="APPOINTMENT_REQUEST">Appointment Intakes</option>
              <option value="SETTINGS">Website Settings</option>
              <option value="SEO">SEO Settings</option>
              <option value="SYSTEM">System Reset / Init</option>
            </select>
          </div>
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-16 text-xs text-slate-400">
            No audit logs found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Administrator</th>
                  <th className="py-3.5 px-4">Entity</th>
                  <th className="py-3.5 px-4">Action Performed</th>
                  <th className="py-3.5 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{log.adminName}</div>
                      <div className="text-[10px] text-slate-400">{log.adminEmail}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-teal-50 text-[#007E70] text-[10px] font-bold">
                        {log.entityType}
                      </span>
                      {log.entityName && (
                        <div className="text-[11px] font-semibold text-slate-800 mt-0.5">
                          {log.entityName}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">{log.action}</td>

                    <td className="py-3.5 px-4 text-slate-500 text-[11px] max-w-sm">
                      {log.details || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
