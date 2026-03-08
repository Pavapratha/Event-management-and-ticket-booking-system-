import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { EventCard, EventCardSkeleton } from '../components/EventCard';
import { 
  SearchIcon, 
  FilterIcon, 
  GridIcon, 
  ListIcon, 
  MapPinIcon,
  ChevronDownIcon,
  XIcon
} from '../components/Icons';
import './Events.css';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const defaultCategories = ['All', 'Music', 'Sports', 'Technology', 'Food & Drink', 'Arts', 'Business', 'Education', 'Other'];
const sortOptions = [
  { value: 'date', label: 'Date' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
];

// Transform database event to EventCard format
const transformEvent = (event) => {
  const dateObj = new Date(event.date);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const spotsLeft = event.availableSeats;
  const totalSeats = event.totalSeats;
  const soldSeats = totalSeats - spotsLeft;

  return {
    id: event._id,
    title: event.title,
    date: formattedDate,
    time: event.time,
    location: event.location,
    venue: event.location,
    image: event.image ? `${API_BASE}${event.image}` : null,
    price: event.price === 0 ? 'Free' : `$${event.price}`,
    priceNum: event.price,
    category: event.category,
    spotsLeft,
    attendees: soldSeats,
    isHot: spotsLeft < 20 && spotsLeft > 0,
    _raw: event,
  };
};

export const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [allEvents, setAllEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch events from API
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/api/events');
        const events = (res.data.events || []).map(transformEvent);
        setAllEvents(events);
      } catch (err) {
        console.error('Failed to fetch events:', err);
        setAllEvents([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Derive unique locations from fetched events
  const locations = useMemo(() => {
    const locs = ['All Locations', ...new Set(allEvents.map((e) => e.location))];
    return locs;
  }, [allEvents]);

  // Derive unique categories from fetched events (merged with defaults)
  const categories = useMemo(() => {
    const eventCats = new Set(allEvents.map((e) => e.category));
    const merged = new Set([...defaultCategories, ...eventCats]);
    return Array.from(merged);
  }, [allEvents]);

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    let events = [...allEvents];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      events = events.filter(
        (event) =>
          event.title.toLowerCase().includes(query) ||
          event.venue.toLowerCase().includes(query) ||
          event.location.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory && selectedCategory !== 'All') {
      events = events.filter(
        (event) => event.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by location
    if (selectedLocation && selectedLocation !== 'All Locations') {
      events = events.filter((event) => event.location === selectedLocation);
    }

    // Sort events
    switch (sortBy) {
      case 'price-low':
        events.sort((a, b) => (a.priceNum || 0) - (b.priceNum || 0));
        break;
      case 'price-high':
        events.sort((a, b) => (b.priceNum || 0) - (a.priceNum || 0));
        break;
      default:
        // Sort by date (ascending - upcoming first)
        events.sort((a, b) => new Date(a._raw.date) - new Date(b._raw.date));
        break;
    }

    return events;
  }, [allEvents, searchQuery, selectedCategory, selectedLocation, sortBy]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (category === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category.toLowerCase());
    }
    setSearchParams(searchParams);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedLocation('All Locations');
    setSortBy('date');
    setSearchParams({});
  };

  const hasActiveFilters = searchQuery || selectedCategory !== 'All' || selectedLocation !== 'All Locations';

  return (
    <div className="events-page">
      {/* Page Header */}
      <div className="events-header">
        <div className="container">
          <div className="events-header-content">
            <h1 className="events-page-title">Discover Events</h1>
            <p className="events-page-subtitle">
              Find and book tickets for concerts, festivals, conferences, and more
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="events-filters-bar">
        <div className="container">
          <div className="filters-bar-content">
            {/* Search */}
            <div className="events-search">
              <SearchIcon size={20} className="search-icon" />
              <input
                type="text"
                placeholder="Search events, artists, venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="events-search-input"
              />
              {searchQuery && (
                <button className="search-clear" onClick={() => setSearchQuery('')}>
                  <XIcon size={16} />
                </button>
              )}
            </div>

            {/* Filter Toggles */}
            <div className="filter-controls">
              {/* Location Select */}
              <div className="filter-select-wrapper">
                <MapPinIcon size={18} className="filter-icon" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="filter-select"
                >
                  {locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon size={16} className="filter-chevron" />
              </div>

              {/* Sort Select */}
              <div className="filter-select-wrapper">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="filter-select"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      Sort by: {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon size={16} className="filter-chevron" />
              </div>

              {/* View Mode Toggle */}
              <div className="view-mode-toggle">
                <button
                  className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                >
                  <GridIcon size={18} />
                </button>
                <button
                  className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                >
                  <ListIcon size={18} />
                </button>
              </div>

              {/* Mobile Filter Button */}
              <button
                className="filter-toggle-btn hidden-desktop"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <FilterIcon size={18} />
                Filters
              </button>
            </div>
          </div>

          {/* Category Pills */}
          <div className="category-pills">
            {categories.map((category) => (
              <button
                key={category}
                className={`category-pill ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="active-filters">
              <span className="active-filters-label">Active filters:</span>
              {searchQuery && (
                <span className="filter-tag">
                  Search: {searchQuery}
                  <button onClick={() => setSearchQuery('')}>
                    <XIcon size={12} />
                  </button>
                </span>
              )}
              {selectedCategory !== 'All' && (
                <span className="filter-tag">
                  {selectedCategory}
                  <button onClick={() => handleCategoryChange('All')}>
                    <XIcon size={12} />
                  </button>
                </span>
              )}
              {selectedLocation !== 'All Locations' && (
                <span className="filter-tag">
                  {selectedLocation}
                  <button onClick={() => setSelectedLocation('All Locations')}>
                    <XIcon size={12} />
                  </button>
                </span>
              )}
              <button className="clear-filters-btn" onClick={clearFilters}>
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Events Content */}
      <div className="events-content">
        <div className="container">
          {/* Results Count */}
          <div className="events-results-header">
            <p className="results-count">
              Showing <strong>{filteredEvents.length}</strong> events
            </p>
          </div>

          {/* Events Grid/List */}
          {isLoading ? (
            <div className={`events-grid ${viewMode === 'list' ? 'events-list' : ''}`}>
              {[...Array(8)].map((_, index) => (
                <EventCardSkeleton key={index} variant={viewMode === 'list' ? 'horizontal' : 'default'} />
              ))}
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className={`events-grid ${viewMode === 'list' ? 'events-list' : ''}`}>
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  variant={viewMode === 'list' ? 'horizontal' : 'default'}
                />
              ))}
            </div>
          ) : (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>No events found</h3>
              <p>Try adjusting your search or filters to find what you're looking for.</p>
              <button className="btn btn-primary" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          )}

          {/* Load More */}
          {filteredEvents.length > 0 && filteredEvents.length >= 12 && (
            <div className="load-more">
              <button className="btn btn-outline btn-lg">
                Load More Events
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Events;
