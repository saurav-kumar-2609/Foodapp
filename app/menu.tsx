import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { collection, onSnapshot, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useCart } from '../context/CartContext';
import { db } from '../firebaseConfig';

interface MenuItem {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    price: number;
    category: string;
    rating: number;
    deliveryTime: string;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const LOGO_URI = "https://cdn-icons-png.flaticon.com/512/869/869636.png";

const categories = [
    { id: '0', name: 'All', icon: 'apps' },
    { id: '1', name: 'Salads', icon: 'leaf' },
    { id: '2', name: 'Burgers', icon: 'fast-food' },
    { id: '3', name: 'Pizzas', icon: 'pizza' },
     { id: '4', name: 'Desserts', icon: 'ice-cream' },
    { id: '5', name: 'Drinks', icon: 'beer' },
];

export default function MenuScreen() {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [filteredMenuItems, setFilteredMenuItems] = useState<MenuItem[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { addToCart, cartItems } = useCart();

    useEffect(() => {
        const q = query(collection(db, 'menuItems'));
        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const items: MenuItem[] = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    items.push({ 
                        id: doc.id, 
                        ...data,
                        rating: data.rating || 4.2,
                        deliveryTime: data.deliveryTime || '25-30 min'
                    } as MenuItem);
                });
                setMenuItems(items);
                setLoading(false);
            },
            (err) => {
                console.error("Error fetching menu items:", err);
                setError("Failed to load menu. Please try again later.");
                setLoading(false);
            }
        );
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        let filtered = menuItems;
        if (selectedCategory !== 'All') {
            filtered = filtered.filter(item => item.category === selectedCategory);
        }
        if (searchText) {
            const text = searchText.toLowerCase();
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(text) ||
                item.description.toLowerCase().includes(text)
            );
        }
        setFilteredMenuItems(filtered);
    }, [menuItems, selectedCategory, searchText]);

    const renderMenuItem = ({ item }: { item: MenuItem }) => (
        <View style={styles.card}>
            <Image 
                source={{ uri: item.imageUrl }} 
                style={styles.cardImage}
                resizeMode="cover"
            />
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.gradient}
            />
            
            <View style={styles.cardContent}>
                <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color="#FFD700" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                </View>
                
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDescription}>{item.description}</Text>
                
                <View style={styles.bottomRow}>
                    <Text style={styles.deliveryTime}>
                        <Ionicons name="time-outline" size={14} color="#FFF" /> {item.deliveryTime}
                    </Text>
                    <Text style={styles.price}>₹{item.price.toFixed(2)}</Text>
                </View>
            </View>
            
            <TouchableOpacity 
                style={styles.addButton}
                onPress={() => addToCart(item)}
            >
                <Ionicons name="add" size={24} color="#FFF" />
            </TouchableOpacity>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6B6B" />
                <Text style={styles.loadingText}>Loading delicious options...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Ionicons name="sad-outline" size={50} color="#FF6B6B" />
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#FF6B6B', '#FF4343']}
                style={styles.header}
            >
                <View style={styles.headerTop}>
                    <View style={styles.logoContainer}>
                        <Image 
                            source={{ uri: LOGO_URI }} 
                            style={styles.logo} 
                            resizeMode="contain"
                        />
                        <Text style={styles.title}>Good Food</Text>
                    </View>
                    
                    <Link href="/order-history" asChild>
                        <TouchableOpacity style={styles.historyButton}>
                            <Ionicons name="time" size={24} color="#FFF" />
                        </TouchableOpacity>
                    </Link>
                </View>

                <View style={styles.headerContent}>
                    <Text style={styles.subtitle}>What are you craving today?</Text>
                    
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search restaurants or dishes..."
                            placeholderTextColor="#888"
                            value={searchText}
                            onChangeText={setSearchText}
                        />
                    </View>
                </View>
            </LinearGradient>

            {/* Category Tabs */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryContainer}
            >
                {categories.map((category) => (
                    <TouchableOpacity
                        key={category.id}
                        style={[
                            styles.categoryCard,
                            selectedCategory === category.name && styles.selectedCategoryCard
                        ]}
                        onPress={() => setSelectedCategory(category.name)}
                    >
                        <Ionicons 
                            name={category.icon as any} 
                            size={24} 
                            color={selectedCategory === category.name ? '#FF6B6B' : '#666'} 
                        />
                        <Text style={[
                            styles.categoryText,
                            selectedCategory === category.name && styles.selectedCategoryText
                        ]}>
                            {category.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Increased spacing below categories */}
            <View style={styles.categorySpacing} />

            {/* Menu List */}
            <FlatList
                data={filteredMenuItems}
                renderItem={renderMenuItem}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="fast-food-outline" size={60} color="#FF6B6B" />
                        <Text style={styles.emptyText}>No items found matching your search</Text>
                    </View>
                }
            />

            {/* Cart FAB */}
            {cartItems.length > 0 && (
                <Link href="/cart" asChild>
                    <TouchableOpacity style={styles.cartFab}>
                        <Ionicons name="cart" size={28} color="#FFF" />
                        <View style={styles.cartBadge}>
                            <Text style={styles.cartCount}>
                                {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </Link>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
    },
    header: {
        paddingTop: Platform.select({ ios: 50, android: 50 }),
        paddingBottom: 30,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        width: 40,
        height: 40,
        marginRight: 12,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFF',
        fontFamily: 'Helvetica Neue',
    },
    historyButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    headerContent: {
        paddingHorizontal: 20,
    },
    subtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 20,
    },
    searchContainer: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        paddingHorizontal: 15,
        height: 50,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 3,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333',
        marginLeft: 10,
    },
    searchIcon: {
        marginRight: 5,
    },
    categoryContainer: {
        paddingTop:10,
        paddingHorizontal: 20,
        backgroundColor: '#FFF',
        paddingBottom: 20, // Added bottom padding
    },
    categorySpacing: {
        height: 20, // Increased spacing
        backgroundColor: '#FFF',
    },
    categoryCard: {
        width: 80,
        height: 80,
        backgroundColor: '#FFF',
        borderRadius: 15,
        marginHorizontal: 8,
        marginBottom:30, // Added bottom margin
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    selectedCategoryCard: {
        borderColor: '#FF6B6B',
        backgroundColor: '#FFF5F5',
    },
    categoryText: {
        marginTop: 8,
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
    },
    selectedCategoryText: {
        color: '#FF6B6B',
    },
    card: {
        width: CARD_WIDTH,
        backgroundColor: '#FFF',
        borderRadius: 15,
        marginHorizontal: 20,
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        overflow: 'hidden',
    },
    cardImage: {
        width: '100%',
        height: 180,
    },
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '60%',
    },
    cardContent: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 15,
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 10,
        paddingVertical: 4,
        paddingHorizontal: 8,
        alignSelf: 'flex-start',
    },
    ratingText: {
        color: '#FFF',
        fontSize: 12,
        marginLeft: 4,
        fontWeight: '700',
    },
    itemName: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFF',
        marginTop: 8,
    },
    itemDescription: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginTop: 4,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
    },
    deliveryTime: {
        color: '#FFF',
        fontSize: 12,
        fontWeight: '600',
    },
    price: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '800',
    },
    addButton: {
        position: 'absolute',
        top: 15,
        right: 15,
        backgroundColor: '#FF6B6B',
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
    },
    cartFab: {
        position: 'absolute',
        bottom: 30,
        right: 20,
        backgroundColor: '#FF6B6B',
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
    },
    cartBadge: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#2D3436',
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cartCount: {
        color: '#FFF',
        fontWeight: '800',
        fontSize: 12,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
    },
    loadingText: {
        marginTop: 20,
        fontSize: 16,
        color: '#636E72',
    },
    errorText: {
        fontSize: 16,
        color: '#2D3436',
        marginTop: 20,
        textAlign: 'center',
        paddingHorizontal: 30,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 50,
    },
    emptyText: {
        fontSize: 18,
        color: '#636E72',
        marginTop: 15,
        textAlign: 'center',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
    },
    listContent: {
        paddingTop: 20,
        paddingBottom: 100,
    },
});