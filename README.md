# SkiesAbove - Plane Tracker

A beautiful, Apple-inspired Progressive Web App for real-time aircraft tracking with a modern mobile-first design.

## ✨ Features

### 🛩️ Core Functionality
- **Real-time plane tracking** - Find aircraft near your location
- **Flight predictions** - See upcoming flights in your area
- **Multiple location methods** - GPS, IP-based, or custom location input
- **Live data updates** - Auto-refresh every 30 seconds (configurable)

### 🎨 Design & UX
- **Apple-inspired design** - Clean, modern interface with iOS-style components
- **Dark mode support** - Toggle between light and dark themes
- **Responsive design** - Optimized for mobile, tablet, and desktop
- **Smooth animations** - Parallax effects, hover animations, and ripple effects
- **Native app feel** - Bottom navigation, card-based layout, and smooth transitions

### 📱 Progressive Web App (PWA)
- **Installable** - Add to home screen on iOS and Android
- **Offline support** - Service worker for caching and offline functionality
- **App shortcuts** - Quick access to settings and stats
- **Splash screens** - Custom launch screens for different device sizes
- **Push notifications** - Get alerts for nearby planes (optional)

### ⚙️ Settings & Customization
- **Dark mode toggle** - Switch between light and dark themes
- **Search radius** - Adjust distance for plane detection (10-200 km)
- **Auto-refresh** - Enable/disable automatic data updates
- **Notifications** - Toggle push notifications for nearby planes
- **Units** - Choose between metric (km, m/s) and imperial (mi, mph)

### 📊 Statistics & Analytics
- **Flight statistics** - Total planes, average distance, speed, and altitude
- **Interactive charts** - Visual distribution of planes by distance
- **Real-time updates** - Stats update automatically with new data

### 🔧 Technical Features
- **Geolocation API** - Precise GPS location detection
- **Geocoding** - Convert addresses to coordinates using OpenStreetMap
- **Local storage** - Remember user preferences and settings
- **Service worker** - Background sync and offline caching
- **Modern JavaScript** - ES6+ features and async/await patterns

## 🚀 Getting Started

### Prerequisites
- Modern web browser with JavaScript enabled
- Internet connection for data fetching
- GPS access (optional, for automatic location detection)

### Installation

1. **Clone or download** the project files
2. **Open `index.html`** in your web browser
3. **Allow location access** when prompted (optional)
4. **Start tracking planes!**

### PWA Installation

#### iOS (Safari)
1. Open the app in Safari
2. Tap the **Share** button
3. Select **"Add to Home Screen"**
4. Tap **"Add"**

#### Android (Chrome)
1. Open the app in Chrome
2. Tap the **menu** (three dots)
3. Select **"Add to Home screen"**
4. Tap **"Add"**

## 📱 Usage

### Setting Your Location
1. **Automatic GPS** - Tap "Use My Location" for instant GPS detection
2. **Custom Location** - Enter any address, city, or coordinates
3. **IP-based** - Automatically uses your approximate location

### Navigating the App
- **Home** - Main tracking interface with nearby and predicted planes
- **Stats** - View flight statistics and plane distribution charts
- **Settings** - Customize app preferences and appearance

### Understanding the Data
- **Nearby Planes** - Aircraft currently within your search radius
- **Predicted Flights** - Upcoming flights that will pass through your area
- **Distance** - How far each plane is from your location
- **Altitude** - Current flight level of each aircraft
- **Speed** - Ground speed of each plane
- **Heading** - Direction the plane is traveling

## 🎛️ Settings Guide

### Dark Mode
Toggle between light and dark themes for comfortable viewing in any lighting condition.

### Search Radius
Adjust how far the app searches for planes:
- **10-50 km** - Local area (recommended for urban areas)
- **50-100 km** - Regional coverage
- **100-200 km** - Wide area coverage

### Auto Refresh
- **Enabled** - Data updates automatically every 30 seconds
- **Disabled** - Manual refresh only (tap the refresh button)

### Notifications
- **Enabled** - Get alerts when planes are detected nearby
- **Disabled** - No push notifications

### Units
- **Metric** - Kilometers, meters per second, meters
- **Imperial** - Miles, miles per hour, feet

## 🔧 Technical Details

### Architecture
- **Frontend** - Vanilla JavaScript with modern ES6+ features
- **Styling** - CSS3 with CSS Grid, Flexbox, and CSS Variables
- **Icons** - Font Awesome 6.0
- **Fonts** - SF Pro Display (Apple's system font)

### APIs Used
- **Geolocation API** - Browser's built-in location services
- **OpenStreetMap Nominatim** - Geocoding and reverse geocoding
- **Mock Data** - Simulated aircraft data (replace with real API)

### Browser Support
- **Chrome** 60+
- **Safari** 12+
- **Firefox** 55+
- **Edge** 79+

### PWA Features
- **Manifest** - App metadata, icons, and theme colors
- **Service Worker** - Offline caching and background sync
- **App Shortcuts** - Quick access to key features
- **Splash Screens** - Custom launch screens for different devices

## 🎨 Design System

### Color Palette
- **Primary** - #007AFF (Apple Blue)
- **Secondary** - #5856D6 (Purple)
- **Success** - #34C759 (Green)
- **Warning** - #FF9500 (Orange)
- **Error** - #FF3B30 (Red)

### Typography
- **Font Family** - SF Pro Display
- **Weights** - 300, 400, 500, 600, 700
- **Sizes** - 12px to 28px

### Spacing
- **XS** - 4px
- **SM** - 8px
- **MD** - 16px
- **LG** - 24px
- **XL** - 32px
- **XXL** - 48px

### Components
- **Cards** - Rounded corners, subtle shadows, hover effects
- **Buttons** - Gradient backgrounds, ripple effects, smooth transitions
- **Toggles** - iOS-style switches with smooth animations
- **Sliders** - Custom-styled range inputs
- **Navigation** - Bottom tab bar with active states

## 🔮 Future Enhancements

### Planned Features
- **Real API integration** - Connect to actual flight tracking APIs
- **3D visualization** - Interactive 3D map of aircraft positions
- **Flight history** - Track historical flight data
- **Weather integration** - Show weather conditions affecting flights
- **Social features** - Share flight sightings with friends
- **Advanced filters** - Filter by aircraft type, airline, altitude, etc.

### Technical Improvements
- **WebGL rendering** - Hardware-accelerated graphics
- **WebSocket connections** - Real-time data streaming
- **Advanced caching** - Intelligent data caching strategies
- **Performance optimization** - Lazy loading and code splitting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Apple** - Design inspiration and SF Pro Display font
- **Font Awesome** - Beautiful icons
- **OpenStreetMap** - Geocoding services
- **Modern web standards** - Making PWAs possible

---

**Built with ❤️ for aviation enthusiasts everywhere**

*SkiesAbove - Where technology meets the skies* 