import React, { useState, useEffect } from 'react';
import { BackHandler, View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from './src/screens/SplashScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import ListOrderScreen from './src/screens/ListOrderScreen';
import FormOrderScreen from './src/screens/FormOrderScreen';
import DetailOrderScreen from './src/screens/DetailOrderScreen';
import EditOrderScreen from './src/screens/EditOrderScreen';
import ListProductScreen from './src/screens/ListProductScreen';
import FormProductScreen from './src/screens/FormProductScreen';
import DetailProductScreen from './src/screens/DetailProductScreen';
import EditProductScreen from './src/screens/EditProductScreen';
import ListStockMoveScreen from './src/screens/ListStockMoveScreen';
import RekonStokScreen from './src/screens/RekonStokScreen';
import DetailStockMoveScreen from './src/screens/DetailStockMoveScreen';
import Toast from './src/components/atoms/Toast';
import useFCM from './src/hooks/useFCM';
import { Product } from './src/api/products';
import { StockMove, StockMoveProduct } from './src/api/stockMoves';
import { AuthUser, getStoredUser, logout } from './src/api/auth';

type Screen =
  | 'welcome' | 'dashboard'
  | 'listOrder' | 'formOrder' | 'detailOrder' | 'editOrder'
  | 'listProduct' | 'formProduct' | 'detailProduct' | 'editProduct'
  | 'listStockMove' | 'detailStockMove' | 'rekonStok';

const BACK_MAP: Partial<Record<Screen, Screen>> = {
  listOrder:      'dashboard',
  formOrder:      'listOrder',
  detailOrder:    'listOrder',
  editOrder:      'detailOrder',
  listProduct:    'dashboard',
  formProduct:    'listProduct',
  detailProduct:  'listProduct',
  editProduct:    'detailProduct',
  rekonStok:      'listProduct',
  listStockMove:  'dashboard',
  detailStockMove: 'listStockMove',
};

export default function App() {
  useFCM((data) => {
    if (data.screen === 'detailRequest' && data.req_id) {
      setSelectedOrderId(data.req_id);
      setScreen('detailOrder');
    }
  });
  const [showSplash, setShowSplash] = useState(true);
  const [screen, setScreen] = useState<Screen>('welcome');
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedStockMove, setSelectedStockMove] = useState<StockMove | null>(null);
  const [selectedStockMoveProd, setSelectedStockMoveProd] = useState<StockMoveProduct | null>(null);
  const [stockMoveDetailType, setStockMoveDetailType] = useState<'move' | 'moveProd'>('move');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [editingOrder, setEditingOrder] = useState<import('./src/api/requests').Request | null>(null);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  const selectedOutlet = authUser?.outlet ?? null;

  async function handleSplashFinish() {
    try {
      const stored = await getStoredUser();
      if (stored) {
        setAuthUser(stored);
        setScreen('dashboard');
      }
    } catch {
      // session tidak bisa dibaca, lanjut ke welcome
    }
    setShowSplash(false);
  }

  async function handleLogout() {
    try { await logout(authUser?.id ?? ''); } catch {}
    setAuthUser(null);
    setScreen('welcome');
  }

  function showToast(message: string) {
    setToast({ message, visible: true });
  }

  function navigate(to: Screen) {
    setScreen(to);
  }

  function navigateWithToast(to: Screen, message: string) {
    setScreen(to);
    setTimeout(() => showToast(message), 100);
  }

  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      const prev = BACK_MAP[screen];
      if (prev) { setScreen(prev); return true; }
      return false;
    });
    return () => handler.remove();
  }, [screen]);

  const screenKey = screen + (selectedProductId ?? '') + (editingProduct?.id ?? '') + (selectedStockMove?.id ?? '') + (selectedStockMoveProd?.id ?? '') + (selectedOrderId ?? '') + (editingOrder?.id ?? '') + (authUser?.id ?? '');

  const renderScreen = () => {
    if (screen === 'editOrder' && editingOrder)
      return <EditOrderScreen
        item={editingOrder}
        onBack={() => navigate('detailOrder')}
        onSuccess={() => navigateWithToast('detailOrder', 'Order berhasil diperbarui!')}
      />;
    if (screen === 'detailOrder' && selectedOrderId)
      return <DetailOrderScreen
        requestId={selectedOrderId}
        onBack={() => navigate('listOrder')}
        onEdit={it => { setEditingOrder(it); navigate('editOrder'); }}
        onDeleted={() => navigateWithToast('listOrder', 'Order berhasil dihapus!')}
        onSuccess={msg => navigateWithToast('listOrder', msg)}
      />;
    if (screen === 'formOrder') return <FormOrderScreen onBack={() => navigate('listOrder')} onSuccess={() => navigateWithToast('listOrder', 'Order berhasil dibuat!')} outlet={selectedOutlet ?? undefined} />;
    if (screen === 'listOrder') return <ListOrderScreen
      onBack={() => navigate('dashboard')}
      onAddOrder={() => navigate('formOrder')}
      onSelectOrder={item => { setSelectedOrderId(item.id); navigate('detailOrder'); }}
      outlet={selectedOutlet ?? undefined}
    />;
    if (screen === 'editProduct' && editingProduct)
      return <EditProductScreen
        item={editingProduct}
        onBack={() => navigate('detailProduct')}
        onSuccess={() => navigateWithToast('listProduct', 'Produk berhasil diperbarui!')}
      />;
    if (screen === 'detailProduct' && selectedProductId)
      return <DetailProductScreen
        productId={selectedProductId}
        onBack={() => navigate('listProduct')}
        onEdit={it => { setEditingProduct(it); navigate('editProduct'); }}
        onDeleted={() => navigateWithToast('listProduct', 'Produk berhasil dihapus!')}
      />;
    if (screen === 'formProduct')
      return <FormProductScreen
        onBack={() => navigate('listProduct')}
        onSuccess={() => navigateWithToast('listProduct', 'Produk berhasil ditambahkan!')}
      />;
    if (screen === 'rekonStok')
      return <RekonStokScreen
        onBack={() => navigate('listProduct')}
        outlet={selectedOutlet ?? undefined}
        onSuccess={msg => navigateWithToast('listProduct', msg)}
      />;
    if (screen === 'listProduct')
      return <ListProductScreen
        onBack={() => navigate('dashboard')}
        onAdd={() => navigate('formProduct')}
        onSelect={id => { setSelectedProductId(id); navigate('detailProduct'); }}
        onRekon={() => navigate('rekonStok')}
        outlet={selectedOutlet ?? undefined}
      />;
    if (screen === 'detailStockMove') {
      if (stockMoveDetailType === 'move' && selectedStockMove)
        return <DetailStockMoveScreen type="move" item={selectedStockMove} onBack={() => navigate('listStockMove')} />;
      if (stockMoveDetailType === 'moveProd' && selectedStockMoveProd)
        return <DetailStockMoveScreen type="moveProd" item={selectedStockMoveProd} onBack={() => navigate('listStockMove')} />;
    }
    if (screen === 'listStockMove')
      return <ListStockMoveScreen
        onBack={() => navigate('dashboard')}
        onSelect={item => { setSelectedStockMoveProd(item); setStockMoveDetailType('moveProd'); navigate('detailStockMove'); }}
        outlet={selectedOutlet ?? undefined}
      />;
    if (screen === 'dashboard') return <DashboardScreen onNavigate={(s: string) => navigate(s as Screen)} user={authUser} onLogout={handleLogout} />;
    return <WelcomeScreen onGetStarted={user => { setAuthUser(user); navigate('dashboard'); }} />;
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />
      <View style={styles.root}>
        {showSplash ? (
          <SplashScreen onFinish={handleSplashFinish} />
        ) : (
          <>
            <View key={screenKey} style={styles.root}>
              {renderScreen()}
            </View>
            <Toast
              message={toast.message}
              visible={toast.visible}
              onHide={() => setToast(t => ({ ...t, visible: false }))}
            />
          </>
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
