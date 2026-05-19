import React, { useState } from 'react';
import RoomList from '../../../components/adminDashboard/room/RoomList';
import RoomDetail from '../../../components/adminDashboard/room/RoomDetail';
import RoomForm from '../../../components/adminDashboard/room/RoomForm';
import { X } from 'lucide-react';

const RoomPage = () => {
  const [view, setView] = useState('list'); // 'list', 'detail', 'add', 'edit'
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [modalImage, setModalImage] = useState(null);

  const handleOpenModal = (img) => setModalImage(img);
  const handleCloseModal = () => setModalImage(null);

  const handleViewDetail = (room) => {
    setSelectedRoom(room);
    setView('detail');
  };

  const handleAddRoom = () => {
    setSelectedRoom(null);
    setView('add');
  };

  const handleEditRoom = (room) => {
    setSelectedRoom(room);
    setView('edit');
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedRoom(null);
  };

  const handleSuccess = () => {
    setView('list');
    setSelectedRoom(null);
  };

  const renderContent = () => {
    switch (view) {
      case 'list':
        return <RoomList onViewDetail={handleViewDetail} onAddRoom={handleAddRoom} onZoomImage={handleOpenModal} />;
      case 'detail':
        return <RoomDetail room={selectedRoom} onBack={handleBackToList} onEdit={() => handleEditRoom(selectedRoom)} onDeleteSuccess={handleSuccess} onZoomImage={handleOpenModal} />;
      case 'add':
        return <RoomForm onBack={handleBackToList} onSuccess={handleSuccess} onZoomImage={handleOpenModal} />;
      case 'edit':
        return <RoomForm room={selectedRoom} onBack={() => setView('detail')} onSuccess={handleSuccess} onZoomImage={handleOpenModal} />;
      default:
        return <RoomList onViewDetail={handleViewDetail} onAddRoom={handleAddRoom} onZoomImage={handleOpenModal} />;
    }
  };

  return (
    <div className="room-page">
      {renderContent()}
      
      {modalImage && (
        <div className="image-lightbox-overlay" onClick={handleCloseModal}>
          <div className="lightbox-content" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close" onClick={handleCloseModal}><X size={32} /></button>
            <img src={modalImage} alt="Full view" />
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomPage;
