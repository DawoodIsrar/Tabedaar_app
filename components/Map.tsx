// import React, { useEffect, useState } from "react";
// import { ActivityIndicator, Text, View } from "react-native";
// import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
// import MapViewDirections from "react-native-maps-directions";

// import { icons } from "@/constants";
// import { useFetch } from "@/lib/fetch";
// import {
//   calculateDriverTimes,
//   calculateRegion,
//   generateMarkersFromData,
// } from "@/lib/map";
// import { useDriverStore, useLocationStore } from "@/store";
// import { Driver, MarkerData } from "@/types/type";

// const directionsAPI = process.env.EXPO_PUBLIC_DIRECTIONS_API_KEY;

// const Map = () => {
//   const {
//     userLongitude,
//     userLatitude,
//     destinationLatitude,
//     destinationLongitude,
//   } = useLocationStore();
//   const { selectedDriver, setDrivers } = useDriverStore();

//   const { data: drivers, loading, error } = useFetch<Driver[]>("/(api)/driver");
//   const [markers, setMarkers] = useState<MarkerData[]>([]);

//   useEffect(() => {
//     if (Array.isArray(drivers)) {
//       if (!userLatitude || !userLongitude) return;

//       const newMarkers = generateMarkersFromData({
//         data: drivers,
//         userLatitude,
//         userLongitude,
//       });

//       setMarkers(newMarkers);
//     }
//   }, [drivers, userLatitude, userLongitude]);

//   useEffect(() => {
//     if (
//       markers.length > 0 &&
//       destinationLatitude !== undefined &&
//       destinationLongitude !== undefined
//     ) {
//       calculateDriverTimes({
//         markers,
//         userLatitude,
//         userLongitude,
//         destinationLatitude,
//         destinationLongitude,
//       }).then((drivers) => {
//         setDrivers(drivers as MarkerData[]);
//       });
//     }
//   }, [markers, destinationLatitude, destinationLongitude]);

//   const region = calculateRegion({
//     userLatitude,
//     userLongitude,
//     destinationLatitude,
//     destinationLongitude,
//   });

//   if (loading || (!userLatitude && !userLongitude))
//     return (
//       <View className="flex justify-between items-center w-full">
//         <ActivityIndicator size="small" color="#000" />
//       </View>
//     );

//   if (error)
//     return (
//       <View className="flex justify-between items-center w-full">
//         <Text>Error: {error}</Text>
//       </View>
//     );

//   return (
//     <MapView
//       provider={PROVIDER_DEFAULT}
//       className="w-full h-full rounded-2xl"
//       tintColor="black"
//       mapType="mutedStandard"
//       showsPointsOfInterest={false}
//       initialRegion={region}
//       showsUserLocation={true}
//       userInterfaceStyle="light"
//     >
//       {markers.map((marker, index) => (
//         <Marker
//           key={marker.id}
//           coordinate={{
//             latitude: marker.latitude,
//             longitude: marker.longitude,
//           }}
//           title={marker.title}
//           image={
//             selectedDriver === +marker.id ? icons.selectedMarker : icons.marker
//           }
//         />
//       ))}

//       {destinationLatitude && destinationLongitude && (
//         <>
//           <Marker
//             key="destination"
//             coordinate={{
//               latitude: destinationLatitude,
//               longitude: destinationLongitude,
//             }}
//             title="Destination"
//             image={icons.pin}
//           />
//           <MapViewDirections
//             origin={{
//               latitude: userLatitude!,
//               longitude: userLongitude!,
//             }}
//             destination={{
//               latitude: destinationLatitude,
//               longitude: destinationLongitude,
//             }}
//             apikey={directionsAPI!}
//             strokeColor="#0286FF"
//             strokeWidth={2}
//           />
//         </>
//       )}
//     </MapView>
//   );
// };

// export default Map;

import axios from "axios";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";

import { EXPO_PUBLIC_ORS_API_KEY, icons } from "@/constants";
import {
  calculateDriverTimes,
  calculateRegion,
  generateMarkersFromData,
} from "@/lib/map";
import { useDriverStore, useLocationStore } from "@/store";
import { Driver, MarkerData } from "@/types/type";

// Your OpenRouteService API Key
// const openRouteServiceKey = process.env.EXPO_PUBLIC_ORS_API_KEY!;

const Map = () => {
  const {
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationLongitude,
  } = useLocationStore();
  console.log("userLongitude", userLongitude);
  console.log("userLatitude", userLatitude);

  const { selectedDriver, setDrivers, drivers, fetchDrivers } =
    useDriverStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [routeCoords, setRouteCoords] = useState<
    { latitude: number; longitude: number }[]
  >([]);

  // Fetch drivers near user location using driver store method
  useEffect(() => {
    const loadDrivers = async () => {
      if (userLatitude && userLongitude) {
        setLoading(true);
        setError(null);
        try {
          await fetchDrivers(userLatitude, userLongitude);
        } catch (err) {
          setError("Failed to fetch drivers");
          console.error(err);
        }
        setLoading(false);
      }
    };

    loadDrivers();
  }, [userLatitude, userLongitude, fetchDrivers]);

  // Generate driver markers from fetched drivers
  useEffect(() => {
    if (Array.isArray(drivers) && userLatitude && userLongitude) {
      const newMarkers = generateMarkersFromData({
        data: drivers,
        userLatitude,
        userLongitude,
      });
      setMarkers(newMarkers);
    }
  }, [drivers, userLatitude, userLongitude]);

  // Calculate estimated driver times
  useEffect(() => {
    if (
      markers.length > 0 &&
      destinationLatitude !== undefined &&
      destinationLongitude !== undefined
    ) {
      calculateDriverTimes({
        markers,
        userLatitude,
        userLongitude,
        destinationLatitude,
        destinationLongitude,
      }).then((updatedDrivers) => {
        setDrivers(updatedDrivers as MarkerData[]);
      });
    }
  }, [
    markers,
    destinationLatitude,
    destinationLongitude,
    userLatitude,
    userLongitude,
    setDrivers,
  ]);

  // Fetch route using OpenRouteService
  useEffect(() => {
    const fetchRoute = async () => {
      if (
        userLatitude &&
        userLongitude &&
        destinationLatitude &&
        destinationLongitude
      ) {
        try {
          const url = `https://api.openrouteservice.org/v2/directions/driving-car/geojson`;

          const body = {
            coordinates: [
              [userLongitude, userLatitude],
              [destinationLongitude, destinationLatitude],
            ],
          };

          const res = await axios.post(url, body, {
            headers: {
              Authorization: EXPO_PUBLIC_ORS_API_KEY,
              "Content-Type": "application/json",
            },
          });

          // Geometry is in GeoJSON format: coordinates array of [lon, lat]
          const coords = res.data.features[0].geometry.coordinates;

          // Convert [lon, lat] to {latitude, longitude}
          const routeCoordinates = coords.map(
            ([lon, lat]: [number, number]) => ({
              latitude: lat,
              longitude: lon,
            }),
          );

          setRouteCoords(routeCoordinates);
        } catch (err) {
          console.error("Error fetching route from OpenRouteService:", err);
        }
      }
    };

    fetchRoute();
  }, [userLatitude, userLongitude, destinationLatitude, destinationLongitude]);

  const region = calculateRegion({
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  });

  if (loading || (!userLatitude && !userLongitude))
    return (
      <View className="flex justify-between items-center w-full">
        <ActivityIndicator size="small" color="#000" />
      </View>
    );

  if (error)
    return (
      <View className="flex justify-between items-center w-full">
        <Text>Error: {error}</Text>
      </View>
    );

  return (
    <MapView
      provider={PROVIDER_DEFAULT}
      className="w-full h-full rounded-2xl"
      tintColor="black"
      mapType="mutedStandard"
      showsPointsOfInterest={false}
      initialRegion={region}
      showsUserLocation={true}
      userInterfaceStyle="light"
    >
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          coordinate={{
            latitude: marker.latitude,
            longitude: marker.longitude,
          }}
          title={marker.title}
          image={
            selectedDriver === +marker.id ? icons.selectedMarker : icons.marker
          }
        />
      ))}

      {destinationLatitude && destinationLongitude && (
        <>
          <Marker
            key="destination"
            coordinate={{
              latitude: destinationLatitude,
              longitude: destinationLongitude,
            }}
            title="Destination"
            image={icons.pin}
          />

          {/* Draw route */}
          <Polyline
            coordinates={routeCoords}
            strokeColor="#0286FF"
            strokeWidth={3}
          />
        </>
      )}
    </MapView>
  );
};

export default Map;
