# College Transfer Counselor AI

A Next.js application that provides AI-powered college transfer counseling using RAG (Retrieval-Augmented Generation) with ASSIST.org data.

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── assets/            # App-specific assets and components
│   └── *.tsx              # Pages and layouts
├── assets/                # Static assets (images, HTML files)
├── config/                # Configuration files
│   ├── eslint.config.mjs  # ESLint configuration
│   ├── next.config.ts     # Next.js configuration
│   ├── tsconfig.json      # TypeScript configuration
│   └── next-env.d.ts      # Next.js type definitions
├── data/                  # Data files (CSV, JSON)
├── docs/                  # Documentation
│   ├── README.md          # Detailed documentation
│   └── REFACTOR-GUIDE.md  # Refactoring guide
├── js/                    # Legacy JavaScript files
├── scripts/               # Build and utility scripts
├── src/                   # Source code (refactored architecture)
│   ├── config/           # App configuration
│   ├── lib/              # High-level services
│   ├── services/         # Core business logic
│   ├── types/            # TypeScript definitions
│   └── utils/            # Utilities and helpers
└── node_modules/         # Dependencies
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Environment variables (see below)

### Environment Variables

Create a `.env.local` file:

```env
ASTRA_DB_NAMESPACE=your_namespace
ASTRA_DB_COLLECTION=your_collection
ASTRA_DB_API_ENDPOINT=your_endpoint
ASTRA_DB_APPLICATION_TOKEN=your_token
OPENAI_API_KEY=your_openai_key
```

### Installation

```bash
npm install
```

### Development

```bash
# Start development server
npm run dev

# Load university data (original)
npm run seed

# Load university data (refactored)
npm run seed:refactored

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📚 Documentation

- **[Detailed Documentation](./docs/README.md)** - Complete project documentation
- **[Refactor Guide](./docs/REFACTOR-GUIDE.md)** - Architecture and refactoring details

## 🏗️ Architecture

This project uses a clean, modular architecture:

- **Services Layer**: Core business logic (database, embedding, scraping)
- **Lib Layer**: High-level orchestration and workflows  
- **Utils Layer**: Shared utilities and helpers
- **Config Layer**: Centralized configuration management

## 📄 License

This project is private and proprietary.