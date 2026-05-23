import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import VerificationList from '../../../components/adminDashboard/verification/VerificationList';
import VerificationDetail from '../../../components/adminDashboard/verification/VerificationDetail';
import bookingService from '../../../services/bookingService';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const VerificationPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const sub = searchParams.get('sub') || 'list';
  const id = searchParams.get('id');
  
  const [selectedItem, setSelectedItem] = useState(null);
  const [loadingItem, setLoadingItem] = useState(false);

  useEffect(() => {
    if (sub === 'detail' && id) {
      if (!selectedItem || selectedItem.id !== parseInt(id)) {
        const fetchItem = async () => {
          setLoadingItem(true);
          try {
            const res = await bookingService.getBookingById(id);
            setSelectedItem(res.data || res);
          } catch (err) {
            console.error('Failed to fetch booking detail:', err);
          } finally {
            setLoadingItem(false);
          }
        };
        fetchItem();
      }
    } else {
      setSelectedItem(null);
    }
  }, [sub, id, selectedItem]);

  const handleViewDetail = (item) => {
    setSelectedItem(item);
    setSearchParams({ view: 'verifikasi', sub: 'detail', id: item.id.toString() });
  };

  const handleBackToList = () => {
    setSearchParams({ view: 'verifikasi' });
    setSelectedItem(null);
  };

  if (sub === 'detail' && loadingItem && !selectedItem) {
    return <LoadingSpinner text="Memuat detail pengajuan..." />;
  }

  return (
    <div className="verification-page">
      {sub === 'list' ? (
        <VerificationList onViewDetail={handleViewDetail} />
      ) : (
        selectedItem && <VerificationDetail item={selectedItem} onBack={handleBackToList} />
      )}
    </div>
  );
};

export default VerificationPage;
