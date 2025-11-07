/**
 * Fleet Calculator for Lunaris
 * Handles fleet movement, travel time, fuel consumption, and mission calculations
 */

import {
  SHIP_SPEEDS,
  SHIP_CARGO_CAPACITY,
  SHIP_FUEL_CONSUMPTION,
  GAME_SETTINGS,
} from './constants';

export interface Coordinates {
  galaxy: number;
  system: number;
  position: number;
}

export interface FleetComposition {
  [shipType: string]: number;
}

export interface MissionCalculation {
  distance: number;
  duration: number; // seconds one-way
  totalDuration: number; // seconds round-trip
  fuelCost: number;
  fleetSpeed: number;
  cargoCapacity: number;
  arrivalTime: Date;
  returnTime: Date;
}

// ============================================================================
// DISTANCE CALCULATIONS
// ============================================================================

/**
 * Calculate distance between two coordinates
 * Formula based on OGame distance calculation
 */
export function calculateDistance(
  from: Coordinates,
  to: Coordinates
): number {
  // Same position
  if (
    from.galaxy === to.galaxy &&
    from.system === to.system &&
    from.position === to.position
  ) {
    return 5;
  }

  // Same system, different position
  if (from.galaxy === to.galaxy && from.system === to.system) {
    return 1000 + 5 * Math.abs(from.position - to.position);
  }

  // Same galaxy, different system
  if (from.galaxy === to.galaxy) {
    return 2700 + 95 * Math.abs(from.system - to.system);
  }

  // Different galaxy
  return 20000 * Math.abs(from.galaxy - to.galaxy);
}

// ============================================================================
// SPEED CALCULATIONS
// ============================================================================

/**
 * Get fleet speed (slowest ship determines fleet speed)
 */
export function getFleetSpeed(
  fleet: FleetComposition,
  combustionDriveLevel: number = 0,
  _impulseDriveLevel: number = 0,
  _hyperspaceDriveLevel: number = 0
): number {
  let slowestSpeed = Infinity;

  for (const [shipType, count] of Object.entries(fleet)) {
    if (count > 0) {
      const baseSpeed = SHIP_SPEEDS[shipType] || 0;

      // Apply drive bonuses
      // TODO: Determine which drive each ship uses and apply appropriate bonus
      // For now, use combustion drive bonus for simplicity
      const speedBonus = 1 + (combustionDriveLevel * 0.1);
      const shipSpeed = baseSpeed * speedBonus;

      if (shipSpeed < slowestSpeed) {
        slowestSpeed = shipSpeed;
      }
    }
  }

  return slowestSpeed === Infinity ? 0 : slowestSpeed;
}

/**
 * Calculate travel duration in seconds
 */
export function calculateTravelDuration(
  distance: number,
  fleetSpeed: number,
  fleetSpeedPercentage: number = 100
): number {
  if (fleetSpeed === 0) return 0;

  // Formula: (3500 / speedPercentage) * sqrt(distance * 10 / fleetSpeed) + 10
  const speedMultiplier = fleetSpeedPercentage / 100;
  const adjustedSpeed = fleetSpeed * speedMultiplier;

  const duration = (3500 / speedMultiplier) * Math.sqrt((distance * 10) / adjustedSpeed) + 10;

  // Apply fleet speed game setting
  return Math.floor(duration / GAME_SETTINGS.FLEET_SPEED);
}

// ============================================================================
// FUEL CALCULATIONS
// ============================================================================

/**
 * Calculate fuel consumption for a fleet
 */
export function calculateFuelConsumption(
  fleet: FleetComposition,
  distance: number,
  _duration: number
): number {
  let totalFuel = 0;

  for (const [shipType, count] of Object.entries(fleet)) {
    if (count > 0) {
      const baseFuel = SHIP_FUEL_CONSUMPTION[shipType] || 0;
      const shipFuel = baseFuel * count * distance / 35000 + 1;
      totalFuel += shipFuel * count;
    }
  }

  return Math.ceil(totalFuel);
}

// ============================================================================
// CARGO CALCULATIONS
// ============================================================================

/**
 * Calculate total cargo capacity of a fleet
 */
export function calculateCargoCapacity(fleet: FleetComposition): number {
  let totalCargo = 0;

  for (const [shipType, count] of Object.entries(fleet)) {
    if (count > 0) {
      const shipCargo = SHIP_CARGO_CAPACITY[shipType] || 0;
      totalCargo += shipCargo * count;
    }
  }

  return totalCargo;
}

/**
 * Check if cargo resources fit in fleet
 */
export function canCarryResources(
  fleet: FleetComposition,
  resources: { metal: number; crystal: number; deuterium: number },
  fuelCost: number
): boolean {
  const totalResources = resources.metal + resources.crystal + resources.deuterium + fuelCost;
  const capacity = calculateCargoCapacity(fleet);
  return totalResources <= capacity;
}

// ============================================================================
// MISSION CALCULATIONS
// ============================================================================

/**
 * Calculate complete mission details
 */
export function calculateMission(
  fleet: FleetComposition,
  from: Coordinates,
  to: Coordinates,
  _cargo: { metal: number; crystal: number; deuterium: number },
  fleetSpeedPercentage: number = 100,
  combustionDriveLevel: number = 0,
  impulseDriveLevel: number = 0,
  hyperspaceDriveLevel: number = 0
): MissionCalculation {
  // Calculate distance
  const distance = calculateDistance(from, to);

  // Get fleet speed
  const fleetSpeed = getFleetSpeed(
    fleet,
    combustionDriveLevel,
    impulseDriveLevel,
    hyperspaceDriveLevel
  );

  // Calculate duration
  const duration = calculateTravelDuration(distance, fleetSpeed, fleetSpeedPercentage);
  const totalDuration = duration * 2; // Round trip

  // Calculate fuel
  const fuelCost = calculateFuelConsumption(fleet, distance, duration);

  // Calculate cargo capacity
  const cargoCapacity = calculateCargoCapacity(fleet);

  // Calculate arrival and return times
  const now = Date.now();
  const arrivalTime = new Date(now + duration * 1000);
  const returnTime = new Date(now + totalDuration * 1000);

  return {
    distance,
    duration,
    totalDuration,
    fuelCost,
    fleetSpeed,
    cargoCapacity,
    arrivalTime,
    returnTime,
  };
}

/**
 * Validate fleet can be sent on mission
 */
export function validateFleetMission(
  fleet: FleetComposition,
  availableShips: Record<string, number>,
  cargo: { metal: number; crystal: number; deuterium: number },
  availableResources: { metal: number; crystal: number; deuterium: number },
  missionCalc: MissionCalculation
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check fleet is not empty
  const totalShips = Object.values(fleet).reduce((sum, count) => sum + count, 0);
  if (totalShips === 0) {
    errors.push('Fleet is empty');
  }

  // Check ships are available
  for (const [shipType, count] of Object.entries(fleet)) {
    if (count > 0) {
      const available = availableShips[shipType] || 0;
      if (count > available) {
        errors.push(`Not enough ${shipType}: need ${count}, have ${available}`);
      }
    }
  }

  // Check cargo resources are available
  if (cargo.metal > availableResources.metal) {
    errors.push(`Not enough metal for cargo: need ${cargo.metal}, have ${availableResources.metal}`);
  }
  if (cargo.crystal > availableResources.crystal) {
    errors.push(`Not enough crystal for cargo: need ${cargo.crystal}, have ${availableResources.crystal}`);
  }
  if (cargo.deuterium + missionCalc.fuelCost > availableResources.deuterium) {
    errors.push(`Not enough deuterium for cargo + fuel: need ${cargo.deuterium + missionCalc.fuelCost}, have ${availableResources.deuterium}`);
  }

  // Check cargo fits in fleet
  if (!canCarryResources(fleet, cargo, missionCalc.fuelCost)) {
    const totalCargo = cargo.metal + cargo.crystal + cargo.deuterium + missionCalc.fuelCost;
    errors.push(`Cargo too large: ${totalCargo} > ${missionCalc.cargoCapacity} capacity`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format coordinates for display
 */
export function formatCoordinates(coords: Coordinates): string {
  return `[${coords.galaxy}:${coords.system}:${coords.position}]`;
}

/**
 * Parse coordinates from string
 */
export function parseCoordinates(coordString: string): Coordinates | null {
  const match = coordString.match(/\[?(\d+):(\d+):(\d+)\]?/);
  if (!match) return null;

  const galaxy = match[1];
  const system = match[2];
  const position = match[3];

  if (!galaxy || !system || !position) return null;

  return {
    galaxy: parseInt(galaxy),
    system: parseInt(system),
    position: parseInt(position),
  };
}

/**
 * Format mission duration for display
 */
export function formatDuration(seconds: number): string {
  if (seconds < 0) return '0s';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}
