import { Entity } from "../reports/Entity";
import { ValueObject } from "@/value-objects/ValueObject";

/**
 * Extracts the serialized data from an Entity or ValueObject.
 * This removes all methods to prevent corruption of the original object.
 * If T is neither an Entity nor a ValueObject, the type resolves to never.
 */
export type Serialized<T> = T extends (ValueObject | Entity) 
  ? ReturnType<T["toJSON"]> 
  : never;
