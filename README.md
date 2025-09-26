# CLAT Prep Platform

A comprehensive CLAT preparation platform built with Next.js, Prisma, and MongoDB.

## 🚀 New Admin Features (Recently Added)

### ✅ Completed Features

#### 1. **Updated Database Schema**

- **Test Model**: Added `thumbnailUrl`, `highlightPoints`, `durationInMinutes`, `positiveMarks`, `negativeMarks`
- **Question Model**: Enhanced with `imageUrls`, `comprehension`, `tableData`, `questionType`, `optionType`, `section`, etc.
- **Answer Model**: Updated to support `selectedOption`, `timeTakenSec`, `report`
- **TestAttempt Model**: Added `totalTimeSec`, `totalAttempted`
- **User Model**: Added `isBlocked` field for user management

#### 2. **Admin User Management** (`/admin/users`)

- ✅ View all users with profile photos, names, emails, roles
- ✅ Change user roles (FREE ↔ PAID ↔ ADMIN)
- ✅ Block/unblock users
- ✅ See user status and paid until dates
- ✅ Real-time role updates with dropdown menu

#### 3. **Create Test Functionality** (`/admin/create-test`)

- ✅ Create new tests with comprehensive form
- ✅ Test metadata: title, description, type (FREE/PAID)
- ✅ Thumbnail URL support
- ✅ Duration in minutes
- ✅ Positive/negative marks configuration
- ✅ Highlight points (up to 4 bullet points)
- ✅ Form validation and error handling

#### 4. **API Endpoints Created**

- ✅ `GET /api/admin/users` - Fetch all users
- ✅ `PATCH /api/admin/users/[id]/role` - Update user role
- ✅ `PATCH /api/admin/users/[id]/block` - Block/unblock user
- ✅ `POST /api/admin/tests` - Create new test
- ✅ `GET /api/admin/tests` - Fetch all tests

#### 5. **UI Components**

- ✅ Badge component for status display
- ✅ Input, Textarea, Label components
- ✅ Select component with dropdown functionality
- ✅ Enhanced admin dashboard with new navigation

### 🔄 In Progress / Next Steps

#### 1. **Question Management System**

- [ ] Add questions to created tests (`/admin/create-test/[id]/questions`)
- [ ] Support for different question types (OPTIONS/INPUT)
- [ ] Comprehension text support
- [ ] Table data support
- [ ] Image upload for questions
- [ ] Section-based question organization

#### 2. **Test Management**

- [ ] Edit existing tests
- [ ] Delete tests
- [ ] View test statistics
- [ ] Manage test visibility (active/inactive)

#### 3. **User Experience Features**

- [ ] Test attempt functionality for users
- [ ] Timer implementation
- [ ] Question navigation
- [ ] Score calculation
- [ ] Report question functionality

#### 4. **Advanced Features**

- [ ] Notification system
- [ ] Payment integration
- [ ] Analytics dashboard
- [ ] Bulk operations

## 🛠️ Technical Stack

- **Frontend**: Next.js 14 with App Router
- **Database**: MongoDB with Prisma ORM
- **Authentication**: NextAuth.js
- **UI**: Custom components with Tailwind CSS
- **Icons**: Lucide React

## 🚀 Getting Started

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Environment Setup**

   ```bash
   cp .env.example .env.local
   # Configure your MongoDB and NextAuth settings
   ```

3. **Database Setup**

   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
clatprep/
├── app/
│   ├── admin/           # Admin panel routes
│   │   ├── users/       # User management
│   │   ├── create-test/ # Test creation
│   │   └── ...
│   ├── api/             # API routes
│   │   └── admin/       # Admin API endpoints
│   └── dashboard/       # User dashboard
├── components/
│   └── ui/              # Reusable UI components
├── prisma/
│   └── schema.prisma    # Database schema
└── lib/
    └── utils.js         # Utility functions
```

## 🔐 Admin Access

To access admin features, ensure your user has the `ADMIN` role in the database. You can update user roles through the admin panel or directly in the database.

## 📝 Database Schema Highlights

### New Enums Added:

- `QuestionType`: OPTIONS, INPUT
- `OptionType`: SINGLE, MULTI
- `SectionType`: ENGLISH, GK_CA, LEGAL_REASONING, LOGICAL_REASONING, QUANTITATIVE_TECHNIQUES

### Enhanced Models:

- **Test**: Now supports rich metadata and configuration
- **Question**: Supports complex question types with images, tables, comprehension
- **Answer**: Tracks user responses with timing and reporting
- **User**: Added blocking functionality for admin control

## 🎯 Key Features Implemented

1. **Role-based Access Control**: Admin-only routes and API endpoints
2. **User Management**: Complete CRUD operations for user accounts
3. **Test Creation**: Comprehensive test creation with metadata
4. **Responsive UI**: Modern, accessible interface components
5. **Real-time Updates**: Immediate feedback for admin actions

## 🔄 Development Workflow

1. **Schema Changes**: Update `prisma/schema.prisma`
2. **Generate Client**: `npx prisma generate`
3. **Push Changes**: `npx prisma db push`
4. **Create Components**: Add UI components as needed
5. **API Routes**: Implement backend logic
6. **Frontend**: Build user interface
7. **Testing**: Verify functionality

## 📊 Current Status

- ✅ **Database Schema**: Complete with all required fields
- ✅ **Admin User Management**: Fully functional
- ✅ **Test Creation**: Basic functionality complete
- 🔄 **Question Management**: In development
- ⏳ **User Test Experience**: Planned
- ⏳ **Advanced Features**: Planned

---

_This platform is designed to provide a comprehensive CLAT preparation experience with powerful admin controls and a modern user interface._
# dummy
# OUTLAWED
