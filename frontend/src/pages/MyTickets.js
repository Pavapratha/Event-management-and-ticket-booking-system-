import React from 'react';
import { Link } from 'react-router-dom';
import { PageContainer, Section, Card } from '../components/Layout';

export const MyTickets = () => {
  const tickets = []; // Empty for now - would fetch from API

  return (
    <PageContainer>
      <Section>
        <div className="tickets-header">
          <h1>My Tickets</h1>
          <p className="tickets-subtitle">View and manage your event tickets</p>
        </div>

        {tickets.length === 0 ? (
          <Card className="empty-state">
            <div className="empty-icon">🎫</div>
            <h3>No Tickets Yet</h3>
            <p>You haven't purchased any tickets yet. Browse our events to find something exciting!</p>
            <Link to="/events" className="btn btn-primary">
              Browse Events
            </Link>
          </Card>
        ) : (
          <div className="tickets-list">
            {tickets.map((ticket) => (
              <Card key={ticket.id} className="ticket-card">
                <div className="ticket-details">
                  <h3>{ticket.eventName}</h3>
                  <p className="ticket-date">{ticket.date}</p>
                  <p className="ticket-location">{ticket.location}</p>
                </div>
                <div className="ticket-qr">
                  <button className="btn btn-secondary">View QR Code</button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Section>
    </PageContainer>
  );
};
