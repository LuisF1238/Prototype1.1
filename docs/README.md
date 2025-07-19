# Merced College Transfer Assistant

A comprehensive web application that integrates Program Mapper with an AI-powered transfer counselor to help students plan their educational pathways from community college to 4-year universities.

## Overview

This project combines two key components:
1. **Program Mapper Integration** - Main entry point showing Merced College's program mapping interface
2. **ASSISTgpt Chat Interface** - Next.js-powered AI counselor that opens in a popup window

## Features

### 🎯 Main Interface (index.html)
- **Program Mapper Integration** - Embedded iframe showing Merced College's program mapping tool
- **Student Information Collection** - Smart form with autocomplete for majors
- **Data Persistence** - Remembers user information for up to 7 days
- **Responsive Design** - Works seamlessly on desktop and mobile
- **Accessibility** - Full keyboard navigation and screen reader support

### 🤖 AI Counselor (Next.js App)
- **Personalized Guidance** - AI-powered transfer counseling using OpenAI GPT-4
- **Vector Database Integration** - Semantic search with DataStax Astra DB
- **Real-time Chat** - Streaming responses with React hooks
- **Context Awareness** - Automatically loads student information from main interface
- **Prompt Suggestions** - Pre-built prompts to help students get started

## Tech Stack

### Frontend
- **HTML/CSS/JavaScript** - Main interface with modular architecture
- **Next.js 15** - AI chat interface with App Router
- **TypeScript** - Type-safe development
- **React 19** - Modern hooks and state management

### Backend & AI
- **OpenAI GPT-4** - AI counselor responses
- **DataStax Astra DB** - Vector database for semantic search
- **AI SDK** - Streaming responses and AI integration
- **LangChain** - AI workflow management

## Project Structure

```
Prototype1/
├── index.html                    # Main entry point
├── js/                          # JavaScript modules
│   ├── ChatbotApp.js            # Main application controller
│   ├── ChatbotPanel.js          # Panel toggle & navigation
│   ├── AutocompleteInput.js     # Major autocomplete functionality
│   ├── FormValidator.js         # Form validation
│   ├── StudentDataManager.js    # Data persistence
│   └── CSVLoader.js             # CSV file handling
├── app/                         # Next.js AI interface
│   ├── api/chat/route.ts        # Chat API endpoint
│   ├── assets/components/       # React components
│   ├── page.tsx                 # AI chat interface
│   └── global.css               # Styles
├── Merced College Majors.csv    # Major data source
└── scripts/loadDb.ts            # Database seeding
```

## Installation & Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- OpenAI API key
- DataStax Astra DB account

### 1. Environment Setup
Create a `.env.local` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key
ASTRA_DB_API_ENDPOINT=your_astra_db_endpoint
ASTRA_DB_APPLICATION_TOKEN=your_astra_db_token
ASTRA_DB_NAMESPACE=your_namespace
ASTRA_DB_COLLECTION=your_collection_name
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Seed Database (Optional)
```bash
npm run seed
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Open Main Interface
Open `index.html` in your browser to start using the application.

## How It Works

### User Flow
1. **Landing Page** - User opens `index.html` and sees the Program Mapper
2. **Information Collection** - User clicks chatbot button to open info form
3. **Form Completion** - User enters year, major, and transfer goals
4. **AI Counselor Launch** - Form submission opens ASSISTgpt in popup window
5. **Personalized Assistance** - AI provides contextual guidance based on student data

### Data Flow
```
index.html → Student Form → localStorage → ASSISTgpt Popup → AI Counselor
```

### Key Components

#### ChatbotApp (Main Controller)
- Orchestrates all JavaScript modules
- Handles form submission and popup management
- Manages CSV loading and fallback scenarios

#### Student Data Management
- Automatic form validation with real-time feedback
- Persistent storage with 7-day expiration
- Seamless data transfer to AI interface

#### AI Integration
- Context-aware responses using student information
- Vector search for relevant transfer guidance
- Streaming chat interface with loading states

## Customization

### Modify Major Data Source
Update the CSV file path in `ChatbotApp.js`:
```javascript
const majors = await this.csvLoader.loadCSV('Your-College-Majors.csv');
```

### Adjust Data Persistence
Change retention period in `StudentDataManager.js`:
```javascript
this.maxAge = 14 * 24 * 60 * 60 * 1000; // 14 days
```

### Update AI Popup Settings
Modify popup dimensions in `ChatbotApp.js`:
```javascript
const popupFeatures = 'width=1000,height=700,scrollbars=yes,resizable=yes';
```

## Scripts

- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run seed` - Seed the vector database
- `npm run lint` - Run ESLint

## Browser Compatibility

### Supported Browsers
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Required APIs
- Fetch API (CSV loading)
- LocalStorage (data persistence)
- Popup windows (AI interface)
- ES6 Classes (modular architecture)

## Development Notes

### Local Development
1. Start Next.js server: `npm run dev`
2. Open `index.html` in browser
3. Test form submission → popup integration

### Production Deployment
1. Build Next.js app: `npm run build`
2. Deploy both static files and Next.js app
3. Ensure proper CORS configuration
4. Configure HTTPS for production

## Contributing

This project is part of the UC Merced/ASSIST AssistGPT research initiative. For contributions:

1. Fork the repository
2. Create a feature branch
3. Test both HTML interface and Next.js app
4. Submit a pull request

## License

This project is developed for educational purposes as part of the UC Merced/ASSIST AssistGPT research project.