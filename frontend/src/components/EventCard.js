import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarIcon, MapPinIcon, ClockIcon, HeartIcon, TicketIcon, UsersIcon } from './Icons';
import './EventCard.css';

export const EventCard = ({ 
  event,
  variant = 'default', // 'default', 'featured', 'compact', 'horizontal'
  showActions = true,
  onClick = null // Optional click handler for booking modal
}) => {
  const [isLiked, setIsLiked] = useState(false);

  const {
    id,
    title,
    date,
    time,
    location,
    venue,
    image,
    price,
    originalPrice,
    category,
    attendees,
    spotsLeft,
    isHot,
    isFeatured,
    rating
  } = event;

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  // If onClick is provided, render as a clickable div instead of a Link
  const handleCardClick = (e) => {
    if (onClick) {
      console.log('[EventCard] Click detected, triggering onClick handler', { eventId: event.id, eventTitle: event.title });
      onClick(e);
    }
  };

  const cardProps = onClick ? {
    onClick: handleCardClick,
    role: 'button',
    tabIndex: '0',
    style: { cursor: 'pointer' },
    onKeyDown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        console.log('[EventCard] Keyboard Enter/Space detected');
        onClick(e);
      }
    }
  } : {};

  const CardWrapper = onClick ? 'div' : Link;
  const wrapperProps = onClick ? cardProps : { to: `/events/${id}` };

  if (variant === 'horizontal') {
    return (
      <CardWrapper {...wrapperProps} className="event-card event-card-horizontal">
        <div className="event-card-image">
          {image ? (
            <img src={image} alt={title} />
          ) : (
            <div className="event-card-placeholder">
              <TicketIcon size={32} />
            </div>
          )}
          {category && <span className="event-category">{category}</span>}
        </div>
        
        <div className="event-card-body">
          <div className="event-card-header">
            <h3 className="event-title">{title}</h3>
            {isHot && <span className="badge badge-secondary">Hot</span>}
          </div>
          
          <div className="event-meta">
            <div className="event-meta-item">
              <CalendarIcon size={16} />
              <span>{date}</span>
            </div>
            {time && (
              <div className="event-meta-item">
                <ClockIcon size={16} />
                <span>{time}</span>
              </div>
            )}
            <div className="event-meta-item">
              <MapPinIcon size={16} />
              <span>{venue || location}</span>
            </div>
          </div>
          
          <div className="event-card-footer">
            <div className="event-price-section">
              <span className="event-price">{price}</span>
              {originalPrice && (
                <span className="event-original-price">{originalPrice}</span>
              )}
            </div>
            <button className="btn btn-primary btn-sm">Get Tickets</button>
          </div>
        </div>
        
        {showActions && (
          <button 
            className={`event-like-btn ${isLiked ? 'liked' : ''}`} 
            onClick={handleLike}
            aria-label="Like event"
          >
            <HeartIcon size={18} filled={isLiked} />
          </button>
        )}
      </CardWrapper>
    );
  }

  if (variant === 'compact') {
    return (
      <CardWrapper {...wrapperProps} className="event-card event-card-compact">
        <div className="event-card-image">
          {image ? (
            <img src={image} alt={title} />
          ) : (
            <div className="event-card-placeholder">
              <TicketIcon size={24} />
            </div>
          )}
        </div>
        
        <div className="event-card-body">
          <h4 className="event-title">{title}</h4>
          <div className="event-meta-item">
            <CalendarIcon size={14} />
            <span>{date}</span>
          </div>
          <span className="event-price">{price}</span>
        </div>
      </CardWrapper>
    );
  }

  if (variant === 'featured') {
    return (
      <CardWrapper {...wrapperProps} className="event-card event-card-featured">
        <div className="event-card-image">
          {image ? (
            <img src={image} alt={title} />
          ) : (
            <div className="event-card-placeholder">
              <TicketIcon size={48} />
            </div>
          )}
          <div className="event-image-overlay"></div>
          
          {showActions && (
            <button 
              className={`event-like-btn ${isLiked ? 'liked' : ''}`} 
              onClick={handleLike}
              aria-label="Like event"
            >
              <HeartIcon size={20} filled={isLiked} />
            </button>
          )}
          
          <div className="event-badges">
            {isFeatured && <span className="badge badge-primary">Featured</span>}
            {isHot && <span className="badge badge-secondary">Hot</span>}
            {category && <span className="badge badge-outline">{category}</span>}
          </div>
        </div>
        
        <div className="event-card-body">
          <h3 className="event-title">{title}</h3>
          
          <div className="event-meta">
            <div className="event-meta-item">
              <CalendarIcon size={16} />
              <span>{date}</span>
            </div>
            {time && (
              <div className="event-meta-item">
                <ClockIcon size={16} />
                <span>{time}</span>
              </div>
            )}
          </div>
          
          <div className="event-meta">
            <div className="event-meta-item">
              <MapPinIcon size={16} />
              <span>{venue || location}</span>
            </div>
          </div>
          
          {attendees && (
            <div className="event-attendees">
              <div className="attendee-avatars">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="attendee-avatar">
                    <UsersIcon size={12} />
                  </div>
                ))}
              </div>
              <span className="attendee-count">+{attendees} attending</span>
            </div>
          )}
          
          <div className="event-card-footer">
            <div className="event-price-section">
              <span className="event-price-label">From</span>
              <span className="event-price">{price}</span>
              {originalPrice && (
                <span className="event-original-price">{originalPrice}</span>
              )}
            </div>
            
            {spotsLeft && spotsLeft < 50 && (
              <span className="event-spots-left">{spotsLeft} spots left</span>
            )}
          </div>
        </div>
      </CardWrapper>
    );
  }

  // Default variant
  return (
    <CardWrapper {...wrapperProps} className="event-card">
      <div className="event-card-image">
        {image ? (
          <img src={image} alt={title} />
        ) : (
          <div className="event-card-placeholder">
            <TicketIcon size={32} />
          </div>
        )}
        <div className="event-image-overlay"></div>
        
        {showActions && (
          <button 
            className={`event-like-btn ${isLiked ? 'liked' : ''}`} 
            onClick={handleLike}
            aria-label="Like event"
          >
            <HeartIcon size={18} filled={isLiked} />
          </button>
        )}
        
        {category && <span className="event-category">{category}</span>}
        
        {isHot && (
          <div className="event-hot-badge">
            <span>🔥 Hot</span>
          </div>
        )}
      </div>
      
      <div className="event-card-body">
        <h3 className="event-title">{title}</h3>
        
        <div className="event-meta">
          <div className="event-meta-item">
            <CalendarIcon size={14} />
            <span>{date}</span>
          </div>
          {time && (
            <div className="event-meta-item">
              <ClockIcon size={14} />
              <span>{time}</span>
            </div>
          )}
        </div>
        
        <div className="event-meta-item event-location">
          <MapPinIcon size={14} />
          <span>{venue || location}</span>
        </div>
        
        <div className="event-card-footer">
          <div className="event-price-section">
            <span className="event-price">{price}</span>
            {originalPrice && (
              <span className="event-original-price">{originalPrice}</span>
            )}
          </div>
          <button className="btn btn-primary btn-sm">Book Now</button>
        </div>
      </div>
    </CardWrapper>
  );
};

// Event Card Skeleton for loading states
export const EventCardSkeleton = ({ variant = 'default' }) => {
  if (variant === 'horizontal') {
    return (
      <div className="event-card event-card-horizontal event-card-skeleton">
        <div className="event-card-image skeleton"></div>
        <div className="event-card-body">
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-text"></div>
          <div className="skeleton skeleton-text short"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="event-card event-card-skeleton">
      <div className="event-card-image skeleton"></div>
      <div className="event-card-body">
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-text short"></div>
        <div className="skeleton skeleton-price"></div>
      </div>
    </div>
  );
};

export default EventCard;
