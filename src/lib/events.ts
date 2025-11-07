/**
 * Custom events for real-time UI updates without page reloads
 */

// Event names
export const EVENTS = {
  RESOURCES_CHANGED: 'lunaris:resources-changed',
  BUILDINGS_CHANGED: 'lunaris:buildings-changed',
} as const;

/**
 * Dispatch a resources changed event
 * This triggers ResourceDisplay to refetch
 */
export function triggerResourcesRefresh() {
  console.log('Triggering RESOURCES_CHANGED event');
  window.dispatchEvent(new CustomEvent(EVENTS.RESOURCES_CHANGED));
}

/**
 * Dispatch a buildings changed event
 * This triggers BuildingList to refetch
 */
export function triggerBuildingsRefresh() {
  console.log('Triggering BUILDINGS_CHANGED event');
  window.dispatchEvent(new CustomEvent(EVENTS.BUILDINGS_CHANGED));
}

/**
 * Trigger both resources and buildings to refresh
 */
export function triggerFullRefresh() {
  console.log('Triggering full refresh (resources + buildings)');
  triggerResourcesRefresh();
  triggerBuildingsRefresh();
}
