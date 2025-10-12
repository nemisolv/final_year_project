## Project Structure

```
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth route group
│   ├── (dashboard)/              # Dashboard route group
│   ├── (marketing)/              # Marketing route group
│   ├── admin/                    # Admin pages
│   ├── learning/                 # Learning feature pages
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
│
├── components/
│   ├── features/                 # Feature-specific components
│   │   ├── auth/                 # Authentication components
│   │   ├── dashboard/            # Dashboard components
│   │   ├── learning/             # Learning feature components
│   │   └── admin/                # Admin components
│   ├── shared/                   # Shared/common components
│   │   ├── layout/               # Layout components
│   │   └── navigation/           # Navigation components
│   └── ui/                       # UI library components (shadcn/ui)
│
├── services/                     # API service layer
│   ├── auth.service.ts           # Authentication services
│   ├── user.service.ts           # User services
│   └── index.ts                  # Service exports
│
├── lib/
│   ├── api/                      # API client & configurations
│   │   ├── client.ts             # Axios client with interceptors
│   │   └── index.ts
│   ├── auth/                     # Auth utilities
│   │   ├── helpers.ts            # Auth helper functions
│   │   └── index.ts
│   ├── utils/                    # Utility functions
│   │   ├── cn.ts                 # Class name utility
│   │   ├── format.ts             # Formatting utilities
│   │   └── index.ts
│   └── validations/              # Validation schemas (Zod)
│
├── hooks/                        # Custom React hooks
│   ├── use-auth.ts               # Authentication hook
│   ├── use-user.ts               # User data hook
│   └── index.ts
│
├── types/                        # TypeScript types & interfaces
│   ├── user.ts                   # User types
│   ├── auth.ts                   # Auth types
│   ├── api.ts                    # API response types
│   └── index.ts                  # Central type exports
│
├── config/                       # Application configuration
│   ├── app.config.ts             # App-level config
│   ├── api.config.ts             # API endpoints config
│   ├── auth.config.ts            # Auth config & routes
│   └── index.ts
│
├── actions/                      # Server actions
│   └── tts.ts                    # Text-to-speech action
│
└── public/                       # Static assets

```

