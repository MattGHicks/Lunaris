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

// TypeScript global augmentation
declare global {
  var io: SocketIOServer | undefined;
}
