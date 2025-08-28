import { CLS } from "./metrics/CLS";
import { FCP } from "./metrics/FCP";
import { FID } from "./metrics/FID";
import { LCP } from "./metrics/LCP";
import { INP } from "./metrics/INP";
import { NetworkTiming } from "./metrics/NetworkTiming";
import { DOMTiming } from "./metrics/DOMTiming";
import { UnhandledErrorsObserver } from "./metrics/UnhandledErrorsObserver";
import { UnhandledPromiseErrorsObserver } from "./metrics/UnhandledPromiseErrorsObserver";
import { ResourceErrorObserver } from "./metrics/ResourceErrorObserver";
import { CSPViolationObserver } from "./metrics/CSPViolationObserver";

new LCP()
.subscribe((error, report) => {
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('LCP Report:', report);
  }
});

new FID()
.subscribe((error, report) => {
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('FID Report:', report);
  }
});

new FCP()
.subscribe((error, report) => {
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('FCP Report:', report);
  }
});

new CLS()
.subscribe((error, report) => {
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('CLS Report:', report);
  }
});

new INP()
.subscribe((error, report) => {
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('INP Report:', report);
  }
});

new NetworkTiming()
.subscribe((error, report) => {
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Navigation Timing Report:', report);
  }
});

new DOMTiming()
.subscribe((error, report) => {
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('DOM Timing Report:', report);
  }
});

new UnhandledErrorsObserver()
.subscribe((report) => {
  console.log('Error Tracking Report:', report);
});

new UnhandledPromiseErrorsObserver()
.subscribe((report) => {
  console.log('Unhandled Promise Errors Report:', report);
});

new ResourceErrorObserver()
.subscribe((report) => {
  console.log('Resource Error Report:', report);
});

new CSPViolationObserver()
.subscribe((report) => {
  console.log('CSP Violation Report:', report);
});
