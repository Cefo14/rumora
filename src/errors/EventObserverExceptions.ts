import { RumoraException } from './RumoraException';

export class EventObserverException extends RumoraException {};

export class EventObserverHandlerException extends EventObserverException {
  constructor(cause?: unknown) {
    super('Error occurred in event observer handler', { cause });
  }
}
