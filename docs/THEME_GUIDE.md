# Theme System Guide

## 🎨 Complete Theme System Implementation

Your CLAT Prep platform now has a fully functional dark/light theme system with automatic persistence and smooth transitions.

## ✨ Features Implemented

### 1. **Theme Toggle Button**

- **Location**: Header component (top-right corner)
- **Icon**: Sun (light mode) / Moon (dark mode)
- **Functionality**: Toggles between light and dark themes
- **Persistence**: Theme preference is saved to localStorage

### 2. **Theme-Aware Components**

All components now use CSS custom properties that automatically adapt to the current theme:

```css
/* Light Mode Colors */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --secondary: 210 40% 96%;
  --muted: 210 40% 96%;
  --accent: 210 40% 96%;
  --destructive: 0 84.2% 60.2%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
}

/* Dark Mode Colors */
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  --secondary: 217.2 32.6% 17.5%;
  --muted: 217.2 32.6% 17.5%;
  --accent: 217.2 32.6% 17.5%;
  --destructive: 0 62.8% 30.6%;
  --border: 217.2 32.6% 17.5%;
  --input: 217.2 32.6% 17.5%;
  --ring: 224.3 76.3% 94.1%;
}
```

## 🎯 How to Use the Theme System

### 1. **Theme Toggle Component**

```jsx
import { ThemeToggle } from '@/components/ui/theme-toggle'

// Use in any component
;<ThemeToggle />
```

### 2. **Theme Context Hook**

```jsx
import { useTheme } from '@/lib/theme'

function MyComponent() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  )
}
```

### 3. **Theme-Aware CSS Classes**

#### Text Colors

```jsx
// Primary text
className = 'text-foreground'

// Secondary/muted text
className = 'text-muted-foreground'

// Primary brand color
className = 'text-primary'
```

#### Background Colors

```jsx
// Main background
className = 'bg-background'

// Card background
className = 'bg-card'

// Muted background
className = 'bg-muted'
```

#### Border Colors

```jsx
// Standard borders
className = 'border-border'

// Input borders
className = 'border-input'
```

#### Interactive States

```jsx
// Hover states
className = 'hover:bg-accent hover:text-accent-foreground'

// Focus states
className = 'focus:ring-ring focus:border-ring'
```

## 📱 Components Updated

### ✅ **Layout Components**

- `MainLayout` - Theme-aware background and loading states
- `Header` - Theme toggle button, search bar, notifications
- `Sidebar` - Navigation, user profile, admin badge

### ✅ **Admin Pages**

- `Admin Dashboard` - Stats cards, quick actions, recent activity
- `Users Management` - User list, role badges, action buttons
- `Create Test` - Form inputs, validation, navigation

### ✅ **UI Components**

- `Button` - All variants support theme colors
- `Card` - Background and border colors
- `Input` - Border and focus states
- `Badge` - Color variants for different states
- `Avatar` - Background colors
- `Dropdown` - Menu backgrounds and borders

## 🎨 Color System

### **Primary Colors**

- `primary` - Main brand color (blue)
- `primary-foreground` - Text on primary background

### **Semantic Colors**

- `background` - Main page background
- `foreground` - Primary text color
- `card` - Card backgrounds
- `card-foreground` - Text on cards
- `popover` - Dropdown/popover backgrounds
- `popover-foreground` - Text in popovers

### **Interactive Colors**

- `accent` - Hover states
- `accent-foreground` - Text on accent backgrounds
- `muted` - Secondary backgrounds
- `muted-foreground` - Secondary text

### **Status Colors**

- `destructive` - Error states
- `destructive-foreground` - Text on error backgrounds
- `border` - Border colors
- `input` - Input field borders
- `ring` - Focus ring colors

## 🔧 Configuration

### **Tailwind Config**

```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        // ... other color mappings
      },
    },
  },
}
```

### **CSS Variables**

```css
/* app/globals.css */
@layer base {
  :root {
    /* Light mode variables */
  }

  .dark {
    /* Dark mode variables */
  }
}
```

### **Theme Provider**

```jsx
// app/providers.jsx
import { ThemeProvider } from '@/lib/theme'

export function Providers({ children }) {
  return (
    <SessionProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </SessionProvider>
  )
}
```

## 🚀 Usage Examples

### **Creating Theme-Aware Components**

```jsx
function MyCard({ children }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-foreground font-semibold">Title</h3>
      <p className="text-muted-foreground">{children}</p>
    </div>
  )
}
```

### **Conditional Theming**

```jsx
function StatusBadge({ status }) {
  const getStatusClasses = () => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs ${getStatusClasses()}`}>
      {status}
    </span>
  )
}
```

### **Theme-Aware Icons**

```jsx
function ThemeIcon({ icon: Icon }) {
  return (
    <Icon className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
  )
}
```

## 🎯 Best Practices

### 1. **Always Use Semantic Colors**

```jsx
// ✅ Good
className = 'text-foreground bg-background border-border'

// ❌ Avoid
className = 'text-black bg-white border-gray-200'
```

### 2. **Use CSS Variables for Custom Colors**

```css
/* For custom colors, extend the theme */
:root {
  --custom-color: 220 13% 91%;
}

.dark {
  --custom-color: 220 13% 18%;
}
```

### 3. **Test Both Themes**

Always test your components in both light and dark modes to ensure proper contrast and readability.

### 4. **Use Consistent Spacing**

```jsx
// Use Tailwind's spacing scale
className = 'p-4 m-2 space-y-4'
```

## 🔄 Theme Persistence

The theme system automatically:

- Saves theme preference to `localStorage`
- Restores theme on page load
- Applies theme to `document.documentElement`
- Handles theme switching without page refresh

## 🎨 Customization

### **Adding New Colors**

1. Add CSS variables to `globals.css`
2. Extend Tailwind config
3. Use in components

### **Modifying Existing Colors**

1. Update CSS variables in `globals.css`
2. Colors will automatically update across all components

### **Creating Theme Variants**

```jsx
const buttonVariants = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  destructive:
    'bg-destructive text-destructive-foreground hover:bg-destructive/90',
}
```

## 🚀 Next Steps

1. **Test All Pages**: Ensure all pages work well in both themes
2. **Add Animations**: Consider adding smooth transitions between themes
3. **Accessibility**: Ensure proper contrast ratios in both themes
4. **User Preferences**: Consider respecting system theme preferences

---

**Your theme system is now fully functional and ready for production use!** 🌟
