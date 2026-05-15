import React, { useState } from 'react';
import UserList from '../../../components/adminDashboard/user/UserList';
import UserForm from '../../../components/adminDashboard/user/UserForm';
import { X } from 'lucide-react';

const UserPage = () => {
  const [view, setView] = useState('list'); // 'list', 'add', 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalImage, setModalImage] = useState(null);

  const handleOpenModal = (img) => setModalImage(img);
  const handleCloseModal = () => setModalImage(null);

  const handleAddUser = () => {
    setSelectedUser(null);
    setView('add');
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setView('edit');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedUser(null);
  };

  const handleSuccess = () => {
    setView('list');
    setSelectedUser(null);
  };

  const renderContent = () => {
    switch (view) {
      case 'list':
        return <UserList onAddUser={handleAddUser} onEditUser={handleEditUser} onZoomImage={handleOpenModal} />;
      case 'add':
        return <UserForm onBack={handleBackToList} onSuccess={handleSuccess} onZoomImage={handleOpenModal} />;
      case 'edit':
        return <UserForm user={selectedUser} onBack={handleBackToList} onSuccess={handleSuccess} onZoomImage={handleOpenModal} />;
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
