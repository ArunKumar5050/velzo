import { getStoresByPincode } from './medicalStoreService';
import { getLabsByPincode } from './laboratoryService';
import { updateOrder } from './orderService';
import { updateDoc } from 'firebase/firestore';

/**
 * Assigns an order to the best matching store based on pincode.
 * If multiple stores service the same pincode, it picks the first one for now.
 * In the future, this could be expanded to pick based on load balancing.
 */
export const assignOrderToNearestStore = async (orderId, userId, customerPincode, existingPath) => {
  if (!customerPincode) {
    console.log(`⚠️ Order ${orderId}: No pincode provided, cannot auto-assign`);
    return null;
  }

  try {
    const matchedStores = await getStoresByPincode(customerPincode);
    
    if (matchedStores.length === 0) {
      console.log(`⚠️ Order ${orderId}: No active stores found for pincode ${customerPincode}`);
      return null;
    }

    // Pick the best store (e.g., first one for now, could load-balance later)
    const selectedStore = matchedStores[0];
    
    // Update the order with the assignedStoreId
    await updateOrder(userId, orderId, { assignedStoreId: selectedStore.id }, existingPath);
    console.log(`✅ Order ${orderId} assigned to Store ${selectedStore.id} (${selectedStore.name})`);
    
    return selectedStore;
  } catch (error) {
    console.error(`❌ Error auto-assigning order ${orderId}:`, error);
    return null;
  }
}

/**
 * Scans an array of orders and auto-assigns any unassigned orders.
 * Only attempts to assign if `customerPincode` is present.
 */
export const autoAssignUnassignedOrders = async (orders) => {
  let assignedCount = 0;
  for (const order of orders) {
    // Only try to assign if not already assigned AND has a pincode
    // Orders from the mobile app should populate customerPincode
    if (!order.assignedStoreId) {
      let pincodeToUse = order.customerPincode;
      
      // Fallback: try to extract from shippingAddress if not denormalized
      if (!pincodeToUse && order.shippingAddress && order.shippingAddress.pincode) {
        pincodeToUse = order.shippingAddress.pincode;
      }

      if (pincodeToUse) {
        const store = await assignOrderToNearestStore(order.id, order.userId, pincodeToUse, order._path);
        if (store) assignedCount++;
      }
    }
  }
  return assignedCount;
}

/**
 * Assigns a lab appointment to the best matching lab based on pincode.
 */
export const assignLabBookingToNearestLab = async (appointmentId, customerPincode, ref) => {
  if (!customerPincode) {
    console.log(`⚠️ Lab Booking ${appointmentId}: No pincode provided, cannot auto-assign`);
    return null;
  }

  try {
    const matchedLabs = await getLabsByPincode(customerPincode);
    
    if (matchedLabs.length === 0) {
      console.log(`⚠️ Lab Booking ${appointmentId}: No active labs found for pincode ${customerPincode}`);
      return null;
    }

    const selectedLab = matchedLabs[0];
    
    // Update the appointment with the assignedLabId
    await updateDoc(ref, { assignedLabId: selectedLab.id });
    console.log(`✅ Lab Booking ${appointmentId} assigned to Lab ${selectedLab.id} (${selectedLab.name})`);
    
    return selectedLab;
  } catch (error) {
    console.error(`❌ Error auto-assigning lab booking ${appointmentId}:`, error);
    return null;
  }
}

/**
 * Scans an array of lab appointments and auto-assigns any unassigned ones.
 */
export const autoAssignUnassignedAppointments = async (appointments) => {
  let assignedCount = 0;
  for (const apt of appointments) {
    if (!apt.assignedLabId) {
      let pincodeToUse = apt.customerPincode || apt.pincode;
      
      if (!pincodeToUse && apt.address && apt.address.pincode) {
        pincodeToUse = apt.address.pincode;
      }

      if (pincodeToUse) {
        const lab = await assignLabBookingToNearestLab(apt.id, pincodeToUse, apt.ref);
        if (lab) assignedCount++;
      }
    }
  }
  return assignedCount;
}
