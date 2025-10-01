# Rumora

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
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

## What Rumora Does

Rumora focuses exclusively on **technical performance metrics** that help you optimize your web application:

### Web Vitals Monitoring
- **Core Web Vitals**: LCP (Largest Contentful Paint), FID (First Input Delay), CLS (Cumulative Layout Shift)
- **Additional Vitals**: FCP (First Contentful Paint), INP (Interaction to Next Paint)
- **Collections**: Automatic aggregation and percentile calculations (e.g., INP p98)

### Error Tracking
- **JavaScript Errors**: Runtime errors, syntax errors, type errors with stack traces
- **Promise Rejections**: Unhandled promise failures with categorization
- **Resource Loading Failures**: Failed scripts, stylesheets, images with detailed analysis
- **CSP Violations**: Content Security Policy violations with impact assessment

### Performance Timing
- **Resource Timing**: Detailed analysis of asset loading with collections
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

## Implementation Status

**Core Web Vitals**
- LCP (Largest Contentful Paint) with Collection
- FID (First Input Delay)
- CLS (Cumulative Layout Shift) with Collection
- FCP (First Contentful Paint)
- INP (Interaction to Next Paint) with Collection

**Error Monitoring**
- JavaScript Error Observer
- Promise Rejection Observer
- Resource Error Observer
- CSP Violation Observer

**Performance Timing**
- Resource Timing with Collection
- DOM Timing Observer
- Network Timing Observer
- Element Timing Observer
- Long Task Observer

**Planned Features** 📋
- Memory Usage Observer
- Connection Quality Observer  
- User Timing Observer
- Advanced sampling strategies

## API Reference

### New API Pattern: Split Callbacks

Rumora uses a **split callback pattern** for better type safety:

```typescript
import { observeLCP } from 'rumora/web-vitals';

// ✅ Type-safe: report is never null in onSuccess
observeLCP()
  .onSuccess((collection) => {
    // collection is guaranteed to be LCPCollection, not null
    const lcp = collection.lastReport;
    console.log(`LCP: ${lcp?.value}ms`);
  })
  .onError((error) => {
    // error is guaranteed to be Error, not null
    console.error('LCP failed:', error.message);
  });
```

### Web Vitals with Collections

```typescript
import { 
  observeLCP, 
  observeFCP, 
  observeFID, 
  observeCLS, 
  observeINP 
} from 'rumora/web-vitals';

// Largest Contentful Paint (with collection)
observeLCP().onSuccess((collection) => {
  const lcp = collection.lastReport; // Final LCP value
  if (lcp) {
    console.log(`LCP: ${lcp.value}ms (${lcp.rating})`);
  }
});

// First Contentful Paint
observeFCP().onSuccess((report) => {
  console.log(`FCP: ${report.value}ms (${report.rating})`);
});

// Cumulative Layout Shift (with collection)
observeCLS().onSuccess((collection) => {
  const cls = collection.cumulativeShiftScore;
  console.log(`CLS: ${cls.toFixed(3)} (${collection.rating})`);
  console.log(`Total shifts: ${collection.totalReports}`);
});

// Interaction to Next Paint (with percentile 98)
observeINP().onSuccess((collection) => {
  const inp = collection.percentile98; // Official INP metric
  if (inp) {
    console.log(`INP (p98): ${inp.value}ms`);
  }
  console.log(`Total interactions: ${collection.totalReports}`);
});
```

### Performance Timing

```typescript
import { 
  observeResourceTiming, 
  observeLongTask, 
  observeElementTiming,
  observeDOMTiming,
  observeNetworkTiming
} from 'rumora/performance';

// Monitor resource loading (collection-based)
observeResourceTiming().onSuccess((collection) => {
  console.log(`Resources: ${collection.totalReports}`);
  console.log(`Total size: ${collection.totalTransferSize} bytes`);
  console.log(`Average load: ${collection.averageLoadTime}ms`);
  
  // Access individual resources
  const slowest = collection.slowestResource;
  console.log(`Slowest: ${slowest?.name} (${slowest?.duration}ms)`);
  
  // Group by type
  const byType = collection.resourcesByType;
  console.log(`Scripts: ${byType['script']?.length || 0}`);
});

// Monitor DOM timing
observeDOMTiming().onSuccess((report) => {
  console.log(`Time to Interactive: ${report.timeToInteractive}ms`);
  console.log(`DOMContentLoaded: ${report.timeToContentLoaded}ms`);
  console.log(`DOM Complete: ${report.timeToDOMComplete}ms`);
  console.log(`Full Load: ${report.timeToFullLoad}ms`);
});

// Monitor network timing
observeNetworkTiming().onSuccess((report) => {
  console.log(`DNS: ${report.dnsLookup.duration}ms`);
  console.log(`TCP: ${report.tcpConnect.duration}ms`);
  console.log(`TTFB: ${report.serverProcessing.duration}ms`);
  console.log(`Total: ${report.totalNetworkTime}ms`);
});

// Monitor long tasks that block the main thread
observeLongTask().onSuccess((report) => {
  console.log(`Long task: ${report.duration}ms (${report.severity})`);
});

// Monitor specific elements (requires elementtiming attribute)
observeElementTiming().onSuccess((report) => {
  console.log(`Element "${report.identifier}": ${report.renderTime}ms`);
});
```

### Error Tracking

```typescript
import { 
  observeUnhandledJavaScriptError,
  observeUnhandledPromiseRejection,
  observeResourceError,
  observeCSPViolation
} from 'rumora/errors';

// JavaScript runtime errors
observeUnhandledJavaScriptError()
  .onSuccess((report) => {
    console.log(`JS Error: ${report.errorMessage}`);
    console.log(`File: ${report.filename}:${report.line}:${report.column}`);
    console.log(`Severity: ${report.severity}`);
  })
  .onError((error) => {
    console.error('Observer error:', error);
  });

// Failed promise rejections
observeUnhandledPromiseRejection()
  .onSuccess((report) => {
    console.log(`Promise Rejection: ${report.reason}`);
    console.log(`Severity: ${report.severity}`);
  })
  .onError((error) => {
    console.error('Observer error:', error);
  });

// Resource loading failures
observeResourceError()
  .onSuccess((report) => {
    console.log(`Failed to load: ${report.resourceUrl}`);
    console.log(`Type: ${report.resourceType}`);
  })
  .onError((error) => {
    console.error('Observer error:', error);
  });

// CSP violations
observeCSPViolation()
  .onSuccess((report) => {
    console.log(`CSP Violation: ${report.blockedURI}`);
    console.log(`Directive: ${report.directive}`);
    console.log(`Policy: ${report.violatedDirective}`);
  })
  .onError((error) => {
    console.error('Observer error:', error);
  });
```

### Memory Management

Observers are singletons and cleanup automatically, but you can manually reset them:

```typescript
import { resetLCP, resetFCP, resetResourceTiming } from 'rumora';

// Manual cleanup (usually not needed)
window.addEventListener('beforeunload', () => {
  resetLCP();
  resetFCP();
  resetResourceTiming();
});
```

## Collections API

Rumora uses **Collection classes** for metrics that accumulate over time:

### LCPCollection
```typescript
observeLCP().onSuccess((collection) => {
  collection.lastReport;      // Final LCP value
  collection.reports;         // All LCP candidates
  collection.totalReports;    // Number of candidates
  collection.isEmpty;         // Check if empty
});
```

### CLSCollection
```typescript
observeCLS().onSuccess((collection) => {
  collection.cumulativeShiftScore;  // Total CLS score
  collection.reports;               // Individual layout shifts
  collection.rating;                // 'GOOD' | 'NEEDS_IMPROVEMENT' | 'POOR'
  collection.isGood;               // < 0.1
  collection.isPoor;               // >= 0.25
});
```

### INPCollection
```typescript
observeINP().onSuccess((collection) => {
  collection.percentile98;     // Official INP metric (p98)
  collection.worstReport;      // Worst interaction
  collection.reports;          // All interactions
  collection.totalReports;     // Number of interactions
});
```

### ResourceTimingCollection
```typescript
observeResourceTiming().onSuccess((collection) => {
  collection.totalReports;          // Number of resources
  collection.totalTransferSize;     // Total bytes
  collection.averageLoadTime;       // Average load time
  collection.slowestResource;       // Slowest resource
  collection.resourcesByType;       // Grouped by type
  collection.resourcesByDomain;     // Grouped by domain
  collection.thirdPartyResources;   // External resources
});
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

## Recommendations

### Error Monitoring

Start error monitoring immediately to catch early errors:

```typescript
import { 
  observeUnhandledJavaScriptError,
  observeUnhandledPromiseRejection 
} from 'rumora/errors';

// Start error monitoring immediately - critical to catch early errors
observeUnhandledJavaScriptError()
  .onSuccess((report) => {
    console.log(`JS Error: ${report.errorMessage} (${report.severity})`);
  })
  .onError((error) => {
    console.warn('JS Error monitoring failed:', error.message);
  });

observeUnhandledPromiseRejection()
  .onSuccess((report) => {
    console.log(`Promise Rejection: ${report.reason} (${report.severity})`);
  })
  .onError((error) => {
    console.warn('Promise rejection monitoring failed:', error.message);
  });
```

### Performance Monitoring

Start performance monitoring after DOM content loads (uses buffered=true to capture past events):

```typescript
import { observeLCP } from 'rumora/web-vitals';

document.addEventListener('DOMContentLoaded', () => {
  // Monitor Core Web Vitals with collections
  observeLCP()
    .onSuccess((collection) => {
      const lcp = collection.lastReport;
      if (lcp) {
        console.log(`LCP: ${lcp.value}ms (${lcp.rating})`);
      }
    })
    .onError((error) => {
      console.warn('LCP monitoring failed:', error.message);
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
  LCPCollection, 
  ResourceTimingCollection,
  UnhandledJavaScriptErrorReport 
} from 'rumora';

// Full type safety with collections
const handleLCP = (collection: LCPCollection) => {
  const lcp = collection.lastReport;
  if (lcp) {
    console.log(lcp.value, lcp.rating);
  }
};

// Type-safe error handling
const handleError = (report: UnhandledJavaScriptErrorReport) => {
  console.log(report.errorMessage, report.severity);
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
// Observers handle this automatically with onError
observeLCP()
  .onSuccess(collection => { /* ... */ })
  .onError(error => {
    if (error.message.includes('not supported')) {
      console.log('LCP not supported in this browser');
    }
  });
```

**No reports received**
- Ensure the monitored events actually occur (e.g., LCP requires content)
- Check browser console for errors
- For INP: requires user interactions to generate reports

**TypeScript errors**
- Ensure TypeScript 5.0+ for best compatibility
- Import types explicitly: `import type { ... } from 'rumora'`

**Bundle size concerns**
- Use path-based imports: `import { observeLCP } from 'rumora/web-vitals'`
- Enable tree-shaking in your bundler
- Import only the observers you need

## Architecture

Rumora is built on a clean, modular architecture:

- **Value Objects**: Immutable data structures (`PerformanceTime`, `TimeSegment`)
- **Collections**: Aggregate reports with computed metrics (`LCPCollection`, `INPCollection`)
- **Observer Pattern**: Singleton observers with split callbacks for type safety
- **Factory Functions**: Primary API (`observeLCP()`, `observeFCP()`)
- **Memory Management**: Automatic singleton cleanup with manual reset options
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

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you have any questions or need help, please:

1. Check the [Issues](https://github.com/cefo14/rumora/issues) for existing solutions
2. Create a new issue if your problem isn't already addressed
3. Contact the maintainer: <cefo14@protonmail.com>

---

**Built with privacy in mind, designed for performance.**

Made with ❤️ by Cefo14
