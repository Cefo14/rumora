import { CLS } from "./webvitals/CLS";
import { FCP } from "./webvitals/FCP";
import { FID } from "./webvitals/FID";
import { LCP } from "./webvitals/LCP";
import { INP } from "./webvitals/INP";
import { NetworkTiming } from "./webvitals/NetworkTiming";
import { DOMTiming } from "./webvitals/DOMTiming";

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