import React from 'react';
import { PageContainer, Section, Card } from '../components/Layout';

export const Events = () => {
  const sampleEvents = [
    {
      id: 1,
      title: 'Summer Music Festival',
      date: 'August 15, 2024',
      location: 'Central Park',
      image: '🎵',
      price: '$45.00',
    },
    {
      id: 2,
      title: 'Tech Conference 2024',
      date: 'September 20, 2024',
      location: 'Convention Center',
      image: '💻',
      price: '$120.00',
    },
    {
      id: 3,
      title: 'Art Exhibition Opening',
      date: 'October 5, 2024',
      location: 'City Gallery',
      image: '🎨',
      price: '$25.00',
    },
    {
      id: 4,
      title: 'Comedy Night Special',
      date: 'October 12, 2024',
      location: 'Downtown Theater',
      image: '😂',
      price: '$35.00',
    },
  ];

  return (
    <PageContainer>
      <Section>
        <div className="events-header">
          <h1>Upcoming Events</h1>
          <p className="events-subtitle">Discover and book tickets for amazing events</p>
        </div>

        <div className="events-grid">
          {sampleEvents.map((event) => (
            <Card key={event.id} className="event-card">
              <div className="event-image">{event.image}</div>
              <div className="event-details">
                <h3>{event.title}</h3>
                <p className="event-date">📅 {event.date}</p>
                <p className="event-location">📍 {event.location}</p>
                <div className="event-footer">
                  <span className="event-price">{event.price}</span>
                  <button className="btn btn-primary btn-sm">Get Tickets</button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Section>
    </PageContainer>
  );
};
