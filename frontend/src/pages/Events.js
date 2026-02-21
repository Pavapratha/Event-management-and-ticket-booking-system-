import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EventCard, EventCardSkeleton } from '../components/EventCard';
import { 
  SearchIcon, 
  FilterIcon, 
  GridIcon, 
  ListIcon, 
  CalendarIcon,
  MapPinIcon,
  ChevronDownIcon,
  XIcon
} from '../components/Icons';
import './Events.css';

// Sample events data
const allEvents = [
  {
    id: 1,
    title: 'Summer Music Festival 2026',
    date: 'August 15-17, 2026',
    time: '4:00 PM',
    location: 'Los Angeles',
    venue: 'Sunset Beach Arena',
    image: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=600&h=400&fit=crop',
    price: '$149',
    originalPrice: '$199',
    category: 'Music',
    attendees: 1250,
    spotsLeft: 45,
    isHot: true,
  },
  {
    id: 2,
    title: 'Tech Innovation Summit',
    date: 'September 20, 2026',
    time: '9:00 AM',
    location: 'San Francisco',
    venue: 'Moscone Center',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop',
    price: '$299',
    category: 'Conference',
    attendees: 850,
    spotsLeft: 120,
  },
  {
    id: 3,
    title: 'Art & Design Exhibition',
    date: 'October 5, 2026',
    time: '10:00 AM',
    location: 'New York',
    venue: 'Metropolitan Gallery',
    image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?w=600&h=400&fit=crop',
    price: '$45',
    category: 'Art',
    attendees: 420,
  },
  {
    id: 4,
    title: 'Comedy Night Live',
    date: 'October 12, 2026',
    time: '8:00 PM',
    location: 'Chicago',
    venue: 'Laugh Factory',
    image: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?w=600&h=400&fit=crop',
    price: '$35',
    category: 'Comedy',
    attendees: 180,
    isHot: true,
  },
  {
    id: 5,
    title: 'Jazz Night at Blue Note',
    date: 'March 15, 2026',
    time: '7:30 PM',
    location: 'New York',
    venue: 'Blue Note Jazz Club',
    image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=600&h=400&fit=crop',
    price: '$65',
    category: 'Music',
  },
  {
    id: 6,
    title: 'Startup Pitch Competition',
    date: 'March 22, 2026',
    time: '2:00 PM',
    location: 'Austin',
    venue: 'Capital Factory',
    image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600&h=400&fit=crop',
    price: 'Free',
    category: 'Business',
  },
  {
    id: 7,
    title: 'Food & Wine Festival',
    date: 'April 8, 2026',
    time: '12:00 PM',
    location: 'Napa Valley',
    venue: 'Vineyard Estate',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&h=400&fit=crop',
    price: '$85',
    category: 'Food',
    isHot: true,
  },
  {
    id: 8,
    title: 'Electronic Music Rave',
    date: 'April 15, 2026',
    time: '10:00 PM',
    location: 'Miami',
    venue: 'Warehouse District',
    image: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=600&h=400&fit=crop',
    price: '$75',
    category: 'Music',
  },
  {
    id: 9,
    title: 'Photography Workshop',
    date: 'May 5, 2026',
    time: '10:00 AM',
    location: 'Seattle',
    venue: 'Creative Studio',
    image: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=600&h=400&fit=crop',
    price: '$120',
    category: 'Workshop',
  },
  {
    id: 10,
    title: 'Rock Concert Night',
    date: 'May 20, 2026',
    time: '8:00 PM',
    location: 'Las Vegas',
    venue: 'The Arena',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&h=400&fit=crop',
    price: '$95',
    category: 'Music',
    isHot: true,
  },
  {
    id: 11,
    title: 'Yoga & Wellness Retreat',
    date: 'June 1-3, 2026',
    time: '7:00 AM',
    location: 'Sedona',
    venue: 'Mountain Retreat Center',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop',
    price: '$350',
    category: 'Wellness',
  },
  {
    id: 12,
    title: 'Gaming Convention 2026',
    date: 'June 15-17, 2026',
    time: '10:00 AM',
    location: 'Los Angeles',
    venue: 'Convention Center',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=400&fit=crop',
    price: '$89',
    category: 'Gaming',
    isHot: true,
  },
];

const categories = ['All', 'Music', 'Conference', 'Art', 'Comedy', 'Business', 'Food', 'Workshop', 'Wellness', 'Gaming'];
const locations = ['All Locations', 'Los Angeles', 'San Francisco', 'New York', 'Chicago', 'Austin', 'Miami', 'Seattle', 'Las Vegas', 'Sedona'];
const sortOptions = [
  { value: 'date', label: 'Date' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'popular', label: 'Most Popular' },
];

export const Events = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
        events.sort((a, b) => {
          const priceA = parseInt(a.price.replace(/[^0-9]/g, '')) || 0;
          const priceB = parseInt(b.price.replace(/[^0-9]/g, '')) || 0;
          return priceA - priceB;
        });
        break;
      case 'price-high':
        events.sort((a, b) => {
          const priceA = parseInt(a.price.replace(/[^0-9]/g, '')) || 0;
          const priceB = parseInt(b.price.replace(/[^0-9]/g, '')) || 0;
          return priceB - priceA;
        });
        break;
      case 'popular':
        events.sort((a, b) => (b.attendees || 0) - (a.attendees || 0));
        break;
      default:
        // Sort by date (default)
        break;
    }

    return events;
  }, [searchQuery, selectedCategory, selectedLocation, sortBy]);

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
