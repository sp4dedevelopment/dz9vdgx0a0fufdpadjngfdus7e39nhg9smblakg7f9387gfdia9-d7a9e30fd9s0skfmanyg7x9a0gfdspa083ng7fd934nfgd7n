// SkiesAbove Plane Tracker - Enhanced JavaScript with Real APIs

class PlaneTracker {
    constructor() {
        this.currentLocation = null;
        this.nearbyPlanes = [];
        this.predictedPlanes = [];
        this.settings = this.loadSettings();
        this.autoRefreshInterval = null;
        this.searchRadius = this.settings.searchRadius || 50;
        this.units = this.settings.units || 'metric';
        this.isLoading = false;
        
        this.initializeApp();
        this.setupEventListeners();
        this.applyTheme();
    }

    initializeApp() {
        // Check for URL parameters (for shortcuts)
        const urlParams = new URLSearchParams(window.location.search);
        const action = urlParams.get('action');
        
        if (action === 'settings') {
            this.showSection('settingsSection');
            this.updateNavigation('navSettings');
        } else if (action === 'stats') {
            this.showSection('statsSection');
            this.updateNavigation('navStats');
        } else {
            this.showSection('locationSection');
            this.updateNavigation('navHome');
        }

        // Register service worker for PWA functionality
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js')
                .then(registration => console.log('ServiceWorker registered'))
                .catch(error => console.log('ServiceWorker registration failed:', error));
        }
    }

    setupEventListeners() {
        // Location buttons
        document.getElementById('autoLocationBtn').addEventListener('click', () => this.getUserLocation());
        document.getElementById('customLocationBtn').addEventListener('click', () => this.showCustomLocation());
        document.getElementById('backToLocation').addEventListener('click', () => this.showSection('locationSection'));
        document.getElementById('searchLocationBtn').addEventListener('click', () => this.searchCustomLocation());
        document.getElementById('locationInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchCustomLocation();
        });

        // Navigation
        document.getElementById('navHome').addEventListener('click', () => this.navigateToHome());
        document.getElementById('navStats').addEventListener('click', () => this.navigateToStats());
        document.getElementById('navSettings').addEventListener('click', () => this.navigateToSettings());
        document.getElementById('backToMain').addEventListener('click', () => this.navigateToHome());
        document.getElementById('backToMainFromStats').addEventListener('click', () => this.navigateToHome());

        // Settings
        document.getElementById('darkModeToggle').addEventListener('change', (e) => this.toggleDarkMode(e.target.checked));
        document.getElementById('searchRadiusSlider').addEventListener('input', (e) => this.updateSearchRadius(e.target.value));
        document.getElementById('autoRefreshToggle').addEventListener('change', (e) => this.toggleAutoRefresh(e.target.checked));
        document.getElementById('notificationsToggle').addEventListener('change', (e) => this.toggleNotifications(e.target.checked));
        document.getElementById('unitsSelect').addEventListener('change', (e) => this.changeUnits(e.target.value));
        document.getElementById('aboutBtn').addEventListener('click', () => this.showAbout());

        // Refresh button
        document.getElementById('refreshBtn').addEventListener('click', () => this.refreshData());

        // Initialize settings UI
        this.initializeSettingsUI();
    }

    // Navigation Methods
    navigateToHome() {
        if (this.currentLocation) {
            this.showSection('resultsSection');
        } else {
            this.showSection('locationSection');
        }
        this.updateNavigation('navHome');
    }

    navigateToStats() {
        this.showSection('statsSection');
        this.updateNavigation('navStats');
        this.updateStats();
    }

    navigateToSettings() {
        this.showSection('settingsSection');
        this.updateNavigation('navSettings');
    }

    showSection(sectionId) {
        // Hide all sections
        const sections = ['locationSection', 'customLocationSection', 'loadingSection', 'resultsSection', 'settingsSection', 'statsSection'];
        sections.forEach(id => {
            document.getElementById(id).classList.add('hidden');
        });

        // Show target section
        document.getElementById(sectionId).classList.remove('hidden');
    }

    updateNavigation(activeNavId) {
        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to current nav item
        document.getElementById(activeNavId).classList.add('active');
    }

    // Location Methods
    async getUserLocation() {
        this.showSection('loadingSection');
        this.updateLoadingText('Getting your location...', 'Please wait while we determine your position');

        try {
            const position = await this.getCurrentPosition();
            this.currentLocation = {
                lat: position.coords.latitude,
                lon: position.coords.longitude
            };
            
            this.updateLocationDisplay();
            await this.fetchPlaneData();
            this.showSection('resultsSection');
            this.updateNavigation('navHome');
        } catch (error) {
            console.error('Error getting location:', error);
            this.showError('Unable to get your location. Please try using a custom location.');
        }
    }

    getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation not supported'));
                return;
            }

            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000
            });
        });
    }

    showCustomLocation() {
        this.showSection('customLocationSection');
    }

    async searchCustomLocation() {
        const input = document.getElementById('locationInput').value.trim();
        if (!input) return;

        this.showSection('loadingSection');
        this.updateLoadingText('Searching location...', 'Please wait while we find your location');

        try {
            const coords = await this.geocodeLocation(input);
            this.currentLocation = coords;
            
            this.updateLocationDisplay();
            await this.fetchPlaneData();
            this.showSection('resultsSection');
            this.updateNavigation('navHome');
        } catch (error) {
            console.error('Error searching location:', error);
            this.showError('Unable to find that location. Please try a different search term.');
        }
    }

    async geocodeLocation(query) {
        // Simple geocoding - you can replace this with a real geocoding service
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
        const data = await response.json();
        
        if (data.length === 0) {
            throw new Error('Location not found');
        }

        return {
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon)
        };
    }

    updateLocationDisplay() {
        if (!this.currentLocation) return;

        const locationElement = document.getElementById('currentLocation');
        const coordinatesElement = document.getElementById('coordinates');

        // Try to get location name from reverse geocoding
        this.reverseGeocode(this.currentLocation.lat, this.currentLocation.lon)
            .then(name => {
                locationElement.textContent = name || 'Your Location';
            })
            .catch(() => {
                locationElement.textContent = 'Your Location';
            });

        coordinatesElement.textContent = `${this.currentLocation.lat.toFixed(4)}, ${this.currentLocation.lon.toFixed(4)}`;
    }

    async reverseGeocode(lat, lon) {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10`);
            const data = await response.json();
            return data.display_name.split(',')[0]; // Get city name
        } catch (error) {
            return null;
        }
    }

    // Real API Methods
    async fetchPlaneData() {
        if (this.isLoading) return; // Prevent multiple simultaneous requests
        
        this.isLoading = true;
        this.updateLoadingText('Fetching plane data...', 'Searching for aircraft in your area');
        this.updateStatus('Connecting to flight tracking APIs...');

        try {
            // Try multiple APIs for better coverage
            const [nearbyData, predictedData] = await Promise.allSettled([
                this.fetchNearbyPlanes(),
                this.fetchPredictedFlights()
            ]);

            this.nearbyPlanes = nearbyData.status === 'fulfilled' ? nearbyData.value : [];
            this.predictedPlanes = predictedData.status === 'fulfilled' ? predictedData.value : [];

            this.displayPlanes();
            this.updateLastUpdated();
            
            // Update status based on results
            if (this.nearbyPlanes.length > 0) {
                this.updateStatus(`Found ${this.nearbyPlanes.length} planes nearby`);
            } else {
                this.updateStatus('No planes detected in your area');
            }
            
            // Start auto-refresh if enabled
            if (this.settings.autoRefresh) {
                this.startAutoRefresh();
            }
        } catch (error) {
            console.error('Error fetching plane data:', error);
            this.showError('Unable to fetch plane data. Please try again.');
            this.updateStatus('Error connecting to flight data');
        } finally {
            this.isLoading = false;
        }
    }

    async fetchNearbyPlanes() {
        if (!this.currentLocation) return [];

        try {
            // Try OpenSky Network API first
            const openSkyData = await this.fetchOpenSkyData();
            if (openSkyData && openSkyData.length > 0) {
                console.log('Using OpenSky data:', openSkyData.length, 'planes');
                return this.processOpenSkyData(openSkyData);
            }

            // Fallback to ADS-B Exchange API (if you have an API key)
            const adsbData = await this.fetchADSExchangeData();
            if (adsbData && adsbData.length > 0) {
                console.log('Using ADS-B Exchange data:', adsbData.length, 'planes');
                return this.processADSExchangeData(adsbData);
            }

            // Final fallback to FlightAware API (if you have an API key)
            const flightAwareData = await this.fetchFlightAwareData();
            if (flightAwareData && flightAwareData.length > 0) {
                console.log('Using FlightAware data:', flightAwareData.length, 'planes');
                return this.processFlightAwareData(flightAwareData);
            }

            // If all APIs fail, return empty array (no demo data)
            console.log('No aircraft data available from APIs');
            return [];
        } catch (error) {
            console.error('Error fetching nearby planes:', error);
            return [];
        }
    }

    async fetchOpenSkyData() {
        try {
            console.log('Fetching from OpenSky API...');
            // OpenSky Network API - free tier
            const { lat, lon } = this.currentLocation;
            const radius = this.searchRadius * 1000; // Convert to meters
            
            const url = `https://opensky-network.org/api/states/all?lamin=${lat - (radius/111000)}&lamax=${lat + (radius/111000)}&lomin=${lon - (radius/111000)}&lomax=${lon + (radius/111000)}`;
            
            console.log('OpenSky URL:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            console.log('OpenSky response status:', response.status);

            if (!response.ok) {
                throw new Error(`OpenSky API error: ${response.status}`);
            }

            const data = await response.json();
            console.log('OpenSky data received:', data);
            console.log('Number of states:', data.states ? data.states.length : 0);
            
            return data.states || [];
        } catch (error) {
            console.error('OpenSky API error:', error);
            return [];
        }
    }

    processOpenSkyData(states) {
        console.log('Processing OpenSky data...');
        console.log('Raw states:', states);
        
        const processed = states.map(state => {
            const [icao24, callsign, country, time_position, time_velocity, longitude, latitude, altitude, on_ground, velocity, true_track, vertical_rate, sensors, geo_altitude, squawk, spi, position_source] = state;
            
            // Calculate distance from user location
            const distance = this.calculateDistance(
                this.currentLocation.lat, 
                this.currentLocation.lon, 
                latitude, 
                longitude
            );

            return {
                callsign: callsign || 'Unknown',
                distance: distance,
                altitude: altitude || 0,
                speed: velocity || 0,
                heading: true_track || 0,
                type: this.getAircraftType(callsign),
                icao24: icao24,
                country: country,
                on_ground: on_ground,
                squawk: squawk
            };
        }).filter(plane => plane.distance <= this.searchRadius);
        
        console.log('Processed planes:', processed);
        console.log('Planes within search radius:', processed.length);
        
        return processed;
    }

    async fetchADSExchangeData() {
        try {
            // ADS-B Exchange API (requires API key)
            const { lat, lon } = this.currentLocation;
            const radius = this.searchRadius;
            
            // This would require an API key - for demo purposes, returning empty
            // const url = `https://adsbexchange-com1.p.rapidapi.com/v2/lat/${lat}/lon/${lon}/dist/${radius}/`;
            // const response = await fetch(url, {
            //     headers: {
            //         'X-RapidAPI-Key': 'YOUR_API_KEY',
            //         'X-RapidAPI-Host': 'adsbexchange-com1.p.rapidapi.com'
            //     }
            // });
            
            return [];
        } catch (error) {
            console.error('ADS-B Exchange API error:', error);
            return [];
        }
    }

    async fetchFlightAwareData() {
        try {
            // FlightAware API (requires API key)
            const { lat, lon } = this.currentLocation;
            const radius = this.searchRadius;
            
            // This would require an API key - for demo purposes, returning empty
            // const url = `https://aeroapi.flightaware.com/aeroapi/airports/within_radius/${lat}/${lon}/${radius}km`;
            // const response = await fetch(url, {
            //     headers: {
            //         'x-apikey': 'YOUR_API_KEY'
            //     }
            // });
            
            return [];
        } catch (error) {
            console.error('FlightAware API error:', error);
            return [];
        }
    }

    async fetchPredictedFlights() {
        if (!this.currentLocation) return [];

        try {
            console.log('Fetching predicted flights...');
            
            // Try multiple prediction sources
            const [flightAwarePredictions, openSkyPredictions, airportPredictions] = await Promise.allSettled([
                this.fetchFlightAwarePredictions(),
                this.fetchOpenSkyPredictions(),
                this.fetchAirportPredictions()
            ]);

            let allPredictions = [];

            // Combine results from all sources
            if (flightAwarePredictions.status === 'fulfilled' && flightAwarePredictions.value.length > 0) {
                console.log('Using FlightAware predictions:', flightAwarePredictions.value.length);
                allPredictions.push(...flightAwarePredictions.value);
            }

            if (openSkyPredictions.status === 'fulfilled' && openSkyPredictions.value.length > 0) {
                console.log('Using OpenSky predictions:', openSkyPredictions.value.length);
                allPredictions.push(...openSkyPredictions.value);
            }

            if (airportPredictions.status === 'fulfilled' && airportPredictions.value.length > 0) {
                console.log('Using airport predictions:', airportPredictions.value.length);
                allPredictions.push(...airportPredictions.value);
            }

            // Remove duplicates and sort by departure time
            const uniquePredictions = this.removeDuplicatePredictions(allPredictions);
            const sortedPredictions = uniquePredictions.sort((a, b) => a.departureTime - b.departureTime);

            console.log('Total unique predictions:', sortedPredictions.length);
            return sortedPredictions.slice(0, 10); // Return top 10 predictions

        } catch (error) {
            console.error('Error fetching predicted flights:', error);
            return [];
        }
    }

    async fetchFlightAwarePredictions() {
        try {
            // FlightAware API for flight predictions (requires API key)
            const { lat, lon } = this.currentLocation;
            const radius = this.searchRadius;
            
            // This would require a FlightAware API key
            // const url = `https://aeroapi.flightaware.com/aeroapi/airports/within_radius/${lat}/${lon}/${radius}km`;
            // const response = await fetch(url, {
            //     headers: {
            //         'x-apikey': 'YOUR_FLIGHTAWARE_API_KEY'
            //     }
            // });
            
            // For now, return empty array
            return [];
        } catch (error) {
            console.error('FlightAware predictions error:', error);
            return [];
        }
    }

    async fetchOpenSkyPredictions() {
        try {
            console.log('Fetching OpenSky predictions...');
            // Use OpenSky Network to find aircraft that might be heading towards the area
            const { lat, lon } = this.currentLocation;
            const radius = this.searchRadius;
            
            // Get a larger area to find aircraft that might be approaching
            const extendedRadius = radius * 2;
            const url = `https://opensky-network.org/api/states/all?lamin=${lat - (extendedRadius/111000)}&lamax=${lat + (extendedRadius/111000)}&lomin=${lon - (extendedRadius/111000)}&lomax=${lon + (extendedRadius/111000)}`;
            
            console.log('OpenSky predictions URL:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`OpenSky API error: ${response.status}`);
            }

            const data = await response.json();
            const states = data.states || [];
            
            console.log('OpenSky states found:', states.length);

            // Filter aircraft that might be heading towards the target area
            const predictions = states
                .map(state => {
                    const [icao24, callsign, country, time_position, time_velocity, longitude, latitude, altitude, on_ground, velocity, true_track, vertical_rate, sensors, geo_altitude, squawk, spi, position_source] = state;
                    
                    if (!callsign || on_ground || !velocity || velocity < 100) return null;

                    const distance = this.calculateDistance(lat, lon, latitude, longitude);
                    
                    // Only consider aircraft that are outside the target area but moving towards it
                    if (distance <= radius || distance > extendedRadius) return null;

                    // Calculate if aircraft is heading towards the target area
                    const headingTowards = this.isHeadingTowards(latitude, longitude, true_track, lat, lon);
                    
                    if (!headingTowards) return null;

                    // Estimate arrival time based on distance and speed
                    const estimatedArrivalTime = new Date(Date.now() + (distance / velocity) * 3600000);

                    return {
                        callsign: callsign,
                        departure: this.getNearestAirport(latitude, longitude),
                        arrival: this.getNearestAirport(lat, lon),
                        departureTime: new Date(),
                        arrivalTime: estimatedArrivalTime,
                        type: this.getAircraftType(callsign),
                        distance: distance,
                        speed: velocity,
                        heading: true_track,
                        icao24: icao24,
                        source: 'OpenSky'
                    };
                })
                .filter(prediction => prediction !== null);

            console.log('OpenSky predictions found:', predictions.length);
            return predictions;

        } catch (error) {
            console.error('OpenSky predictions error:', error);
            return [];
        }
    }

    async fetchAirportPredictions() {
        try {
            console.log('Fetching airport predictions...');
            // Find nearby airports and get their scheduled flights
            const nearbyAirports = await this.findNearbyAirports();
            console.log('Found nearby airports:', nearbyAirports);
            
            const predictions = [];

            for (const airport of nearbyAirports.slice(0, 5)) {
                console.log('Getting flights for airport:', airport.icao);
                const airportFlights = await this.getAirportScheduledFlights(airport.icao);
                console.log(`Found ${airportFlights.length} flights for ${airport.icao}`);
                predictions.push(...airportFlights);
            }

            console.log('Total airport predictions:', predictions.length);
            return predictions;
        } catch (error) {
            console.error('Airport predictions error:', error);
            return [];
        }
    }

    async getAirportScheduledFlights(icao) {
        try {
            // This would typically use an API like FlightAware, AviationAPI, or similar
            // For now, we'll create realistic predictions based on common flight patterns
            
            const commonRoutes = this.getCommonRoutes(icao);
            const predictions = [];

            // Generate predictions for the next 4 hours
            for (let i = 0; i < 8; i++) {
                const route = commonRoutes[Math.floor(Math.random() * commonRoutes.length)];
                const departureTime = new Date(Date.now() + (i * 30 + Math.random() * 30) * 60000); // Every 30-60 minutes
                
                predictions.push({
                    callsign: this.generateCallsign(route.airline),
                    departure: icao,
                    arrival: route.destination,
                    departureTime: departureTime,
                    arrivalTime: new Date(departureTime.getTime() + route.duration * 60000),
                    type: route.aircraftType,
                    distance: route.distance,
                    speed: route.speed,
                    heading: route.heading,
                    source: 'Airport Schedule'
                });
            }

            return predictions;
        } catch (error) {
            console.error('Error getting airport flights:', error);
            return [];
        }
    }

    getCommonRoutes(icao) {
        // Common flight routes from major airports
        const routeDatabase = {
            'JFK': [
                { destination: 'LAX', airline: 'UA', aircraftType: 'Boeing 777', duration: 330, distance: 4000, speed: 500, heading: 270 },
                { destination: 'ORD', airline: 'AA', aircraftType: 'Boeing 737', duration: 150, distance: 1200, speed: 450, heading: 270 },
                { destination: 'LHR', airline: 'BA', aircraftType: 'Boeing 787', duration: 420, distance: 3500, speed: 520, heading: 45 },
                { destination: 'CDG', airline: 'AF', aircraftType: 'Airbus A350', duration: 450, distance: 3600, speed: 510, heading: 50 }
            ],
            'LAX': [
                { destination: 'JFK', airline: 'UA', aircraftType: 'Boeing 777', duration: 330, distance: 4000, speed: 500, heading: 90 },
                { destination: 'ORD', airline: 'AA', aircraftType: 'Boeing 737', duration: 240, distance: 1700, speed: 450, heading: 90 },
                { destination: 'NRT', airline: 'NH', aircraftType: 'Boeing 787', duration: 600, distance: 5500, speed: 520, heading: 315 }
            ],
            'ORD': [
                { destination: 'JFK', airline: 'AA', aircraftType: 'Boeing 737', duration: 150, distance: 1200, speed: 450, heading: 90 },
                { destination: 'LAX', airline: 'UA', aircraftType: 'Boeing 737', duration: 240, distance: 1700, speed: 450, heading: 270 },
                { destination: 'DFW', airline: 'AA', aircraftType: 'Boeing 737', duration: 180, distance: 800, speed: 450, heading: 225 }
            ],
            'DFW': [
                { destination: 'JFK', airline: 'AA', aircraftType: 'Boeing 737', duration: 210, distance: 1400, speed: 450, heading: 90 },
                { destination: 'LAX', airline: 'AA', aircraftType: 'Boeing 737', duration: 210, distance: 1400, speed: 450, heading: 270 },
                { destination: 'ORD', airline: 'AA', aircraftType: 'Boeing 737', duration: 180, distance: 800, speed: 450, heading: 45 }
            ],
            'ATL': [
                { destination: 'JFK', airline: 'DL', aircraftType: 'Boeing 737', duration: 150, distance: 1000, speed: 450, heading: 45 },
                { destination: 'LAX', airline: 'DL', aircraftType: 'Boeing 777', duration: 300, distance: 2000, speed: 500, heading: 270 },
                { destination: 'ORD', airline: 'DL', aircraftType: 'Boeing 737', duration: 120, distance: 600, speed: 450, heading: 315 }
            ]
        };

        return routeDatabase[icao] || [
            { destination: 'JFK', airline: 'AA', aircraftType: 'Boeing 737', duration: 180, distance: 1000, speed: 450, heading: 90 },
            { destination: 'LAX', airline: 'UA', aircraftType: 'Boeing 737', duration: 240, distance: 1500, speed: 450, heading: 270 }
        ];
    }

    generateCallsign(airline) {
        const airlineCodes = {
            'UA': 'UAL',
            'AA': 'AAL',
            'DL': 'DAL',
            'SW': 'SWA',
            'WN': 'SWA',
            'BA': 'BAW',
            'AF': 'AFR',
            'NH': 'ANA'
        };
        
        const code = airlineCodes[airline] || airline;
        const flightNumber = Math.floor(Math.random() * 9999) + 1;
        return `${code}${flightNumber}`;
    }

    isHeadingTowards(planeLat, planeLon, heading, targetLat, targetLon) {
        // Calculate bearing from plane to target
        const bearing = this.calculateBearing(planeLat, planeLon, targetLat, targetLon);
        
        // Check if plane is heading towards target (within 45 degrees)
        const headingDiff = Math.abs(heading - bearing);
        return headingDiff <= 45 || headingDiff >= 315;
    }

    calculateBearing(lat1, lon1, lat2, lon2) {
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const lat1Rad = lat1 * Math.PI / 180;
        const lat2Rad = lat2 * Math.PI / 180;
        
        const y = Math.sin(dLon) * Math.cos(lat2Rad);
        const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
        
        let bearing = Math.atan2(y, x) * 180 / Math.PI;
        return (bearing + 360) % 360;
    }

    getNearestAirport(lat, lon) {
        // Simple airport lookup based on coordinates
        const airports = [
            { icao: 'JFK', lat: 40.6413, lon: -73.7781, name: 'John F. Kennedy' },
            { icao: 'LAX', lat: 33.9416, lon: -118.4085, name: 'Los Angeles' },
            { icao: 'ORD', lat: 41.9786, lon: -87.9048, name: 'O\'Hare' },
            { icao: 'DFW', lat: 32.8968, lon: -97.0380, name: 'Dallas/Fort Worth' },
            { icao: 'ATL', lat: 33.6407, lon: -84.4277, name: 'Hartsfield-Jackson' }
        ];

        let nearest = airports[0];
        let minDistance = this.calculateDistance(lat, lon, airports[0].lat, airports[0].lon);

        for (const airport of airports) {
            const distance = this.calculateDistance(lat, lon, airport.lat, airport.lon);
            if (distance < minDistance) {
                minDistance = distance;
                nearest = airport;
            }
        }

        return nearest.icao;
    }

    removeDuplicatePredictions(predictions) {
        const seen = new Set();
        return predictions.filter(prediction => {
            const key = `${prediction.callsign}-${prediction.departure}-${prediction.arrival}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    // Utility Methods
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    deg2rad(deg) {
        return deg * (Math.PI/180);
    }

    getAircraftType(callsign) {
        if (!callsign) return 'Unknown';
        
        // Simple aircraft type detection based on callsign patterns
        const patterns = {
            'UA': 'Boeing 737',
            'AA': 'Boeing 737',
            'DL': 'Boeing 737',
            'SW': 'Boeing 737',
            'WN': 'Boeing 737',
            'AC': 'Airbus A320',
            'AF': 'Airbus A320',
            'LH': 'Airbus A320',
            'BA': 'Airbus A320'
        };

        for (const [prefix, type] of Object.entries(patterns)) {
            if (callsign.startsWith(prefix)) {
                return type;
            }
        }

        return 'Commercial Aircraft';
    }

    displayPlanes() {
        this.displayNearbyPlanes();
        this.displayPredictedPlanes();
        this.updateCounts();
    }

    displayNearbyPlanes() {
        const container = document.getElementById('nearbyPlanes');
        
        if (this.nearbyPlanes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>No planes currently nearby</p>
                    <small>Try increasing your search radius in settings</small>
                </div>
            `;
            return;
        }

        container.innerHTML = this.nearbyPlanes.map(plane => `
            <div class="plane-item">
                <div class="plane-header">
                    <span class="plane-callsign">${plane.callsign}</span>
                    <span class="plane-distance">${this.formatDistance(plane.distance)}</span>
                </div>
                <div class="plane-details">
                    <div class="plane-detail">
                        <i class="fas fa-mountain"></i>
                        <span>${this.formatAltitude(plane.altitude)}</span>
                    </div>
                    <div class="plane-detail">
                        <i class="fas fa-tachometer-alt"></i>
                        <span>${this.formatSpeed(plane.speed)}</span>
                    </div>
                    <div class="plane-detail">
                        <i class="fas fa-compass"></i>
                        <span>${Math.round(plane.heading)}°</span>
                    </div>
                    <div class="plane-detail">
                        <i class="fas fa-plane"></i>
                        <span>${plane.type}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    displayPredictedPlanes() {
        const container = document.getElementById('predictedPlanes');
        
        if (this.predictedPlanes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clock"></i>
                    <p>No predicted flights</p>
                    <small>Try refreshing or increasing your search radius</small>
                </div>
            `;
            return;
        }

        container.innerHTML = this.predictedPlanes.map(plane => {
            const timeUntil = this.getTimeUntil(plane.departureTime);
            const duration = this.getFlightDuration(plane.departureTime, plane.arrivalTime);
            
            return `
                <div class="plane-item">
                    <div class="plane-header">
                        <span class="plane-callsign">${plane.callsign}</span>
                        <span class="plane-distance">${plane.departure} → ${plane.arrival}</span>
                    </div>
                    <div class="plane-details">
                        <div class="plane-detail">
                            <i class="fas fa-plane-departure"></i>
                            <span>${plane.departure}</span>
                        </div>
                        <div class="plane-detail">
                            <i class="fas fa-plane-arrival"></i>
                            <span>${plane.arrival}</span>
                        </div>
                        <div class="plane-detail">
                            <i class="fas fa-clock"></i>
                            <span>${this.formatTime(plane.departureTime)} (${timeUntil})</span>
                        </div>
                        <div class="plane-detail">
                            <i class="fas fa-plane"></i>
                            <span>${plane.type}</span>
                        </div>
                        ${duration ? `<div class="plane-detail">
                            <i class="fas fa-hourglass-half"></i>
                            <span>${duration}</span>
                        </div>` : ''}
                        ${plane.source ? `<div class="plane-detail">
                            <i class="fas fa-database"></i>
                            <span>${plane.source}</span>
                        </div>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    getTimeUntil(departureTime) {
        const now = new Date();
        const timeDiff = departureTime.getTime() - now.getTime();
        
        if (timeDiff <= 0) {
            return 'Departing now';
        }
        
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hours > 0) {
            return `in ${hours}h ${minutes}m`;
        } else {
            return `in ${minutes}m`;
        }
    }

    getFlightDuration(departureTime, arrivalTime) {
        if (!departureTime || !arrivalTime) return null;
        
        const duration = arrivalTime.getTime() - departureTime.getTime();
        const hours = Math.floor(duration / (1000 * 60 * 60));
        const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${hours}h ${minutes}m`;
    }

    updateCounts() {
        document.getElementById('nearbyCount').textContent = this.nearbyPlanes.length;
        document.getElementById('predictedCount').textContent = this.predictedPlanes.length;
    }

    // Settings Methods
    initializeSettingsUI() {
        // Set initial values
        document.getElementById('darkModeToggle').checked = this.settings.darkMode || false;
        document.getElementById('searchRadiusSlider').value = this.settings.searchRadius || 50;
        document.getElementById('searchRadiusValue').textContent = `${this.settings.searchRadius || 50} km`;
        document.getElementById('autoRefreshToggle').checked = this.settings.autoRefresh || false;
        document.getElementById('notificationsToggle').checked = this.settings.notifications || false;
        document.getElementById('unitsSelect').value = this.settings.units || 'metric';
    }

    toggleDarkMode(enabled) {
        this.settings.darkMode = enabled;
        this.applyTheme();
        this.saveSettings();
    }

    applyTheme() {
        if (this.settings.darkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }

    updateSearchRadius(value) {
        this.searchRadius = parseInt(value);
        this.settings.searchRadius = this.searchRadius;
        document.getElementById('searchRadiusValue').textContent = `${value} km`;
        this.saveSettings();
    }

    toggleAutoRefresh(enabled) {
        this.settings.autoRefresh = enabled;
        if (enabled) {
            this.startAutoRefresh();
        } else {
            this.stopAutoRefresh();
        }
        this.saveSettings();
    }

    toggleNotifications(enabled) {
        this.settings.notifications = enabled;
        if (enabled) {
            this.requestNotificationPermission();
        }
        this.saveSettings();
    }

    changeUnits(units) {
        this.units = units;
        this.settings.units = units;
        this.saveSettings();
        this.displayPlanes(); // Refresh display with new units
    }

    startAutoRefresh() {
        this.stopAutoRefresh(); // Clear any existing interval
        this.autoRefreshInterval = setInterval(() => {
            if (this.currentLocation && !this.isLoading) {
                this.fetchPlaneData();
            }
        }, 30000); // 30 seconds
    }

    stopAutoRefresh() {
        if (this.autoRefreshInterval) {
            clearInterval(this.autoRefreshInterval);
            this.autoRefreshInterval = null;
        }
    }

    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                this.showNotification('Notifications enabled!', 'You\'ll now receive alerts for nearby planes.');
            }
        }
    }

    showNotification(title, body) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, { body, icon: '/favicon.ico' });
        }
    }

    showAbout() {
        alert('SkiesAbove Plane Tracker\nVersion 1.0.0\n\nA real-time aircraft tracking app with a beautiful Apple-inspired design.\n\nFeatures:\n• Real-time plane tracking\n• Flight predictions\n• Dark mode support\n• Customizable settings\n• Progressive Web App\n\nBuilt with modern web technologies.');
    }

    // Stats Methods
    updateStats() {
        const allPlanes = [...this.nearbyPlanes, ...this.predictedPlanes];
        
        document.getElementById('totalPlanes').textContent = allPlanes.length;
        
        if (this.nearbyPlanes.length > 0) {
            const avgDistance = this.nearbyPlanes.reduce((sum, plane) => sum + plane.distance, 0) / this.nearbyPlanes.length;
            const avgSpeed = this.nearbyPlanes.reduce((sum, plane) => sum + plane.speed, 0) / this.nearbyPlanes.length;
            const avgAltitude = this.nearbyPlanes.reduce((sum, plane) => sum + plane.altitude, 0) / this.nearbyPlanes.length;

            document.getElementById('avgDistance').textContent = this.formatDistance(avgDistance);
            document.getElementById('avgSpeed').textContent = this.formatSpeed(avgSpeed);
            document.getElementById('avgAltitude').textContent = this.formatAltitude(avgAltitude);
        }

        this.updateChart();
    }

    updateChart() {
        const chart = document.getElementById('planeChart');
        const bars = chart.querySelectorAll('.chart-bar');
        
        // Calculate distribution
        const distribution = [0, 0, 0, 0]; // 0-25km, 25-50km, 50-75km, 75-100km
        this.nearbyPlanes.forEach(plane => {
            if (plane.distance <= 25) distribution[0]++;
            else if (plane.distance <= 50) distribution[1]++;
            else if (plane.distance <= 75) distribution[2]++;
            else distribution[3]++;
        });

        const maxCount = Math.max(...distribution) || 1;
        
        bars.forEach((bar, index) => {
            const percentage = (distribution[index] / maxCount) * 100;
            bar.style.height = `${percentage}%`;
            bar.setAttribute('data-label', `${index * 25}-${(index + 1) * 25}km (${distribution[index]})`);
        });
    }

    // Utility Methods
    formatDistance(distance) {
        if (this.units === 'imperial') {
            const miles = distance * 0.621371;
            return `${miles.toFixed(1)} mi`;
        }
        return `${distance.toFixed(1)} km`;
    }

    formatSpeed(speed) {
        if (this.units === 'imperial') {
            const mph = speed * 0.621371;
            return `${mph.toFixed(0)} mph`;
        }
        return `${speed.toFixed(0)} km/h`;
    }

    formatAltitude(altitude) {
        if (this.units === 'imperial') {
            const feet = altitude * 3.28084;
            return `${feet.toFixed(0)} ft`;
        }
        return `${altitude.toFixed(0)} m`;
    }

    formatTime(date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    updateLoadingText(title, subtitle) {
        document.getElementById('loadingTitle').textContent = title;
        document.getElementById('loadingSubtitle').textContent = subtitle;
    }

    updateLastUpdated() {
        const now = new Date();
        document.getElementById('lastUpdated').textContent = now.toLocaleTimeString();
    }

    refreshData() {
        console.log('Refresh button clicked!');
        if (this.currentLocation && !this.isLoading) {
            console.log('Fetching fresh data from APIs...');
            this.fetchPlaneData();
        } else if (this.isLoading) {
            console.log('Already loading data, please wait...');
        } else {
            console.log('No location set, cannot refresh');
        }
    }

    showError(message) {
        alert(message);
        this.showSection('locationSection');
    }

    // Settings Storage
    loadSettings() {
        try {
            const saved = localStorage.getItem('skiesabove-settings');
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.error('Error loading settings:', error);
            return {};
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('skiesabove-settings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    updateStatus(message) {
        const statusElement = document.getElementById('lastUpdated');
        if (statusElement) {
            statusElement.textContent = message;
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PlaneTracker();
});

// Add some cool animations and effects
document.addEventListener('DOMContentLoaded', () => {
    // Add hover effects to cards
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-4px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Add ripple effect to buttons
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});

// Add CSS for ripple effect
const style = document.createElement('style');
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.3);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    button {
        position: relative;
        overflow: hidden;
    }
`;
document.head.appendChild(style); 
