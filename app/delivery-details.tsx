// app/delivery-details.tsx
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function DeliveryDetailsScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const router = useRouter();

  const handleGetLocation = async () => {
    setIsFetchingLocation(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "Permission to access location was denied. Please enable it in your device settings to use this feature.");
      setIsFetchingLocation(false);
      return;
    }

    try {
      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      let reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const firstResult = reverseGeocode[0];
        const formattedAddress = [
          firstResult.name,
          firstResult.street,
          firstResult.city,
          firstResult.postalCode,
          firstResult.country
        ].filter(Boolean).join(', '); // Filter out null/undefined parts and join
        setAddress(formattedAddress);
      } else {
        Alert.alert("Location Not Found", "Could not determine address from current location.");
      }
    } catch (error) {
      console.error("Error fetching location or address: ", error);
      Alert.alert("Error", "Failed to fetch current location or address. Please try again or enter manually.");
    } finally {
      setIsFetchingLocation(false);
    }
  };

  const handleProceedToSummary = () => {
    if (!phoneNumber.startsWith('+91')) {
      Alert.alert("Invalid Phone Number", "Phone number must start with +91.");
      return;
    }
    if (phoneNumber.length < 13) { // +91 and 10 digits
        Alert.alert("Invalid Phone Number", "Please enter a valid 10-digit phone number with +91 prefix.");
        return;
    }
    if (address.trim().length < 10) {
      Alert.alert("Invalid Address", "Please enter a complete delivery address (minimum 10 characters).");
      return;
    }

    router.push({
      pathname: "/order-summary",
      params: { phoneNumber, deliveryAddress: address }
    });
  };

  return (
    <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
    >
        <ScrollView contentContainerStyle={styles.scrollContentContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#2D3436" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Delivery Details</Text>
            </View>

            <View style={styles.formContainer}>
                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.inputContainer}>
                    <Text style={styles.prefix}>+91</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="9876543210"
                        keyboardType="phone-pad"
                        value={phoneNumber.replace('+91', '')}
                        onChangeText={(text) => setPhoneNumber('+91' + text.replace(/[^0-9]/g, ''))}
                        maxLength={10 + 3} // +91 and 10 digits
                    />
                </View>

                <Text style={styles.label}>Delivery Address</Text>
                <TouchableOpacity style={styles.locationButton} onPress={handleGetLocation} disabled={isFetchingLocation}>
                    {isFetchingLocation ? (
                        <ActivityIndicator size="small" color="#FF6B6B" />
                    ) : (
                        <Ionicons name="locate-outline" size={20} color="#FF6B6B" />
                    )}
                    <Text style={styles.locationButtonText}>
                        {isFetchingLocation ? "Fetching Location..." : "Use Current Location"}
                    </Text>
                </TouchableOpacity>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Enter your full delivery address or use current location"
                    value={address}
                    onChangeText={setAddress}
                    multiline
                    numberOfLines={4}
                />

                <TouchableOpacity style={styles.proceedButton} onPress={handleProceedToSummary}>
                    <Text style={styles.proceedButtonText}>PROCEED TO ORDER SUMMARY</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    marginRight: 10,
    padding: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2D3436',
  },
  formContainer: {
    padding: 20,
    flex: 1,
  },
  label: {
    fontSize: 16,
    color: '#636E72',
    marginBottom: 8,
    marginTop: 15,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
  },
  prefix: {
    fontSize: 16,
    color: '#2D3436',
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#2D3436',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B6B',
    marginBottom: 10, // Space before the text area
    marginTop: 5, // Space after the label
  },
  locationButtonText: {
    color: '#FF6B6B',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  proceedButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
    elevation: 2,
  },
  proceedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});