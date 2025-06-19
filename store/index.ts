// import { create } from "zustand";

// import { DriverStore, LocationStore, MarkerData } from "@/types/type";

// export const useLocationStore = create<LocationStore>((set) => ({
//   userLatitude: null,
//   userLongitude: null,
//   userAddress: null,
//   destinationLatitude: null,
//   destinationLongitude: null,
//   destinationAddress: null,
//   setUserLocation: ({
//     latitude,
//     longitude,
//     address,
//   }: {
//     latitude: number;
//     longitude: number;
//     address: string;
//   }) => {
//     set(() => ({
//       userLatitude: latitude,
//       userLongitude: longitude,
//       userAddress: address,
//     }));

//     // if driver is selected and now new location is set, clear the selected driver
//     const { selectedDriver, clearSelectedDriver } = useDriverStore.getState();
//     if (selectedDriver) clearSelectedDriver();
//   },

//   setDestinationLocation: ({
//     latitude,
//     longitude,
//     address,
//   }: {
//     latitude: number;
//     longitude: number;
//     address: string;
//   }) => {
//     set(() => ({
//       destinationLatitude: latitude,
//       destinationLongitude: longitude,
//       destinationAddress: address,
//     }));

//     // if driver is selected and now new location is set, clear the selected driver
//     const { selectedDriver, clearSelectedDriver } = useDriverStore.getState();
//     if (selectedDriver) clearSelectedDriver();
//   },
// }));

// export const useDriverStore = create<DriverStore>((set) => ({
//   drivers: [] as MarkerData[],
//   selectedDriver: null,
//   setSelectedDriver: (driverId: number) =>
//     set(() => ({ selectedDriver: driverId })),
//   setDrivers: (drivers: MarkerData[]) => set(() => ({ drivers })),
//   clearSelectedDriver: () => set(() => ({ selectedDriver: null })),
// }));

import axios from "axios";
import { create } from "zustand";

import { DriverStore, LocationStore, MarkerData } from "@/types/type";

export const useLocationStore = create<LocationStore>((set) => ({
  userLatitude: null,
  userLongitude: null,
  userAddress: null,
  destinationLatitude: null,
  destinationLongitude: null,
  destinationAddress: null,
  setUserLocation: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    set(() => ({
      userLatitude: latitude,
      userLongitude: longitude,
      userAddress: address,
    }));

    // if driver is selected and now new location is set, clear the selected driver
    const { selectedDriver, clearSelectedDriver } = useDriverStore.getState();
    if (selectedDriver) clearSelectedDriver();
  },

  setDestinationLocation: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    set(() => ({
      destinationLatitude: latitude,
      destinationLongitude: longitude,
      destinationAddress: address,
    }));
    const distance = getDistanceFromLatLonInKm(
      useLocationStore.getState().userLatitude!,
      useLocationStore.getState().userLongitude!,
      latitude,
      longitude,
    );
    console.log('distance', distance)
    // if driver is selected and now new location is set, clear the selected driver
    const { selectedDriver, clearSelectedDriver } = useDriverStore.getState();
    if (selectedDriver) clearSelectedDriver();
  },
}));

// export const useDriverStore = create<DriverStore>((set) => ({
//   drivers: [] as MarkerData[],
//   selectedDriver: null,
//   setSelectedDriver: (driverId: number) =>
//     set(() => ({ selectedDriver: driverId })),
//   setDrivers: (drivers: MarkerData[]) => set(() => ({ drivers })),
//   clearSelectedDriver: () => set(() => ({ selectedDriver: null })),
// }));

// Utility to calculate distance between two lat/lng points (Haversine formula)
export function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const toRad = (deg: number) => deg * (Math.PI / 180);
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

export const useDriverStore = create((set) => ({
  drivers: [] as MarkerData[],
  selectedDriver: null,
  setSelectedDriver: (driverId: number) => set({ selectedDriver: driverId }),
  setDrivers: (drivers: MarkerData[]) => set({ drivers }),
  clearSelectedDriver: () => set({ selectedDriver: null }),

  fetchDrivers: async (userLatitude?: number, userLongitude?: number) => {
    try {
      const res = await axios.get("/(api)/driver");
      let data: MarkerData[] = res.data;

      if (userLatitude !== undefined && userLongitude !== undefined) {
        // Filter drivers within a certain radius, e.g., 10 km
        const radiusKm = 10;
        data = data.filter((driver) => {
          return (
            driver.latitude !== undefined &&
            driver.longitude !== undefined &&
            getDistanceFromLatLonInKm(
              userLatitude,
              userLongitude,
              driver.latitude,
              driver.longitude,
            ) <= radiusKm
          );
        });
      }

      set({ drivers: data });
    } catch (error) {
      console.error("Failed to fetch drivers:", error);
    }
  },
}));
