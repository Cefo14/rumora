/* eslint-disable @typescript-eslint/no-extraneous-class */

import { PerformanceNavigationTimingBuilder } from '../builders/PerformanceNavigationTimingBuilder';

export class PerformanceEntryMothers {
  static slowPageLoad() {
    return PerformanceNavigationTimingBuilder
      .create()
      .withSlowPageLoad()
      .build();
  }

  static fastPageLoad() {
    return PerformanceNavigationTimingBuilder
      .create()
      .withFastPageLoad()
      .build();
  }

  static redirectedPageLoad() {
    return PerformanceNavigationTimingBuilder
      .create()
      .withRedirectScenario()
      .withSlowPageLoad()
      .build();
  }
};
