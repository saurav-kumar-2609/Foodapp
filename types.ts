// types.ts

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category?: string; // Optional category field
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id?: string; // Firebase will generate this ID
  items: CartItem[];
  totalPrice: number;
  orderDate: Date;
  status: 'pending' | 'completed' | 'cancelled'; // Current status of the order
}