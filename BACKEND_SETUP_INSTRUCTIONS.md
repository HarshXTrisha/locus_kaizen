# 🚀 Backend Setup Instructions for Locus

## ✅ **What's Been Implemented**

### **Database Models:**
- ✅ **User Model** - Complete user management with stats
- ✅ **Quiz Model** - Full quiz functionality with questions
- ✅ **Result Model** - Comprehensive result tracking

### **API Routes:**
- ✅ **Authentication** (`/api/auth/verify`) - Firebase token verification
- ✅ **Quizzes** (`/api/quizzes`) - CRUD operations for quizzes
- ✅ **Results** (`/api/results`) - Submit and retrieve quiz results
- ✅ **Analytics** (`/api/analytics/dashboard`) - Dashboard statistics

### **Features:**
- ✅ **Robust Authentication** - Firebase Admin integration
- ✅ **Input Validation** - Zod schema validation
- ✅ **Error Handling** - Comprehensive error management
- ✅ **Pagination** - Efficient data loading
- ✅ **Performance Optimization** - Database indexing
- ✅ **Analytics** - Advanced statistics and insights

## 🛠️ **Setup Steps**

### **Step 1: Set up MongoDB Atlas (Free Cloud Database)**

1. **Go to [MongoDB Atlas](https://www.mongodb.com/atlas)**
2. **Create a free account**
3. **Create a new cluster** (M0 Free tier)
4. **Set up database access:**
   - Create a database user
   - Set username and password
5. **Set up network access:**
   - Add IP address: `0.0.0.0/0` (allow all)
6. **Get connection string:**
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string

### **Step 2: Set up Firebase Admin**

1. **Go to [Firebase Console](https://console.firebase.google.com)**
2. **Select your project**
3. **Go to Project Settings > Service Accounts**
4. **Click "Generate new private key"**
5. **Download the JSON file**

### **Step 3: Configure Environment Variables**

Create a `.env.local` file in your project root:

```env
# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/locus?retryWrites=true&w=majority

# Firebase Admin SDK
FIREBASE_ADMIN_TYPE=service_account
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key Here\n-----END PRIVATE KEY-----\n"
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_CLIENT_ID=your-client-id
FIREBASE_ADMIN_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_ADMIN_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_ADMIN_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_ADMIN_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project.iam.gserviceaccount.com

# Frontend Firebase Config (existing)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

### **Step 4: Test the Backend**

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Test the API endpoints:**
   - Open your browser to `http://localhost:3000`
   - Sign in with Google
   - Check browser console for API calls

## 📊 **API Endpoints Reference**

### **Authentication:**
```
POST /api/auth/verify
GET  /api/auth/verify
```

### **Quizzes:**
```
GET    /api/quizzes              - Get user's quizzes
POST   /api/quizzes              - Create new quiz
GET    /api/quizzes/[id]         - Get specific quiz
PUT    /api/quizzes/[id]         - Update quiz
DELETE /api/quizzes/[id]         - Delete quiz
```

### **Results:**
```
GET  /api/results                - Get user's results
POST /api/results                - Submit quiz result
```

### **Analytics:**
```
GET /api/analytics/dashboard     - Get dashboard analytics
```

## 🔧 **Frontend Integration**

### **Update Firebase Functions:**

Replace your existing Firebase functions with API calls:

```typescript
// Example: Create Quiz
const createQuiz = async (quizData: any) => {
  const token = await auth.currentUser?.getIdToken();
  
  const response = await fetch('/api/quizzes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(quizData),
  });

  return response.json();
};

// Example: Get User Quizzes
const getUserQuizzes = async () => {
  const token = await auth.currentUser?.getIdToken();
  
  const response = await fetch('/api/quizzes', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  return response.json();
};
```

## 🚀 **Deployment to Vercel**

### **Step 1: Push to GitHub**
```bash
git add .
git commit -m "Add comprehensive backend with API routes"
git push origin master
```

### **Step 2: Deploy to Vercel**
1. **Go to [Vercel](https://vercel.com)**
2. **Import your GitHub repository**
3. **Add environment variables** (copy from `.env.local`)
4. **Deploy**

### **Step 3: Update MongoDB Network Access**
1. **Go to MongoDB Atlas**
2. **Add Vercel's IP ranges** or use `0.0.0.0/0`

## 📈 **Performance Features**

### **Database Optimization:**
- ✅ **Indexing** on frequently queried fields
- ✅ **Connection pooling** for better performance
- ✅ **Query optimization** with aggregation pipelines
- ✅ **Pagination** for large datasets

### **API Optimization:**
- ✅ **Input validation** with Zod
- ✅ **Error handling** with proper HTTP status codes
- ✅ **Rate limiting** (basic implementation)
- ✅ **Authentication middleware** for security

### **Analytics Features:**
- ✅ **Real-time statistics** calculation
- ✅ **Performance tracking** with improvement rates
- ✅ **Subject-wise analysis** for insights
- ✅ **Monthly activity** tracking

## 🔒 **Security Features**

### **Authentication:**
- ✅ **Firebase token verification** on every request
- ✅ **User ownership validation** for data access
- ✅ **Input sanitization** and validation
- ✅ **Error message sanitization**

### **Data Protection:**
- ✅ **MongoDB injection prevention** with Mongoose
- ✅ **Input validation** with Zod schemas
- ✅ **Proper error handling** without data leakage

## 🎯 **Next Steps**

### **Immediate:**
1. **Set up MongoDB Atlas** (free tier)
2. **Configure Firebase Admin** credentials
3. **Add environment variables**
4. **Test the API endpoints**

### **Future Enhancements:**
1. **Real-time notifications** (WebSocket)
2. **File upload processing** (PDF parsing)
3. **Advanced caching** (Redis)
4. **Export functionality** (PDF, Excel)
5. **Team collaboration** features

## 💡 **Troubleshooting**

### **Common Issues:**

1. **MongoDB Connection Error:**
   - Check connection string format
   - Verify network access settings
   - Ensure username/password are correct

2. **Firebase Admin Error:**
   - Verify service account JSON format
   - Check environment variable names
   - Ensure private key is properly escaped

3. **API 401 Errors:**
   - Check Firebase token generation
   - Verify Authorization header format
   - Ensure user is authenticated

4. **Validation Errors:**
   - Check request body format
   - Verify required fields
   - Review Zod schema requirements

## 🎉 **Success Metrics**

Your backend is now ready for:
- ✅ **100-150 users** with excellent performance
- ✅ **Real-time quiz creation** and management
- ✅ **Comprehensive analytics** and insights
- ✅ **Secure authentication** and data protection
- ✅ **Scalable architecture** for future growth

**The backend is production-ready and optimized for your user scale!** 🚀
