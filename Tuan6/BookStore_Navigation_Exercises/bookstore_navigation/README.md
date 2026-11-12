# BookStore Navigation Practice (React Native + TypeScript)

Bộ bài giải gồm 5 phần theo tài liệu thực hành:

1. Select Phone: chọn điện thoại, mở màn hình chi tiết, chọn màu và xác nhận.
2. MockAPI: tải danh sách điện thoại từ endpoint do bạn tạo trên MockAPI.
3. Bottom Tab Navigation: Home, Search, Profile.
4. Stack + Tab + Passing Params: Products/Favorites nằm trong Bottom Tabs; nhấn sản phẩm để mở Product Details và truyền `productId` qua `route.params`.
5. Drawer Navigation: Home, Select Phone, Bottom Tabs, Stack + Tabs, Profile, Settings. Settings có 2 Switch minh họa.

Code chính nằm trong `App.tsx` để người mới dễ theo dõi.

## 1. Tạo project Expo TypeScript

```bash
npx create-expo-app@latest BookStoreNavigation --template blank-typescript
cd BookStoreNavigation
```

Chép file `App.tsx` trong thư mục này vào thư mục gốc project, thay thế `App.tsx` mặc định.

## 2. Cài React Navigation v7

```bash
npm install @react-navigation/native@^7 @react-navigation/native-stack@^7 @react-navigation/bottom-tabs@^7 @react-navigation/drawer@^7
npx expo install @expo/vector-icons
npx expo install react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated react-native-worklets
```

## 3. Cấu hình Babel cho Drawer/Reanimated

Nếu project đã có `babel.config.js`, giữ nguyên preset hiện tại và thêm plugin worklets ở cuối danh sách `plugins`.

Ví dụ `babel.config.js`:

```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-worklets/plugin'],
  };
};
```

Sau đó khởi động lại Metro và xóa cache:

```bash
npx expo start -c
```

## 4. Cấu hình MockAPI cho bài 2

1. Mở https://mockapi.io/ và tạo một project.
2. Tạo resource tên `phones`.
3. Thêm các field: `name` (string), `price` (number), `image` (string), `description` (string).
4. Thêm ít nhất một vài record. `id` được MockAPI tự tạo.
5. Copy endpoint của resource, ví dụ `https://<project-id>.mockapi.io/api/v1/phones`.
6. Mở `App.tsx`, tìm `const MOCKAPI_URL = ''` và dán endpoint vào giữa hai dấu nháy.

Ví dụ record:

```json
{
  "name": "VPhone X Pro",
  "price": 1790000,
  "image": "https://example.com/phone.png",
  "description": "Điện thoại màn hình lớn, pin tốt."
}
```

Khi chưa nhập endpoint, Bài 1 vẫn chạy bằng dữ liệu local. Khi có endpoint, màn hình Select Phone sẽ gọi MockAPI; nếu request lỗi, app giữ dữ liệu local và hiển thị thông báo.

## 5. Chạy app

```bash
npx expo start
```

Mở trên Expo Go hoặc emulator. Drawer mở bằng nút menu ở góc trên bên trái hoặc vuốt từ cạnh trái.

## 6. Cách kiểm tra từng bài

- Bài 1: mở Drawer > `Bài 1–2: Select Phone` > chạm một điện thoại > chọn màu > `CHỌN MUA`.
- Bài 2: cấu hình `MOCKAPI_URL`, vào Select Phone và kéo danh sách xuống để tải lại.
- Bài 3: mở Drawer > `Bài 3: Bottom Tabs`, thử Home, Search, Profile.
- Bài 4: mở Drawer > `Bài 4: Stack + Tabs`, ở Products nhấn ♡ để thêm yêu thích; nhấn sản phẩm để mở Product Details. Dữ liệu truyền là `productId`, màn hình đích đọc bằng `route.params.productId`.
- Bài 5: mở Drawer để chuyển giữa Home, Profile, Settings; ở Settings, bật/tắt hai Switch.

## Ghi chú học tập

- Mỗi `Screen` là một component React Native.
- `NavigationContainer` bao ngoài hệ thống navigator.
- `navigate('ScreenName', params)` chuyển màn hình và truyền tham số.
- `route.params` nhận tham số ở màn hình đích.
- `createNativeStackNavigator` dùng cho luồng màn hình có nút Back.
- `createBottomTabNavigator` dùng cho các tab phía dưới.
- `createDrawerNavigator` dùng cho menu kéo từ cạnh trái.
- Để đơn giản, phần Select Phone truyền object phone qua params để học bài chọn sản phẩm. Phần Stack + Tab truyền `productId` để minh họa cách truyền ID gọn hơn.
