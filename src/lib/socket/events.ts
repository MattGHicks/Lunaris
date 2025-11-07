/**
 * Socket.io Event Types
 * Defines all events that can be emitted/received
 */

export const SOCKET_EVENTS = {
  // Building events
  BUILDING_STARTED: 'building:started',
  BUILDING_COMPLETED: 'building:completed',
  BUILDING_CANCELLED: 'building:cancelled',

  // Resource events
  RESOURCES_UPDATED: 'resources:updated',

  // Connection events
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
} as const;

export interface BuildingStartedPayload {
  planetId: string;
  buildingType: string;
  buildingName: string;
  level: number;
  upgradeEndTime: Date;
}

export interface BuildingCompletedPayload {
  planetId: string;
  buildingType: string;
  buildingName: string;
  newLevel: number;
}

export interface BuildingCancelledPayload {
  planetId: string;
  buildingType: string;
  buildingName: string;
}

export interface ResourcesUpdatedPayload {
  planetId: string;
  resources: {
    metal: number;
    crystal: number;
    deuterium: number;
    energy: number;
  };
}
