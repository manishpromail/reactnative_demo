# React Native Multi-Backend Store (Flutter to React Native Guide)

This React Native project is designed and built to **mirror the exact architecture, folder structure, design patterns, and dual-backend capabilities (Supabase PostgreSQL & MongoDB Atlas)** of the Flutter application in `flutter_supabse`.

If you are an experienced Flutter developer new to React Native, this guide serves as your comprehensive reference.

---

## 🏛️ Direct Architecture Comparison: Flutter vs. React Native

| Layer / Concept | Flutter Implementation (`flutter_supabse`) | React Native Implementation (`reactnative_demo`) |
| :--- | :--- | :--- |
| **Language** | Dart (Strongly typed, OOP, compile-time types) | TypeScript (Strongly typed, interfaces, classes) |
| **Entry Point** | `lib/main.dart` (`void main()`, `runApp(MyApp)`) | `App.tsx` (Root React Component with Providers) |
| **Package Manifest** | `pubspec.yaml` (dependencies & assets) | `package.json` (npm dependencies & scripts) |
| **HTTP Client** | `dio` (Interceptors, timeouts, headers) | `axios` (Interceptors, timeouts, headers) |
| **Local Storage** | `shared_preferences` (`SharedPreferences`) | `@react-native-async-storage/async-storage` (`AsyncStorage`) |
| **State Management** | `flutter_bloc` (`Cubit<State>`, `emit()`) | React Context + Custom Hook (`useAuth()`, `useProducts()`) |
| **Screen Gateway** | `AuthGate` (`BlocBuilder<AuthCubit, AuthState>`) | `AppNavigator` (`useAuth()`, conditional screen gate) |
| **Icon Library** | `Icons.*` (`uses-material-design: true`) | `@expo/vector-icons` (`MaterialIcons`, `Ionicons`) |
| **Screen Shell** | `SafeArea`, `Scaffold`, `AppBar` | `SafeAreaView`, `View`, custom Header component |
| **Scroll / Lists** | `ListView.builder`, `SingleChildScrollView` | `<FlatList>`, `<ScrollView>` |
| **Styling** | `ThemeData`, `BoxDecoration`, `TextStyle` | `StyleSheet.create({ ... })`, `Colors` palette |

---

## 📁 1-to-1 Project Structure

The folder hierarchy in `src/` directly reflects `lib/` in Flutter:

```
reactnative_demo/
├── App.tsx                                        <---> lib/main.dart (Root entry & AuthGate)
└── src/
    ├── core/
    │   ├── constants/
    │   │   └── api_constants.ts                   <---> lib/core/constants/api_constants.dart
    │   ├── network/
    │   │   └── network_handling.ts                <---> lib/core/network/network_handling.dart
    │   └── theme/
    │       └── colors.ts                          <---> lib/main.dart (ThemeData / ColorScheme)
    ├── data/
    │   ├── api_provider/
    │   │   ├── auth_api_provider.ts               <---> lib/data/api_provider/auth_api_provider.dart
    │   │   └── product_api_provider.ts            <---> lib/data/api_provider/product_api_provider.dart
    │   ├── injector.ts                            <---> lib/data/injector.dart (Axios / Dio)
    │   └── shared/
    │       └── data_response.ts                   <---> lib/data/shared/data_response.dart
    ├── features/
    │   ├── auth/
    │   │   ├── cubit/
    │   │   │   ├── auth_cubit.tsx                 <---> lib/features/auth/cubit/auth_cubit.dart
    │   │   │   └── auth_state.ts                  <---> lib/features/auth/cubit/auth_state.dart
    │   │   ├── data/
    │   │   │   ├── auth_repository.ts             <---> lib/features/auth/data/auth_repository.dart
    │   │   │   └── user_model.ts                  <---> lib/features/auth/data/user_model.dart
    │   │   └── presentation/
    │   │       ├── login_screen.tsx               <---> lib/features/auth/presentation/login_screen.dart
    │   │       └── signup_screen.tsx              <---> lib/features/auth/presentation/signup_screen.dart
    │   ├── backend_selection/
    │   │   └── presentation/
    │   │       └── backend_selection_screen.tsx   <---> lib/features/backend_selection/presentation/backend_selection_screen.dart
    │   └── products/
    │       ├── cubit/
    │       │   ├── product_cubit.tsx              <---> lib/features/products/cubit/product_cubit.dart
    │       │   └── product_state.ts               <---> lib/features/products/cubit/product_state.dart
    │       ├── data/
    │       │   ├── product_model.ts               <---> lib/features/products/data/product_model.dart
    │       │   └── product_repository.ts          <---> lib/features/products/data/product_repository.dart
    │       └── presentation/
    │           ├── add_product_screen.tsx         <---> lib/features/products/presentation/add_product_screen.dart
    │           ├── home_products_screen.tsx       <---> lib/features/products/presentation/home_products_screen.dart
    │           └── widgets/
    │               └── product_card.tsx           <---> lib/features/products/presentation/widgets/product_card.dart
    └── utils/
        └── helper/
            └── storage_helper.ts                  <---> lib/utils/helper/storage_helper.dart
```

---

## 🎨 UI & Component Cheat Sheet

| Flutter Widget | React Native Equivalent | Code Example |
| :--- | :--- | :--- |
| `Scaffold` | `<SafeAreaView>` + `<View>` | `<SafeAreaView style={{ flex: 1, backgroundColor: '#F8FAFC' }}>` |
| `AppBar` | Custom Header `<View>` | `<View style={styles.header}><Text style={styles.title}>Title</Text></View>` |
| `Container` / `BoxDecoration` | `<View style={styles.box}>` | `borderRadius: 16, backgroundColor: '#FFF', elevation: 2` |
| `Text` + `TextStyle` | `<Text style={styles.text}>` | `<Text style={{ fontSize: 16, fontWeight: '700' }}>Hello</Text>` |
| `TextFormField` | `<TextInput>` | `<TextInput value={val} onChangeText={setVal} placeholder="..." />` |
| `FilledButton` / `InkWell` | `<TouchableOpacity>` / `<Pressable>` | `<TouchableOpacity activeOpacity={0.8} onPress={handlePress}>` |
| `ListView.builder` | `<FlatList>` | `<FlatList data={items} keyExtractor={i => i.id} renderItem={...} />` |
| `SingleChildScrollView` | `<ScrollView>` | `<ScrollView contentContainerStyle={styles.content}>` |
| `CircularProgressIndicator` | `<ActivityIndicator>` | `<ActivityIndicator size="large" color="#6366F1" />` |
| `SnackBar` / `AlertDialog` | `Alert.alert(...)` / Modal | `Alert.alert('Title', 'Message', [{ text: 'OK' }])` |
| `Icons.*` | `@expo/vector-icons` | `<MaterialIcons name="storefront" size={24} color="#6366F1" />` |
| `Image.network` | `<Image source={{ uri }}>` | `<Image source={{ uri: product.imageUrl }} resizeMode="cover" />` |
| `FloatingActionButton` | Styled `<TouchableOpacity>` | Absolute positioned button (`position: 'absolute', bottom: 20`) |

---

## ⚡ Core Concepts Explained for Flutter Developers

### 1. Models & Type Safety: Dart vs. TypeScript

#### In Flutter (`lib/features/products/data/product_model.dart`):
```dart
class ProductModel {
  final String id;
  final String title;
  final double price;

  ProductModel({required this.id, required this.title, required this.price});

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: json['id']?.toString() ?? '',
      title: json['title'] ?? '',
      price: (json['price'] != null) ? double.tryParse(json['price'].toString()) ?? 0.0 : 0.0,
    );
  }

  Map<String, dynamic> toJson() => {'id': id, 'title': title, 'price': price};
}
```

#### In React Native (`src/features/products/data/product_model.ts`):
```typescript
export class ProductModel {
  readonly id: string;
  readonly title: string;
  readonly price: number;

  constructor(id: string, title: string, price: number) {
    this.id = id;
    this.title = title;
    this.price = price;
  }

  static fromJson(json: any): ProductModel {
    const rawPrice = json.price != null ? Number(json.price) : 0;
    return new ProductModel(
      String(json.id || json._id || ''),
      json.title || '',
      isNaN(rawPrice) ? 0 : rawPrice
    );
  }

  toJson(): Record<string, any> {
    return { id: this.id, title: this.title, price: this.price };
  }
}
```

---

### 2. HTTP Client & Interceptors: Dio vs. Axios

Both `Dio` and `Axios` support custom base URLs, timeouts, and request/response interceptors.

#### In Flutter (`lib/data/injector.dart`):
```dart
final Dio dio = Dio(BaseOptions(baseUrl: ApiConstants.baseUrl, connectTimeout: Duration(seconds: 45)));

dio.interceptors.add(InterceptorsWrapper(
  onRequest: (options, handler) {
    final token = StorageHelper().getUserToken();
    if (token != null) options.headers['Authorization'] = 'Bearer $token';
    handler.next(options);
  },
));
```

#### In React Native (`src/data/injector.ts`):
```typescript
const axiosInstance = axios.create({
  baseURL: ApiConstants.baseUrl,
  timeout: ApiConstants.connectTimeoutMs,
});

axiosInstance.interceptors.request.use((config) => {
  const token = StorageHelper.getInstance().getUserToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

### 3. Local Storage: SharedPreferences vs. AsyncStorage

- **Flutter**: `SharedPreferences.getInstance()` loads data into memory on startup, allowing synchronous getters like `prefs.getString('token')`.
- **React Native**: `@react-native-async-storage/async-storage` methods are asynchronous (`await AsyncStorage.getItem(...)`).
- **Our Pattern (`storage_helper.ts`)**: To provide the exact same synchronous convenience as Flutter, we call `await StorageHelper.init()` in `App.tsx` during application bootstrap. This preloads cached keys into a memory `Map` so getters like `storage.getUserToken()` return immediately without awaiting, while disk writes sync to `AsyncStorage` asynchronously.

---

### 4. State Management: Cubit vs. React Context + Custom Hooks

#### In Flutter (`lib/features/auth/cubit/auth_cubit.dart`):
```dart
// Emit states
emit(AuthLoading());
final user = await _authRepository.login(email: email, password: password);
emit(AuthAuthenticated(user));

// Trigger in Widget
context.read<AuthCubit>().login(email, password);

// Rebuild UI in Widget
BlocBuilder<AuthCubit, AuthState>(
  builder: (context, state) {
    if (state is AuthLoading) return CircularProgressIndicator();
    if (state is AuthAuthenticated) return HomeProductsScreen();
    return LoginScreen();
  },
)
```

#### In React Native (`src/features/auth/cubit/auth_cubit.tsx`):
```tsx
// Provider / Hook pattern
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({ type: 'initial' });

  const login = async (params) => {
    setState({ type: 'loading' });
    try {
      const user = await authRepository.login(params);
      setState({ type: 'authenticated', user });
      return true;
    } catch (e) {
      setState({ type: 'error', message: e.message });
      return false;
    }
  };

  return <AuthContext.Provider value={{ state, login }}>{children}</AuthContext.Provider>;
};

// Consumed in Screen Component
const { state, login } = useAuth();

if (state.type === 'loading') {
  return <ActivityIndicator size="large" color={Colors.primary} />;
}
```

---

### 5. App Bootstrap & Gateway: `main.dart` vs. `App.tsx`

#### In Flutter (`main.dart`):
```dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await StorageHelper.init();
  runApp(
    MultiBlocProvider(
      providers: [
        BlocProvider<AuthCubit>(create: (_) => AuthCubit()..checkAuthStatus()),
        BlocProvider<ProductCubit>(create: (_) => ProductCubit()),
      ],
      child: MyApp(),
    ),
  );
}
```

#### In React Native (`App.tsx`):
```tsx
export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function init() {
      await StorageHelper.init();
      setIsReady(true);
    }
    init();
  }, []);

  if (!isReady) return <ActivityIndicator />;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ProductProvider>
          <AppNavigator />
        </ProductProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
```

---

## 🌐 Dual-Backend Switcher Features

The `BackendSelectionScreen` provides complete feature parity with the Flutter implementation:
- **Supabase Cloud (PostgreSQL)**: `https://flutter-supabase-backend-bdv6.onrender.com`
- **MongoDB Atlas (NoSQL)**: `https://flutter-mongodb.onrender.com`
- **Live Health Ping**: Pings `/api/health` in real-time to check cold starts and verify database connection.
- **Custom URL Override**: Easily toggle between Render Cloud, Android Emulator (`http://10.0.2.2:3000`), or Localhost (`http://localhost:3000`).
- **Scoped User Sessions**: User tokens and profiles are saved per-backend (`userToken_supabase` vs. `userToken_mongodb`) so switching backends maintains separate authenticated sessions without collisions.

---

## 🚀 How to Run the Project

Inside the `reactnative_demo` directory:

```bash
# Start Metro bundler interactive terminal
npm start

# Run on Android Emulator or connected physical device
npm run android

# Run on iOS Simulator (macOS required)
npm run ios

# Run directly in your Web browser
npm run web

# Run TypeScript type check
npx tsc --noEmit
```
