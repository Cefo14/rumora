import { CLS } from "./metrics/web-vitals/CLS";
import { FCP } from "./metrics/web-vitals/FCP";
import { FID } from "./metrics/web-vitals/FID";
import { LCP } from "./metrics/web-vitals/LCP";
import { INP } from "./metrics/web-vitals/INP";

import { NetworkTiming } from "./metrics/performance/NetworkTiming";
import { DOMTiming } from "./metrics/performance/DOMTiming";

import { UnhandledErrorsObserver } from "./metrics/errors/UnhandledErrorsObserver";
import { UnhandledPromiseErrorsObserver } from "./metrics/errors/UnhandledPromiseErrorsObserver";
import { ResourceErrorObserver } from "./metrics/errors/ResourceErrorObserver";
import { CSPViolationObserver } from "./metrics/errors/CSPViolationObserver";
import { LongTask } from "./metrics/performance/LongTask";
import { ResourceTiming } from "./metrics/performance/ResourceTiming";

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

new LongTask()
.subscribe((error, report) => {
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Long Task Report:', report);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  function forceLongTask() {
    const loop = () => {
      for (let i = 0; i < 1000; i++) {
        console.log("sync");
      }
    };

    queueMicrotask(function microtask() {
      const start = performance.now();
      loop();
      const end = performance.now();
      console.log(`queueMicrotask loop duration: ${end - start}ms`);
    });
  }

  forceLongTask();
});

window.addEventListener("load", () => {
  new ResourceTiming()
  .subscribe((error, report) => {
    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Resource Timing Report:', report);
    }
  });
});
