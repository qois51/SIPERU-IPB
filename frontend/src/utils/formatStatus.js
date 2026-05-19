/**
 * formatStatus.js — Status display utilities
 */

export const STATUS_CONFIG = {
  Pending: {
    label: 'Pending',
    labelID: 'Menunggu',
    color: '#eab308',
    bgColor: '#fef9c3',
    textColor: '#854d0e',
    tailwind: 'bg-yellow-100 text-yellow-800',
  },
  Approved: {
    label: 'Approved',
    labelID: 'Disetujui',
    color: '#22c55e',
    bgColor: '#dcfce7',
    textColor: '#166534',
    tailwind: 'bg-green-100 text-green-800',
  },
  Rejected: {
    label: 'Rejected',
    labelID: 'Ditolak',
    color: '#ef4444',
    bgColor: '#fee2e2',
    textColor: '#991b1b',
    tailwind: 'bg-red-100 text-red-800',
  },
  Completed: {
    label: 'Completed',
    labelID: 'Selesai',
    color: '#3b82f6',
    bgColor: '#dbeafe',
    textColor: '#1e40af',
    tailwind: 'bg-blue-100 text-blue-800',
  },
  Draft: {
    label: 'Draft',
    labelID: 'Draft',
    color: '#64748b',
    bgColor: '#f1f5f9',
    textColor: '#334155',
    tailwind: 'bg-slate-100 text-slate-800',
  },
};

export const getStatusConfig = (status) => {
  return STATUS_CONFIG[status] || STATUS_CONFIG.Pending;
};

export const getStatusLabel = (status) => {
  return getStatusConfig(status).labelID;
};

export const getStatusColor = (status) => {
  return getStatusConfig(status).color;
};
