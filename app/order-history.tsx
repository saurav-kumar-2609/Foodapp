// app/order-history.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, deleteDoc, doc, onSnapshot, query, Timestamp, where } from 'firebase/firestore'; // [cite: 121]
import React, { useEffect, useState } from 'react'; // [cite: 121]
import {
    ActivityIndicator, // [cite: 122]
    Alert, // [cite: 122]
    FlatList, Platform, // [cite: 122]
    StyleSheet, // [cite: 122]
    Text, // [cite: 122]
    TouchableOpacity, // [cite: 122]
    View // [cite: 122]
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler'; // [cite: 123]
import { db } from '../firebaseConfig'; // [cite: 123]

interface OrderItem { // [cite: 123]
  itemId: string; // [cite: 123]
  name: string; // [cite: 124]
  price: number; // [cite: 124]
  quantity: number; // [cite: 124]
}

type OrderStatus = 'Delivered' | 'Pending' | 'Cancelled' | 'In Progress'; // [cite: 124]

export interface Order { // Exporting for use in order-detail if needed // [cite: 125]
  id: string; // [cite: 125]
  userId: string; // [cite: 125]
  items: OrderItem[]; // [cite: 125]
  totalPrice: number; // [cite: 125]
  orderDate: Timestamp; // Use Firebase Timestamp for proper typing // [cite: 125]
  status: OrderStatus; // [cite: 125]
  phoneNumber?: string; // Added
  deliveryAddress?: string; // Added
}

const statusColor = { // [cite: 126]
  Delivered: '#4CAF50', // [cite: 126]
  Pending: '#FF9800', // [cite: 126]
  Cancelled: '#9E9E9E', // [cite: 126]
  'In Progress': '#2196F3' // [cite: 126]
} as const;

export default function OrderHistoryScreen() {
  const [orders, setOrders] = useState<Order[]>([]); // [cite: 127]
  const [loading, setLoading] = useState(true); // [cite: 127]
  const [error, setError] = useState<string | null>(null); // [cite: 128]
  const userId = "demoUser123"; // This should ideally come from an auth context // [cite: 128]
  const router = useRouter();

  useEffect(() => { // [cite: 129]
    const q = query(collection(db, 'orders'), where('userId', '==', userId)); // [cite: 129]
    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const fetchedOrders = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id, // [cite: 129]
            ...data, // [cite: 129]
            status: data.status as OrderStatus, // [cite: 129]
            orderDate: data.orderDate as Timestamp, // Ensure type
            phoneNumber: data.phoneNumber, // Fetch phoneNumber
            deliveryAddress: data.deliveryAddress, // Fetch deliveryAddress
          } as Order;
        });

        fetchedOrders.sort((a, b) => (b.orderDate?.toMillis() || 0) - (a.orderDate?.toMillis() || 0)); // [cite: 130]
        setOrders(fetchedOrders); // [cite: 130]
        setLoading(false); // [cite: 130]
      },
      (err) => { // [cite: 130]
        console.error("Error fetching orders:", err); // [cite: 130]
        setError("Failed to load order history"); // [cite: 130]
        setLoading(false); // [cite: 130]
      }
    );
    return () => unsubscribe(); // [cite: 130]
  }, [userId]);

  const handleDeleteOrder = async (orderId: string) => { // [cite: 131]
    try {
      await deleteDoc(doc(db, 'orders', orderId)); // [cite: 131]
      setOrders(prev => prev.filter(order => order.id !== orderId)); // [cite: 132]
    } catch (error) {
      Alert.alert("Error", "Failed to delete order"); // [cite: 132]
    } // [cite: 133]
  };

  const renderRightActions = (orderId: string) => ( // [cite: 133]
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => Alert.alert( // [cite: 133]
        "Delete Order", // [cite: 133]
        "Are you sure you want to delete this order?", // [cite: 133]
        [ // [cite: 133]
          { text: "Cancel", style: "cancel" }, // [cite: 133]
          { text: "Delete", onPress: () => handleDeleteOrder(orderId) } // [cite: 133]
        ]
      )}
    >
      <Ionicons name="trash-outline" size={20} color="white" />
    </TouchableOpacity> // [cite: 134]
  );

  const renderOrderItem = ({ item }: { item: Order }) => ( // [cite: 135]
    <Swipeable
      renderRightActions={() => renderRightActions(item.id)} // [cite: 135]
      containerStyle={styles.swipeContainer} // [cite: 135]
    >
        <TouchableOpacity onPress={() => router.push({ pathname: `/order-detail`, params: { orderId: item.id } })}>
            <View style={styles.orderCard}>
                <View style={styles.orderHeader}>
                <Text style={styles.orderId}>Order #{item.id.slice(0,6).toUpperCase()}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColor[item.status] || statusColor.Pending }]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
                </View>

                <Text style={styles.orderDate}>
                {item.orderDate?.toDate().toLocaleDateString('en-IN', { // [cite: 136]
                    day: 'numeric', // [cite: 136]
                    month: 'short', // [cite: 136]
                    year: 'numeric', // [cite: 136]
                    hour: '2-digit', // [cite: 136]
                    minute: '2-digit' // [cite: 136]
                })}
                </Text>

                <View style={styles.itemsPreviewContainer}>
                    <Text style={styles.itemPreviewText}>
                        {item.items.slice(0, 2).map(i => i.name).join(', ')}
                        {item.items.length > 2 ? ` and ${item.items.length - 2} more...` : ''}
                    </Text>
                </View>

                <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total:</Text>
                <Text style={styles.totalPrice}>₹{item.totalPrice.toFixed(2)}</Text>
                </View>
            </View>
        </TouchableOpacity>
    </Swipeable> // [cite: 139]
  );


  if (loading) { // [cite: 139]
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading your orders...</Text>
      </View>
    );
  } // [cite: 139]

  if (error) { // [cite: 140]
    return (
      <View style={styles.centered}>
        <Ionicons name="warning-outline" size={40} color="#FF9800" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  } // [cite: 140]

  if (orders.length === 0) { // [cite: 141]
    return (
      <View style={styles.container}>
         <View style={styles.header}>
            <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/menu')} style={styles.backButtonAbsolute}>
                <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Order History</Text>
            <View style={{width:24}} />{/* Placeholder */}
        </View>
        <View style={styles.centered}>
            <Ionicons name="receipt-outline" size={60} color="#9E9E9E" />
            <Text style={styles.emptyTitle}>No orders found</Text>
            <Text style={styles.emptySubtitle}>Your completed orders will appear here</Text>
        </View>
      </View>
    );
  } // [cite: 142]

  return (
    <View style={styles.container}>
      <View style={styles.header}>
         <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/menu')} style={styles.backButtonAbsolute}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order History</Text>
        <View style={{width:24}} />{/* Placeholder */}
      </View>

      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
      />
    </View> // [cite: 143]
  );
}

const styles = StyleSheet.create({ // [cite: 143]
  container: { // [cite: 143]
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: { // [cite: 143]
    backgroundColor: '#FF6B6B', // Theme color
    paddingTop: Platform.OS === 'ios' ? 50 : 50,
    paddingBottom:20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { // [cite: 143]
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  backButtonAbsolute: {
    padding: 5,
  },
  centered: { // [cite: 143]
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F5F5F5', // Match container background
  },
  loadingText: { // [cite: 143]
    marginTop: 16, // [cite: 144]
    fontSize: 16, // [cite: 144]
    color: '#616161', // [cite: 144]
  },
  errorText: { // [cite: 144]
    marginTop: 16, // [cite: 144]
    fontSize: 16, // [cite: 144]
    color: '#D32F2F', // [cite: 144]
    textAlign: 'center', // [cite: 144]
  },
  emptyTitle: { // [cite: 144]
    fontSize: 20,
    fontWeight: '600',
    color: '#424242',
    marginTop: 16,
  },
  emptySubtitle: { // [cite: 144]
    fontSize: 14,
    color: '#757575',
    marginTop: 8,
    textAlign: 'center',
  },
  listContent: { // [cite: 144]
    padding: 16,
  },
  swipeContainer: { // [cite: 145]
    marginBottom: 12, // [cite: 145] // Increased margin
    borderRadius: 12, // [cite: 145] // Increased radius
    overflow: 'hidden', // [cite: 145]
    elevation: 2, // Added elevation to swipe container
    backgroundColor: 'white', // Added background to swipe container
  },
  orderCard: { // [cite: 145]
    backgroundColor: 'white',
    borderRadius: 12, // Match swipe container if not set on swipe directly
    padding: 16,
    // Removed shadow from here as it's on swipeContainer now
  },
  orderHeader: { // [cite: 145]
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: { // [cite: 145]
    fontSize: 14, // [cite: 146]
    fontWeight: '600', // [cite: 146] // Bolder
    color: '#2D3436', // [cite: 146] // Darker
  },
  statusBadge: { // [cite: 146]
    paddingVertical: 5, // Adjusted padding
    paddingHorizontal: 10, // Adjusted padding
    borderRadius: 12,
  },
  statusText: { // [cite: 146]
    fontSize: 12,
    fontWeight: '600', // Bolder
    color: 'white',
  },
  orderDate: { // [cite: 146]
    fontSize: 12,
    color: '#757575',
    marginBottom: 12,
  },
  itemsPreviewContainer: { // New style for item previews
    marginBottom: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#EEEEEE',
  },
  itemPreviewText: {
    fontSize: 14,
    color: '#636E72',
    fontStyle: 'italic',
  },
  itemsContainer: { // [cite: 137] // Kept if needed by order-detail
    marginBottom: 12, // [cite: 137]
  },
  itemRow: { // [cite: 137]
    flexDirection: 'row', // [cite: 137]
    justifyContent: 'space-between', // [cite: 137]
    marginBottom: 6, // [cite: 147]
  },
  itemName: { // [cite: 147]
    fontSize: 14, // [cite: 147]
    color: '#424242', // [cite: 147]
    flex: 2, // [cite: 147]
  },
  itemDetails: { // [cite: 147]
    fontSize: 14, // [cite: 147]
    color: '#757575', // [cite: 147]
    flex: 1, // [cite: 147]
    textAlign: 'right', // [cite: 147]
  },
  totalRow: { // [cite: 138]
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 12,
    marginTop: 0, // Adjusted as itemsPreviewContainer now has margin
  },
  totalLabel: { // [cite: 138]
    fontSize: 15,
    fontWeight: '500',
    color: '#424242', // [cite: 148]
  },
  totalPrice: { // [cite: 148]
    fontSize: 15,
    fontWeight: '700', // Bolder
    color: '#FF6B6B', // Theme color
  },
  deleteButton: { // [cite: 148]
    backgroundColor: '#E74C3C', // Changed color for delete
    justifyContent: 'center',
    alignItems: 'center',
    width: 75, // Slightly wider
    height: '100%',
  },
});