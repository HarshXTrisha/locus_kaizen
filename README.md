# 🎯 QuestAI - Advanced Quiz Management Platform

A comprehensive quiz management platform powered by Kaizen methodology, built with Next.js, TypeScript, Firebase, and cutting-edge web technologies. QuestAI provides an exceptional user experience with advanced features, mobile optimization, offline support, and enterprise-grade performance, all designed for continuous improvement.

## ✨ **Key Features**

### 🚀 **Core Platform Features**
- **📝 Quiz Creation & Management**: Create, edit, and organize quizzes with multiple question types
- **🎯 Interactive Quiz Taking**: Real-time quiz interface with progress tracking and instant feedback
- **📊 Analytics Dashboard**: Comprehensive performance insights with beautiful charts and metrics
- **📁 File Upload System**: Support for PDF, JSON, and TXT files with automatic quiz generation
- **👥 User Management**: Secure authentication with Google Sign-In and role-based access
- **📱 Mobile-First Design**: Optimized mobile experience with responsive design
- **🔄 Real-time Updates**: Live data synchronization across all devices

### 🎨 **User Experience**
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark/Light Theme**: Theme switching capability
- **Loading States**: Beautiful loading spinners and skeletons
- **Notifications**: Toast notifications for user feedback
- **Error Boundaries**: Graceful error handling throughout the app
- **Accessibility**: WCAG compliant with keyboard navigation support

### 🔐 **Security & Authentication**
- **Google Sign-In Only**: Secure authentication using Google accounts
- **Protected Routes**: Automatic authentication checks with middleware
- **Global State Management**: Zustand for seamless state handling
- **Real-time Auth State**: Instant authentication status updates
- **Error Handling**: Comprehensive error management with user-friendly messages

### 📱 **Mobile Optimization**
- **Mobile-First Components**: Dedicated mobile components for optimal experience
- **Touch-Friendly Interface**: Optimized for touch interactions
- **Responsive Navigation**: Mobile-optimized navigation and menus
- **Performance Optimization**: Mobile-specific performance enhancements
- **Offline Support**: Full offline functionality with service worker

### 🚀 **Performance & Optimization**
- **Lightning Fast**: Optimized bundle size with dynamic imports and code splitting
- **Core Web Vitals**: Excellent LCP, FID, and CLS scores
- **Progressive Web App**: Full offline support with service worker
- **Image Optimization**: Next.js Image component with WebP/AVIF support
- **Tree Shaking**: Optimized imports for minimal bundle size
- **Caching Strategies**: Intelligent caching for improved performance

## 🛠 **Tech Stack**

### **Frontend**
- **Next.js 14**: App Router with server-side rendering
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Zustand**: Lightweight state management
- **Lucide React**: Beautiful icon library
- **React Query**: Server state management and caching

### **Backend & Services**
- **Firebase Authentication**: Secure user management
- **Firebase Firestore**: Real-time database
- **Firebase Storage**: File upload and management
- **Firebase Analytics**: User behavior tracking

### **Performance & Testing**
- **Dynamic Imports**: Code splitting for optimal loading
- **Image Optimization**: Next.js Image with modern formats
- **Service Worker**: Offline functionality and caching
- **PWA Support**: Progressive Web App capabilities
- **k6**: Load testing and performance monitoring
- **Artillery**: Additional load testing capabilities

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Firebase project setup
- Git

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/HarshXTrisha/locus_kaizen.git
   cd locus_kaizen/locus
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file with your Firebase configuration:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 **Project Structure**

```
questai/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (main)/            # Main application pages
│   │   │   ├── dashboard/     # Dashboard functionality
│   │   │   ├── upload/        # File upload system
│   │   │   ├── quiz/          # Quiz taking interface
│   │   │   ├── results/       # Results and analytics
│   │   │   ├── create/        # Quiz creation
│   │   │   ├── settings/      # User settings
│   │   │   ├── teams/         # Team management
│   │   │   └── archive/       # Quiz archive
│   │   ├── api/               # API routes
│   │   ├── login/             # Authentication
│   │   └── layout.tsx         # Root layout
│   ├── components/            # Reusable components
│   │   ├── mobile/           # Mobile-optimized components
│   │   │   ├── MobileAppWrapper.tsx
│   │   │   ├── MobileQuizTaker.tsx
│   │   │   ├── MobileUpload.tsx
│   │   │   ├── MobileCreateQuiz.tsx
│   │   │   ├── MobileResults.tsx
│   │   │   ├── MobileProfile.tsx
│   │   │   └── MobileQuizList.tsx
│   │   ├── common/           # Shared components
│   │   ├── dashboard/        # Dashboard components
│   │   ├── quiz/             # Quiz components
│   │   ├── upload/           # Upload components
│   │   ├── results/          # Results components
│   │   └── layout/           # Layout components
│   ├── lib/                  # Utility libraries
│   │   ├── firebase-quiz.ts  # Firebase quiz functions
│   │   ├── optimized-firebase.ts # Optimized Firebase functions
│   │   ├── store.ts          # Zustand state management
│   │   ├── config.ts         # Firebase configuration
│   │   ├── pdf-processor.ts  # PDF processing utilities
│   │   └── performance-monitor.ts # Performance monitoring
│   ├── hooks/                # Custom React hooks
│   │   └── useDashboard.ts   # Dashboard data hooks
│   └── middleware.ts         # Next.js middleware
├── public/                   # Static assets
├── load-test-80-users-60-questions.js # k6 load test script
├── test-quiz-60-questions.json # Test quiz data
├── LOAD_TEST_README.md       # Load testing documentation
└── package.json             # Dependencies and scripts
```

## 🎯 **Core Features**

### **📝 Quiz Management**
- ✅ **Dynamic Quiz Creation**: Real-time quiz building interface
- ✅ **Multiple Question Types**: Multiple choice, true/false, short answer
- ✅ **File Upload Support**: PDF, JSON, and TXT file processing
- ✅ **Quiz Organization**: Archive and categorization system
- ✅ **Real-time Editing**: Live quiz modification capabilities

### **🎯 Quiz Taking Experience**
- ✅ **Interactive Interface**: Real-time quiz taking with progress tracking
- ✅ **Question Navigation**: Easy navigation between questions
- ✅ **Answer Flagging**: Mark questions for review
- ✅ **Timer Support**: Optional time limits for quizzes
- ✅ **Auto-save**: Automatic answer saving and recovery

### **📊 Analytics & Results**
- ✅ **Detailed Performance Analytics**: Comprehensive scoring and insights
- ✅ **Interactive Charts**: Beautiful data visualization with Recharts
- ✅ **Individual Result Tracking**: Personal performance history
- ✅ **Comparative Analysis**: Performance comparison tools
- ✅ **Export Capabilities**: Data export in multiple formats

### **📱 Mobile Experience**
- ✅ **Mobile-First Design**: Optimized for mobile devices
- ✅ **Touch-Friendly Interface**: Optimized touch interactions
- ✅ **Responsive Navigation**: Mobile-optimized menus
- ✅ **Offline Support**: Full offline functionality
- ✅ **PWA Features**: Progressive Web App capabilities

### **🔐 Authentication & Security**
- ✅ **Google Sign-In**: Secure authentication with Google accounts
- ✅ **Protected Routes**: Automatic authentication checks
- ✅ **Role-Based Access**: User permission management
- ✅ **Session Management**: Secure session handling
- ✅ **Error Handling**: Comprehensive error management

## �� **Load Testing**

QuestAI includes comprehensive load testing capabilities using k6:

### **Available Load Tests**
```bash
# Basic load tests
npm run load-test                    # 80 users, 60 questions each
npm run load-test-local             # Local testing
npm run load-test-prod              # Production testing

# Advanced load tests
npm run load-test:small             # 100 users for 5 minutes
npm run load-test:medium            # 500 users for 10 minutes
npm run load-test:large             # 1000 users for 15 minutes
npm run load-test:full              # Full load test suite

# Performance monitoring
npm run performance:monitor         # Real-time performance monitoring
```

### **Load Test Features**
- **Realistic User Simulation**: Desktop and mobile user agents
- **Question Answering**: Simulates actual quiz taking behavior
- **Performance Metrics**: Response time, error rate, throughput
- **Scalability Testing**: Tests system under various load conditions
- **Detailed Reporting**: Comprehensive test results and analysis

## 🔧 **Available Scripts**

```bash
# Development
npm run dev                    # Start development server
npm run build                  # Build for production
npm run start                  # Start production server
npm run lint                   # Run ESLint

# Deployment
npm run deploy:firestore       # Deploy Firestore rules
npm run deploy:storage         # Deploy storage rules
npm run deploy:rules           # Deploy all rules

# Load Testing
npm run load-test              # Run main load test
npm run load-test-local        # Local load testing
npm run load-test-prod         # Production load testing
npm run performance:monitor    # Performance monitoring
```

## 📊 **Performance Metrics**

- **First Load JS**: ~87.6 kB (shared)
- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices, SEO)
- **Core Web Vitals**: Excellent scores across all metrics
- **Bundle Size**: Optimized with tree shaking and code splitting
- **Load Testing**: Supports 1000+ concurrent users

## 🌐 **Deployment**

### **Vercel (Recommended)**
1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### **Firebase Hosting**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login and initialize
firebase login
firebase init hosting

# Deploy
firebase deploy
```

### **Other Platforms**
- **Netlify**: Compatible with Next.js
- **Railway**: Easy deployment with database
- **DigitalOcean**: App Platform support
- **AWS Amplify**: Full-stack deployment

## 🔒 **Security Features**

- ✅ Firebase Authentication with Google Sign-In
- ✅ Protected API routes with middleware
- ✅ Input validation and sanitization
- ✅ XSS protection
- ✅ CSRF protection
- ✅ Secure headers configuration
- ✅ Environment variable protection

## 📱 **Mobile & PWA Features**

- ✅ Responsive design for all devices
- ✅ Progressive Web App support
- ✅ Offline functionality with service worker
- ✅ Push notifications
- ✅ App-like experience
- ✅ Touch-optimized interface
- ✅ Mobile-specific components

## 🧪 **Testing Strategy**

### **Load Testing**
- **k6 Scripts**: Comprehensive load testing scenarios
- **Performance Monitoring**: Real-time performance tracking
- **Scalability Testing**: System behavior under load
- **Stress Testing**: Breaking point identification

### **Manual Testing**
- **Cross-browser Testing**: Chrome, Firefox, Safari, Edge
- **Mobile Testing**: iOS and Android devices
- **Accessibility Testing**: WCAG compliance
- **Performance Testing**: Lighthouse audits

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Development Guidelines**
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Implement responsive design
- Add proper error handling
- Include comprehensive documentation

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support & Documentation**

### **Additional Documentation**
- [Load Testing Guide](./LOAD_TEST_README.md) - Comprehensive load testing documentation
- [Mobile Optimization Guide](./mobile-optimization-guide.md) - Mobile development guidelines
- [Performance Optimizations](./performance-optimizations.md) - Performance best practices
- [Firebase Setup Guide](./FIREBASE_ADMIN_SETUP.md) - Firebase configuration
- [Deployment Guide](./VERCEL_DEPLOYMENT_GUIDE.md) - Deployment instructions

### **Support Channels**
- **Documentation**: [Wiki](https://github.com/HarshXTrisha/locus_kaizen/wiki)
- **Issues**: [GitHub Issues](https://github.com/HarshXTrisha/locus_kaizen/issues)
- **Discussions**: [GitHub Discussions](https://github.com/HarshXTrisha/locus_kaizen/discussions)

## 🎉 **Acknowledgments**

- **Next.js Team**: For the amazing framework
- **Firebase Team**: For robust backend services
- **Tailwind CSS**: For the utility-first CSS framework
- **Lucide**: For beautiful icons
- **Zustand**: For lightweight state management
- **k6 Team**: For powerful load testing tools

## 🚀 **Roadmap**

### **Upcoming Features**
- [ ] Advanced analytics with machine learning insights
- [ ] Real-time collaboration features
- [ ] Advanced question types (essay, file upload)
- [ ] Integration with learning management systems
- [ ] Advanced reporting and export options
- [ ] Multi-language support
- [ ] Advanced mobile features

### **Performance Improvements**
- [ ] Advanced caching strategies
- [ ] Database optimization
- [ ] CDN integration
- [ ] Advanced load balancing
- [ ] Real-time performance monitoring

---

**Built with ❤️ by the QuestAI Team**

*Transform your learning experience with the most advanced quiz management platform available.*

---

## 📞 **Contact**

For questions, support, or collaboration:
- **Email**: [contact@questai.com](mailto:contact@questai.com)
- **GitHub**: [@HarshXTrisha](https://github.com/HarshXTrisha)
- **Project**: [QuestAI Kaizen](https://github.com/HarshXTrisha/locus_kaizen)

---

*Last updated: August 2025*
