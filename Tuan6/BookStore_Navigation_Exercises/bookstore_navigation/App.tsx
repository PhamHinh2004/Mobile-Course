import 'react-native-gesture-handler';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NavigationContainer } from '@react-navigation/native';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// ============================================================
// 0. DATA MẪU + KIỂU DỮ LIỆU
// ============================================================

type PhoneColor = {
  name: string;
  hex: string;
};

type Phone = {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  colors: PhoneColor[];
};

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
};

const DEFAULT_COLORS: PhoneColor[] = [
  { name: 'Đen', hex: '#171923' },
  { name: 'Đỏ', hex: '#E11D2E' },
  { name: 'Xanh', hex: '#2563EB' },
];

const LOCAL_PHONES: Phone[] = [
  {
    id: 'phone-1',
    name: 'VPhone X Pro',
    price: 1790000,
    image: 'https://images.unsplash.com/photo-1511709263669-2f1d4b8f9f2b?w=700',
    description: 'Màn hình sắc nét, thiết kế gọn nhẹ, phù hợp cho nhu cầu sử dụng hằng ngày.',
    colors: DEFAULT_COLORS,
  },
  {
    id: 'phone-2',
    name: 'VPhone Y Plus',
    price: 2190000,
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=700',
    description: 'Thiết kế hiện đại, pin bền và camera đáp ứng tốt nhu cầu chụp ảnh cơ bản.',
    colors: [
      { name: 'Đen', hex: '#171923' },
      { name: 'Bạc', hex: '#D9DCE3' },
      { name: 'Tím', hex: '#8B5CF6' },
    ],
  },
  {
    id: 'phone-3',
    name: 'VPhone Z Lite',
    price: 1490000,
    image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=700',
    description: 'Một lựa chọn tiết kiệm với kiểu dáng trẻ trung và hiệu năng ổn định.',
    colors: DEFAULT_COLORS,
  },
  {
    id: 'phone-4',
    name: 'VPhone A Max',
    price: 2690000,
    image: 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=700',
    description: 'Màn hình lớn, thiết kế nổi bật và không gian lưu trữ rộng rãi.',
    colors: [
      { name: 'Trắng', hex: '#F3F4F6' },
      { name: 'Đen', hex: '#171923' },
      { name: 'Hồng', hex: '#F9A8D4' },
    ],
  },
];

const PRODUCTS: Product[] = [
  {
    id: 'p-1',
    name: 'Clean Code',
    price: 250000,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=700',
    description: 'Sách về cách viết mã nguồn rõ ràng, dễ đọc và dễ bảo trì.',
  },
  {
    id: 'p-2',
    name: 'The Pragmatic Programmer',
    price: 320000,
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=700',
    description: 'Những kinh nghiệm thực tế để trở thành lập trình viên hiệu quả hơn.',
  },
  {
    id: 'p-3',
    name: 'Design Patterns',
    price: 280000,
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=700',
    description: 'Giới thiệu các mẫu thiết kế phổ biến trong phát triển phần mềm.',
  },
  {
    id: 'p-4',
    name: 'You Don’t Know JS',
    price: 210000,
    image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=700',
    description: 'Tìm hiểu sâu hơn về JavaScript qua các ví dụ thực hành.',
  },
];

const money = (value: number) => `${value.toLocaleString('vi-VN')} đ`;

// BÀI 2: Thay chuỗi rỗng bằng endpoint Collection /phones của MockAPI.
// Ví dụ: https://<project-id>.mockapi.io/api/v1/phones
const MOCKAPI_URL = '';

// ============================================================
// 1. BÀI 1 + BÀI 2: SELECT PHONE + KẾT NỐI MOCKAPI
// ============================================================

type SelectPhoneStackParamList = {
  PhoneList: { selectedSummary?: string } | undefined;
  PhoneDetail: { phone: Phone };
  PhoneConfirmation: { phone: Phone; color: PhoneColor };
};

const SelectPhoneStack = createNativeStackNavigator<SelectPhoneStackParamList>();

type PhoneListProps = NativeStackScreenProps<SelectPhoneStackParamList, 'PhoneList'>;
type PhoneDetailProps = NativeStackScreenProps<SelectPhoneStackParamList, 'PhoneDetail'>;
type PhoneConfirmationProps = NativeStackScreenProps<SelectPhoneStackParamList, 'PhoneConfirmation'>;

function PhoneListScreen({ navigation, route }: PhoneListProps) {
  const [phones, setPhones] = useState<Phone[]>(LOCAL_PHONES);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const loadPhones = async () => {
    // Khi chưa cấu hình MockAPI, dùng dữ liệu local để vẫn chạy được bài 1.
    if (!MOCKAPI_URL.trim()) {
      setPhones(LOCAL_PHONES);
      setErrorMessage('Chưa cấu hình MOCKAPI_URL — đang hiển thị dữ liệu mẫu local.');
      return;
    }

    try {
      setLoading(true);
      setErrorMessage('');

      const response = await fetch(MOCKAPI_URL);
      if (!response.ok) {
        throw new Error(`API trả về HTTP ${response.status}`);
      }

      const result = (await response.json()) as Array<{
        id: string | number;
        name: string;
        price: number;
        image: string;
        description?: string;
      }>;

      const mappedPhones: Phone[] = result.map((item) => ({
        id: String(item.id),
        name: item.name,
        price: Number(item.price),
        image: item.image,
        description: item.description ?? 'Chưa có mô tả cho sản phẩm này.',
        colors: DEFAULT_COLORS,
      }));

      setPhones(mappedPhones);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Không thể tải dữ liệu điện thoại.';
      setErrorMessage(message);
      // Giữ dữ liệu mẫu nếu API chưa hoạt động để người học vẫn thực hành được.
      setPhones(LOCAL_PHONES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPhones();
  }, []);

  const renderPhone = ({ item }: { item: Phone }) => (
    <Pressable
      style={styles.phoneCard}
      onPress={() => navigation.navigate('PhoneDetail', { phone: item })}
    >
      <Image source={{ uri: item.image }} style={styles.phoneImage} resizeMode="contain" />
      <View style={styles.flexOne}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.mutedText}>★★★★★  (Đánh giá 5.0)</Text>
        <Text style={styles.priceText}>{money(item.price)}</Text>
        <Text style={styles.linkText}>Xem chi tiết và chọn màu ›</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.pageIntro}>
        <Text style={styles.pageTitle}>Chọn điện thoại</Text>
        <Text style={styles.mutedText}>Bài 1: Chạm vào một sản phẩm để chọn màu.</Text>
        {route.params?.selectedSummary ? (
          <Text style={styles.returnedParam}>Lựa chọn vừa nhận từ màn hình trước: {route.params.selectedSummary}</Text>
        ) : null}
      </View>

      {errorMessage ? <Text style={styles.noticeText}>{errorMessage}</Text> : null}

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
      ) : (
        <FlatList
          data={phones}
          keyExtractor={(item) => item.id}
          renderItem={renderPhone}
          contentContainerStyle={styles.listContent}
          refreshing={loading}
          onRefresh={loadPhones}
          ListEmptyComponent={<Text style={styles.emptyText}>Chưa có sản phẩm.</Text>}
        />
      )}

      <Pressable style={styles.outlineButton} onPress={loadPhones}>
        <Text style={styles.outlineButtonText}>Tải lại danh sách</Text>
      </Pressable>
    </View>
  );
}

function PhoneDetailScreen({ route, navigation }: PhoneDetailProps) {
  const { phone } = route.params;
  const [selectedColor, setSelectedColor] = useState<PhoneColor>(phone.colors[0] ?? DEFAULT_COLORS[0]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.detailContent}>
      <Image source={{ uri: phone.image }} style={styles.phoneHeroImage} resizeMode="contain" />
      <Text style={styles.pageTitle}>{phone.name}</Text>
      <Text style={styles.priceText}>{money(phone.price)}</Text>
      <Text style={styles.bodyText}>{phone.description}</Text>

      <Text style={styles.sectionTitle}>Chọn một màu bên dưới:</Text>
      <View style={styles.colorList}>
        {phone.colors.map((color) => {
          const isSelected = selectedColor.name === color.name;
          return (
            <Pressable
              key={color.name}
              onPress={() => setSelectedColor(color)}
              style={styles.colorOption}
            >
              <View
                style={[
                  styles.colorCircle,
                  { backgroundColor: color.hex },
                  isSelected && styles.colorCircleSelected,
                ]}
              />
              <Text style={isSelected ? styles.selectedText : styles.bodyText}>{color.name}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.selectedColorText}>Màu đang chọn: {selectedColor.name}</Text>
      <Pressable
        style={styles.primaryButton}
        onPress={() => navigation.navigate('PhoneConfirmation', { phone, color: selectedColor })}
      >
        <Text style={styles.primaryButtonText}>CHỌN MUA</Text>
      </Pressable>
    </ScrollView>
  );
}

function PhoneConfirmationScreen({ route, navigation }: PhoneConfirmationProps) {
  const { phone, color } = route.params;
  return (
    <View style={[styles.screen, styles.centerContent]}>
      <Text style={styles.successIcon}>✓</Text>
      <Text style={styles.pageTitle}>Bạn đã chọn sản phẩm</Text>
      <Image source={{ uri: phone.image }} style={styles.confirmImage} resizeMode="contain" />
      <Text style={styles.cardTitle}>{phone.name}</Text>
      <Text style={styles.bodyText}>Màu: {color.name}</Text>
      <View style={[styles.colorCircle, { backgroundColor: color.hex }]} />
      <Text style={styles.priceText}>{money(phone.price)}</Text>
      <Pressable
        style={styles.primaryButton}
        onPress={() => navigation.popTo('PhoneList', { selectedSummary: `${phone.name} - màu ${color.name}` })}
      >
        <Text style={styles.primaryButtonText}>GỬI LỰA CHỌN VỀ MÀN HÌNH TRƯỚC</Text>
      </Pressable>
    </View>
  );
}

function SelectPhoneNavigator() {
  return (
    <SelectPhoneStack.Navigator>
      <SelectPhoneStack.Screen name="PhoneList" component={PhoneListScreen} options={{ title: 'Select Phone' }} />
      <SelectPhoneStack.Screen name="PhoneDetail" component={PhoneDetailScreen} options={{ title: 'Thông tin điện thoại' }} />
      <SelectPhoneStack.Screen name="PhoneConfirmation" component={PhoneConfirmationScreen} options={{ title: 'Xác nhận lựa chọn' }} />
    </SelectPhoneStack.Navigator>
  );
}

// ============================================================
// 2. BÀI 3: BOTTOM TAB NAVIGATION (HOME / SEARCH / PROFILE)
// ============================================================

type BasicTabParamList = {
  Home: undefined;
  Search: undefined;
  Profile: undefined;
};

const BasicTab = createBottomTabNavigator<BasicTabParamList>();

function HomeScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.pageIntro}>
        <Text style={styles.pageTitle}>BookStore</Text>
        <Text style={styles.mutedText}>Home: danh sách sản phẩm đơn giản.</Text>
      </View>
      <FlatList
        data={PRODUCTS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.simpleProductRow}>
            <Image source={{ uri: item.image }} style={styles.smallBookImage} />
            <View style={styles.flexOne}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.priceText}>{money(item.price)}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

function SearchScreen() {
  const [keyword, setKeyword] = useState('');
  const results = PRODUCTS.filter((item) => item.name.toLowerCase().includes(keyword.toLowerCase()));

  return (
    <View style={styles.screen}>
      <View style={styles.pageIntro}>
        <Text style={styles.pageTitle}>Search</Text>
        <Text style={styles.mutedText}>Bài 3: nhập từ khóa để tìm sách.</Text>
      </View>
      <TextInput
        value={keyword}
        onChangeText={setKeyword}
        placeholder="Nhập tên sách..."
        style={styles.input}
      />
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.simpleProductRow}>
            <Image source={{ uri: item.image }} style={styles.smallBookImage} />
            <View style={styles.flexOne}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.priceText}>{money(item.price)}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Không tìm thấy sản phẩm phù hợp.</Text>}
      />
    </View>
  );
}

function ProfileScreen() {
  return (
    <View style={[styles.screen, styles.centerContent]}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>A</Text>
      </View>
      <Text style={styles.pageTitle}>Nguyễn Văn A</Text>
      <Text style={styles.bodyText}>user@bookstore.com</Text>
      <Text style={styles.mutedText}>Profile: thông tin người dùng đơn giản.</Text>
    </View>
  );
}

function BasicBottomTabs() {
  return (
    <BasicTab.Navigator
      screenOptions={({ route }) => ({
        headerTitle: 'BookStore',
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#7B8494',
        tabBarIcon: ({ color, size }) => {
          const iconName =
            route.name === 'Home' ? 'home-outline' :
            route.name === 'Search' ? 'search-outline' : 'person-circle-outline';
          return <Ionicons name={iconName} color={color} size={size} />;
        },
      })}
    >
      <BasicTab.Screen name="Home" component={HomeScreen} options={{ title: 'Trang chủ' }} />
      <BasicTab.Screen name="Search" component={SearchScreen} options={{ title: 'Tìm kiếm' }} />
      <BasicTab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Tài khoản' }} />
    </BasicTab.Navigator>
  );
}

// ============================================================
// 3. BÀI 4: STACK + TAB + PASSING PARAMS + FAVORITES
// ============================================================

type ProductTabParamList = {
  Products: undefined;
  Favorites: undefined;
};

type ProductStackParamList = {
  ProductTabs: NavigatorScreenParams<ProductTabParamList> | undefined;
  ProductDetails: { productId: string };
};

const ProductTab = createBottomTabNavigator<ProductTabParamList>();
const ProductStack = createNativeStackNavigator<ProductStackParamList>();

type FavoriteContextValue = {
  favoriteIds: string[];
  toggleFavorite: (id: string) => void;
};

const FavoriteContext = createContext<FavoriteContextValue | null>(null);

function useFavorites() {
  const value = useContext(FavoriteContext);
  if (!value) {
    throw new Error('useFavorites phải được dùng bên trong FavoriteContext.Provider');
  }
  return value;
}

type ProductListScreenProps = CompositeScreenProps<
  BottomTabScreenProps<ProductTabParamList, 'Products'>,
  NativeStackScreenProps<ProductStackParamList, 'ProductTabs'>
>;

type FavoritesScreenProps = CompositeScreenProps<
  BottomTabScreenProps<ProductTabParamList, 'Favorites'>,
  NativeStackScreenProps<ProductStackParamList, 'ProductTabs'>
>;

function ProductRow({ product, onOpen }: { product: Product; onOpen: () => void }) {
  const { favoriteIds, toggleFavorite } = useFavorites();
  const isFavorite = favoriteIds.includes(product.id);

  return (
    <View style={styles.productRowCard}>
      <Pressable style={styles.productRowMain} onPress={onOpen}>
        <Image source={{ uri: product.image }} style={styles.bookThumb} />
        <View style={styles.flexOne}>
          <Text style={styles.cardTitle}>{product.name}</Text>
          <Text style={styles.priceText}>{money(product.price)}</Text>
          <Text style={styles.linkText}>Xem chi tiết ›</Text>
        </View>
      </Pressable>
      <Pressable onPress={() => toggleFavorite(product.id)} style={styles.favoriteButton}>
        <Text style={styles.favoriteIcon}>{isFavorite ? '♥' : '♡'}</Text>
      </Pressable>
    </View>
  );
}

function ProductsScreen({ navigation }: ProductListScreenProps) {
  return (
    <View style={styles.screen}>
      <View style={styles.pageIntro}>
        <Text style={styles.pageTitle}>Products</Text>
        <Text style={styles.mutedText}>Tab 1: nhấn sản phẩm để mở Product Details.</Text>
      </View>
      <FlatList
        data={PRODUCTS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <ProductRow
            product={item}
            onOpen={() => navigation.navigate('ProductDetails', { productId: item.id })}
          />
        )}
      />
    </View>
  );
}

function FavoritesScreen({ navigation }: FavoritesScreenProps) {
  const { favoriteIds } = useFavorites();
  const favoriteProducts = PRODUCTS.filter((item) => favoriteIds.includes(item.id));

  return (
    <View style={styles.screen}>
      <View style={styles.pageIntro}>
        <Text style={styles.pageTitle}>Favorites</Text>
        <Text style={styles.mutedText}>Tab 2: danh sách sách yêu thích.</Text>
      </View>
      <FlatList
        data={favoriteProducts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <ProductRow
            product={item}
            onOpen={() => navigation.navigate('ProductDetails', { productId: item.id })}
          />
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Bạn chưa có sách yêu thích. Hãy nhấn ♡ ở tab Products.</Text>}
      />
    </View>
  );
}

function ProductTabs() {
  return (
    <ProductTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarIcon: ({ color, size }) => (
          <Ionicons
            name={route.name === 'Products' ? 'book-outline' : 'heart-outline'}
            color={color}
            size={size}
          />
        ),
      })}
    >
      <ProductTab.Screen name="Products" component={ProductsScreen} options={{ title: 'Products' }} />
      <ProductTab.Screen name="Favorites" component={FavoritesScreen} options={{ title: 'Favorites' }} />
    </ProductTab.Navigator>
  );
}

function ProductDetailsScreen({ route }: NativeStackScreenProps<ProductStackParamList, 'ProductDetails'>) {
  const { productId } = route.params;
  const product = PRODUCTS.find((item) => item.id === productId);
  const { favoriteIds, toggleFavorite } = useFavorites();

  if (!product) {
    return (
      <View style={[styles.screen, styles.centerContent]}>
        <Text>Không tìm thấy sản phẩm.</Text>
      </View>
    );
  }

  const isFavorite = favoriteIds.includes(product.id);
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.detailContent}>
      <Image source={{ uri: product.image }} style={styles.bookHero} resizeMode="cover" />
      <Text style={styles.pageTitle}>{product.name}</Text>
      <Text style={styles.priceText}>{money(product.price)}</Text>
      <Text style={styles.bodyText}>{product.description}</Text>
      <Pressable style={styles.outlineButton} onPress={() => toggleFavorite(product.id)}>
        <Text style={styles.outlineButtonText}>{isFavorite ? '♥ Đã yêu thích' : '♡ Thêm vào yêu thích'}</Text>
      </Pressable>
      <Text style={styles.noticeText}>ProductDetails nhận productId qua route.params.</Text>
    </ScrollView>
  );
}

function StackWithTabsDemo() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const value = useMemo<FavoriteContextValue>(
    () => ({
      favoriteIds,
      toggleFavorite: (id: string) => {
        setFavoriteIds((current) =>
          current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
        );
      },
    }),
    [favoriteIds],
  );

  return (
    <FavoriteContext.Provider value={value}>
      <ProductStack.Navigator>
        <ProductStack.Screen name="ProductTabs" component={ProductTabs} options={{ headerShown: false }} />
        <ProductStack.Screen name="ProductDetails" component={ProductDetailsScreen} options={{ title: 'Product Details' }} />
      </ProductStack.Navigator>
    </FavoriteContext.Provider>
  );
}

// ============================================================
// 4. BÀI 5: DRAWER NAVIGATION (HOME / PROFILE / SETTINGS)
// ============================================================

type RootDrawerParamList = {
  Home: undefined;
  SelectPhone: NavigatorScreenParams<SelectPhoneStackParamList> | undefined;
  BottomTabs: NavigatorScreenParams<BasicTabParamList> | undefined;
  StackTabDemo: NavigatorScreenParams<ProductStackParamList> | undefined;
  Profile: undefined;
  Settings: undefined;
};

const Drawer = createDrawerNavigator<RootDrawerParamList>();

function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <View style={styles.screen}>
      <View style={styles.pageIntro}>
        <Text style={styles.pageTitle}>Settings</Text>
        <Text style={styles.mutedText}>Bài 5: màn hình cài đặt với Switch.</Text>
      </View>

      <View style={styles.settingRow}>
        <View style={styles.flexOne}>
          <Text style={styles.cardTitle}>Thông báo</Text>
          <Text style={styles.mutedText}>Bật/tắt thông báo ứng dụng.</Text>
        </View>
        <Switch value={notifications} onValueChange={setNotifications} />
      </View>

      <View style={styles.settingRow}>
        <View style={styles.flexOne}>
          <Text style={styles.cardTitle}>Dark mode</Text>
          <Text style={styles.mutedText}>Bật/tắt chế độ giao diện tối (minh họa state).</Text>
        </View>
        <Switch value={darkMode} onValueChange={setDarkMode} />
      </View>
    </View>
  );
}

function RootDrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="SelectPhone"
      screenOptions={{
        headerTintColor: COLORS.navy,
        drawerActiveTintColor: COLORS.primary,
        drawerLabelStyle: { fontSize: 14 },
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Drawer.Screen name="SelectPhone" component={SelectPhoneNavigator} options={{ title: 'Bài 1–2: Select Phone' }} />
      <Drawer.Screen name="BottomTabs" component={BasicBottomTabs} options={{ title: 'Bài 3: Bottom Tabs' }} />
      <Drawer.Screen name="StackTabDemo" component={StackWithTabsDemo} options={{ title: 'Bài 4: Stack + Tabs' }} />
      <Drawer.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
      <Drawer.Screen name="Settings" component={SettingsScreen} options={{ title: 'Bài 5: Settings' }} />
    </Drawer.Navigator>
  );
}

// ============================================================
// APP ROOT
// ============================================================

export default function App() {
  return (
    <GestureHandlerRootView style={styles.appRoot}>
      <SafeAreaProvider>
        <NavigationContainer>
          <RootDrawerNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// ============================================================
// STYLES
// ============================================================

const COLORS = {
  primary: '#334E9A',
  navy: '#172554',
  red: '#E11D2E',
  background: '#F4F6FA',
  card: '#FFFFFF',
  text: '#172033',
  muted: '#6B7280',
  border: '#E1E5ED',
};

const styles = StyleSheet.create({
  appRoot: { flex: 1 },
  screen: { flex: 1, backgroundColor: COLORS.background },
  flexOne: { flex: 1 },
  pageIntro: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 10 },
  pageTitle: { color: COLORS.text, fontSize: 22, fontWeight: '700', marginBottom: 5 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: COLORS.text, marginTop: 18, marginBottom: 10 },
  mutedText: { color: COLORS.muted, fontSize: 13, lineHeight: 19 },
  bodyText: { color: COLORS.text, fontSize: 15, lineHeight: 23, marginTop: 8 },
  cardTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700', marginBottom: 5 },
  priceText: { color: COLORS.red, fontSize: 16, fontWeight: '700', marginTop: 7 },
  linkText: { color: COLORS.primary, fontSize: 13, fontWeight: '600', marginTop: 8 },
  listContent: { padding: 14, paddingBottom: 28 },
  phoneCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card,
    borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, padding: 12, marginBottom: 12,
  },
  phoneImage: { width: 105, height: 138, marginRight: 14, backgroundColor: '#F8FAFC', borderRadius: 10 },
  loader: { marginTop: 35 },
  noticeText: { marginHorizontal: 16, marginVertical: 8, color: '#8A5A00', backgroundColor: '#FFF4D6', padding: 10, borderRadius: 8, fontSize: 12 },
  returnedParam: { color: '#166534', backgroundColor: '#DCFCE7', padding: 9, borderRadius: 8, marginTop: 8, fontSize: 12, fontWeight: '600' },
  emptyText: { color: COLORS.muted, textAlign: 'center', padding: 24, lineHeight: 21 },
  outlineButton: { borderWidth: 1, borderColor: COLORS.primary, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 9, alignItems: 'center', margin: 14 },
  outlineButtonText: { color: COLORS.primary, fontWeight: '700' },
  primaryButton: { backgroundColor: COLORS.red, paddingVertical: 14, borderRadius: 9, alignItems: 'center', marginTop: 22, width: '100%' },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '800', letterSpacing: 0.5 },
  detailContent: { padding: 18, paddingBottom: 35 },
  phoneHeroImage: { width: '100%', height: 270, backgroundColor: '#FFFFFF', borderRadius: 14, marginBottom: 18 },
  colorList: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  colorOption: { alignItems: 'center', minWidth: 62, gap: 7 },
  colorCircle: { width: 38, height: 38, borderRadius: 19, borderWidth: 2, borderColor: '#FFFFFF' },
  colorCircleSelected: { borderColor: COLORS.primary, borderWidth: 3 },
  selectedText: { color: COLORS.primary, fontWeight: '700' },
  selectedColorText: { color: COLORS.text, marginTop: 14, fontWeight: '600' },
  centerContent: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  successIcon: { width: 62, height: 62, borderRadius: 31, overflow: 'hidden', textAlign: 'center', textAlignVertical: 'center', color: '#FFFFFF', backgroundColor: '#16A34A', fontSize: 36, marginBottom: 18 },
  confirmImage: { width: 150, height: 180, marginVertical: 14 },
  simpleProductRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, padding: 10, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border },
  smallBookImage: { width: 58, height: 74, borderRadius: 7, marginRight: 12, backgroundColor: '#E5E7EB' },
  input: { marginHorizontal: 16, marginVertical: 10, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, fontSize: 15 },
  avatar: { width: 92, height: 92, borderRadius: 46, backgroundColor: '#DCE6FF', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  avatarText: { color: COLORS.primary, fontWeight: '800', fontSize: 40 },
  productRowCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 13, borderWidth: 1, borderColor: COLORS.border, padding: 10, marginBottom: 12 },
  productRowMain: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  bookThumb: { width: 64, height: 82, borderRadius: 7, backgroundColor: '#E5E7EB', marginRight: 12 },
  favoriteButton: { paddingHorizontal: 10, paddingVertical: 8 },
  favoriteIcon: { color: COLORS.red, fontSize: 27 },
  bookHero: { width: '100%', height: 250, borderRadius: 14, backgroundColor: '#E5E7EB', marginBottom: 18 },
  settingRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, marginHorizontal: 16, marginTop: 12, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
});
