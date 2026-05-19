import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({
  title = 'Tidak ada data',
  description = 'Data yang Anda cari tidak ditemukan.',
  icon: Icon = Inbox,
  action = null,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-4">{description}</p>
      {action}
    </div>
  );
};

export default EmptyState;
