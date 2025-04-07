import React, { useState, useEffect } from 'react'
import VideoCard from './components/VideoCard'
import VideoPlayer from './components/VideoPlayer'
import BookmarkList from './components/BookmarkList'
import CommentBox from './components/CommentBox'
import ErrorBoundary from './components/ErrorBoundary'
import LoadingSpinner from './components/LoadingSpinner'

// Simulated API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const videos = [
  { 
    id: 1, 
    title: "React Basics",
    duration: "10:30",
    thumbnail: "https://picsum.photos/200/300",
    description: "Learn the fundamentals of React",
    tags: ["react", "javascript", "frontend"],
    viewCount: 1500,
    rating: 4.5,
    publishedAt: "2024-03-01"
  },
  { 
    id: 2, 
    title: "Advanced React",
    duration: "15:45",
    thumbnail: "https://picsum.photos/200/300",
    description: "Deep dive into React advanced concepts",
    tags: ["react", "hooks", "performance"],
    viewCount: 2300,
    rating: 4.8,
    publishedAt: "2024-03-15"
  },
  { 
    id: 3, 
    title: "Intro to Testing",
    duration: "12:20",
    thumbnail: "https://picsum.photos/200/300",
    description: "Learn how to test React applications",
    tags: ["testing", "jest", "react-testing-library"],
    viewCount: 1800,
    rating: 4.2,
    publishedAt: "2024-03-20"
  },
];

function App() {
  const [search, setSearch] = useState('');
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, recent, popular
  const [sortBy, setSortBy] = useState('title'); // title, date, rating
  const [userPreferences, setUserPreferences] = useState({
    autoplay: false,
    quality: 'high',
    subtitles: true
  });

  // Simulated API call with error handling
  const fetchVideoDetails = async (videoId) => {
    try {
      setIsLoading(true);
      setError(null);
      await delay(1000); // Simulate network delay
      const video = videos.find(v => v.id === videoId);
      if (!video) {
        throw new Error('Video not found');
      }
      setSelectedVideo(video);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVideos = videos
    .filter(v => {
      const matchesSearch = v.title.toLowerCase().includes(search.toLowerCase()) ||
                          v.description.toLowerCase().includes(search.toLowerCase()) ||
                          v.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
      
      if (filter === 'recent') {
        const videoDate = new Date(v.publishedAt);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return matchesSearch && videoDate >= thirtyDaysAgo;
      }
      
      if (filter === 'popular') {
        return matchesSearch && v.viewCount > 2000;
      }
      
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'date') return new Date(b.publishedAt) - new Date(a.publishedAt);
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });

  const handleVideoSelect = (video) => {
    fetchVideoDetails(video.id);
  };

  const handleBookmarkAdd = (video) => {
    if (bookmarks.some(b => b.id === video.id)) {
      setError('Video already bookmarked');
      return;
    }
    setBookmarks([...bookmarks, video]);
  };

  return (
    <div className="app-container" style={{ padding: 20 }}>
      <h1>TinyFlix</h1>
      
      <div className="controls">
        <input
          placeholder="Search videos, tags, or descriptions"
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search videos"
        />
        
        <select 
          value={filter} 
          onChange={e => setFilter(e.target.value)}
          aria-label="Filter videos"
        >
          <option value="all">All Videos</option>
          <option value="recent">Recent</option>
          <option value="popular">Popular</option>
        </select>

        <select 
          value={sortBy} 
          onChange={e => setSortBy(e.target.value)}
          aria-label="Sort videos"
        >
          <option value="title">Sort by Title</option>
          <option value="date">Sort by Date</option>
          <option value="rating">Sort by Rating</option>
        </select>
      </div>

      {error && <div className="error-message" role="alert">{error}</div>}
      
      <div className="video-grid">
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          filteredVideos.map(video => (
            <ErrorBoundary key={video.id}>
              <VideoCard 
                video={video} 
                onClick={() => handleVideoSelect(video)}
                onBookmark={() => handleBookmarkAdd(video)}
              />
            </ErrorBoundary>
          ))
        )}
      </div>

      {selectedVideo && (
        <ErrorBoundary>
          <VideoPlayer 
            video={selectedVideo} 
            bookmarks={bookmarks} 
            setBookmarks={setBookmarks}
            userPreferences={userPreferences}
            setUserPreferences={setUserPreferences}
          />
          <BookmarkList bookmarks={bookmarks} />
          <CommentBox 
            comments={comments} 
            setComments={setComments}
            videoId={selectedVideo.id}
          />
        </ErrorBoundary>
      )}
    </div>
  )
}

export default App
