import { RumoraException } from './RumoraException';

export class TimeSegmentException extends RumoraException {}

export class InvalidTimeSegmentException extends TimeSegmentException {
  constructor(time: number) {
    super(`Invalid timing data: ${time} were expecting a finite number >= 0`);
  }
}

export class InvalidEndTimeException extends TimeSegmentException {
  constructor(startTime: number, endTime: number) {
    super(`End time (${endTime}) is before start time (${startTime})`);
  }
}
