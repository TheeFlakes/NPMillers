import PocketBase from 'pocketbase';

const pb = new PocketBase('https://odds.pockethost.io');

export { pb };

export async function getDrivers(page = 1, perPage = 50) {
  const result = await pb.collection('driver_profile').getList(page, perPage, { sort: '-created' });
  return result.items.map((d) => ({
    id: d.id,
    name: d.name,
    id_no: d.id_no,
    phone_no: d.phone_no
  }));
}

/**
 * @param {string} id
 */
export async function getDriverById(id) {
  return await pb.collection('driver_profile').getOne(id);
}

/**
 * @param {string} query
 * @param {number} [page]
 * @param {number} [perPage]
 */
export async function searchDrivers(query, page = 1, perPage = 50) {
  // Search by name, id_no, or phone_no
  const filter = `name ~ "${query}" || id_no ~ "${query}" || phone_no ~ "${query}"`;
  const result = await pb.collection('driver_profile').getList(page, perPage, { filter });
  return result.items.map((d) => ({
    id: d.id,
    name: d.name,
    id_no: d.id_no,
    phone_no: d.phone_no
  }));
}

/**
 * @param {Object} data
 */
export async function createDriver(data) {
  return await pb.collection('driver_profile').create(data);
}

/**
 * @param {string} id
 * @param {Object} data
 */
export async function updateDriver(id, data) {
  return await pb.collection('driver_profile').update(id, data);
}

/**
 * @param {string} id
 */
export async function deleteDriver(id) {
  return await pb.collection('driver_profile').delete(id);
}

/**
 * @param {Object} data
 */
export async function createGatepass(data) {
  return await pb.collection('gatepasses').create(data);
}

/**
 * Fetch vehicles from PocketBase
 */
export async function getVehicles(page = 1, perPage = 50) {
  const result = await pb.collection('vehicles').getList(page, perPage, { sort: '-created' });
  return result.items.map((v) => ({
    id: v.id,
    vehicle_number: v.vehicle_number,
    model: v.model,
    number_plate: v.number_plate
  }));
}

/**
 * @param {string} id
 */
export async function getVehicleById(id) {
  return await pb.collection('vehicles').getOne(id);
}

/**
 * @type {null | (() => void)}
 */
let driverUnsubscribe = null;

/**
 * @param {(e: any) => void} callback
 */
export async function subscribeToDrivers(callback) {
  if (driverUnsubscribe) driverUnsubscribe();
  driverUnsubscribe = await pb.collection('driver_profile').subscribe('*', callback);
}

export function unsubscribeDrivers() {
  if (driverUnsubscribe) driverUnsubscribe();
  driverUnsubscribe = null;
} 