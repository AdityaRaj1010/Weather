# Weather Now 🌦️

A modern, real-time weather application built with React.js (Vite) frontend and FastAPI Python backend. Features location tracking, detailed forecasts, and a beautiful glassmorphic UI.

## Features

### 🌍 Location Services
- **Auto GPS Detection**: Automatically detects and tracks your current location
- **Location Search**: Search for any city or place worldwide
- **GPS Following**: Optional continuous location tracking with 200m accuracy threshold
- **Reverse Geocoding**: Convert coordinates to readable location names

### 🌤️ Weather Data
- **Current Conditions**: Real-time temperature, humidity, wind, and pressure
- **24-Hour Forecast**: Detailed hourly predictions with interactive charts
- **7-Day Outlook**: Extended forecast with UV index visualization
- **Weather Icons**: Visual weather condition indicators
- **Sunrise/Sunset**: Daily sun timing information

### 📊 Data Visualization
- **Interactive Charts**: Beautiful area charts for temperature trends using Recharts
- **UV Index Bars**: Visual representation of UV intensity levels
- **Hourly Table**: Detailed breakdown of temperature, precipitation, and wind

### 🎨 User Experience
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Glassmorphic UI**: Modern backdrop-blur design with gradient backgrounds
- **Unit Toggle**: Switch between Celsius and Fahrenheit
- **Auto Refresh**: Updates every 5 minutes automatically
- **Real-time Status**: Shows last updated time and loading states

## Technology Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Recharts** - Composable charting library for React

### Backend
- **FastAPI** - Modern, fast web framework for Python
- **HTTPX** - Async HTTP client for Python
- **Requests** - HTTP library for Python
- **CORS Middleware** - Cross-origin request handling

### APIs
- **Open-Meteo** - Weather data provider
- **OpenStreetMap Nominatim** - Geocoding and reverse geocoding

## Prerequisites

- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **npm** or **yarn**
- **pip** (Python package manager)

## Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd weather-app
```

### 2. Backend Setup

Create a virtual environment and install dependencies:
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install fastapi uvicorn httpx requests
```

### 3. Frontend Setup

Install Node.js dependencies:
```bash
npm install
# or
yarn install
```

Required dependencies include:
```json
{
  "react": "^18.0.0",
  "react-dom": "^18.0.0",
  "recharts": "^2.0.0"
}
```

## Running the Application

### 1. Start the Backend Server
```bash
# Make sure virtual environment is activated
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### 2. Start the Frontend Development Server
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`

## API Endpoints

### Weather Data
- **GET** `/weather?lat={lat}&lon={lon}&tz={timezone}`
  - Returns current conditions, hourly, and daily forecasts
  - Parameters: latitude, longitude, timezone (optional, defaults to "auto")

### Location Services
- **GET** `/api/reverse?lat={lat}&lon={lon}`
  - Reverse geocoding: converts coordinates to location name
  
- **GET** `/api/search?q={query}`
  - Location search: finds places matching the query

## Configuration

### Backend Configuration
The backend runs on `http://localhost:8000` by default. To change this:

1. Update the `BACKEND_URL` constant in the React component
2. Restart the FastAPI server on your desired port

### CORS Settings
Current CORS settings allow all origins (`allow_origins=["*"]`). For production:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.com"],
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)
```

## Project Structure

```
weather-app/
├── backend
|    ├── main.py           # FastAPI backend server
├── public/
├── src/
|   ├── App.css
│   ├── App.jsx            # Main React component
|   ├── index.css
│   └── main.jsx           # React app entry point
├── eslint.config.js
├── index.html
├── package.json           # Node.js dependencies
├── vite.config.js
└── README.md
```

### Component Architecture
- **WeatherApp**: Main component containing all weather functionality
- **SearchBar**: Location search with debounced input
- **UnitToggle**: Celsius/Fahrenheit temperature unit switcher
- **Stat**: Reusable statistic display component

## Features Breakdown

### Location Tracking
- Uses browser's `navigator.geolocation` API
- Implements `watchPosition` for continuous tracking
- 200-meter threshold to prevent excessive API calls
- Graceful fallback to New Delhi coordinates

### Weather Data Processing
- Transforms API responses into chart-ready formats
- Handles unit conversions (Celsius ↔ Fahrenheit)
- Processes weather codes into human-readable labels and icons
- Implements error handling for API failures

### Performance Optimizations
- Debounced search input (350ms delay)
- Memoized chart data processing with `useMemo`
- Efficient re-rendering with React hooks
- AbortController for cancelling in-flight requests

## Browser Support

- **Modern browsers** with geolocation support
- **Chrome/Edge** 50+
- **Firefox** 55+
- **Safari** 12+
- **Mobile browsers** (iOS Safari, Chrome Mobile)

## Development

### Adding New Features
1. **Weather Parameters**: Add new parameters to the Open-Meteo API call in `main.py`
2. **UI Components**: Create new components following the existing Tailwind + glassmorphic pattern
3. **Charts**: Use Recharts components for data visualization

### Styling Guidelines
- Use Tailwind utility classes
- Follow the glassmorphic design pattern (`bg-white/70 backdrop-blur`)
- Maintain rounded corners with `rounded-2xl` or `rounded-3xl`
- Use consistent spacing and shadows

## Deployment

### Frontend (Vite Build)
```bash
npm run build
# Deploy the 'dist' folder to your static hosting service
```

### Backend (FastAPI Production)
```bash
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Environment Variables
Consider using environment variables for:
- API base URLs
- CORS origins
- Port configurations

## Troubleshooting

### Common Issues

**Location not working:**
- Ensure HTTPS (required for geolocation API)
- Check browser permissions
- Verify GPS is enabled on mobile devices

**Weather data not loading:**
- Check if backend server is running on port 8000
- Verify internet connection
- Check browser console for CORS errors

**Search not working:**
- Ensure OpenStreetMap Nominatim is accessible
- Check for rate limiting (add delays between requests)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source. Please check the repository for license details.

## Acknowledgments

- **Open-Meteo** for providing free weather API
- **OpenStreetMap** for geocoding services
- **Recharts** for beautiful React charts
- **Tailwind CSS** for utility-first styling