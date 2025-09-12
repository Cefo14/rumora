import { Entity } from "../reports/Entity";
import { ValueObject } from "@/value-objects/ValueObject";

/**
 * Extracts the serialized data from an Entity or ValueObject.
 * This removes all methods to prevent corruption of the original object.
 * 
 * @template T - The entity or value object type
 * @example
 * ```typescript
 * type DOMData = Serialized<Report>;
 * // Gets the plain data object returned by Report.toJSON()
 * ```
 */
export type Serialized<T> = T extends (ValueObject | Entity) 
  ? ReturnType<T["toJSON"]> 
  : never;
