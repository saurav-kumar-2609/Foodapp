// app/order-detail.tsx
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { db } from '../firebaseConfig';
import { Order } from './order-history'; // Assuming Order interface is exported from order-history.tsx

const statusColor: Record<string, string> = {
  Delivered: '#4CAF50',
  Pending: '#FF9800',
  Cancelled: '#9E9E9E',
  'In Progress': '#2196F3'
};

export default function OrderDetailScreen() {
  const params = useLocalSearchParams();
  const orderId = params.orderId as string;
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (orderId) {
      const fetchOrderDetails = async () => {
        setLoading(true);
        try {
          const orderDocRef = doc(db, 'orders', orderId);
          const orderDocSnap = await getDoc(orderDocRef);

          if (orderDocSnap.exists()) {
            setOrder({ id: orderDocSnap.id, ...orderDocSnap.data() } as Order);
          } else {
            setError('Order not found.');
          }
        } catch (e) {
          console.error("Error fetching order details:", e);
          setError('Failed to load order details.');
        } finally {
          setLoading(false);
        }
      };
      fetchOrderDetails();
    } else {
        setError('Order ID is missing.');
        setLoading(false);
    }
  }, [orderId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
         <TouchableOpacity onPress={() => router.back()} style={styles.backButtonHeader}>
            <Ionicons name="arrow-back" size={24} color="#2D3436" />
        </TouchableOpacity>
        <Ionicons name="alert-circle-outline" size={50} color="#D32F2F" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.goBackButton}>
            <Text style={styles.goBackButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!order) {
     return (
      <View style={styles.centered}>
        <Text>No order data available.</Text>
         <TouchableOpacity onPress={() => router.back()} style={styles.goBackButton}>
            <Text style={styles.goBackButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Order #{order.id.slice(0, 6).toUpperCase()}</Text>
            <View style={{width: 24}} />{/* Placeholder for balance */}
        </View>
        <ScrollView contentContainerStyle={styles.scrollContentContainer}>
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>Order Status</Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor[order.status] || '#757575' }]}>
                        <Text style={styles.statusText}>{order.status}</Text>
                    </View>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" style={styles.detailIcon} />
                    <Text style={styles.detailLabel}>Order Date:</Text>
                    <Text style={styles.detailValue}>
                    {order.orderDate?.toDate().toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                    </Text>
                </View>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Delivery Information</Text>
                <View style={styles.detailRow}>
                    <Ionicons name="call-outline" style={styles.detailIcon} />
                    <Text style={styles.detailLabel}>Phone:</Text>
                    <Text style={styles.detailValue}>{order.phoneNumber || 'N/A'}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="location-outline" style={styles.detailIcon} />
                    <Text style={styles.detailLabel}>Address:</Text>
                    <Text style={styles.detailValueMultiline}>{order.deliveryAddress || 'N/A'}</Text>
                </View>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Items Ordered ({order.items.length})</Text>
                {order.items.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                        <View style={styles.itemInfo}>
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
                        </View>
                        <Text style={styles.itemPrice}>₹{(item.price * item.quantity).toFixed(2)}</Text>
                    </View>
                ))}
            </View>

            <View style={[styles.card, styles.totalCard]}>
                <View style={styles.detailRow}>
                    <Text style={styles.totalLabel}>Subtotal</Text>
                    <Text style={styles.totalValue}>₹{order.totalPrice.toFixed(2)}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.totalLabel}>Delivery Fee</Text>
                    <Text style={styles.totalValue}>₹0.00</Text>{/* Placeholder */}
                </View>
                <View style={[styles.detailRow, styles.grandTotalRow]}>
                    <Text style={styles.grandTotalLabel}>Grand Total</Text>
                    <Text style={styles.grandTotalValue}>₹{order.totalPrice.toFixed(2)}</Text>
                </View>
            </View>
        </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FF6B6B',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  scrollContentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  backButtonHeader: { // For error screen
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    padding: 10,
    zIndex: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#616161',
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 20,
  },
  goBackButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  goBackButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 12,
  },
  statusBadge: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align items to the start for multiline text
    marginBottom: 10,
  },
  detailIcon: {
    fontSize: 18,
    color: '#FF6B6B',
    marginRight: 10,
    marginTop: 2, // Align icon with text
  },
  detailLabel: {
    fontSize: 15,
    color: '#636E72',
    fontWeight: '500',
    marginRight: 5,
  },
  detailValue: {
    fontSize: 15,
    color: '#2D3436',
    flexShrink: 1, // Allow text to shrink and wrap
  },
  detailValueMultiline: {
    fontSize: 15,
    color: '#2D3436',
    flex: 1, // Allow text to take remaining space and wrap
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333333',
  },
  itemQuantity: {
    fontSize: 13,
    color: '#757575',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3436',
  },
  totalCard: {
    marginTop: 8, // Reduced top margin as it's the last card
  },
  totalLabel: {
    fontSize: 15,
    color: '#636E72',
    fontWeight: '500',
    flex:1,
  },
  totalValue: {
    fontSize: 15,
    color: '#2D3436',
    fontWeight: '500',
    textAlign: 'right',
  },
  grandTotalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 10,
    marginTop: 5,
  },
  grandTotalLabel: {
    fontSize: 17,
    color: '#2D3436',
    fontWeight: '700',
    flex: 1,
  },
  grandTotalValue: {
    fontSize: 17,
    color: '#FF6B6B',
    fontWeight: '700',
    textAlign: 'right',
  },
});