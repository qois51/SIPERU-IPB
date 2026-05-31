import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import UserList from '../../../components/adminDashboard/user/UserList';
import UserForm from '../../../components/adminDashboard/user/UserForm';
import adminService from '../../../services/adminService';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { X } from 'lucide-react';

const UserPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const sub = searchParams.get('sub') || 'list';
  const id = searchParams.get('id');

  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(false);
  const [modalImage, setModalImage] = useState(null);

  useEffect(() => {
    if (sub === 'edit' && id) {
      if (!selectedUser || selectedUser.id !== parseInt(id)) {
        const fetchUser = async () => {
          setLoadingUser(true);
          try {
            const res = await adminService.getUserById(id);
            setSelectedUser(res.data || res);
          } catch (err) {
            console.error('Failed to fetch user detail:', err);
          } finally {
            setLoadingUser(false);
          }
        };
        fetchUser();
      }
    } else {
      setSelectedUser(null);
    }
  }, [sub, id, selectedUser]);

  const handleOpenModal = (img) => setModalImage(img);
  const handleCloseModal = () => setModalImage(null);

  const handleAddUser = () => {
    setSelectedUser(null);
    setSearchParams({ view: 'user', sub: 'add' });
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setSearchParams({ view: 'user', sub: 'edit', id: user.id.toString() });
  };

  const handleBackToList = () => {
    setSearchParams({ view: 'user' });
    setSelectedUser(null);
  };

  const handleSuccess = () => {
    setSearchParams({ view: 'user' });
    setSelectedUser(null);
  };

  if (sub === 'edit' && loadingUser && !selectedUser) {
    return <LoadingSpinner text="Memuat data pengguna..." />;
  }

  const renderContent = () => {
    switch (sub) {
      case 'list':
        return <UserList onAddUser={handleAddUser} onEditUser={handleEditUser} onZoomImage={handleOpenModal} />;
      case 'add':
        return <UserForm onBack={handleBackToList} onSuccess={handleSuccess} onZoomImage={handleOpenModal} />;
      case 'edit':
        return selectedUser && <UserForm user={selectedUser} onBack={handleBackToList} onSuccess={handleSuccess} onZoomImage={handleOpenModal} />;
      default:
        return <UserList onAddUser={handleAddUser} onEditUser={handleEditUser} onZoomImage={handleOpenModal} />;
    }
  };

  return (
    <div className="user-page">
      {renderContent()}
      
      {modalImage && (
        <div className="image-lightbox-overlay" onClick={handleCloseModal}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close" onClick={handleCloseModal}><X size={32} /></button>
            <img src={modalImage} alt="Full view" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: '8px' }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserPage;
