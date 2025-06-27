import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Newspaper, Heart, AlertCircle, Settings, Eye, EyeOff } from 'lucide-react';
import { NewsItem, RSSFeed } from '../types';
import { fetchRSSFeed } from '../utils/rssParser';
import NewsItemComponent from './NewsItem';
import CategoryFilter from './CategoryFilter';
import SearchBar from './SearchBar';
import FeedManager from './admin/FeedManagement';

const DEFAULT_FEEDS: RSSFeed[] = [
  // US General News
  { id: '1', url: 'http://feeds.abcnews.com/abcnews/usheadlines', title: 'ABC News US', isActive: true },
  { id: '2', url: 'http://rss.cnn.com/rss/cnn_topstories.rss', title: 'CNN Top Stories', isActive: true },
  { id: '3', url: 'http://www.cbsnews.com/latest/rss/main', title: 'CBS News', isActive: true },
  { id: '4', url: 'http://feeds.nbcnews.com/feeds/topstories', title: 'NBC News', isActive: true },
  { id: '5', url: 'http://feeds.reuters.com/Reuters/worldNews', title: 'Reuters World', isActive: true },
  { id: '6', url: 'http://feeds.bbci.co.uk/news/world/rss.xml', title: 'BBC World News', isActive: true },
  { id: '7', url: 'http://news.yahoo.com/rss/us', title: 'Yahoo News US', isActive: true },
  { id: '8', url: 'http://www.huffingtonpost.com/feeds/verticals/world/index.xml', title: 'HuffPost World', isActive: true },
  
  // US Politics
  { id: '9', url: 'http://www.politico.com/rss/politicopicks.xml', title: 'Politico', isActive: true },
  { id: '10', url: 'http://rss.cnn.com/rss/cnn_allpolitics.rss', title: 'CNN Politics', isActive: true },
  { id: '11', url: 'http://feeds.nbcnews.com/feeds/nbcpolitics', title: 'NBC Politics', isActive: true },
  { id: '12', url: 'http://feeds.foxnews.com/foxnews/politics', title: 'Fox News Politics', isActive: true },
  { id: '13', url: 'http://rss.nytimes.com/services/xml/rss/nyt/Politics.xml', title: 'NY Times Politics', isActive: true },
  
  // US Business
  { id: '14', url: 'http://online.wsj.com/xml/rss/3_7014.xml', title: 'Wall Street Journal', isActive: true },
  { id: '15', url: 'http://rss.nytimes.com/services/xml/rss/nyt/Business.xml', title: 'NY Times Business', isActive: true },
  { id: '16', url: 'http://feeds.reuters.com/reuters/businessNews', title: 'Reuters Business', isActive: true },
  { id: '17', url: 'http://rss.cnn.com/rss/edition_business.rss', title: 'CNN Business', isActive: true },
  
  // US Technology
  { id: '18', url: 'http://feeds.feedburner.com/TechCrunch/', title: 'TechCrunch', isActive: true },
  { id: '19', url: 'http://feeds.wired.com/wired/index', title: 'Wired', isActive: true },
  { id: '20', url: 'http://rss.cnn.com/rss/cnn_tech.rss', title: 'CNN Tech', isActive: true },
  { id: '21', url: 'http://rss.nytimes.com/services/xml/rss/nyt/Technology.xml', title: 'NY Times Tech', isActive: true },
  { id: '22', url: 'http://www.theverge.com/rss/group/features/index.xml', title: 'The Verge', isActive: true },
  { id: '23', url: 'http://www.cnet.com/rss/news/', title: 'CNET News', isActive: true },
  { id: '24', url: 'http://www.engadget.com/rss.xml', title: 'Engadget', isActive: true },
  
  // US Sports
  { id: '25', url: 'http://rss.nytimes.com/services/xml/rss/nyt/Sports.xml', title: 'NY Times Sports', isActive: true },
  { id: '26', url: 'http://feeds.foxnews.com/foxnews/sports', title: 'Fox Sports', isActive: true },
  { id: '27', url: 'http://sports.espn.go.com/espn/rss/news', title: 'ESPN', isActive: true },
  { id: '28', url: 'https://sports.yahoo.com/top/rss.xml', title: 'Yahoo Sports', isActive: true },
  
  // US Health
  { id: '29', url: 'http://rss.cnn.com/rss/cnn_health.rss', title: 'CNN Health', isActive: true },
  { id: '30', url: 'http://www.nytimes.com/services/xml/rss/nyt/Health.xml', title: 'NY Times Health', isActive: true },
  { id: '31', url: 'http://feeds.reuters.com/reuters/healthNews', title: 'Reuters Health', isActive: true },
  { id: '32', url: 'http://feeds.bbci.co.uk/news/health/rss.xml?edition=us', title: 'BBC Health', isActive: true },
  
  // US Science
  { id: '33', url: 'http://rss.nytimes.com/services/xml/rss/nyt/Science.xml', title: 'NY Times Science', isActive: true },
  { id: '34', url: 'http://feeds.foxnews.com/foxnews/science', title: 'Fox Science', isActive: true },
  { id: '35', url: 'http://feeds.nbcnews.com/feeds/science', title: 'NBC Science', isActive: true },
  { id: '36', url: 'http://feeds.sciencedaily.com/sciencedaily', title: 'Science Daily', isActive: true },
  { id: '37', url: 'http://feeds.wired.com/wiredscience', title: 'Wired Science', isActive: true },
  { id: '38', url: 'http://feeds.bbci.co.uk/news/science_and_environment/rss.xml', title: 'BBC Science', isActive: true },
  
  // US Entertainment
  { id: '39', url: 'http://variety.com/feed/', title: 'Variety', isActive: true },
  { id: '40', url: 'http://www.hollywoodreporter.com/blogs/live-feed/rss', title: 'Hollywood Reporter', isActive: true },
  { id: '41', url: 'http://rss.ew.com/web/ew/rss/todayslatest/index.xml', title: 'Entertainment Weekly', isActive: true },
  { id: '42', url: 'http://rss.cnn.com/rss/cnn_showbiz.rss', title: 'CNN Entertainment', isActive: true },
  
  // Canada General
  { id: '43', url: 'http://www.cbc.ca/cmlink/rss-canada', title: 'CBC Canada', isActive: true },
  { id: '44', url: 'http://globalnews.ca/canada/feed/', title: 'Global News Canada', isActive: true },
  { id: '45', url: 'http://www.thestar.com/feeds.articles.news.canada.rss', title: 'Toronto Star', isActive: true },
  { id: '46', url: 'http://www.theglobeandmail.com/news/national/?service=rss', title: 'Globe and Mail', isActive: true },
  
  // UK General
  { id: '47', url: 'http://feeds.bbci.co.uk/news/uk/rss.xml', title: 'BBC UK', isActive: true },
  { id: '48', url: 'http://www.theguardian.com/uk/rss', title: 'Guardian UK', isActive: true },
  { id: '49', url: 'http://www.telegraph.co.uk/news/uknews/rss', title: 'Telegraph UK', isActive: true },
  { id: '50', url: 'http://news.sky.com/feeds/rss/uk.xml', title: 'Sky News UK', isActive: true },
  
  // Australia General
  { id: '51', url: 'http://www.abc.net.au/news/feed/46182/rss.xml', title: 'ABC Australia', isActive: true },
  { id: '52', url: 'http://feeds.smh.com.au/rssheadlines/national.xml', title: 'Sydney Morning Herald', isActive: true },
  { id: '53', url: 'http://www.theguardian.com/au/rss', title: 'Guardian Australia', isActive: true },
  
  // India General
  { id: '54', url: 'http://feeds.hindustantimes.com/HT-India', title: 'Hindustan Times', isActive: true },
  { id: '55', url: 'http://indianexpress.com/section/india/feed/', title: 'Indian Express', isActive: true },
  { id: '56', url: 'http://timesofindia.feedsportal.com/c/33039/f/533916/index.rss', title: 'Times of India', isActive: true },
  { id: '57', url: 'http://www.thehindu.com/news/national/?service=rss', title: 'The Hindu', isActive: true },
  
  // International Business
  { id: '58', url: 'http://www.economist.com/feeds/print-sections/77/business.xml', title: 'The Economist Business', isActive: true },
  { id: '59', url: 'http://www.ft.com/rss/home/us', title: 'Financial Times', isActive: true },
  { id: '60', url: 'http://www.bloomberg.com/feed/podcast/law.xml', title: 'Bloomberg', isActive: true },
  
  // Gaming
  { id: '61', url: 'http://feeds.ign.com/ign/all', title: 'IGN Gaming', isActive: true },
  { id: '62', url: 'http://feeds.feedburner.com/RockPaperShotgun', title: 'Rock Paper Shotgun', isActive: true },
  { id: '63', url: 'http://www.polygon.com/rss/index.xml', title: 'Polygon', isActive: true },
  { id: '64', url: 'http://www.gamespot.com/feeds/mashup/', title: 'GameSpot', isActive: true },
  
  // Additional Tech Sources
  { id: '65', url: 'http://feeds.arstechnica.com/arstechnica/technology-lab', title: 'Ars Technica', isActive: true },
  { id: '66', url: 'http://feeds.venturebeat.com/VentureBeat', title: 'VentureBeat', isActive: true },
  { id: '67', url: 'http://www.digitaltrends.com/feed/', title: 'Digital Trends', isActive: true },
  { id: '68', url: 'http://www.technologyreview.com/stream/rss/', title: 'MIT Technology Review', isActive: true },
  
  // Additional Science Sources
  { id: '69', url: 'http://feeds.newscientist.com/science-news', title: 'New Scientist', isActive: true },
  { id: '70', url: 'http://www.livescience.com/home/feed/site.xml', title: 'Live Science', isActive: true },
  { id: '71', url: 'http://www.popsci.com/rss.xml', title: 'Popular Science', isActive: true },
  { id: '72', url: 'http://phys.org/rss-feed/', title: 'Phys.org', isActive: true },
  
  // Additional Health Sources
  { id: '73', url: 'http://www.health.harvard.edu/rss.php', title: 'Harvard Health', isActive: true },
  { id: '74', url: 'http://www.mayoclinic.org/rss/all-health-information-topics', title: 'Mayo Clinic', isActive: true },
  { id: '75', url: 'http://rss.medicalnewstoday.com/featurednews.xml', title: 'Medical News Today', isActive: true },

  // Cybersecurity Hub Feeds
  { id: '76', url: 'https://www.cshub.com/rss/articles', title: 'CSHub Articles', isActive: true },
  { id: '77', url: 'https://www.cshub.com/rss/case-studies', title: 'CSHub Case Studies', isActive: true },
  { id: '78', url: 'https://www.cshub.com/rss/news', title: 'CSHub News', isActive: true },
  { id: '79', url: 'https://www.cshub.com/rss/news-trends', title: 'CSHub News Trends', isActive: true },
  { id: '80', url: 'https://www.cshub.com/rss/categories/attacks', title: 'CSHub Attacks', isActive: true },
  { id: '81', url: 'https://www.cshub.com/rss/categories/cloud', title: 'CSHub Cloud Security', isActive: true },
  { id: '82', url: 'https://www.cshub.com/rss/categories/data', title: 'CSHub Data Security', isActive: true },
  { id: '83', url: 'https://www.cshub.com/rss/categories/malware', title: 'CSHub Malware', isActive: true },
  { id: '84', url: 'https://www.cshub.com/rss/categories/network', title: 'CSHub Network Security', isActive: true },
  { id: '85', url: 'https://www.cshub.com/rss/categories/security-strategy', title: 'CSHub Security Strategy', isActive: true },
  { id: '86', url: 'https://www.cshub.com/rss/categories/threat-defense', title: 'CSHub Threat Defense', isActive: true },
  { id: '87', url: 'https://www.cshub.com/rss/categories/mobile', title: 'CSHub Mobile Security', isActive: true },
  { id: '88', url: 'https://www.cshub.com/rss/categories/iot', title: 'CSHub IoT Security', isActive: true }
];

export default function NewsAggregator() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [feeds, setFeeds] = useState<RSSFeed[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showFeedManager, setShowFeedManager] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Load feeds from localStorage or use defaults
  useEffect(() => {
    const savedFeeds = localStorage.getItem('rss-feeds');
    if (savedFeeds) {
      try {
        setFeeds(JSON.parse(savedFeeds));
      } catch (error) {
        console.error('Error loading feeds from localStorage:', error);
        setFeeds(DEFAULT_FEEDS);
      }
    } else {
      setFeeds(DEFAULT_FEEDS);
      localStorage.setItem('rss-feeds', JSON.stringify(DEFAULT_FEEDS));
    }
  }, []);

  const fetchAllNews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    const activeFeeds = feeds.filter(feed => feed.isActive);
    if (activeFeeds.length === 0) {
      setError('No active RSS feeds configured.');
      setIsLoading(false);
      return;
    }

    try {
      // Fetch from a subset of feeds to avoid overwhelming the system
      const feedsToFetch = activeFeeds.slice(0, 25); // Increased limit for more comprehensive coverage
      
      const allNewsPromises = feedsToFetch.map(feed =>
        fetchRSSFeed(feed.url, feed.title).catch(err => {
          console.warn(`Failed to fetch from ${feed.title}:`, err);
          return []; // Return empty array on failure
        })
      );
      
      const allNewsArrays = await Promise.all(allNewsPromises);
      const allNews = allNewsArrays.flat();
      
      // Remove duplicates based on link
      const uniqueNews = allNews.filter((item, index, self) => 
        index === self.findIndex(t => t.link === item.link)
      );
      
      // Sort by publication date (newest first)
      const sortedNews = uniqueNews.sort((a, b) => 
        new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
      );
      
      // Preserve favorites from existing news items
      const existingFavorites = new Set(
        newsItems.filter(item => item.isFavorite).map(item => item.link)
      );
      
      const newsWithFavorites = sortedNews.map(item => ({
        ...item,
        isFavorite: existingFavorites.has(item.link)
      }));
      
      setNewsItems(newsWithFavorites);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to fetch news. Please check your internet connection.');
      console.error('Error fetching news:', err);
    } finally {
      setIsLoading(false);
    }
  }, [feeds, newsItems]);

  const handleToggleFavorite = (id: string) => {
    setNewsItems(prev => prev.map(item =>
      item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
    ));
  };

  const handleFeedToggle = (feedId: string) => {
    const updatedFeeds = feeds.map(feed =>
      feed.id === feedId ? { ...feed, isActive: !feed.isActive } : feed
    );
    setFeeds(updatedFeeds);
    localStorage.setItem('rss-feeds', JSON.stringify(updatedFeeds));
  };

  // Filter news items based on category, search term, and favorites
  const filteredNews = newsItems.filter(item => {
    const matchesCategory = selectedCategory === null || item.category === selectedCategory;
    const matchesSearch = searchTerm === '' || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFavorites = !showFavorites || item.isFavorite;
    
    return matchesCategory && matchesSearch && matchesFavorites;
  });

  // Calculate category counts
  const categoryCounts = newsItems.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Initial load
  useEffect(() => {
    if (feeds.length > 0) {
      fetchAllNews();
    }
  }, [feeds.length]); // Only depend on feeds.length to avoid infinite loop

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Newspaper className="mr-3 text-blue-600" size={48} />
            <h1 className="text-4xl font-bold text-gray-900">RSS NewsHub</h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Your centralized hub for news from {feeds.length}+ trusted RSS feeds worldwide, automatically categorized and searchable
          </p>
        </header>

        {/* Controls */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchAllNews}
              disabled={isLoading}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <RefreshCw 
                size={20} 
                className={`mr-2 ${isLoading ? 'animate-spin' : ''}`} 
              />
              {isLoading ? 'Refreshing...' : 'Refresh News'}
            </button>
            
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className={`flex items-center px-6 py-3 rounded-xl transition-all duration-200 shadow-lg ${
                showFavorites
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Heart 
                size={20} 
                className="mr-2" 
                fill={showFavorites ? 'currentColor' : 'none'} 
              />
              {showFavorites ? 'Show All' : 'Favorites Only'}
            </button>

            <button
              onClick={() => setShowFeedManager(!showFeedManager)}
              className="flex items-center px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Settings size={20} className="mr-2" />
              Manage Feeds
            </button>
          </div>
          
          <div className="flex flex-col items-end">
            {lastUpdated && (
              <div className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
            )}
            <div className="text-xs text-gray-400 mt-1">
              {feeds.filter(f => f.isActive).length} active feeds
            </div>
          </div>
        </div>

        {/* Feed Manager */}
        {showFeedManager && (
          <FeedManager
            feeds={feeds}
            onFeedToggle={handleFeedToggle}
            onClose={() => setShowFeedManager(false)}
          />
        )}

        {/* Search Bar */}
        <SearchBar 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />

        {/* Category Filter */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categoryCounts={categoryCounts}
        />

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex items-center">
            <AlertCircle className="text-red-500 mr-3" size={20} />
            <div>
              <h3 className="text-red-800 font-medium">Error Loading News</h3>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-gray-600">Loading latest news from {feeds.filter(f => f.isActive).length} sources...</span>
          </div>
        )}

        {/* News Grid */}
        {!isLoading && filteredNews.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredNews.map(item => (
              <NewsItemComponent
                key={item.id}
                item={item}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredNews.length === 0 && newsItems.length > 0 && (
          <div className="text-center py-12">
            <Newspaper size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-600">
              {showFavorites
                ? "You haven't favorited any articles yet."
                : searchTerm || selectedCategory
                ? "No articles match your current filters."
                : "No articles available."}
            </p>
          </div>
        )}

        {/* No News State */}
        {!isLoading && newsItems.length === 0 && !error && (
          <div className="text-center py-12">
            <Newspaper size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Welcome to RSS NewsHub</h3>
            <p className="text-gray-600 mb-4">
              Click "Refresh News" to load the latest stories from our curated collection of {feeds.length} RSS feeds.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}