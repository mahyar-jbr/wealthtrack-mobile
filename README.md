# WealthTrack Mobile

React Native mobile application for the WealthTrack personal wealth tracking platform. Built with Expo and TypeScript, featuring a premium minimal design.

## 🚀 Features

- ✅ **User Authentication**
  - Secure registration and login
  - JWT-based authentication with SecureStore
  - Protected routes and session management
  - Auto-logout on token expiration

- ✅ **Dashboard**
  - Real-time portfolio overview
  - Total portfolio value display
  - Gain/loss tracking with visual indicators
  - Recent assets quick view
  - Premium black & white minimal design

- ✅ **Asset Management**
  - Full CRUD operations for assets
  - Support for multiple asset types (Stocks, Crypto, ETFs, Bonds)
  - Real-time price fetching from Yahoo Finance and CoinGecko
  - Detailed asset view with performance metrics
  - Add/Edit/Delete asset functionality
  - Date picker for purchase date selection

- ✅ **Portfolio Analytics**
  - Real-time portfolio valuation
  - Individual asset performance tracking
  - Gain/loss calculations
  - Price update timestamps
  - Visual profit/loss indicators

- ✅ **Profile Management**
  - User profile display
  - Settings and preferences
  - Account management options
  - Sign out functionality

## 🛠 Tech Stack

- **Framework**: React Native (0.81.4)
- **Platform**: Expo (54.0.8)
- **Navigation**: Expo Router (6.0.6)
- **Language**: TypeScript (5.9.2)
- **UI Library**: React Native Paper (5.14.5)
- **Charts**: React Native Gifted Charts (1.4.64)
- **HTTP Client**: Axios (1.12.2)
- **Secure Storage**: Expo SecureStore
- **Date Picker**: React Native DateTimePicker

## 📋 Prerequisites

- Node.js 16+
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development) or Android Emulator (for Android development)
- Running backend server (see [WealthTrack Backend](https://github.com/mahyar-jbr/wealthtrack-backend))

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/wealthtrack-mobile.git
cd wealthtrack-mobile
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

Update the API URL in `.env`:
```env
EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:3000
```

To find your local IP:
```bash
# macOS/Linux
ipconfig getifaddr en0

# Windows
ipconfig
```

### 4. Start the development server
```bash
npm start
```

This will open Expo Dev Tools in your browser. From there you can:
- Press `i` to open iOS Simulator
- Press `a` to open Android Emulator
- Scan QR code with Expo Go app on your physical device

## 📁 Project Structure

```
wealthtrack-mobile/
├── app/                    # App screens (Expo Router)
│   ├── (auth)/            # Authentication screens
│   │   ├── login.tsx     # Login screen
│   │   └── register.tsx  # Registration screen
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx     # Dashboard screen
│   │   ├── assets.tsx    # Assets list screen
│   │   └── profile.tsx   # Profile screen
│   ├── asset-detail.tsx   # Asset detail screen
│   ├── add-asset.tsx      # Add asset screen
│   └── _layout.tsx        # Root layout
├── components/             # Reusable components
│   └── LoadingSpinner.tsx # Loading indicator
├── constants/             # App constants
│   ├── theme.ts          # Color scheme and theme
│   └── api.ts            # API endpoints
├── contexts/              # React contexts
│   └── AuthContext.tsx   # Authentication context
├── services/              # API services
│   ├── auth.ts           # Authentication API
│   ├── assets.ts         # Assets API
│   └── prices.ts         # Prices API
├── types/                 # TypeScript type definitions
│   └── index.ts          # Shared types
├── .env.example          # Environment variables template
├── .gitignore            # Git ignore rules
├── app.json              # Expo configuration
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## 🎨 Design System

The app features a premium minimal design with:
- **Primary Color**: Black (#000000)
- **Background**: White (#FFFFFF)
- **Accents**: Gray scale (#666666, #999999, #E5E5E5)
- **Success**: Green (#10B981)
- **Loss**: Red (#EF4444)
- **Typography**: System fonts with letter spacing
- **Shadows**: Subtle elevation for depth
- **Borders**: 1px gray borders for separation

## 🔐 Authentication Flow

1. User opens app
2. If no token, redirect to login screen
3. User registers or logs in
4. JWT token stored securely in SecureStore
5. Token sent with all API requests
6. Auto-logout on token expiration or manual sign out

## 📱 Screens

### Authentication Screens
- **Login**: Email and password authentication
- **Register**: New user registration with first name, last name, email, and password

### Main App Screens
- **Dashboard**: Portfolio overview with total value, gain/loss, and recent assets
- **Assets**: List of all holdings with real-time prices and performance
- **Asset Detail**: Detailed view of individual asset with edit/delete options
- **Add/Edit Asset**: Form to add new asset or edit existing one
- **Profile**: User profile and account settings

## 🔌 API Integration

The app connects to the WealthTrack backend API:

### Base URL
Configure in `.env`:
```env
EXPO_PUBLIC_API_URL=http://your-backend-url:3000
```

### Endpoints Used
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/users/me` - Get current user
- `GET /api/assets` - Get all user assets
- `POST /api/assets` - Create new asset
- `PUT /api/assets/:id` - Update asset
- `DELETE /api/assets/:id` - Delete asset
- `GET /api/prices/portfolio` - Get portfolio with current prices

## 🧪 Development

### Run on iOS
```bash
npm run ios
```

### Run on Android
```bash
npm run android
```

### Run on Web
```bash
npm run web
```

## 📦 Building for Production

### iOS
```bash
# Requires Apple Developer account
eas build --platform ios
```

### Android
```bash
eas build --platform android
```

For detailed build instructions, see [Expo EAS Build documentation](https://docs.expo.dev/build/introduction/).

## 🐛 Common Issues

### Cannot connect to API
- Ensure backend server is running
- Check that API URL in `.env` uses correct IP address
- For physical devices, ensure device is on same network as backend
- For iOS Simulator/Android Emulator, localhost won't work - use computer's IP

### Port Already in Use
```bash
# Kill process using port 8081
lsof -i :8081
kill -9 <PID>

# Or start on different port
npx expo start --port 8082
```

### Expo Go Not Connecting
- Ensure phone and computer are on same WiFi network
- Disable VPN if active
- Try restarting Expo Dev Server

## 📱 Testing

The app has been tested on:
- iOS Simulator (iPhone 14 Pro)
- Android Emulator
- Physical iOS devices
- Physical Android devices

## 🔗 Related Repositories

- [WealthTrack Backend](https://github.com/mahyar-jbr/wealthtrack-backend) - Node.js/Express API

## 📝 License

MIT

## 👨‍💻 Author

Built by Mahyar Jaberi
