# Backend Setup Guide for Locus

## 🎯 **Why We Need a Backend**

### **Current Issues:**
- **Firebase-only dependency** - Limited control and customization
- **Performance bottlenecks** - Direct client-to-Firebase calls
- **Security concerns** - API keys exposed in frontend
- **Scalability issues** - No caching, rate limiting, or optimization
- **Data processing limitations** - Heavy operations on client-side
- **Real-time features** - Limited WebSocket support

### **Benefits of Adding Backend:**
- ✅ **Better Performance** - Caching, optimization, CDN
- ✅ **Enhanced Security** - API key protection, rate limiting
- ✅ **Advanced Features** - Real-time notifications, file processing
- ✅ **Better UX** - Faster loading, smoother interactions
- ✅ **Scalability** - Handle more users and data
- ✅ **Analytics** - Server-side tracking and insights

## 🏗️ **Recommended Backend Architecture**

### **Option 1: Node.js + Express + MongoDB (Recommended)**
```
Frontend (Next.js) → Backend API (Node.js/Express) → Database (MongoDB)
                                    ↓
                              Firebase (Auth only)
```

### **Option 2: Next.js API Routes (Quick Start)**
```
Frontend (Next.js) → API Routes (/api/*) → Database (MongoDB/PostgreSQL)
                                    ↓
                              Firebase (Auth only)
```

### **Option 3: Full-Stack with Prisma**
```
Frontend (Next.js) → Backend (Node.js) → Prisma ORM → PostgreSQL
                                    ↓
                              Firebase (Auth only)
```

## 🚀 **Implementation Plan**

### **Phase 1: Quick Start with Next.js API Routes**
1. **Set up API routes** in `/api` directory
2. **Add database connection** (MongoDB/PostgreSQL)
3. **Create authentication middleware**
4. **Migrate Firebase functions** to API routes

### **Phase 2: Standalone Backend (Recommended)**
1. **Create separate backend project**
2. **Set up Express.js server**
3. **Add comprehensive middleware**
4. **Implement caching and optimization**

### **Phase 3: Advanced Features**
1. **Real-time WebSocket support**
2. **File processing pipeline**
3. **Advanced analytics**
4. **Caching and CDN**

## 📋 **Backend Features to Implement**

### **Core API Endpoints:**
```
POST   /api/auth/verify          - Verify Firebase token
GET    /api/user/profile         - Get user profile
PUT    /api/user/profile         - Update user profile

GET    /api/quizzes              - Get user quizzes
POST   /api/quizzes              - Create new quiz
GET    /api/quizzes/:id          - Get specific quiz
PUT    /api/quizzes/:id          - Update quiz
DELETE /api/quizzes/:id          - Delete quiz

GET    /api/results              - Get user results
POST   /api/results              - Submit quiz result
GET    /api/results/:id          - Get specific result

POST   /api/upload/process       - Process uploaded files
GET    /api/analytics/dashboard  - Get dashboard analytics
```

### **Advanced Features:**
- **Real-time notifications** (WebSocket)
- **File processing queue** (Redis/Bull)
- **Caching layer** (Redis)
- **Rate limiting** and security
- **Analytics and insights**
- **Export functionality** (PDF, Excel)

## 🛠️ **Technology Stack Options**

### **Option A: Node.js Stack (Recommended)**
```json
{
  "backend": {
    "runtime": "Node.js 18+",
    "framework": "Express.js",
    "database": "MongoDB + Mongoose",
    "cache": "Redis",
    "queue": "Bull (Redis)",
    "websockets": "Socket.io",
    "validation": "Joi/Yup",
    "testing": "Jest + Supertest"
  }
}
```

### **Option B: Next.js API Routes**
```json
{
  "backend": {
    "runtime": "Next.js API Routes",
    "database": "MongoDB + Mongoose",
    "cache": "Vercel KV (Redis)",
    "validation": "Zod",
    "testing": "Jest"
  }
}
```

### **Option C: Full-Stack with Prisma**
```json
{
  "backend": {
    "runtime": "Node.js + Express",
    "database": "PostgreSQL",
    "orm": "Prisma",
    "cache": "Redis",
    "validation": "Zod",
    "testing": "Jest"
  }
}
```

## 📊 **Database Schema Design**

### **Users Collection:**
```javascript
{
  _id: ObjectId,
  firebaseUid: String,
  email: String,
  firstName: String,
  lastName: String,
  avatar: String,
  settings: {
    theme: String,
    notifications: Boolean,
    timezone: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### **Quizzes Collection:**
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  subject: String,
  questions: [{
    id: String,
    text: String,
    type: String,
    options: [String],
    correctAnswer: String,
    points: Number,
    explanation: String
  }],
  timeLimit: Number,
  passingScore: Number,
  createdBy: ObjectId,
  isPublished: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### **Results Collection:**
```javascript
{
  _id: ObjectId,
  quizId: ObjectId,
  userId: ObjectId,
  score: Number,
  totalQuestions: Number,
  correctAnswers: Number,
  timeTaken: Number,
  answers: [{
    questionId: String,
    userAnswer: String,
    isCorrect: Boolean,
    points: Number
  }],
  completedAt: Date
}
```

## 🔧 **Implementation Steps**

### **Step 1: Set up Next.js API Routes**
```bash
# Create API routes structure
mkdir -p src/app/api/auth
mkdir -p src/app/api/quizzes
mkdir -p src/app/api/results
mkdir -p src/app/api/upload
mkdir -p src/app/api/analytics
```

### **Step 2: Add Database Connection**
```bash
npm install mongoose
npm install @types/mongoose --save-dev
```

### **Step 3: Create Authentication Middleware**
```javascript
// src/lib/auth-middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from 'firebase-admin';

export async function verifyAuth(request: NextRequest) {
  const token = request.headers.get('authorization')?.split('Bearer ')[1];
  
  if (!token) {
    return { error: 'No token provided' };
  }

  try {
    const decodedToken = await auth().verifyIdToken(token);
    return { user: decodedToken };
  } catch (error) {
    return { error: 'Invalid token' };
  }
}
```

### **Step 4: Create API Routes**
```javascript
// src/app/api/quizzes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';
import { connectDB } from '@/lib/database';
import Quiz from '@/models/Quiz';

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request);
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: 401 });
  }

  try {
    await connectDB();
    const quizzes = await Quiz.find({ createdBy: auth.user.uid });
    return NextResponse.json(quizzes);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch quizzes' }, { status: 500 });
  }
}
```

## 🚀 **Deployment Options**

### **Option 1: Vercel (Recommended for Next.js API Routes)**
- Automatic deployment
- Serverless functions
- Built-in caching
- Easy scaling

### **Option 2: Railway/Render (Standalone Backend)**
- Full control
- Custom domains
- Database hosting
- WebSocket support

### **Option 3: AWS/GCP (Enterprise)**
- Maximum scalability
- Advanced features
- Cost optimization
- Global distribution

## 📈 **Performance Optimizations**

### **Caching Strategy:**
- **Redis** for session storage
- **CDN** for static assets
- **Database query caching**
- **API response caching**

### **Database Optimization:**
- **Indexing** on frequently queried fields
- **Connection pooling**
- **Query optimization**
- **Data pagination**

### **API Optimization:**
- **Rate limiting**
- **Request validation**
- **Error handling**
- **Response compression**

## 🔒 **Security Considerations**

### **Authentication:**
- **JWT token validation**
- **Firebase token verification**
- **Session management**
- **Role-based access**

### **Data Protection:**
- **Input validation**
- **SQL injection prevention**
- **XSS protection**
- **CORS configuration**

### **API Security:**
- **Rate limiting**
- **Request size limits**
- **HTTPS enforcement**
- **Security headers**

## 🎯 **Next Steps**

1. **Choose backend architecture** (Next.js API Routes vs Standalone)
2. **Set up database** (MongoDB vs PostgreSQL)
3. **Create authentication middleware**
4. **Implement core API endpoints**
5. **Add caching and optimization**
6. **Deploy and test**

Would you like me to start implementing any specific part of the backend?
