import { PeriodDescription } from "../models/PeriodDescription";

export type DisplayState =
    | {
          view: "period";
          period: PeriodDescription;
      }
    | {
          view: "radial";
          year: number;
          week: number;
      }
    | {
          view: "recent";
      };
