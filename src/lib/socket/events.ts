/**
 * Socket.io Event Types
 * Defines all events that can be emitted/received
 */

export const SOCKET_EVENTS = {
  // Building events
  BUILDING_STARTED: 'building:started',
  BUILDING_COMPLETED: 'building:completed',
  BUILDING_CANCELLED: 'building:cancelled',

  // Research events
  RESEARCH_STARTED: 'research:started',
  RESEARCH_COMPLETED: 'research:completed',
  RESEARCH_CANCELLED: 'research:cancelled',

  // Ship production events
  SHIP_PRODUCTION_STARTED: 'ship:production:started',
  SHIP_PRODUCTION_COMPLETED: 'ship:production:completed',
  SHIP_PRODUCTION_CANCELLED: 'ship:production:cancelled',

  // Fleet movement events
  FLEET_DISPATCHED: 'fleet:dispatched',
  FLEET_ARRIVED: 'fleet:arrived',
  FLEET_RETURNED: 'fleet:returned',
  FLEET_RECALLED: 'fleet:recalled',

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

export interface ResearchStartedPayload {
  researchType: string;
  researchName: string;
  level: number;
  researchEndTime: Date;
}

export interface ResearchCompletedPayload {
  researchType: string;
  researchName: string;
  newLevel: number;
}

export interface ResearchCancelledPayload {
  researchType: string;
  researchName: string;
}

export interface ShipProductionStartedPayload {
  planetId: string;
  shipType: string;
  shipName: string;
  quantity: number;
  productionEndTime: Date;
}

export interface ShipProductionCompletedPayload {
  planetId: string;
  shipType: string;
  shipName: string;
  quantity: number;
}

export interface ShipProductionCancelledPayload {
  planetId: string;
  shipType: string;
  shipName: string;
}

export interface FleetDispatchedPayload {
  fleetId: string;
  originPlanetId: string;
  targetCoordinates: string;
  mission: string;
  arrivalTime: Date;
}

export interface FleetArrivedPayload {
  fleetId: string;
  mission: string;
  targetPlanetId: string;
}

export interface FleetReturnedPayload {
  fleetId: string;
  originPlanetId: string;
}

export interface FleetRecalledPayload {
  fleetId: string;
  originPlanetId: string;
}
