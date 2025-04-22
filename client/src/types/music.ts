/**
 * This file contains types for music-related functionality that are used
 * on the client side, extending the base types from the schema.
 */

import { Music as BaseMusic } from '@shared/schema';

// Re-export the base Music type for components to use
export type Music = BaseMusic;

// Extended music types for client-side use
export interface MusicQueueItem extends Music {
  albumCover?: string;
  duration: number;
  startTime: Date;
}

export interface MusicRequest extends Music {
  isUpvotedByUser: boolean;
}