# Rumora

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

A privacy-first, open-source web performance monitoring library that helps you analyze and optimize your web applications without compromising user privacy.

## Philosophy

Rumora is built on the principle that **performance monitoring should never come at the cost of user privacy**. In an era where user tracking has become ubiquitous, Rumora provides developers with the performance insights they need while respecting user privacy and complying with data protection regulations.

### Core Principles

- **Privacy by Design**: No user behavior tracking, no session correlation, no personal data collection
- **Technical Focus**: Measure application performance, not user interactions
- **Developer Experience**: Clean TypeScript APIs with comprehensive error handling
- **Extensible Architecture**: Modular design allows for easy customization and extension
- **Tree-shakeable**: Import only what you need for optimal bundle size

## Installation

```bash
npm install rumora
```

```bash
pnpm add rumora
```

```bash
yarn add rumora
```

## Requirements

**Minimum Browser APIs Required:**
- `PerformanceObserver` (for Web Vitals and timing metrics)
- `addEventListener` (for error monitoring)
- Modern JavaScript support (ES2018+)

**Optional APIs (for enhanced features):**
- `PerformanceNavigationTiming` (for network analysis)
- `PerformanceResourceTiming` (for resource analysis)
- `SecurityPolicyViolationEvent` (for CSP monitoring)

**Development Requirements:**
- Node.js 18+
- TypeScript 5.0+

## Quick Start

### Error Monitoring

Start error monitoring immediately to catch early errors:

```typescript
import { 
  UnhandledJavaScriptErrorObserver,
  UnhandledPromiseRejectionObserver 
} from 'rumora';

// Start error monitoring immediately - critical to catch early errors
const jsErrors = new UnhandledJavaScriptErrorObserver();
jsErrors.subscribe((error, report) => {
  if (error) {
    console.warn('JS Error monitoring failed:', error.message);
    return;
  }
  console.log(`JS Error: ${report.errorMessage} (${report.severity})`);
});

const promiseErrors = new UnhandledPromiseRejectionObserver();
promiseErrors.subscribe((error, report) => {
  if (error) {
    console.warn('Promise rejection monitoring failed:', error.message);
    return;
  }
  console.log(`Promise Rejection: ${report.reason} (${report.severity})`);
});
```

### Performance Monitoring

Start performance monitoring after DOM content loads (uses buffered=true to capture past events):

```typescript
import { LCP, FCP, ResourceTiming } from 'rumora';

document.addEventListener('DOMContentLoaded', () => {
  // Monitor Core Web Vitals
  const lcp = new LCP();
  lcp.subscribe((error, report) => {
    if (error) {
      console.warn('LCP monitoring failed:', error.message);
      return;
    }
    
    if (report) {
      console.log(`LCP: ${report.value}ms (${report.rating})`);
      sendMetric('lcp', report.toJSON());
    }
  });

  // Monitor resource performance
  const resourceTiming = new ResourceTiming();
  resourceTiming.subscribe((error, collection) => {
    if (error) {
      console.warn('Resource timing failed:', error.message);
      return;
    }

    if (collection && !collection.isEmpty) {
      console.log(`Loaded ${collection.totalResources} resources`);
      console.log(`Total: ${Math.round(collection.totalTransferSize / 1024)}KB`);
    }
  });

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    [lcp, resourceTiming, jsErrors, promiseErrors].forEach(observer => {
      observer.dispose();
    });
  });
});
```

## What Rumora Does

Rumora focuses exclusively on **technical performance metrics** that help you optimize your web application:

### Web Vitals Monitoring
- **Core Web Vitals**: LCP (Largest Contentful Paint), FID (First Input Delay), CLS (Cumulative Layout Shift)
- **Additional Vitals**: FCP (First Contentful Paint), INP (Interaction to Next Paint)
- Event-driven performance scoring and thresholds

### Error Tracking
- **JavaScript Errors**: Runtime errors, syntax errors, type errors with stack traces
- **Promise Rejections**: Unhandled promise failures with categorization
- **Resource Loading Failures**: Failed scripts, stylesheets, images with detailed analysis
- **CSP Violations**: Content Security Policy violations with impact assessment

### Performance Timing
- **Resource Timing**: Detailed analysis of asset loading (JS, CSS, images, fonts)
- **Element Timing**: Track when specific elements become visible to users
- **Long Tasks**: Main thread blocking detection for UX optimization
- **Network Timing**: DNS, connection, and transfer performance
- **DOM Timing**: Document parsing and construction metrics

## What Rumora Does NOT Do

Rumora deliberately avoids any functionality that could compromise user privacy:

- **No User Behavior Tracking**: No clicks, scrolls, or interaction patterns
- **No Session Correlation**: No user journey mapping or session reconstruction  
- **No Personal Data**: No IP addresses, user agents, or device fingerprinting
- **No Activity Monitoring**: No time spent on page or user engagement metrics
- **No Cross-Session Tracking**: Each measurement is independent

## Implementation Status

**Core Web Vitals** ✅ **Production Ready**
- LCP (Largest Contentful Paint) ✅
- FID (First Input Delay) ✅  
- CLS (Cumulative Layout Shift) ✅
- FCP (First Contentful Paint) ✅
- INP (Interaction to Next Paint) ✅

**Error Monitoring** ✅ **Production Ready**
- JavaScript Error Observer ✅
- Promise Rejection Observer ✅  
- Resource Error Observer ✅
- CSP Violation Observer ✅

**Performance Timing** ✅ **Production Ready**
- Resource Timing Collection ✅
- DOM Timing Observer ✅
- Network Timing Observer ✅
- Element Timing Observer ✅
- Long Task Observer ✅

**Planned Features** 📋
- Memory Usage Observer
- Connection Quality Observer  
- User Timing Observer
- Advanced sampling strategies

## API Reference

### Web Vitals

```typescript
import { LCP, FCP, FID, CLS, INP } from 'rumora';

// Largest Contentful Paint
const lcp = new LCP();
lcp.subscribe((error, report) => {
  if (report) {
    console.log(`LCP: ${report.value}ms (${report.rating})`);
  }
});

// First Contentful Paint
const fcp = new FCP();
fcp.subscribe((error, report) => {
  if (report) {
    console.log(`FCP: ${report.value}ms (${report.rating})`);
  }
});
```

### Performance Timing

```typescript
import { ResourceTiming, LongTask, ElementTiming } from 'rumora';

// Monitor resource loading
const resourceTiming = new ResourceTiming();
resourceTiming.subscribe((error, collection) => {
  if (collection) {
    console.log(`Loaded ${collection.totalResources} resources`);
    console.log(`Total size: ${collection.totalTransferSize} bytes`);
  }
});

// Monitor long tasks that block the main thread
const longTask = new LongTask();
longTask.subscribe((error, report) => {
  if (report) {
    console.log(`Long task: ${report.duration}ms (${report.severity})`);
  }
});

// Monitor specific elements (requires elementtiming attribute)
const elementTiming = new ElementTiming();
elementTiming.subscribe((error, report) => {
  if (report) {
    console.log(`Element "${report.identifier}": ${report.effectiveRenderTime}ms`);
  }
});
```

### Error Tracking

```typescript
import { 
  UnhandledJavaScriptErrorObserver,
  UnhandledPromiseRejectionObserver,
  ResourceErrorObserver,
  CSPViolationObserver
} from 'rumora';

// JavaScript runtime errors
const jsErrors = new UnhandledJavaScriptErrorObserver();
jsErrors.subscribe((error, report) => {
  if (error) {
    console.error('Observer error:', error);
    return;
  }
  console.log(`JS Error: ${report.errorMessage} (${report.severity})`);
});

// Failed promise rejections
const promiseErrors = new UnhandledPromiseRejectionObserver();
promiseErrors.subscribe((error, report) => {
  if (error) {
    console.error('Observer error:', error);
    return;
  }
  console.log(`Promise Rejection: ${report.reason} (${report.severity})`);
});
```

### Memory Management

Always dispose of observers when they're no longer needed:

```typescript
const observers = [lcp, fcp, resourceTiming, longTask];

// Clean up
function cleanup() {
  observers.forEach(observer => observer.dispose());
}

window.addEventListener('beforeunload', cleanup);
```

## Element Timing Usage

To monitor specific elements, add the `elementtiming` attribute:

```html
<!-- Track hero image -->
<img src="hero.jpg" elementtiming="hero-image" alt="Hero">

<!-- Track main content -->
<div elementtiming="main-content">
  Important content here
</div>

<!-- Track above-the-fold elements -->
<section elementtiming="hero-section">
  Critical page content
</section>
```

## Initialization Patterns

### Recommended Setup

```typescript
// Pattern 1: Error monitoring - start immediately
function initErrorMonitoring() {
  const observers = [];
  
  // Critical: start as early as possible to catch all errors
  observers.push(new UnhandledJavaScriptErrorObserver());
  observers.push(new UnhandledPromiseRejectionObserver());
  observers.push(new ResourceErrorObserver());
  observers.push(new CSPViolationObserver());
  
  return observers;
}

// Pattern 2: Performance monitoring - wait for DOM ready
function initPerformanceMonitoring() {
  const observers = [];
  
  // These use buffered=true to capture past events
  observers.push(new LCP());
  observers.push(new FCP());
  observers.push(new CLS());
  observers.push(new ResourceTiming());
  observers.push(new ElementTiming());
  
  return observers;
}

// Usage
const errorObservers = initErrorMonitoring();

document.addEventListener('DOMContentLoaded', () => {
  const performanceObservers = initPerformanceMonitoring();
  
  window.addEventListener('beforeunload', () => {
    [...errorObservers, ...performanceObservers].forEach(obs => obs.dispose());
  });
});
```

## Browser Compatibility

| Feature | Chrome 60+ | Firefox 84+ | Safari 14+ | Edge 79+ |
|---------|------------|-------------|------------|----------|
| **Core Web Vitals** | ✅ LCP, FID, CLS | ✅ LCP, FID, CLS | ⚠️ LCP, CLS only | ✅ LCP, FID, CLS |
| **Additional Vitals** | ✅ FCP, INP | ✅ FCP, ❌ INP | ✅ FCP, ❌ INP | ✅ FCP, INP |
| **Error Tracking** | ✅ All features | ✅ All features | ✅ All features | ✅ All features |
| **Resource Timing** | ✅ Full support | ✅ Full support | ✅ Full support | ✅ Full support |
| **Element Timing** | ✅ 77+ | ❌ Not supported | ❌ Not supported | ✅ 79+ |
| **Long Tasks** | ✅ 58+ | ❌ Not supported | ❌ Not supported | ✅ 79+ |

*✅ Full Support | ⚠️ Partial Support | ❌ Not Supported*

Unsupported features degrade gracefully without breaking your application.

## TypeScript Support

Rumora is built with TypeScript and provides comprehensive type definitions:

```typescript
import type { 
  LCPReport, 
  ResourceTimingCollection,
  JavaScriptErrorReport 
} from 'rumora';

// Full type safety
const handleLCP = (report: LCPReport) => {
  // TypeScript knows the structure
  console.log(report.value, report.rating, report.delta);
};
```

## Privacy Design

Rumora is designed with privacy-first principles that may help with regulatory compliance:

- **No Personal Data**: No collection of IP addresses, user agents, or device fingerprints
- **No User Tracking**: No behavior tracking, session correlation, or cross-site tracking
- **Technical Focus**: Measures application performance, not user interactions
- **No Persistent Storage**: No cookies or local storage of user data

**Legal Note**: While Rumora is designed to minimize privacy concerns, organizations should consult with legal counsel to ensure compliance with applicable regulations in their jurisdiction.

## Troubleshooting

**Common Issues:**

**"Observer not supported" errors**
```typescript
// Check API availability before use
if ('PerformanceObserver' in window && 'observe' in PerformanceObserver.prototype) {
  // Safe to use observers
} else {
  // Fallback or skip monitoring
}
```

**No reports received**
- Ensure the monitored events actually occur (e.g., LCP requires content)
- Check browser console for errors
- Verify observer is disposed after use

**TypeScript errors**
- Ensure `"types": ["rumora"]` in your tsconfig.json
- Update to TypeScript 5.0+ for best compatibility

**Bundle size concerns**
- Use named imports instead of default imports
- Enable tree-shaking in your bundler
- Import specific observers: `import { LCP } from 'rumora/web-vitals'`

## Architecture

Rumora is built on a clean, modular architecture:

- **Value Objects**: Immutable data structures (`PerformanceTime`, `TimeSegment`)
- **Observer Pattern**: Performance metric observers with error handling
- **Factory Methods**: Type-safe report creation from Performance APIs
- **Memory Management**: Explicit cleanup with `dispose()` methods
- **Tree-shaking**: Import only what you need for optimal bundle size

## Contributing

We welcome contributions that align with Rumora's privacy-first philosophy.

**Before Contributing:**
1. Open an issue to discuss new features, especially those collecting new data types
2. Ensure changes maintain privacy guarantees
3. Add comprehensive tests for new functionality

**Development Setup:**
```bash
git clone https://github.com/cefo14/rumora.git
cd rumora
pnpm install

# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Build the library
pnpm build

# Type checking
pnpm typecheck
```

**Testing Philosophy:**
- Given-When-Then test structure required
- Use Object Mothers for test data
- Mock Web APIs using provided helpers
- Maintain high test coverage

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## Support

If you have any questions or need help, please:

1. Check the [Issues](https://github.com/cefo14/rumora/issues) for existing solutions
2. Create a new issue if your problem isn't already addressed
3. Contact the maintainer: <cefo14@protonmail.com>

---

**Built with privacy in mind, designed for performance.**

Made with ❤️ by Cefo14