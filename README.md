# 🎯 Locus - Quiz Management Platform

A modern, full-stack quiz management platform built with Next.js, Firebase, and TypeScript. Features Firebase authentication, performance optimizations, and a beautiful UI.

## ✨ Features

### 🔐 Authentication
- **Firebase Email/Password Authentication**
- Secure login/logout functionality
- Password reset capabilities
- User session management

### 📊 Dashboard & Analytics
- **Performance Charts** with Recharts
- **KPI Cards** for quick insights
- **Recent History** tracking
- **Analytics Dashboard** with detailed metrics

### 🧪 Quiz Management
- **Create Custom Quizzes**
- **Interactive Quiz Interface**
- **Question Navigation**
- **Real-time Progress Tracking**

### 📈 Results & Analytics
- **Score Summaries**
- **Topic Performance Analysis**
- **Key Insights Generation**
- **Detailed Analytics Charts**

### 🗄️ Archive & Management
- **Test Data Table**
- **Archive Management**
- **File Upload System**
- **Settings Configuration**

### ⚡ Performance Optimizations
- **Dynamic Imports** for code splitting
- **Lazy Loading** for Firebase services
- **Icon Optimization** with centralized imports
- **Core Web Vitals** tracking
- **Bundle Size Optimization**

## 🚀 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage
- **Charts**: Recharts
- **Icons**: Lucide React
- **State Management**: Zustand

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project

### Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd locus
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Email/Password authentication
   - Get your Firebase configuration

4. **Environment Variables**
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

5. **Run the development server**
```bash
npm run dev
```

6. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
locus/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── login/            # Authentication pages
│   │   ├── quiz/             # Quiz pages
│   │   ├── results/          # Results pages
│   │   └── ...
│   ├── components/           # React components
│   │   ├── auth/            # Authentication components
│   │   ├── dashboard/       # Dashboard components
│   │   ├── quiz/           # Quiz components
│   │   └── ...
│   └── lib/                 # Utility libraries
│       ├── firebase.ts      # Firebase configuration
│       ├── firebase-auth.ts # Authentication utilities
│       ├── icons.ts         # Icon imports
│       └── ...
├── public/                  # Static assets
├── docs/                   # Documentation
└── ...
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🌐 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Deploy to Vercel**
- Go to [vercel.com](https://vercel.com)
- Import your GitHub repository
- Add environment variables
- Deploy!

### Other Platforms
- **Netlify**: Connect GitHub repo
- **Firebase Hosting**: Use Firebase CLI
- **Railway**: Import from GitHub

## 📚 Documentation

- [Firebase Setup Guide](FIREBASE_SETUP.md)
- [Authentication Guide](FIREBASE_AUTH_GUIDE.md)
- [Performance Optimizations](PERFORMANCE_OPTIMIZATIONS.md)
- [Troubleshooting Guide](LOGIN_TROUBLESHOOTING.md)
- [Step-by-Step Testing](STEP_BY_STEP_GUIDE.md)

## 🎯 Key Features Explained

### Firebase Integration
- Secure authentication with email/password
- Real-time database with Firestore
- File storage with Firebase Storage
- Analytics integration

### Performance Optimizations
- **Dynamic Imports**: Load components only when needed
- **Lazy Loading**: Firebase services loaded on demand
- **Tree Shaking**: Remove unused code
- **Bundle Optimization**: Minimize bundle size

### UI/UX Features
- **Responsive Design**: Works on all devices
- **Modern UI**: Clean, professional interface
- **Loading States**: Smooth user experience
- **Error Handling**: User-friendly error messages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check the [Troubleshooting Guide](LOGIN_TROUBLESHOOTING.md)
2. Review the [Firebase Setup Guide](FIREBASE_SETUP.md)
3. Open an issue on GitHub

## 🎉 Acknowledgments

- Next.js team for the amazing framework
- Firebase team for the backend services
- Tailwind CSS for the styling system
- All contributors and supporters

---

**Built with ❤️ using Next.js and Firebase**
