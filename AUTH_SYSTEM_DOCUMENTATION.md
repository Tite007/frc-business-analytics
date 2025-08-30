# FRC Stock Report Dashboard - Authentication System Documentation

## 🔐 Authentication System Overview

This document provides complete documentation for the authentication system implemented in the FRC Stock Report Dashboard. This system was added on August 29, 2025, and includes user management, JWT token authentication, and role-based access control.

---

## 📁 **Files Added/Modified**

### **New Authentication Files:**

- `api/auth_models.py` - Pydantic models for authentication
- `api/auth_utils.py` - Authentication utilities (JWT, password hashing)
- `api/auth_service.py` - User service layer (database operations)
- `api/auth_routes.py` - FastAPI authentication routes
- `init_users.py` - Database initialization script for creating admin user

### **Modified Files:**

- `api/main.py` - Added authentication routes to FastAPI app
- `requirements.txt` - Added authentication dependencies
- `Thunder_Client_API_Testing_Guide.md` - Updated with auth endpoints
- `frontend_setup.md` - Next.js integration guide

---

## 🛠 **Dependencies Added to requirements.txt**

```txt
# Authentication dependencies (added Aug 29, 2025)
email-validator==2.1.1
bcrypt==4.1.2
PyJWT==2.8.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
```

**⚠️ IMPORTANT:** These dependencies are **ALREADY INCLUDED** in the current requirements.txt file. The existing Dockerfile will automatically install them during deployment.

---

## 🗄️ **Database Structure**

### **MongoDB Collection: `users`**

```json
{
  "_id": "ObjectId or string",
  "email": "user@researchfrc.com",
  "name": "First Name",
  "last_name": "Last Name",
  "position": "Job Title",
  "phone": "+1-555-0000",
  "role": "admin|user|analyst|readonly",
  "is_active": true,
  "password_hash": "$2b$12$...",
  "created_at": "2025-08-29T12:42:13.026000Z",
  "updated_at": "2025-08-29T12:42:13.026000Z",
  "last_login": "2025-08-29T13:04:37.359000Z"
}
```

### **Pre-Created Users:**

| Email                       | Password      | Role  | Name           |
| --------------------------- | ------------- | ----- | -------------- |
| `tsanchez0@researchfrc.com` | `Password123` | admin | Test User      |
| `btang@researchfrc.com`     | `Password123` | user  | Brian Tang     |
| `sidr@researchfrc.com`      | `Password123` | user  | Sid Rajeev     |
| `m.morales@researchfrc.com` | `Password123` | user  | Martin Morales |

---

## 🔗 **API Endpoints**

### **Authentication Endpoints:**

- `POST /api/auth/login` - User login (returns JWT token)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user profile (requires auth)
- `PUT /api/auth/profile` - Update user profile (requires auth)
- `POST /api/auth/change-password` - Change password (requires auth)

### **Admin-Only Endpoints:**

- `GET /api/auth/users` - List all users
- `POST /api/auth/users` - Create user (admin)
- `PUT /api/auth/users/{user_id}` - Update any user
- `DELETE /api/auth/users/{user_id}` - Delete user

### **Utility Endpoints:**

- `GET /api/auth/health` - Health check for auth service
- `GET /api/auth/user/{email}` - Get user by email (no auth required)

---

## 🚀 **Deployment Instructions for Lightsail**

### **Pre-Deployment Checklist:**

1. ✅ All authentication files are committed to repository
2. ✅ `requirements.txt` includes authentication dependencies
3. ✅ MongoDB Atlas connection is configured
4. ✅ Environment variables are set

### **Environment Variables Required:**

```bash
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DB_NAME=frc_business_analytics

# JWT Configuration
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=43200  # 30 days

# FastAPI Configuration
PYTHONPATH=/app
```

### **Deployment Steps:**

1. **Build Docker Image:**

   ```bash
   docker build -t stock-report-dashboard .
   ```

2. **Test Locally (Optional):**

   ```bash
   docker run -d -p 8000:8000 --env-file .env stock-report-dashboard
   ```

3. **Deploy to Lightsail:**
   - Upload code to Lightsail instance
   - Run docker build and docker run commands
   - The existing Dockerfile will handle everything automatically

### **Verification Steps:**

1. **Health Check:**

   ```bash
   curl http://your-domain.com/api/auth/health
   # Expected: {"status":"healthy","service":"authentication","timestamp":"..."}
   ```

2. **Test Authentication:**
   ```bash
   curl -X POST http://your-domain.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"tsanchez0@researchfrc.com","password":"Password123"}'
   # Expected: {"success":true,"access_token":"eyJ...","user":{...}}
   ```

---

## 🐛 **Debugging Guide**

### **Common Issues & Solutions:**

#### **1. JWT Token Errors**

```
Error: module 'jwt' has no attribute 'JWTError'
```

**Solution:** Ensure `PyJWT==2.8.0` is installed (not `jwt` package)

#### **2. Password Hashing Errors**

```
Error: (trapped) error reading bcrypt version
```

**Solution:** This is a warning, not an error. bcrypt is working correctly.

#### **3. Database Connection Issues**

```
Error: MongoDB connections failed
```

**Solution:** Check MongoDB URI and network connectivity

#### **4. Import Errors**

```
ModuleNotFoundError: No module named 'email_validator'
```

**Solution:** Ensure all dependencies in requirements.txt are installed

### **Debugging Commands:**

1. **Check Server Logs:**

   ```bash
   docker logs <container_id>
   ```

2. **Test Database Connection:**

   ```bash
   python3 -c "from database.mongodb_handler import MongoDBHandler; print('DB OK' if MongoDBHandler().connect_async() else 'DB FAIL')"
   ```

3. **Test JWT Token Generation:**

   ```bash
   python3 -c "from api.auth_utils import AuthUtils; print(AuthUtils().create_access_token({'test': 'data'}))"
   ```

4. **List All Routes:**
   ```bash
   curl http://localhost:8000/openapi.json | jq '.paths | keys'
   ```

---

## 🔧 **Configuration Details**

### **JWT Configuration:**

- **Algorithm:** HS256
- **Expiration:** 30 days (2,592,000 seconds)
- **Secret:** Configurable via environment variable

### **Password Security:**

- **Hashing:** bcrypt with salt rounds (cost factor 12)
- **Minimum Length:** 8 characters
- **Validation:** Enforced on registration and password change

### **Role-Based Access:**

- **admin:** Full access to all endpoints
- **user:** Standard user access
- **analyst:** Analysis-focused permissions
- **readonly:** Read-only access

---

## 📊 **Monitoring & Maintenance**

### **Health Monitoring:**

- **Primary:** `GET /api/auth/health`
- **Alternative:** `GET /health` (if main app health endpoint exists)

### **User Management:**

- Admin users can create, update, and delete other users
- Users can update their own profiles and change passwords
- All password changes require current password verification

### **Security Features:**

- JWT tokens with expiration
- Password hashing with bcrypt
- Role-based endpoint protection
- Input validation with Pydantic models
- SQL injection protection via MongoDB

---

## 🚨 **Emergency Procedures**

### **If Authentication is Broken:**

1. **Bypass Authentication Temporarily:**

   - Comment out auth routes in `api/main.py`
   - Restart server
   - Debug the specific issue

2. **Reset Admin User:**

   ```bash
   python3 init_users.py
   ```

3. **Database Issues:**
   - Check MongoDB Atlas connectivity
   - Verify collection exists: `users`
   - Check user documents format

### **Rollback Procedure:**

If authentication causes issues, the system can be rolled back by:

1. Reverting `api/main.py` to remove auth routes
2. The rest of the application will continue to work normally

---

## 📝 **Testing Checklist**

Before marking deployment as successful:

- [ ] Health endpoint responds: `/api/auth/health`
- [ ] Login works with admin user: `tsanchez0@researchfrc.com`
- [ ] Token generation and validation working
- [ ] User registration creates new users
- [ ] Password change functionality works
- [ ] Admin endpoints require proper permissions
- [ ] API documentation accessible: `/docs`

---

## 🎯 **Performance Notes**

- JWT tokens are stateless (no server-side session storage)
- MongoDB queries are optimized with proper indexing
- Password hashing is CPU-intensive but necessary for security
- Token expiration is set to 30 days to reduce frequent re-authentication

---

**Created:** August 29, 2025  
**Status:** Production Ready ✅  
**Last Tested:** August 29, 2025  
**Compatible Docker:** Python 3.11-slim-bullseye  
**MongoDB:** Atlas Compatible with TLS 1.2/1.3
