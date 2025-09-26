# Admin Configuration Guide

## Adding Admin Users

To grant admin access to users in TautologyAI, you need to add their email addresses to the admin configuration.

### Steps to Add Admin Users:

1. **Edit the admin configuration file**: `frontend/src/lib/admin.ts`
2. **Add email addresses** to the `ADMIN_EMAILS` array:

```typescript
export const ADMIN_EMAILS = [
  "admin@legalai.com",
  "tanma@example.com",
  "your-email@example.com", // Add your email here
  // Add more admin emails as needed
];
```

3. **Rebuild and deploy** the frontend:
```bash
cd frontend
npm run build
firebase deploy --only hosting
```

### Current Admin Features

Admin users will see an "Admin Panel" button in the sidebar that provides access to:
- User activity monitoring
- Document processing statistics  
- System health overview
- User management tools

### Security Notes

- Admin access is determined client-side based on email matching
- For production use, consider implementing server-side admin role verification
- Admin emails are case-sensitive
- Users must authenticate with Google OAuth to access admin features

### Admin Panel Access

Once configured, admin users can access the admin panel at:
- **URL**: `/admin`
- **Access**: Available via "Admin Panel" button in the sidebar (when logged in as admin)
- **Opens in**: New tab/window for better workflow

### Testing Admin Access

1. Sign in with an email listed in `ADMIN_EMAILS`
2. Check that the "Admin Panel" button appears in the sidebar
3. Click the button to verify admin panel access
4. Confirm all admin features are working properly

### Removing Admin Access

To revoke admin access, simply remove the email address from the `ADMIN_EMAILS` array and redeploy the frontend.