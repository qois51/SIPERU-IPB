import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import RoomList from '../../../components/adminDashboard/room/RoomList';
import RoomDetail from '../../../components/adminDashboard/room/RoomDetail';
import RoomForm from '../../../components/adminDashboard/room/RoomForm';
import roomService from '../../../services/roomService';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { X } from 'lucide-react';

const RoomPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const sub = searchParams.get('sub') || 'list';
  const id = searchParams.get('id');

  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loadingRoom, setLoadingRoom] = useState(false);
  const [modalImage, setModalImage] = useState(null);

  useEffect(() => {
    if ((sub === 'detail' || sub === 'edit') && id) {
      if (!selectedRoom || selectedRoom.id !== parseInt(id)) {
        const fetchRoom = async () => {
          setLoadingRoom(true);
          try {
            const res = await roomService.getRoomById(id);
            setSelectedRoom(res);
          } catch (err) {
            console.error('Failed to fetch room detail:', err);
          } finally {
            setLoadingRoom(false);
          }
        };
        fetchRoom();
      }
    } else {
      setSelectedRoom(null);
    }
  }, [sub, id, selectedRoom]);

  const handleOpenModal = (img) => setModalImage(img);
  const handleCloseModal = () => setModalImage(null);

  const handleViewDetail = (room) => {
    setSelectedRoom(room);
    setSearchParams({ view: 'ruangan', sub: 'detail', id: room.id.toString() });
  };

  const handleAddRoom = () => {
    setSelectedRoom(null);
    setSearchParams({ view: 'ruangan', sub: 'add' });
  };

  const handleEditRoom = (room) => {
    setSelectedRoom(room);
    setSearchParams({ view: 'ruangan', sub: 'edit', id: room.id.toString() });
  };

  const handleBackToList = () => {
    setSearchParams({ view: 'ruangan' });
    setSelectedRoom(null);
  };

  const handleSuccess = () => {
    setSearchParams({ view: 'ruangan' });
    setSelectedRoom(null);
  };

  if ((sub === 'detail' || sub === 'edit') && loadingRoom && !selectedRoom) {
    return <LoadingSpinner text="Memuat data ruangan..." />;
  }

  const renderContent = () => {
    switch (sub) {
      case 'list':
        return <RoomList onViewDetail={handleViewDetail} onAddRoom={handleAddRoom} onZoomImage={handleOpenModal} />;
      case 'detail':
        return selectedRoom && <RoomDetail room={selectedRoom} onBack={handleBackToList} onEdit={() => handleEditRoom(selectedRoom)} onDeleteSuccess={handleSuccess} onZoomImage={handleOpenModal} />;
      case 'add':
        return <RoomForm onBack={handleBackToList} onSuccess={handleSuccess} onZoomImage={handleOpenModal} />;
      case 'edit':
        return selectedRoom && <RoomForm room={selectedRoom} onBack={() => setSearchParams({ view: 'ruangan', sub: 'detail', id: selectedRoom.id.toString() })} onSuccess={handleSuccess} onZoomImage={handleOpenModal} />;
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
