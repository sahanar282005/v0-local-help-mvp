# LocalHelp - Hyperlocal Support Platform

A modern, production-ready web application for hyperlocal community support, enabling users to borrow items, book technicians, and get emergency help - all powered by AI-driven matching and trust systems.

## Features

### Core Modules

1. **BorrowBox** - Item Borrowing System
   - Browse nearby available items
   - Smart matching based on distance and trust scores
   - Calendar-based booking with deposits
   - Owner approval workflow

2. **FixFast** - Technician Booking
   - Find verified local technicians
   - Skill-based filtering
   - Emergency 24/7 availability
   - AI-powered price estimation

3. **Emergency Help**
   - Priority routing for urgent requests
   - Instant notification to all available helpers
   - Real-time status tracking
   - 5-10 minute average response time

### AI-Powered Features

All AI features are currently implemented as rule-based mock services with clear integration points for production ML models:

- **Urgency Detection:** Automatically classifies requests as normal, priority, or emergency
- **Trust Score Engine:** Calculates user trustworthiness (0-100)
- **Fair Pricing:** Suggests optimal pricing based on context
- **Smart Matching:** Ranks and matches best available helpers

See `AI_INTEGRATION.md` for production ML integration guide.

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19.2, TypeScript
- **Backend:** Firebase (Auth + Firestore)
- **Styling:** Tailwind CSS v4, shadcn/ui components
- **Maps:** Google Maps Platform (integration ready)
- **Charts:** Custom SVG charts (Google Charts ready)
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Firestore and Authentication enabled
- (Optional) Google Maps API key

### Installation

1. Clone and install:
```bash
git clone <repository-url>
cd localhelp
npm install
```

2. Set up environment variables:
```bash
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Optional
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key
```

3. Run development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Firebase Setup

1. Create Firestore database with these collections:
   - `users`
   - `items`
   - `technicians` (or filter users by role)
   - `borrow_requests`
   - `technician_requests`
   - `emergency_logs`
   - `ratings`
   - `transactions`

2. Enable Authentication providers:
   - Email/Password
   - Google Sign-In (recommended)

3. Set Firestore security rules (example):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth.uid == userId;
    }
    
    match /items/{itemId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.ownerId;
    }
    
    // Add rules for other collections
  }
}
```

## Project Structure

```
localhelp/
├── app/
│   ├── (routes)/
│   │   ├── borrow/          # Item borrowing pages
│   │   ├── technician/      # Technician booking pages
│   │   ├── emergency/       # Emergency help pages
│   │   ├── profile/         # User profile
│   │   ├── history/         # Activity history
│   │   ├── admin/           # Admin dashboard
│   │   └── auth/            # Authentication pages
│   ├── layout.tsx
│   ├── page.tsx             # Landing/Home
│   └── globals.css
├── components/
│   ├── ui/                  # shadcn components
│   └── analytics-chart.tsx
├── lib/
│   ├── firebase/            # Firebase setup
│   │   ├── config.ts
│   │   ├── auth.ts
│   │   └── firestore.ts
│   └── mock-ai/             # Mock AI services
│       ├── urgency-detector.ts
│       ├── trust-score.ts
│       ├── pricing-engine.ts
│       └── smart-matching.ts
├── contexts/
│   └── auth-context.tsx     # Auth state management
├── types/
│   └── index.ts             # TypeScript definitions
├── AI_INTEGRATION.md        # AI/ML integration guide
└── README.md
```

## User Roles

1. **User** - Can borrow items and book technicians
2. **Technician** - Offers services, can toggle emergency availability
3. **Item Owner** - Lists items for borrowing
4. **Admin** - Full platform oversight and analytics

Users can have multiple roles simultaneously.

## Key Features

### Trust & Safety
- Verified user badges
- Community-driven trust scores
- Transparent rating system
- Emergency safety guidelines

### Mobile-First Design
- Responsive across all devices
- Touch-optimized interfaces
- Fast loading times
- Progressive Web App ready

### Real-Time Features
- Live emergency status tracking
- Instant notifications (via Firebase)
- Dynamic availability updates
- ETA calculations

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

```bash
vercel deploy
```

### Other Platforms

The app is a standard Next.js application and can be deployed to any platform supporting Node.js:
- Netlify
- Railway
- Fly.io
- AWS/GCP/Azure

## Future Enhancements

### Phase 2: Real AI Integration
- Replace mock AI with production ML models
- Add image recognition for item verification
- Implement predictive availability
- Natural language search

### Phase 3: Advanced Features
- In-app messaging
- Payment processing (Stripe)
- Real-time GPS tracking
- Push notifications
- Multi-language support

### Phase 4: Scale
- Geo-sharding for global deployment
- Advanced fraud detection
- Predictive inventory management
- Community moderation tools

## Contributing

We welcome contributions! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: [repository-url]/issues
- Documentation: Check AI_INTEGRATION.md
- Email: support@localhelp.example.com

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Deployed on [Vercel](https://vercel.com/)

---

**LocalHelp** - Building stronger communities through hyperlocal support.
