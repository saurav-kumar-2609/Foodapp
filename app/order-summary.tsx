// app/order-summary.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router'; // Added useFocusEffect
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import React, { useCallback, useState } from 'react'; // Added useEffect, useCallback
import { ActivityIndicator, Alert, FlatList, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCart } from '../context/CartContext'; // [cite: 96]
import { db } from '../firebaseConfig'; // [cite: 96]

interface CartItem {
  id: string; // [cite: 96]
  name: string; // [cite: 96]
  imageUrl: string; // [cite: 97]
  price: number; // [cite: 97]
  quantity: number; // [cite: 97]
}

export default function OrderSummaryScreen() {
  const { cartItems, totalPrice, clearCart } = useCart(); // [cite: 97]
  const [isPlacingOrder, setIsPlacingOrder] = useState(false); // [cite: 98]
  const userId = "demoUser123"; // This should ideally come from an auth context // [cite: 98]

  const params = useLocalSearchParams();
  const phoneNumber = params.phoneNumber as string;
  const deliveryAddress = params.deliveryAddress as string;
  const [hasNavigatedAway, setHasNavigatedAway] = useState(false); // Flag to prevent multiple navigations

  useFocusEffect(
    useCallback(() => {
      // Reset navigation flag when screen comes into focus
      setHasNavigatedAway(false);

      if (cartItems.length === 0 && !isPlacingOrder && !hasNavigatedAway) {
        // Condition to redirect if cart is empty and not in the middle of an order
        // console.log("OrderSummary: Cart is empty on focus, redirecting.");
        router.replace('/menu');
        setHasNavigatedAway(true); // Mark that navigation has been attempted
      }

      return () => {
        // Optional: Cleanup when screen goes out of focus
        // console.log("OrderSummary: Screen out of focus.");
      };
    }, [cartItems, isPlacingOrder, router]) // Removed hasNavigatedAway from deps to allow re-check on focus
  );


  const placeOrder = async () => {
    if (hasNavigatedAway) return; // Prevent action if navigation has already been initiated

    if (cartItems.length === 0) { // [cite: 98]
      Alert.alert("Cart Empty", "Please add items to your cart before placing an order.");
      if (!hasNavigatedAway) {
        router.replace('/menu'); // [cite: 99]
        setHasNavigatedAway(true);
      }
      return;
    }
    if (!phoneNumber || !deliveryAddress) {
        Alert.alert("Missing Details", "Delivery information is missing. Please go back and provide them.",
            [{ text: "OK", onPress: () => {
                if (!hasNavigatedAway) {
                    router.replace('/delivery-details');
                    setHasNavigatedAway(true);
                }
            }}]
        );
        return;
    }

    setIsPlacingOrder(true); // [cite: 98]
    try {
      const orderData = {
        userId: userId, // [cite: 99]
        items: cartItems.map(item => ({ // [cite: 99]
          itemId: item.id, // [cite: 99]
          name: item.name, // [cite: 99]
          price: item.price, // [cite: 99]
          quantity: item.quantity, // [cite: 99]
        })),
        totalPrice: totalPrice, // [cite: 99]
        orderDate: serverTimestamp(), // [cite: 100]
        status: 'Pending', // [cite: 100]
        phoneNumber: phoneNumber,
        deliveryAddress: deliveryAddress,
      };
      await addDoc(collection(db, 'orders'), orderData); // [cite: 101]
      Alert.alert("Order Placed!", "Your order has been successfully placed.", [ // [cite: 101]
        { text: "OK", onPress: () => { // [cite: 101]
            clearCart(); // [cite: 101]
            if (!hasNavigatedAway) {
                router.replace('/menu'); // [cite: 101]
                setHasNavigatedAway(true);
            }
          }
        }
      ]);
    } catch (error: any) { // [cite: 102]
      console.error("Error placing order:", error); // [cite: 102]
      Alert.alert( // [cite: 103]
        "Order Failed", // [cite: 103]
        `There was an error placing your order: ${error.message || 'Unknown error'}. Please try again.` // [cite: 103]
      );
    } finally {
      setIsPlacingOrder(false); // [cite: 104]
    }
  };

  const renderOrderItem = ({ item }: { item: CartItem }) => ( // [cite: 105]
    <View style={styles.orderItemCard}>
      <Image source={{ uri: item.imageUrl }} style={styles.orderItemImage} />
      <View style={styles.orderItemDetails}>
        <Text style={styles.orderItemName}>{item.name}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.orderItemQuantity}>Quantity: {item.quantity}</Text>
          <Text style={styles.orderItemPrice}>₹{(item.price * item.quantity).toFixed(2)}</Text>
        </View>
        <View style={styles.itemPriceRow}>
          <Text style={styles.unitPrice}>₹{item.price.toFixed(2)} each</Text>
        </View>
      </View>
    </View>
  ); // [cite: 106]


  // This view will be shown briefly if cart is empty before useFocusEffect navigates
  if (cartItems.length === 0 && !isPlacingOrder) { // [cite: 107]
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.emptySubtitle}>Your cart is currently empty. Processing...</Text>
      </View>
    );
  }


  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF6B6B', '#FF4343']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => {
            if (!hasNavigatedAway && router.canGoBack()) {
                 router.back();
            } else if (!hasNavigatedAway) {
                router.replace('/menu'); // Fallback if cannot go back
                setHasNavigatedAway(true);
            }
        }} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Summary</Text>
        <View style={{width: 24}} />{/* Placeholder for balance */}
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.deliveryDetailsContainer}>
            <Text style={styles.sectionTitle}>Delivery Details</Text>
            <View style={styles.detailItem}>
                <Ionicons name="call-outline" size={20} color="#FF6B6B" style={styles.detailIcon}/>
                <Text style={styles.detailText}>{phoneNumber || "Not Provided"}</Text>
            </View>
            <View style={styles.detailItem}>
                <Ionicons name="location-outline" size={20} color="#FF6B6B" style={styles.detailIcon}/>
                <Text style={styles.detailText} numberOfLines={3} ellipsizeMode="tail">{deliveryAddress || "Not Provided"}</Text>
            </View>
        </View>

        <Text style={[styles.sectionTitle, styles.itemsTitle]}>Your Items</Text>
        <FlatList
            data={cartItems}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false} // Disable FlatList scrolling as it's inside a ScrollView
        />
      </ScrollView>


      <LinearGradient
        colors={['#ffffff', '#ffffff', '#ffffffeb']} // [cite: 82]
        style={styles.footer}
      >
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total Payable</Text>
          <Text style={styles.totalPrice}>₹{totalPrice.toFixed(2)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.placeOrderButton, (isPlacingOrder || cartItems.length === 0 || hasNavigatedAway) && styles.disabledButton]}
          onPress={placeOrder} // [cite: 111]
          disabled={isPlacingOrder || cartItems.length === 0 || hasNavigatedAway} // [cite: 111]
        >
          {isPlacingOrder ? ( // [cite: 111]
            <ActivityIndicator color="#fff" size="small" /> // [cite: 112]
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#FFF" />
              <Text style={styles.placeOrderText}>Confirm Order</Text>
            </>
          )}
        </TouchableOpacity>
      </LinearGradient>
    </View> // [cite: 113]
  );
}

const styles = StyleSheet.create({ // [cite: 114]
  container: { // [cite: 114]
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  scrollContainer: {
    paddingBottom: 180,
    paddingHorizontal: 16,
  },
  header: { // [cite: 114]
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom:20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: { // [cite: 114]
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  deliveryDetailsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align items to top for potentially long addresses
    marginBottom: 10,
  },
  detailIcon: {
    marginRight: 10,
    marginTop: 2, // Align icon a bit better with text
  },
  detailText: {
    fontSize: 15,
    color: '#4F4F4F',
    flexShrink: 1,
  },
  itemsTitle: { // [cite: 115]
    marginTop: 0,
    paddingHorizontal: 0,
  },
  orderItemCard: { // [cite: 115]
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  orderItemImage: { // [cite: 115]
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16, // [cite: 116]
  },
  orderItemDetails: { // [cite: 116]
    flex: 1,
    justifyContent: 'center',
  },
  orderItemName: { // [cite: 116]
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 8,
  },
  priceRow: { // [cite: 116]
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  orderItemQuantity: { // [cite: 116]
    fontSize: 14,
    color: '#636E72',
  },
  orderItemPrice: { // [cite: 116]
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B6B',
  },
  itemPriceRow: { // [cite: 116]
    flexDirection: 'row', // [cite: 117]
    justifyContent: 'space-between', // [cite: 117]
  },
  unitPrice: { // [cite: 117]
    fontSize: 12,
    color: '#636E72',
  },
  footer: { // [cite: 117]
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24, // Increased padding
    paddingBottom: Platform.OS === 'ios' ? 34 : 24, // Adjust for home indicator on iOS
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
  },
  totalContainer: { // [cite: 117]
    flexDirection: 'row', // [cite: 118]
    justifyContent: 'space-between', // [cite: 118]
    marginBottom: 20, // [cite: 118]
  },
  totalLabel: { // [cite: 118]
    fontSize: 16, // Adjusted
    color: '#636E72',
    fontWeight: '600',
  },
  totalPrice: { // [cite: 118]
    fontSize: 20, // Adjusted
    fontWeight: '700', // Adjusted
    color: '#2D3436',
  },
  placeOrderButton: { // [cite: 118]
    backgroundColor: '#FF6B6B',
    paddingVertical: 18,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#FF6B6Baa', // Make it look disabled
  },
  placeOrderText: { // [cite: 119]
    color: '#FFFFFF', // [cite: 119]
    fontSize: 16, // [cite: 119]
    fontWeight: '700', // [cite: 119]
  },
  centered: { // [cite: 119]
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F8F8F8',
  },
  emptyIcon: { // [cite: 119]
    marginBottom: 16,
  },
  emptyTitle: { // [cite: 119]
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 8,
  },
  emptySubtitle: { // [cite: 119]
    fontSize: 16,
    color: '#636E72',
    textAlign: 'center',
    marginBottom: 24, // [cite: 120]
  },
});