# Microsoft Authentication Setup Guide for QuestAI

This guide will help you set up Microsoft authentication for the QuestAI platform using Firebase Authentication.

## Prerequisites

- Firebase project with Authentication enabled
- Microsoft Azure account
- QuestAI application deployed or running locally

## Step 1: Azure App Registration

### 1.1 Create Azure App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** > **App registrations**
3. Click **New registration**
4. Fill in the details:
   - **Name**: `QuestAI Authentication`
   - **Supported account types**: Choose based on your needs:
     - `Accounts in this organizational directory only` (for single tenant)
     - `Accounts in any organizational directory` (for multi-tenant)
   - **Redirect URI**: 
     - Type: `Web`
     - URI: `https://your-firebase-project.firebaseapp.com/__/auth/handler`
   - Click **Register**

### 1.2 Configure Authentication

1. In your app registration, go to **Authentication**
2. Under **Platform configurations**, click **Add a platform** > **Web**
3. Add redirect URIs:
   - `https://your-firebase-project.firebaseapp.com/__/auth/handler`
   - `http://localhost:3000/__/auth/handler` (for local development)
4. Under **Implicit grant and hybrid flows**, enable:
   - ✅ Access tokens
   - ✅ ID tokens
5. Click **Save**

### 1.3 Get Client ID and Secret

1. Go to **Overview** in your app registration
2. Copy the **Application (client) ID** - this is your `NEXT_PUBLIC_MICROSOFT_CLIENT_ID`
3. Go to **Certificates & secrets**
4. Click **New client secret**
5. Add a description and choose expiration
6. Copy the **Value** - this will be used in Firebase console

## Step 2: Firebase Configuration

### 2.1 Enable Microsoft Provider in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Authentication** > **Sign-in method**
4. Click on **Microsoft** provider
5. Enable it and configure:
   - **Client ID**: Your Azure app registration client ID
   - **Client secret**: Your Azure app registration client secret
6. Click **Save**

### 2.2 Add Authorized Domains

1. In Firebase Authentication, go to **Settings** > **Authorized domains**
2. Add your domains:
   - `your-firebase-project.firebaseapp.com`
   - `your-custom-domain.com` (if using custom domain)
   - `localhost` (for development)

## Step 3: Environment Variables

### 3.1 Local Development

Create or update your `.env.local` file:

```env
# Microsoft OAuth
NEXT_PUBLIC_MICROSOFT_CLIENT_ID=your-azure-client-id-here

# Firebase Configuration (existing)
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### 3.2 Production Deployment

Add the environment variables to your hosting platform:

- **Vercel**: Add in project settings > Environment Variables
- **Netlify**: Add in site settings > Environment Variables
- **Firebase Hosting**: Use Firebase Functions or external environment management

## Step 4: Testing

### 4.1 Local Testing

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/login`

3. Click "Sign In with Microsoft"

4. You should be redirected to Microsoft's login page

5. After successful authentication, you'll be redirected back to your dashboard

### 4.2 Production Testing

1. Deploy your application

2. Test the Microsoft sign-in flow on your production domain

3. Verify that users can sign in successfully

4. Check Firebase Authentication console for new users

## Step 5: Troubleshooting

### Common Issues

#### 1. "AADSTS50011: The reply URL specified in the request does not match the reply URLs configured for the application"

**Solution**: 
- Check that your redirect URI in Azure matches exactly with Firebase
- Ensure no trailing slashes or extra characters
- Use the exact format: `https://your-project.firebaseapp.com/__/auth/handler`

#### 2. "AADSTS700016: Application with identifier was not found in the directory"

**Solution**:
- Verify your client ID is correct
- Check that you're using the right tenant ID
- Ensure the app registration is in the correct Azure AD tenant

#### 3. "Firebase: Error (auth/unauthorized-domain)"

**Solution**:
- Add your domain to Firebase authorized domains
- Include both your custom domain and Firebase hosting domain
- For local development, ensure `localhost` is added

#### 4. "Popup blocked" or "Redirect issues"

**Solution**:
- The code automatically falls back to redirect method
- Check browser console for specific error messages
- Ensure popups are allowed for your domain

### Debug Steps

1. **Check Browser Console**: Look for authentication-related errors
2. **Verify Azure Configuration**: Double-check client ID and redirect URIs
3. **Check Firebase Console**: Verify Microsoft provider is enabled
4. **Test with Different Browsers**: Some browsers handle OAuth differently
5. **Check Network Tab**: Look for failed requests to Microsoft or Firebase

## Step 6: Security Considerations

### Best Practices

1. **Environment Variables**: Never commit secrets to version control
2. **HTTPS Only**: Always use HTTPS in production
3. **Domain Validation**: Only allow authorized domains
4. **Regular Rotation**: Rotate client secrets periodically
5. **Monitoring**: Monitor authentication logs for suspicious activity

### Azure Security

1. **App Registration Permissions**: Only grant necessary permissions
2. **Client Secret Management**: Use Azure Key Vault for production secrets
3. **Conditional Access**: Consider implementing conditional access policies
4. **Audit Logs**: Enable and monitor Azure AD audit logs

## Step 7: Advanced Configuration

### Custom Scopes

You can modify the scopes in `src/lib/config.ts`:

```typescript
export const microsoftConfig = {
  clientId: process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID || "",
  scopes: ['email', 'profile', 'openid', 'User.Read'], // Add more scopes as needed
  prompt: 'select_account'
};
```

### Custom Claims

To add custom claims to the user profile:

1. Configure custom claims in Firebase Functions
2. Set claims after successful authentication
3. Access claims in your application

### Multi-Tenant Support

For multi-tenant applications:

1. Configure app registration for multi-tenant
2. Handle tenant-specific logic in your application
3. Consider using Azure AD B2C for consumer applications

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Firebase and Azure documentation
3. Check browser console for detailed error messages
4. Verify all configuration steps were completed correctly

## References

- [Firebase Microsoft Authentication](https://firebase.google.com/docs/auth/web/microsoft-oauth)
- [Azure App Registration](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
- [Microsoft Identity Platform](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
