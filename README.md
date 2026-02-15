# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## CONTAINERS

Acabo de crear ambos wrappers y los exporté desde src/presentation/components/form/index.ts. También apliqué KeyboardAvoidingWrapper en app/(auth)/index.tsx para que el teclado no tape los inputs.

---

# Project Documentation

## 📋 Table of Contents

- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Authentication System](#authentication-system)
- [Screen Protection](#screen-protection)
- [Form Components](#form-components)

## 🏗️ Architecture

This project uses **Clean Architecture** with these simple rules:

### Layers and Dependencies

- **Domain**: Does not depend on other layers (main layer)
- **Application**: Uses Domain layer
- **Infrastructure**: Implements interfaces from Domain
- **Presentation**: UI layer that uses Application use cases

### Dependency Flow

```
Presentation → Application → Domain ← Infrastructure
```

## 📁 Folder Structure

### `/app`

Contains main app screens:

```
/app
├── (tabs)/
│   ├── _layout.tsx
│   └── index.tsx
└── (auth)/
    ├── index.tsx      # Welcome screen
    └── login.tsx      # Login screen
```

### `/Constants`

- **`/colors.ts`**: Defines system theme colors
- **Mapping**: Connected to `/presentation/shared/styles/theme.tsx`

### `/application`

Contains use cases for the app.

### `/domain`

Domain layer with:

- **Entities**: `UserEntity`, `RoleEntity`
- **Services**: API services (GET, POST, PUT) - example: `UserService`
- **Types**: Interfaces and DTOs - example: `ThemeColor`

### `/infrastructure`

#### `/configuration`

- **`/http`**: Base HTTP services configuration
- **`/security`**: Security configuration (example: `DecodeToken`)

### `/presentation`

UI layer that includes:

- **Components**: Reusable components
- **Context**: React contexts
- **Hooks**: Custom hooks
- **Shared**: Shared resources (styles, themes, etc.)

## 🔐 Authentication System

### 1. Initial Loading Screen

- **File**: `/presentation/components/LoaderScreen.tsx`
- **Purpose**: Show loading screen during app startup

### 2. Welcome and Login Screens

- **Location**: `app/(auth)/`
- **Welcome**: `index.tsx`
- **Login**: `login.tsx` (requires username and password)

### 3. Authentication Process

#### 3.1 Login Service

```tsx
// Service location: /domain/service/AuthService.tsx
// Context: /presentation/context/AuthContext.tsx
const result = await loginUser(user, password);
// Returns token and other data if authentication is successful
// Data is saved in storage (like session)
```

#### 3.2 Role Decoding

```tsx
// File: /infrastructure/configuration/security/DecodeToken.tsx
const role = rolesByToken(loginResponse.accessToken)?.[0];
// Method that returns roles based on token
```

#### 3.3 Safe Navigation

- Use `route.replace('')` to go to correct screen
- **Protection Component**: `/presentation/components/ProtectedScreen.ts`
- **Purpose**: Check if user is authorized by their roles

## 🛡️ Screen Protection

Use `ProtectedScreen` component to protect screens by user roles:

- In \_layout.tsx:

```tsx
import { ERole } from "@/src/domain/entities/UserEntity";
import ProtectedScreen from "@/src/presentation/components/ProtectedScreen";
import { Stack } from "expo-router";

export default function Layout() {
  return (
    <ProtectedScreen allowedRoles={[ERole.FUNCIONARIO]}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    </ProtectedScreen>
  );
}
```

- Another Archives

```tsx
import { ERole } from "@/src/domain/entities/UserEntity";
import ProtectedScreen from "@/src/presentation/components/ProtectedScreen";

export default function DevelopmentIndex() {
  return (
    <ProtectedScreen allowedRoles={[ERole.DEVELOPMENT]}>
      <View>
        <Text>Hello World! Development Home</Text>
      </View>
    </ProtectedScreen>
  );
}
```

## 📝 Components

### Short Forms

For forms with few fields, use `KeyboardAvoidingWrapper` to center content and avoid keyboard covering it:

```tsx
import { KeyboardAvoidingWrapper } from "@/src/presentation/components/form";

<KeyboardAvoidingWrapper
  contentContainerStyle={{
    flex: 1,
    justifyContent: "center",
    padding: 24,
  }}
>
  {/* TextInput and Buttons */}
</KeyboardAvoidingWrapper>;
```

### Long Forms with Scroll

For long forms, use `KeyboardAwareWrapper`:

```tsx
import { KeyboardAwareWrapper } from "@/src/presentation/components/form";

<KeyboardAwareWrapper contentContainerStyle={{ padding: 16 }}>
  {/* Many inputs, selects, etc. */}
</KeyboardAwareWrapper>;
```

### ComboBox Component

#### Basic Usage

```tsx
const [day, setDay] = useState<string[]>([]);
<ComboBox
  value={day}
  onChange={setDay}
  label="Day of the week"
  items={[
    { label: "Monday", value: "monday" },
    { label: "Tuesday", value: "tuesday", disabled: true },
  ]}
/>;
```

#### With Async Search

```tsx
const [user, setUser] = useState<string>("");

<ComboBox
   value={user}
   onChange={setUser}
   label="Select User"
   fetchItems={async () => {
      const response = await listUsers();
         return (
            response.data?.content?.map((user) => ({
               label: String(user.name) + " " + String(user.lastName),
               value: String(user.id),
            })) ?? []
         );
   }}
   searchable={true}
   required={true}
/>
```

### MultiComboBox

```tsx
const [vehicles, setVehicles] = useState<string[]>([]);

const fetchVehicles = useCallback(async () => {
  const response = await listVehicle({ fields: ["id", "plate", "brand"] });
  return (
    response.data?.content.map((item) => ({
      label: `${item.plate} (${item.brand})`,
      value: String(item.id),
    })) || []
  );
}, []);

<MultiComboBox
   value={vehicles}
   onChange={setVehicles}
   label="Vehículos"
   fetchItems={fetchVehicles}
/>;
```

```tsx
//src/presentation/components/cards/RestaurantCard.tsx
import { RestaurantCard } from "@/src/presentation/components/cards/RestaurantCard";

<RestaurantCard
  id={item.id}
  name={item.name}
  urlImagen={item.urlImagen}
  isSelected={selectedId === item.id}
  colors={colors}
  onSelect={() => setSelectedId(item.id)}
/>

import { ProductCard } from "@/src/presentation/components/cards/ProductCard";

//src/presentation/components/cards/ProductCard.tsx

<ProductCard
  product={productItem}
  colors={colors}
  normalize={normalize}
  // Opcional: Si ya sabemos el restaurante padre
  restaurantName="Pico Rico"
/>

//src/presentation/components/filters/CategoryChip.tsx
import { CategoryChip } from "@/src/presentation/components/filters/CategoryChip";

<CategoryChip
  name="Entradas"
  isSelected={category === "Entradas"}
  onSelect={() => setCategory("Entradas")}
/>

//src/presentation/hooks/useProductFeed.ts
//Propósito: Eliminar lógica matemática y useEffect complejos de las Vistas (Screens).
{
  products: ProductEntity[],  // Lista final ya filtrada y paginada
  categories: string[],       // Lista de categorías disponibles en estos productos
  loadMore: () => void,       // Función para llamar al final del scroll (Infinite Scroll)
  isLoadingInitial: boolean,  // true solo en la primera carga
  isLoadingMore: boolean      // true cuando cargamos página 2, 3...
}
//Ejemplo de Implementación en Vista:
const {
  products,
  loadMore,
  isLoadingInitial
} = useProductFeed(selectedId, searchText, category);

// ... en el FlatList
<FlatList
  data={products}
  onEndReached={loadMore}
  // ...
/>
