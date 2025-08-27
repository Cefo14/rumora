import { WebVitalReport, WebVitalReportDTO } from "@/reports/WebVitalReport";

interface INPReportDTO extends WebVitalReportDTO {
  eventName: string;
}

export class INPReport extends WebVitalReport {
  readonly name = "INTERACTION_TO_NEXT_PAINT";

  readonly goodThreshold = 200;
  readonly badThreshold = 500;

  public readonly eventName: string;

  constructor(data: INPReportDTO) {
    super(data);
    this.eventName = data.eventName;
  }

  public override toJSON(): object {
    return {
      ...super.toJSON(),
      eventName: this.eventName,
    };
  }
}
