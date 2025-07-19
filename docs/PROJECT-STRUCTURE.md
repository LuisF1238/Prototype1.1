# Project Structure Overview

## 📁 Directory Organization

This document explains the new organized project structure after refactoring.

### Root Directory

```
Prototype1.1/
├── README.md              # Project overview and quick start
├── package.json           # Dependencies and scripts
├── package-lock.json      # Dependency lock file
├── next.config.js         # Next.js config proxy (loads from config/)
├── tsconfig.json          # TypeScript config proxy (extends config/)
├── eslint.config.mjs      # ESLint config proxy (imports config/)
└── .gitignore            # Git ignore rules
```

### Organized Directories

#### `/app/` - Next.js Application
```
app/
├── api/                   # API routes
│   └── chat/             # Chat endpoint
├── assets/               # App-specific assets
│   └── components/       # React components
├── global.css            # Global styles
├── layout.tsx            # Root layout
└── page.tsx              # Home page
```

#### `/assets/` - Static Assets
```
assets/
├── chattt.jpg            # Chatbot image
└── index.html            # Static HTML file
```

#### `/config/` - Configuration Files
```
config/
├── eslint.config.mjs     # ESLint configuration
├── next.config.ts        # Next.js configuration
├── next-env.d.ts         # Next.js type definitions
└── tsconfig.json         # TypeScript configuration
```

#### `/data/` - Data Files
```
data/
└── Merced College Majors.csv  # University data
```

#### `/docs/` - Documentation
```
docs/
├── README.md             # Detailed documentation
├── REFACTOR-GUIDE.md     # Refactoring guide
└── PROJECT-STRUCTURE.md  # This file
```

#### `/js/` - Legacy JavaScript
```
js/
├── AutocompleteInput.js  # Legacy form components
├── ChatbotApp.js         # Legacy chatbot
├── ChatbotPanel.js       # Legacy chat panel
├── CSVLoader.js          # Legacy CSV loader
├── FormValidator.js      # Legacy validation
└── StudentDataManager.js # Legacy data management
```

#### `/scripts/` - Build & Utility Scripts
```
scripts/
├── loadDb.ts             # Original data loader
├── loadDb-refactored.ts  # New data loader
└── scraping-progress.json # Progress tracking
```

#### `/src/` - Refactored Source Code
```
src/
├── config/               # Application configuration
├── lib/                  # High-level services
├── services/             # Core business logic
├── types/                # TypeScript definitions
├── utils/                # Utilities and helpers
└── index.ts              # Main exports
```

## 📋 File Types by Purpose

### Configuration Files
- **Root level**: Proxy files that delegate to `/config/`
- **`/config/`**: Actual configuration files
- **Why**: Cleaner root directory while maintaining tool compatibility

### Assets & Media
- **`/assets/`**: Static assets (images, HTML)
- **`/app/assets/`**: App-specific assets and components
- **Why**: Clear separation between static and dynamic assets

### Documentation
- **`/docs/`**: All documentation files
- **Root `README.md`**: Quick overview and getting started
- **Why**: Dedicated documentation space

### Data Files
- **`/data/`**: CSV files and other data
- **Why**: Separate data from code

### Source Code
- **`/app/`**: Next.js app (pages, layouts, API routes)
- **`/src/`**: Refactored services and utilities
- **`/js/`**: Legacy JavaScript files
- **Why**: Clear separation between old and new code

## 🔄 Migration Benefits

### Before (Root Directory Chaos)
```
├── chattt.jpg ❌
├── index.html ❌
├── Merced College Majors.csv ❌
├── eslint.config.mjs ❌
├── next.config.ts ❌
├── tsconfig.json ❌
├── next-env.d.ts ❌
├── Prototype1.1.iml ❌
└── ... many other files
```

### After (Organized Structure)
```
├── README.md ✅
├── package.json ✅
├── assets/ ✅
├── config/ ✅
├── data/ ✅
├── docs/ ✅
└── src/ ✅
```

## 🛠️ Tool Compatibility

All development tools continue to work normally:

- **Next.js**: Uses proxy config files
- **TypeScript**: Extended configuration
- **ESLint**: Imported configuration
- **npm scripts**: Updated to reference correct configs

## 📝 Path Aliases

The following aliases are available in TypeScript:

```typescript
@assets/*    → ./assets/*
@data/*      → ./data/*
@config/*    → ./config/*
@src/*       → ./src/*
@components/* → ./app/assets/components/*
```

## 🚀 Usage Examples

### Import from organized structure:
```typescript
// Old way
import logo from './assets/logo.png'

// New way  
import logo from '@assets/logo.png'
```

### Access configurations:
```typescript
// Config files are properly referenced
// No manual path changes needed
```

### Run scripts:
```bash
# All scripts work the same
npm run dev
npm run build
npm run seed:refactored
```

This organization makes the project much more maintainable and professional while preserving all existing functionality.