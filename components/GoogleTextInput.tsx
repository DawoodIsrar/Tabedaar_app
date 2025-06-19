// import { View, Image } from "react-native";
// import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

// import { icons } from "@/constants";
// import { GoogleInputProps } from "@/types/type";

// const googlePlacesApiKey = process.env.EXPO_PUBLIC_PLACES_API_KEY;

// const GoogleTextInput = ({
//   icon,
//   initialLocation,
//   containerStyle,
//   textInputBackgroundColor,
//   handlePress,
// }: GoogleInputProps) => {
//   return (
//     <View
//       className={`flex flex-row items-center justify-center relative z-50 rounded-xl ${containerStyle}`}
//     >
//       <GooglePlacesAutocomplete
//         fetchDetails={true}
//         placeholder="Search"
//         debounce={200}
//         styles={{
//           textInputContainer: {
//             alignItems: "center",
//             justifyContent: "center",
//             borderRadius: 20,
//             marginHorizontal: 20,
//             position: "relative",
//             shadowColor: "#d4d4d4",
//           },
//           textInput: {
//             backgroundColor: textInputBackgroundColor
//               ? textInputBackgroundColor
//               : "white",
//             fontSize: 16,
//             fontWeight: "600",
//             marginTop: 5,
//             width: "100%",
//             borderRadius: 200,
//           },
//           listView: {
//             backgroundColor: textInputBackgroundColor
//               ? textInputBackgroundColor
//               : "white",
//             position: "relative",
//             top: 0,
//             width: "100%",
//             borderRadius: 10,
//             shadowColor: "#d4d4d4",
//             zIndex: 99,
//           },
//         }}
//         onPress={(data, details = null) => {
//           handlePress({
//             latitude: details?.geometry.location.lat!,
//             longitude: details?.geometry.location.lng!,
//             address: data.description,
//           });
//         }}
//         query={{
//           key: googlePlacesApiKey,
//           language: "en",
//         }}
//         renderLeftButton={() => (
//           <View className="justify-center items-center w-6 h-6">
//             <Image
//               source={icon ? icon : icons.search}
//               className="w-6 h-6"
//               resizeMode="contain"
//             />
//           </View>
//         )}
//         textInputProps={{
//           placeholderTextColor: "gray",
//           placeholder: initialLocation ?? "Where do you want to go?",
//         }}
//       />
//     </View>
//   );
// };

// export default GoogleTextInput;


import React, { useState } from "react";
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  Image,
} from "react-native";

// eslint-disable-next-line import/no-unresolved
import { EXPO_PUBLIC_LOCATIONIQ_API_KEY, icons } from "@/constants";
// eslint-disable-next-line import/no-unresolved
import { GoogleInputProps } from "@/types/type";

// Replace with your real LocationIQ token


const LocationIQTextInput = ({
  icon,
  initialLocation,
  containerStyle,
  textInputBackgroundColor,
  handlePress,
}: GoogleInputProps) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  console.log('LOCATIONIQ_API_KEY', EXPO_PUBLIC_LOCATIONIQ_API_KEY)
  const fetchSuggestions = async (text: string) => {
    setQuery(text);
    if (text.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(
        `https://api.locationiq.com/v1/autocomplete?key=${EXPO_PUBLIC_LOCATIONIQ_API_KEY}&q=${encodeURIComponent(
          text,
        )}&format=json`,
      );
      const data = await res.json();
      setSuggestions(data);
      console.log('suggestions', suggestions)
    } catch (error) {
      console.error("LocationIQ Autocomplete Error:", error);
    }
  };

  const onSelectSuggestion = (item: any) => {
    setQuery(item.display_name);
    setSuggestions([]);

    handlePress({
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      address: item.display_name,
    });
  };

  return (
    <View
      className={`flex flex-col relative z-50 rounded-xl ${containerStyle}`}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: textInputBackgroundColor || "white",
          borderRadius: 30,
          paddingHorizontal: 15,
          marginHorizontal: 20,
        }}
      >
        <Image
          source={icon ? icon : icons.search}
          style={{ width: 24, height: 24, marginRight: 10 }}
          resizeMode="contain"
        />
        <TextInput
          value={query}
          placeholder={initialLocation ?? "Where do you want to go?"}
          placeholderTextColor="gray"
          onChangeText={fetchSuggestions}
          style={{
            flex: 1,
            fontSize: 16,
            fontWeight: "600",
            paddingVertical: 10,
            backgroundColor: "transparent",
          }}
        />
      </View>

      {suggestions.length > 0 && (
        <FlatList
          style={{
            backgroundColor: textInputBackgroundColor || "white",
            marginHorizontal: 20,
            borderRadius: 10,
            marginTop: 5,
            maxHeight: 200,
            zIndex: 99,
            overflow: "hidden",
            overflowY: "scroll"
          }}
          data={suggestions}
          keyExtractor={(item) => item?.place_id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => onSelectSuggestion(item)}
              style={{ padding: 10 }}
            >
              <Text>{item?.display_name}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

export default LocationIQTextInput;
