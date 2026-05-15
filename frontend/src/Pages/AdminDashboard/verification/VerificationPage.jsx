import React, { useState } from 'react';
import VerificationList from '../../../components/adminDashboard/verification/VerificationList';
import VerificationDetail from '../../../components/adminDashboard/verification/VerificationDetail';

const VerificationPage = () => {
  const [view, setView] = useState('list'); // 'list' or 'detail'
  const [selectedItem, setSelectedItem] = useState(null);

  const handleViewDetail = (item) => {
    setSelectedItem(item);
    setView('detail');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedItem(null);
  };

  return (
    <div className="verification-page">
      {view === 'list' ? (
        <VerificationList onViewDetail={handleViewDetail} />
      ) : (
        <VerificationDetail item={selectedItem} onBack={handleBackToList} />
      )}
    </div>
  );
};

export default VerificationPage;
