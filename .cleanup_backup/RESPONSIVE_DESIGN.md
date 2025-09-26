# Responsive Design Guide

## Overview
This document outlines the responsive design implementation for the Legal AI application, ensuring optimal user experience across all device sizes.

## Breakpoints
The application uses the following responsive breakpoints:

- **xs**: 475px (extra small devices)
- **sm**: 640px (small devices, phones)
- **md**: 768px (medium devices, tablets)
- **lg**: 1024px (large devices, laptops)
- **xl**: 1280px (extra large devices, desktops)
- **2xl**: 1536px (2x extra large devices, large desktops)

## Component Structure

### Layout Components

#### ResponsiveLayout
- **Purpose**: Provides a responsive sidebar and main content layout
- **Features**: 
  - Mobile hamburger menu
  - Overlay for mobile navigation
  - Smooth transitions between mobile and desktop views
- **Usage**: Wraps the main application layout

#### MobileHeader
- **Purpose**: Provides consistent header styling across devices
- **Features**:
  - Responsive text sizing
  - Adaptive button layouts
  - Truncation for long titles

#### ResponsiveContainer
- **Purpose**: Provides consistent container sizing and padding
- **Features**:
  - Multiple max-width options
  - Responsive padding
  - Flexible content centering

### Chat Components

#### Sidebar
- **Mobile**: Hidden by default, accessible via hamburger menu
- **Desktop**: Always visible, fixed width
- **Features**:
  - Document list with status indicators
  - User information display
  - New document upload button

#### ChatArea
- **Mobile**: Full-width with compact spacing
- **Desktop**: Centered content with generous spacing
- **Features**:
  - Responsive message bubbles
  - Adaptive file upload area
  - Mobile-optimized headers

#### MessageBubble
- **Mobile**: Smaller avatars and compact spacing
- **Desktop**: Standard sizing with comfortable spacing
- **Features**:
  - Responsive text sizing
  - Adaptive avatar sizes
  - Mobile-friendly touch targets

#### FileUploadArea
- **Mobile**: Compact design with smaller icons
- **Desktop**: Spacious design with larger interactive elements
- **Features**:
  - Drag and drop support
  - File validation
  - Progress indicators

## Responsive Patterns

### Mobile-First Approach
All components are designed with mobile-first principles:
1. Start with mobile styles
2. Add larger screen enhancements using `sm:`, `md:`, `lg:` prefixes
3. Ensure touch-friendly interactions

### Adaptive Typography
- **Mobile**: Smaller base font sizes (text-xs, text-sm)
- **Desktop**: Larger, more readable sizes (text-base, text-lg)
- **Headings**: Scale appropriately (text-lg → text-xl)

### Flexible Layouts
- **Flexbox**: Used for component arrangement
- **Grid**: Used for complex layouts where appropriate
- **Min-width**: Prevents content from becoming too narrow

### Touch Optimization
- **Button sizes**: Minimum 44px touch targets
- **Spacing**: Adequate spacing between interactive elements
- **Gestures**: Support for swipe and tap interactions

## Performance Considerations

### CSS Optimization
- **Tailwind**: Utility-first approach reduces CSS bundle size
- **Purge**: Unused styles are automatically removed
- **Responsive**: Only necessary breakpoints are included

### Component Optimization
- **Lazy loading**: Components load only when needed
- **Memoization**: Expensive calculations are cached
- **Virtual scrolling**: Large lists are efficiently rendered

## Testing Guidelines

### Device Testing
Test on the following device categories:
- **Mobile**: iPhone SE, iPhone 12, Samsung Galaxy
- **Tablet**: iPad, iPad Pro, Android tablets
- **Desktop**: Various screen sizes from 1024px to 2560px

### Browser Testing
- **Chrome**: Latest version
- **Firefox**: Latest version
- **Safari**: Latest version
- **Edge**: Latest version

### Accessibility Testing
- **Screen readers**: Test with VoiceOver, NVDA
- **Keyboard navigation**: Ensure all functionality is accessible
- **Color contrast**: Verify WCAG compliance
- **Focus indicators**: Clear visual focus states

## Maintenance

### Adding New Components
1. Start with mobile design
2. Add responsive breakpoints incrementally
3. Test across all device sizes
4. Document responsive behavior

### Updating Existing Components
1. Test existing responsive behavior
2. Make changes incrementally
3. Verify no regressions on other devices
4. Update documentation

### Performance Monitoring
- **Core Web Vitals**: Monitor LCP, FID, CLS
- **Bundle size**: Track CSS and JS bundle growth
- **Render performance**: Monitor component render times

## Common Patterns

### Responsive Images
```tsx
<img 
  src="image.jpg" 
  className="w-full h-auto max-w-sm sm:max-w-md lg:max-w-lg"
  alt="Description"
/>
```

### Responsive Text
```tsx
<h1 className="text-lg sm:text-xl lg:text-2xl font-bold">
  Title
</h1>
```

### Responsive Spacing
```tsx
<div className="p-2 sm:p-4 lg:p-6">
  Content
</div>
```

### Responsive Visibility
```tsx
<div className="hidden sm:block">
  Desktop only content
</div>
<div className="block sm:hidden">
  Mobile only content
</div>
```

## Future Enhancements

### Planned Improvements
- **Container queries**: For component-level responsive design
- **CSS Grid**: More complex layouts
- **Motion**: Responsive animations and transitions
- **PWA**: Progressive Web App features

### Performance Optimizations
- **Critical CSS**: Inline critical styles
- **Resource hints**: Preload important resources
- **Service workers**: Offline functionality
- **Image optimization**: Responsive images with WebP

## Resources

### Documentation
- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [MDN Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Web.dev Responsive Design](https://web.dev/responsive-web-design-basics/)

### Tools
- **Browser DevTools**: Device simulation
- **Lighthouse**: Performance auditing
- **WebPageTest**: Performance testing
- **Responsive Design Checker**: Cross-device testing
