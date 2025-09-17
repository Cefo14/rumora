/* eslint-disable @typescript-eslint/no-extraneous-class */

import { PerformanceEntryBuilder } from '../builders/PerformanceEntryBuilder';

export class PerformanceEntryMothers {
  static slowResource() {
    return PerformanceEntryBuilder
      .create()
      .asResource()
      .withName('https://example.com/large-image.jpg')
      .withSlowTiming()
      .build();
  }

  static fastScript() {
    return PerformanceEntryBuilder
      .create()
      .asResource()
      .withName('https://cdn.example.com/app.js')
      .withFastTiming()
      .build();
  }

  static longTask() {
    return PerformanceEntryBuilder
      .create()
      .withType('longtask')
      .withDuration(100)
      .build();
  }
};
