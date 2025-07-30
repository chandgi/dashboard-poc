# Dashboard POC

A modern dashboard proof-of-concept built with Next.js, TypeScript, and Tailwind CSS featuring multi-tenant architecture.

## Features

- 🏢 **Multi-tenant architecture** with dynamic routing (`/tenants/[tenantId]/dashboard`)
- 📊 **Dashboard overview** with key metrics and system status
- 👥 **User management** with role-based access control
- 📡 **Beacon monitoring** with real-time status tracking
- 🚨 **Alert system** with severity levels and status management
- 🎨 **Modern UI** using Tailwind CSS and Headless UI components
- 📱 **Responsive design** with mobile-first approach
- 🔧 **Mock API** using JSON Server for development

## Tech Stack

- **Framework:** Next.js 15 with TypeScript
- **Styling:** Tailwind CSS 4.0
- **UI Components:** Headless UI
- **Icons:** Heroicons
- **Mock API:** JSON Server
- **Deployment:** Vercel-ready

## Project Structure

```
dashboard-poc/
├── public/                    # Static assets
├── src/
│   ├── components/           # Shared UI components
│   │   ├── Layout.tsx        # Main layout wrapper
│   │   ├── Sidebar.tsx       # Navigation sidebar
│   │   ├── Navbar.tsx        # Top navigation bar
│   │   └── Table.tsx         # Reusable table component
│   ├── features/             # Feature-based modules
│   │   ├── users/            # User management
│   │   ├── beacons/          # Beacon monitoring
│   │   └── alerts/           # Alert system
│   ├── app/                  # Next.js app router
│   │   └── tenants/
│   │       └── [tenantId]/
│   │           └── dashboard/
│   │               ├── page.tsx        # Dashboard overview
│   │               ├── users/page.tsx  # Users page
│   │               ├── beacons/page.tsx # Beacons page
│   │               └── alerts/page.tsx  # Alerts page
│   ├── mocks/               # Mock data and API
│   │   └── db.json          # JSON Server database
│   └── utils/               # Utility functions
├── tests/
│   └── e2e/                 # End-to-end tests
├── README.md
├── vercel.json              # Vercel deployment config
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dashboard-poc
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development servers**
   ```bash
   npm run dev
   ```
   This will start both:
   - Next.js development server on `http://localhost:3000`
   - JSON Server mock API on `http://localhost:3001`

4. **Open your browser**
   Navigate to `http://localhost:3000` and you'll be redirected to the demo tenant dashboard.

### Available Scripts

- `npm run dev` - Start development servers (Next.js + JSON Server)
- `npm run dev:next` - Start only Next.js development server
- `npm run json-server` - Start only JSON Server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint

## API Endpoints

The mock API provides the following endpoints:

- `GET /users` - Fetch all users
- `POST /users` - Create a new user
- `PATCH /users/:id` - Update a user
- `DELETE /users/:id` - Delete a user

- `GET /beacons` - Fetch all beacons
- `POST /beacons` - Create a new beacon
- `PATCH /beacons/:id` - Update a beacon
- `DELETE /beacons/:id` - Delete a beacon

- `GET /alerts` - Fetch all alerts
- `POST /alerts` - Create a new alert
- `PATCH /alerts/:id` - Update an alert
- `DELETE /alerts/:id` - Delete an alert

## Multi-Tenant Usage

The application supports multi-tenancy through dynamic routing:

- Access different tenants: `/tenants/{tenant-id}/dashboard`
- Example: `/tenants/company-a/dashboard`, `/tenants/company-b/dashboard`
- Each tenant can have isolated data and configurations

## Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Deploy** - Vercel will automatically detect Next.js and configure the build
3. **Environment Variables** - Set `NODE_ENV=production` if needed

The `vercel.json` configuration is already included for optimal deployment.

### Other Platforms

For other platforms, build the application:

```bash
npm run build
```

Then serve the `out` directory with any static hosting service.

## Development Notes

- **Feature-based architecture** - Each feature (users/beacons/alerts) has its own types, API, and components
- **TypeScript strict mode** - Full type safety throughout the application
- **Responsive design** - Mobile-first approach with Tailwind CSS
- **Component reusability** - Shared components like Table can be used across features
- **Mock API** - JSON Server provides a realistic API experience during development

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
