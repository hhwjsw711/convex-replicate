/* prettier-ignore-start */

/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as audio from "../audio.js";
import type * as auth from "../auth.js";
import type * as credits from "../credits.js";
import type * as generate from "../generate.js";
import type * as guidedStory from "../guidedStory.js";
import type * as http from "../http.js";
import type * as replicate from "../replicate.js";
import type * as segments from "../segments.js";
import type * as sketches from "../sketches.js";
import type * as story from "../story.js";
import type * as types from "../types.js";
import type * as videos from "../videos.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  audio: typeof audio;
  auth: typeof auth;
  credits: typeof credits;
  generate: typeof generate;
  guidedStory: typeof guidedStory;
  http: typeof http;
  replicate: typeof replicate;
  segments: typeof segments;
  sketches: typeof sketches;
  story: typeof story;
  types: typeof types;
  videos: typeof videos;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

/* prettier-ignore-end */
