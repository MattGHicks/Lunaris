/**
 * Server-side Socket.io utilities
 * Allows API routes to emit events to connected clients
 */

import { Server as SocketIOServer } from 'socket.io';
import { SOCKET_EVENTS } from './events';

/**
 * Get the global Socket.io instance
 * This is set by server.js
 */
export function getSocketIO(): SocketIOServer | null {
  if (typeof global.io !== 'undefined') {
    return global.io as SocketIOServer;
  }
  return null;
}

/**
 * Emit building started event to user
 */
export function emitBuildingStarted(
  userId: string,
  payload: {
    planetId: string;
    buildingType: string;
    buildingName: string;
    level: number;
    upgradeEndTime: Date;
  }
) {
  const io = getSocketIO();
  if (io) {
    io.to(`user:${userId}`).emit(SOCKET_EVENTS.BUILDING_STARTED, payload);
    console.log(`Emitted BUILDING_STARTED to user:${userId}`, payload);
  }
}

/**
 * Emit building completed event to user
 */
export function emitBuildingCompleted(
  userId: string,
  payload: {
    planetId: string;
    buildingType: string;
    buildingName: string;
    newLevel: number;
  }
) {
  const io = getSocketIO();
  if (io) {
    io.to(`user:${userId}`).emit(SOCKET_EVENTS.BUILDING_COMPLETED, payload);
    console.log(`Emitted BUILDING_COMPLETED to user:${userId}`, payload);
  }
}

/**
 * Emit building cancelled event to user
 */
export function emitBuildingCancelled(
  userId: string,
  payload: {
    planetId: string;
    buildingType: string;
    buildingName: string;
  }
) {
  const io = getSocketIO();
  if (io) {
    io.to(`user:${userId}`).emit(SOCKET_EVENTS.BUILDING_CANCELLED, payload);
    console.log(`Emitted BUILDING_CANCELLED to user:${userId}`, payload);
  }
}

/**
 * Emit resources updated event to user
 */
export function emitResourcesUpdated(
  userId: string,
  payload: {
    planetId: string;
    resources: {
      metal: number;
      crystal: number;
      deuterium: number;
      energy: number;
    };
  }
) {
  const io = getSocketIO();
  if (io) {
    io.to(`user:${userId}`).emit(SOCKET_EVENTS.RESOURCES_UPDATED, payload);
    console.log(`Emitted RESOURCES_UPDATED to user:${userId}`, payload);
  }
}

/**
 * Emit research started event to user
 */
export function emitResearchStarted(
  userId: string,
  payload: {
    researchType: string;
    researchName: string;
    level: number;
    researchEndTime: Date;
  }
) {
  const io = getSocketIO();
  if (io) {
    io.to(`user:${userId}`).emit(SOCKET_EVENTS.RESEARCH_STARTED, payload);
    console.log(`Emitted RESEARCH_STARTED to user:${userId}`, payload);
  }
}

/**
 * Emit research completed event to user
 */
export function emitResearchCompleted(
  userId: string,
  payload: {
    researchType: string;
    researchName: string;
    newLevel: number;
  }
) {
  const io = getSocketIO();
  if (io) {
    io.to(`user:${userId}`).emit(SOCKET_EVENTS.RESEARCH_COMPLETED, payload);
    console.log(`Emitted RESEARCH_COMPLETED to user:${userId}`, payload);
  }
}

/**
 * Emit research cancelled event to user
 */
export function emitResearchCancelled(
  userId: string,
  payload: {
    researchType: string;
    researchName: string;
  }
) {
  const io = getSocketIO();
  if (io) {
    io.to(`user:${userId}`).emit(SOCKET_EVENTS.RESEARCH_CANCELLED, payload);
    console.log(`Emitted RESEARCH_CANCELLED to user:${userId}`, payload);
  }
}

/**
 * Emit ship production started event to user
 */
export function emitShipProductionStarted(
  userId: string,
  payload: {
    planetId: string;
    shipType: string;
    shipName: string;
    quantity: number;
    productionEndTime: Date;
  }
) {
  const io = getSocketIO();
  if (io) {
    io.to(`user:${userId}`).emit(SOCKET_EVENTS.SHIP_PRODUCTION_STARTED, payload);
    console.log(`Emitted SHIP_PRODUCTION_STARTED to user:${userId}`, payload);
  }
}

/**
 * Emit ship production completed event to user
 */
export function emitShipProductionCompleted(
  userId: string,
  payload: {
    planetId: string;
    shipType: string;
    shipName: string;
    quantity: number;
  }
) {
  const io = getSocketIO();
  if (io) {
    io.to(`user:${userId}`).emit(SOCKET_EVENTS.SHIP_PRODUCTION_COMPLETED, payload);
    console.log(`Emitted SHIP_PRODUCTION_COMPLETED to user:${userId}`, payload);
  }
}

/**
 * Emit ship production cancelled event to user
 */
export function emitShipProductionCancelled(
  userId: string,
  payload: {
    planetId: string;
    shipType: string;
    shipName: string;
  }
) {
  const io = getSocketIO();
  if (io) {
    io.to(`user:${userId}`).emit(SOCKET_EVENTS.SHIP_PRODUCTION_CANCELLED, payload);
    console.log(`Emitted SHIP_PRODUCTION_CANCELLED to user:${userId}`, payload);
  }
}

/**
 * Emit fleet dispatched event to user
 */
export function emitFleetDispatched(
  userId: string,
  payload: {
    fleetId: string;
    originPlanetId: string;
    targetCoordinates: string;
    mission: string;
    arrivalTime: Date;
  }
) {
  const io = getSocketIO();
  if (io) {
    io.to(`user:${userId}`).emit(SOCKET_EVENTS.FLEET_DISPATCHED, payload);
    console.log(`Emitted FLEET_DISPATCHED to user:${userId}`, payload);
  }
}

/**
 * Emit fleet arrived event to user
 */
export function emitFleetArrived(
  userId: string,
  payload: {
    fleetId: string;
    mission: string;
    targetPlanetId: string;
  }
) {
  const io = getSocketIO();
  if (io) {
    io.to(`user:${userId}`).emit(SOCKET_EVENTS.FLEET_ARRIVED, payload);
    console.log(`Emitted FLEET_ARRIVED to user:${userId}`, payload);
  }
}

/**
 * Emit fleet returned event to user
 */
export function emitFleetReturned(
  userId: string,
  payload: {
    fleetId: string;
    originPlanetId: string;
  }
) {
  const io = getSocketIO();
  if (io) {
    io.to(`user:${userId}`).emit(SOCKET_EVENTS.FLEET_RETURNED, payload);
    console.log(`Emitted FLEET_RETURNED to user:${userId}`, payload);
  }
}

/**
 * Emit fleet recalled event to user
 */
export function emitFleetRecalled(
  userId: string,
  payload: {
    fleetId: string;
    originPlanetId: string;
  }
) {
  const io = getSocketIO();
  if (io) {
    io.to(`user:${userId}`).emit(SOCKET_EVENTS.FLEET_RECALLED, payload);
    console.log(`Emitted FLEET_RECALLED to user:${userId}`, payload);
  }
}

// TypeScript global augmentation
declare global {
  var io: SocketIOServer | undefined;
}
