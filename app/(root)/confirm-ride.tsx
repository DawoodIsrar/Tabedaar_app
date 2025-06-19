import { router } from "expo-router";
import { FlatList, View } from "react-native";

import CustomButton from "@/components/CustomButton";
import DriverCard from "@/components/DriverCard";
import RideLayout from "@/components/RideLayout";
import { calculateRegion } from "@/lib/map";
import {
  getDistanceFromLatLonInKm,
  useDriverStore,
  useLocationStore,
} from "@/store";

const ConfirmRide = () => {
  const { drivers, selectedDriver, setSelectedDriver } = useDriverStore();
  const {
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
  } = useLocationStore();
  console.log("userAddress in confirm", userLatitude, userLongitude);
  console.log(
    "destinationAddress in confirm",
    destinationLatitude,
    destinationLongitude,
  );
  const region = calculateRegion({
    userLatitude: userLatitude!,
    userLongitude: userLongitude!,
    destinationLatitude: destinationLatitude!,
    destinationLongitude: destinationLongitude!,
  });
  console.log("region", region);
  const distance = getDistanceFromLatLonInKm(10, 11, 12, 14);
  console.log("distance", distance);
  return (
    <RideLayout title={"Choose a Rider"} snapPoints={["65%", "85%"]}>
      <FlatList
        data={drivers}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <DriverCard
            key={index}
            item={item}
            selected={selectedDriver!}
            setSelected={() => setSelectedDriver(item.id!)}
          />
        )}
        ListFooterComponent={() => (
          <View className="mx-5 mt-10">
            <CustomButton
              title="Select Ride"
              onPress={() => router.push("/(root)/book-ride")}
            />
          </View>
        )}
      />
    </RideLayout>
  );
};

export default ConfirmRide;
