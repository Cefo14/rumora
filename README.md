# Rumora

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)

A privacy-first, open-source web performance monitoring library that helps you analyze and optimize your web applications without compromising user privacy.

## Philosophy

Rumora is built on the principle that **performance monitoring should never come at the cost of user privacy**. In an era where user tracking has become ubiquitous, Rumora provides developers with the performance insights they need while respecting user privacy and complying with data protection regulations.

### Core Principles

- **Privacy by Design**: No user behavior tracking, no session correlation, no personal data collection
- **Technical Focus**: Measure application performance, not user interactions
- **Compliance Ready**: GDPR/CCPA compliant out of the box - no consent banners needed
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

## Quick Start

```typescript
import { LCP, FCP, ResourceTiming } from 'rumora';

// Monitor Core Web Vitals
const lcp = new LCP();
lcp.subscribe((error, report) => {
  if (error) {
    console.error('LCP Error:', error);
  } else {
    console.log('LCP Report:', report);
    // Send to your analytics service
  }
});

// Monitor resource loading performance
const resourceTiming = new ResourceTiming();
resourceTiming.subscribe((error, reports) => {
  if (error) {
    console.error('Resource Timing Error:', error);
  } else {
    console.log('Resource Performance:', reports);
  }
});

// Clean up when done
window.addEventListener('beforeunload', () => {
  lcp.dispose();
  resourceTiming.dispose();
});
```

## What Rumora Does

Rumora focuses exclusively on **technical performance metrics** that help you optimize your web application:

### Web Vitals Monitoring
- **Core Web Vitals**: LCP (Largest Contentful Paint), FID (First Input Delay), CLS (Cumulative Layout Shift)
- **Additional Vitals**: FCP (First Contentful Paint), INP (Interaction to Next Paint)
- Real-time performance scoring and thresholds

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

## API Reference

### Web Vitals

```typescript
import { LCP, FCP, FID, CLS, INP } from 'rumora';

// Largest Contentful Paint
const lcp = new LCP();
lcp.subscribe((error, report) => {
  if (report) {
    console.log(`LCP: ${report.value}ms`);
  }
});

// First Contentful Paint
const fcp = new FCP();
fcp.subscribe((error, report) => {
  if (report) {
    console.log(`FCP: ${report.value}ms`);
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
    console.error('Error:', error);
    return;
  }
  console.log(`JS Error: ${report.errorMessage} (${report.severity})`);
});

// Failed promise rejections
const promiseErrors = new UnhandledPromiseRejectionObserver();
promiseErrors.subscribe((error, report) => {
  if (error) {
    console.error('Error:', error);
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

## Completed Features

**Web Vitals**
- ✅ LCP (Largest Contentful Paint)
- ✅ FID (First Input Delay)  
- ✅ CLS (Cumulative Layout Shift)
- ✅ FCP (First Contentful Paint)
- ✅ INP (Interaction to Next Paint)

**Error Tracking**
- ✅ JavaScript Error Observer
- ✅ Promise Rejection Observer  
- ✅ Resource Error Observer
- ✅ CSP Violation Observer

**Performance Timing**
- ✅ Long Tasks Observer
- ✅ Resource Timing Observer with network bottleneck analysis
- ✅ DOM Timing Observer
- ✅ Network Timing Observer
- ✅ Element Timing Observer

### Planned Features

**Advanced Metrics**
- 🔄 Memory Usage Observer
- 🔄 Connection Quality Observer
- 🔄 User Timing Observer

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

## Browser Compatibility

Rumora uses modern browser APIs with graceful degradation:

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| **Web Vitals** | ✅ | ✅ | ⚠️ | ✅ |
| **Error Tracking** | ✅ | ✅ | ✅ | ✅ |
| **Resource Timing** | ✅ | ✅ | ✅ | ✅ |
| **Element Timing** | ✅ | ❌ | ❌ | ✅ |
| **Long Tasks** | ✅ | ❌ | ❌ | ✅ |

*✅ Full Support | ⚠️ Partial Support | ❌ Not Supported*

Unsupported features fail gracefully and emit appropriate error messages.

## Architecture

Rumora is built on a clean, modular architecture:

- **Value Objects**: Immutable data structures (`PerformanceTime`, `TimeSegment`)
- **Observer Pattern**: Performance metric observers with error handling
- **Factory Methods**: Type-safe report creation from Performance APIs
- **Memory Management**: Explicit cleanup with `dispose()` methods
- **Tree-shaking**: Import only what you need for optimal bundle size

## Privacy Compliance

Rumora is designed to be compliant with privacy regulations:

- **GDPR**: No personal data collection or processing
- **CCPA**: No personal information collection or sale
- **PECR**: Technical performance data doesn't require consent
- **No Cookies**: No persistent storage of user data
- **No Tracking**: No cross-session or cross-site tracking

## Bundle Size

Rumora supports tree-shaking, so you only pay for what you use:

```typescript
// Only LCP observer and its dependencies are included
import { LCP } from 'rumora';

// Multiple observers
import { LCP, FCP, ResourceTiming } from 'rumora';
```

## Contributing

Rumora welcomes contributions that align with its privacy-first philosophy. Before contributing features that collect new types of data, please open an issue to discuss privacy implications.

### Development Setup

```bash
git clone https://github.com/your-username/rumora.git
cd rumora
pnpm install
pnpm dev
```

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

## Support

If you have any questions or need help, please:

1. Check the [Issues](https://github.com/your-username/rumora/issues) for existing solutions
2. Create a new issue if your problem isn't already addressed
3. Contact the maintainer: <cefo14@protonmail.com>

---

**Built with privacy in mind, designed for performance.**

Made with ❤️ by Cefo14
