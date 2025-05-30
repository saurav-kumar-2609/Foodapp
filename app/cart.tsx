// app/cart.tsx
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native'; // [cite: 72]
import { useCart } from '../context/CartContext'; // [cite: 72]

interface CartItem { // [cite: 73]
  id: string; // [cite: 73]
  name: string; // [cite: 73]
  imageUrl: string; // [cite: 73]
  price: number; // [cite: 73]
  quantity: number; // [cite: 73]
}

export default function CartScreen() {
  const { cartItems, updateQuantity, removeFromCart, totalPrice } = useCart();
  const router = useRouter(); // [cite: 75]

  const renderCartItem = ({ item }: { item: CartItem }) => ( // [cite: 75]
    <View style={styles.cartItemCard}>
      <Image source={{ uri: item.imageUrl }} style={styles.cartItemImage} />
      <View style={styles.cartItemDetails}>
        <Text style={styles.cartItemName}>{item.name}</Text>
        <Text style={styles.cartItemPrice}>₹{item.price.toFixed(2)}</Text>

        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity - 1)} // [cite: 76]
            disabled={item.quantity === 1}
          >
            <Ionicons name="remove" size={18} color={item.quantity === 1 ? '#FF6B6B50' : '#FF6B6B'} />
          </TouchableOpacity>

          <Text style={styles.quantityText}>{item.quantity}</Text>

          <TouchableOpacity
            style={styles.quantityButton} // [cite: 77]
            onPress={() => updateQuantity(item.id, item.quantity + 1)} // [cite: 77]
          >
            <Ionicons name="add" size={18} color="#FF6B6B" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeFromCart(item.id)} // [cite: 78]
          >
            <Text style={styles.removeButtonText}>REMOVE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (cartItems.length === 0) { // [cite: 79]
    return (
      <View style={styles.centered}>
        <Ionicons name="cart-outline" size={80} color="#FF6B6B" style={styles.emptyCartIcon} />
        <Text style={styles.emptyCartText}>Your cart is empty!</Text>
        <Text style={styles.emptyCartSubtext}>Looks like you haven't added anything to your cart yet.</Text>
        <Link href="/menu" asChild>
          <TouchableOpacity style={styles.browseMenuButton}>
            <Text style={styles.browseMenuButtonText}>Browse Menu</Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  } // [cite: 80]

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#2D3436" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Cart</Text>
      </View>
      <FlatList
        data={cartItems}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent} // [cite: 82]
      />

      <LinearGradient
        colors={['#ffffff', '#ffffff', '#ffffffeb']}
        style={styles.summaryContainer}
      >
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalPrice}>₹{totalPrice.toFixed(2)}</Text>
        </View>

        {/* Updated Link to navigate to delivery-details */}
        <Link href={{ pathname: "/delivery-details" }} asChild>
          <TouchableOpacity style={styles.checkoutButton}>
            <Text style={styles.checkoutButtonText}>ENTER DELIVERY DETAILS</Text>
          </TouchableOpacity>
        </Link>
      </LinearGradient>
    </View> // [cite: 84]
  );
}

const styles = StyleSheet.create({ // [cite: 84]
  container: { // [cite: 84]
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    marginRight: 10,
    padding: 5, // [cite: 85]
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2D3436',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8F8F8',
  },
  emptyCartIcon: {
    marginBottom: 20,
  },
  emptyCartText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: 8,
  },
  emptyCartSubtext: { // [cite: 86]
    fontSize: 16, // [cite: 86]
    color: '#636E72', // [cite: 86]
    textAlign: 'center', // [cite: 86]
    marginBottom: 30, // [cite: 86]
    lineHeight: 24, // [cite: 86]
  },
  browseMenuButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 3,
    shadowColor: '#FF6B6B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  browseMenuButtonText: {
    color: '#FFFFFF', // [cite: 87]
    fontSize: 16, // [cite: 87]
    fontWeight: '700', // [cite: 87]
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    paddingTop: 8,
  },
  cartItemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, // [cite: 88]
    shadowRadius: 4, // [cite: 88]
    elevation: 2, // [cite: 88]
  },
  cartItemImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
    marginRight: 16,
  },
  cartItemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cartItemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 4,
  },
  cartItemPrice: { // [cite: 89]
    fontSize: 17, // [cite: 89]
    color: '#FF6B6B', // [cite: 89]
    fontWeight: '700', // [cite: 89]
    marginBottom: 10, // [cite: 89]
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  quantityButton: {
    backgroundColor: '#FFF5F5',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6B6B20',
  }, // [cite: 90]
  quantityText: { // [cite: 90]
    fontSize: 17, // [cite: 90]
    fontWeight: '700', // [cite: 90]
    marginHorizontal: 15, // [cite: 90]
    color: '#2D3436', // [cite: 90]
  },
  removeButton: {
    marginLeft: 'auto',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#FF6B6B15',
  },
  removeButtonText: {
    color: '#FF6B6B',
    fontSize: 13,
    fontWeight: '700',
  }, // [cite: 91]
  summaryContainer: { // [cite: 91]
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    backgroundColor: '#FFFFFF', // Ensure background is solid before gradient might kick in for some reason
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', // [cite: 92]
    alignItems: 'center', // [cite: 92]
    marginBottom: 20, // [cite: 92]
  },
  totalLabel: {
    fontSize: 18,
    color: '#636E72',
    fontWeight: '600',
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2D3436',
  },
  checkoutButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#FF6B6B', // [cite: 93]
    shadowOffset: { width: 0, height: 4 }, // [cite: 93]
    shadowOpacity: 0.3, // [cite: 93]
    shadowRadius: 5, // [cite: 93]
  },
  checkoutButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.7,
  },
});