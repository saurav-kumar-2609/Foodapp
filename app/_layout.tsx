// app/_layout.tsx
import { Stack } from 'expo-router';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CartProvider } from '../context/CartContext'; // Assuming CartContext.tsx is in ../context/

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CartProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="menu" />
          <Stack.Screen name="cart" />
          <Stack.Screen name="delivery-details" />
          <Stack.Screen name="order-summary" />
          <Stack.Screen name="order-history" />
          <Stack.Screen name="order-detail" />
        </Stack>
      </CartProvider>
    </GestureHandlerRootView>
  );
}