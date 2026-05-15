import React from 'react';

const ActivityItem = ({ activity }) => {
  const dateObj = new Date(activity.date);
  const dayName = dateObj.toLocaleDateString('id-ID', { weekday: 'long' });
  const formattedDate = dateObj.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });

  return (
    <div className="activity-item">
      <div className="activity-content">
        <h4>Peminjaman {activity.room_name} - <span className="activity-desc">{activity.activity_name}</span></h4>
        <div className="activity-time">
          <span className="badge-upcoming">{dayName}</span> {formattedDate}, {activity.start_time} - {activity.end_time}
        </div>
      </div>
    </div>
  );
};

const ActivityList = ({ activities }) => {
  return (
    <div className="activity-section">
      <h3>Aktivitas Mendatang</h3>
      <div className="activity-container">
        {activities && activities.length > 0 ? (
          activities.map((act) => <ActivityItem key={act.id} activity={act} />)
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', opacity: 0.6 }}>Tidak ada aktivitas mendatang</div>
        )}
      </div>
    </div>
  );
};

export default ActivityList;
