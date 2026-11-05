import { useState } from 'react';
import HotelTab from './HotelTab.jsx';
import RoomsTab from './RoomsTab.jsx';
import { BookingsTab, ReviewsTab, InquiriesTab } from './Lists.jsx';

const TABS = ['Hotel profile', 'Rooms', 'Bookings', 'Reviews', 'Inquiries'];

export default function Dashboard() {
  const [tab, setTab] = useState(TABS[0]);
  return (
    <>
      <h1>Manager dashboard</h1>
      <div className="tabs">
        {TABS.map((t) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>)}
      </div>
      {tab === 'Hotel profile' && <HotelTab />}
      {tab === 'Rooms' && <RoomsTab />}
      {tab === 'Bookings' && <BookingsTab />}
      {tab === 'Reviews' && <ReviewsTab />}
      {tab === 'Inquiries' && <InquiriesTab />}
    </>
  );
}
