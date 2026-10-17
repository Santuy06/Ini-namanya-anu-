import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { CartItem, CustomizationSelection, MenuItem, ActiveOrder, ScreenType, ExtraOption } from '../types';
import { supabase } from '../../lib/supabase';
import { billOfOrders } from '../../lib/domain';
import { placeholderImage } from '../../lib/placeholder';

interface ToastState { show: boolean; message: string; icon: string; }
export interface MenuCategory { id: string; label: string; }

interface AppContextType {
  currentScreen: ScreenType;
  navigate: (screen: ScreenType) => void;
  /** 'loading' | 'ok' | 'invalid' (token QR tidak ada / tidak aktif) | 'error' */
  tableState: 'loading' | 'ok' | 'invalid' | 'error';
  selectedTable: string;
  tableArea: string;
  guestsCount: number;
  isTableModalOpen: boolean;
  openTableModal: () => void;
  closeTableModal: () => void;
  setGuests: (count: number) => void;
  menuItems: MenuItem[];
  menuCategories: MenuCategory[];
  extraOptions: ExtraOption[];
  cartItems: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  cartServiceFee: number;
  cartTax: number;
  cartTotal: number;
  selectedMenuItem: MenuItem;
  setSelectedMenuItem: (item: MenuItem) => void;
  openDetail: (item: MenuItem) => void;
  addToCart: (item: MenuItem, customization: CustomizationSelection, qty: number) => void;
  updateCartItemQty: (cartItemId: string, delta: number) => void;
  removeCartItem: (cartItemId: string) => void;
  quickAddToCart: (item: MenuItem) => void;
  activeOrder: ActiveOrder | null;
  submitOrder: (paymentMethod: 'qris' | 'cashier', notes: string) => Promise<void>;
  waiterCalled: boolean;
  waiterCooldown: number;
  callWaiter: () => void;
  checkoutRequested: boolean;
  checkoutCooldown: number;
  requestCheckout: () => void;
  toast: ToastState;
  showToast: (message: string, icon?: string) => void;
  formatRupiah: (amount: number) => string;
  tableNotes: string;
  setTableNotes: (notes: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);
const EMPTY_ITEM: MenuItem = { id: '', name: '', price: 0, description: '', category: '', categories: [], tags: [], image: '' };
const STAGE: Record<string, 1 | 2 | 3 | 4> = { submitted: 1, preparing: 2, ready: 3, served: 4 };
const formatRupiah = (n: number) => 'Rp' + n.toLocaleString('id-ID');
const wib = (iso: string) => new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }).replace(':', '.') + ' WIB';

// Catatan dapur dari pilihan kustomisasi (hanya yang bukan nilai bawaan)
const PEDAS = { '0': 'Tidak pedas', '1': 'Pedas sedang', '2': 'Pedas mantap' } as const;
const noteOf = (c: CustomizationSelection) => [
  c.kuah === 'pisah' && 'Kuah dipisah',
  c.pedas !== '1' && PEDAS[c.pedas],
  c.sayur === 'pisah' && 'Sayur dipisah',
  c.kitchenNotes?.trim(),
].filter(Boolean).join(' • ');

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = useMemo(() => {
    // 1. Ambil dari URL jika baru pertama scan QR
    const urlParams = new URLSearchParams(window.location.search);
    const paramToken = urlParams.get('meja');

    if (paramToken) {
      // Simpan di sessionStorage (hanya aktif di tab ini, tidak terbawa jika link disalin)
      try {
        sessionStorage.setItem('rg_active_table_token', paramToken);
      } catch {}

      // Solusi 4: Masking URL - bersihkan token dari address bar browser agar hanya tampil /pesan
      try {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
      } catch {}

      return paramToken;
    }

    // 2. Jika tidak ada di URL (misal user me-refresh halaman), ambil dari sessionStorage aktif
    try {
      return sessionStorage.getItem('rg_active_table_token') || '';
    } catch {
      return '';
    }
  }, []);
  const cartKey = `rawon_gusti_cart_${token}`;

  const [currentScreen, setCurrentScreen] = useState<ScreenType>('welcome');
  const [tableState, setTableState] = useState<AppContextType['tableState']>(token ? 'loading' : 'invalid');
  const [selectedTable, setSelectedTable] = useState('');
  const [tableArea, setTableArea] = useState('');
  const [guestsCount, setGuestsCount] = useState(2);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
  const [extraOptions, setExtraOptions] = useState<ExtraOption[]>([]);
  const extraIds = useRef<Record<string, number>>({});
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem(cartKey) ?? '[]'); } catch { return []; }
  });
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem>(EMPTY_ITEM);
  const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>(null);
  const [waiterCalled, setWaiterCalled] = useState(false);
  const [waiterCooldown, setWaiterCooldown] = useState(0);
  const [checkoutRequested, setCheckoutRequested] = useState(false);
  const [checkoutCooldown, setCheckoutCooldown] = useState(0);
  const [tableNotes, setTableNotes] = useState('');
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', icon: 'check_circle' });

  // Cooldown countdown timers
  useEffect(() => {
    if (waiterCooldown <= 0) return;
    const timer = setInterval(() => setWaiterCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [waiterCooldown]);

  useEffect(() => {
    if (checkoutCooldown <= 0) return;
    const timer = setInterval(() => setCheckoutCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [checkoutCooldown]);

  useEffect(() => { try { localStorage.setItem(cartKey, JSON.stringify(cartItems)); } catch { /* abaikan */ } }, [cartItems, cartKey]);

  const showToast = useCallback((message: string, icon = 'check_circle') => {
    setToast({ show: true, message, icon });
    setTimeout(() => setToast((p) => ({ ...p, show: false })), 2800);
  }, []);

  // ---------- muat meja + menu ----------
  useEffect(() => {
    if (!token) return;
    (async () => {
      const [t, cats, prods, ex] = await Promise.all([
        supabase.rpc('get_table', { p_token: token }),
        supabase.from('categories').select('*').order('category_id'),
        supabase.from('products').select('*, categories(name)').order('product_id'),
        supabase.from('extras').select('*').eq('is_available', true).order('extra_id'),
      ]);
      if (t.error || prods.error) { setTableState('error'); return; }
      const row = t.data?.[0];
      if (!row) { setTableState('invalid'); return; }
      setSelectedTable(String(row.table_number).padStart(2, '0'));
      setTableArea(row.area);
      setMenuCategories((cats.data ?? []).map((c: any) => ({ id: c.name, label: c.name })));
      const items: MenuItem[] = (prods.data ?? []).filter((p: any) => p.is_available).map((p: any) => {
        const cat = p.categories?.name ?? '';
        return {
          id: String(p.product_id), dbId: p.product_id, name: p.name, price: Number(p.price),
          description: p.description || `${cat} khas Rawon Gusti.`, category: cat, categories: [cat], tags: [cat],
          badge: p.is_signature ? { text: 'Best Seller', type: 'best_seller' } : p.is_favorite ? { text: 'Favorit', type: 'favorite' } : undefined,
          image: p.image_url || placeholderImage(p.name),
        } as MenuItem;
      });
      setMenuItems(items);
      setSelectedMenuItem(items[0] ?? EMPTY_ITEM);
      extraIds.current = Object.fromEntries((ex.data ?? []).map((e: any) => [e.name, e.extra_id]));
      setExtraOptions((ex.data ?? []).map((e: any) => ({ id: String(e.extra_id), name: e.name, price: Number(e.price), description: e.description || '' })));
      setTableState('ok');
    })();
  }, [token]);

  // ---------- status pesanan (polling; pelanggan anon tidak punya akses realtime) ----------
  const lastSeen = useRef<ActiveOrder | null>(null);
  const loadOrders = useCallback(async () => {
    if (!token) return;
    const { data, error } = await supabase.rpc('my_orders', { p_token: token });
    if (error) return;
    const orders: any[] = data ?? [];
    if (!orders.length) {
      // sesi sudah ditutup kasir (lunas): tampilkan pesanan terakhir sebagai selesai
      if (lastSeen.current && lastSeen.current.paymentStatus !== 'LUNAS')
        lastSeen.current = { ...lastSeen.current, paymentStatus: 'LUNAS', statusStage: 4 };
      setActiveOrder(lastSeen.current);
      return;
    }
    const subs = orders.map((o) => o.items.reduce((a: number, i: any) => a + i.price * i.qty, 0));
    const b = billOfOrders(subs);
    const open = orders.filter((o) => o.status !== 'served');
    const stage = open.length ? Math.min(...open.map((o) => STAGE[o.status])) : 4;
    const last = orders[orders.length - 1];
    const next: ActiveOrder = {
      ticketNumber: '#' + last.order_number, orderNumbers: orders.map((o) => o.order_number),
      tableNumber: selectedTable, tableArea, guestsCount: last.guests, orderTime: wib(orders[0].created_at),
      orderTimestamp: new Date(orders[0].created_at).getTime(),
      items: orders.flatMap((o) => o.items.map((i: any, k: number) => ({
        cartItemId: `${o.order_id}-${k}`, menuItemId: '', name: i.name, basePrice: i.price, quantity: i.qty,
        customization: { kitchenNotes: i.note || undefined } as any, extraCost: 0, totalPrice: i.price * i.qty,
        image: menuItems.find((m) => m.name === i.name)?.image || placeholderImage(i.name),
        subtitleDesc: `${i.qty}x porsi (${formatRupiah(i.price)})`,
      }))),
      tableNotes: orders.map((o) => o.note).filter(Boolean).join('; '),
      paymentMethod: last.pay_pref === 'qris' ? 'qris' : 'cashier',
      paymentStatus: orders.every((o) => o.paid) ? 'LUNAS' : 'MENUNGGU DI KASIR',
      statusStage: stage as 1 | 2 | 3 | 4, estimatedMinutes: '12–15 Menit',
      subtotal: b.subtotal, serviceFee: b.service, tax: b.tax, total: b.total,
    };
    lastSeen.current = next;
    setActiveOrder(next);
  }, [token, selectedTable, tableArea, menuItems]);

  useEffect(() => {
    if (tableState !== 'ok') return;

    // Load pertama kali
    loadOrders();

    // Polling cerdas: jika ada pesanan yang sedang diproses (stage < 4), polling setiap 15 detik.
    // Jika tidak ada pesanan aktif atau sudah selesai, cukup setiap 60 detik sebagai cadangan.
    const pollInterval = activeOrder && activeOrder.statusStage < 4 ? 15000 : 60000;

    const t = setInterval(() => {
      // Jangan lakukan request jika tab / layar HP terkunci atau di latar belakang
      if (document.hidden) return;
      loadOrders();
    }, pollInterval);

    // Refresh seketika saat pelanggan membuka kembali tab / aplikasi
    const onVisible = () => {
      if (!document.hidden) {
        loadOrders();
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);

    return () => {
      clearInterval(t);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [tableState, loadOrders, activeOrder?.statusStage]);

  // ---------- navigasi & meja ----------
  const navigate = (screen: ScreenType) => { setCurrentScreen(screen); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const setGuests = (n: number) => setGuestsCount(Math.max(1, Math.min(12, n)));
  const openDetail = (item: MenuItem) => { setSelectedMenuItem(item); navigate('detail'); };

  // ---------- keranjang (harga tampilan; server menghitung ulang saat pesan) ----------
  const addToCart = (item: MenuItem, customization: CustomizationSelection, qty: number) => {
    const extraCost = customization.extras.reduce((a, n) => a + (extraOptions.find((e) => e.name === n)?.price ?? 0), 0);
    const newItem: CartItem = {
      cartItemId: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, menuItemId: item.id, name: item.name,
      basePrice: item.price, quantity: qty, customization, extraCost, totalPrice: (item.price + extraCost) * qty,
      image: item.image, subtitleDesc: `${qty}x porsi (${formatRupiah(item.price)})`,
    };
    setCartItems((p) => [newItem, ...p]);
    showToast(`${item.name} ditambahkan ke pesanan!`, 'shopping_basket');
  };
  const quickAddToCart = (item: MenuItem) => addToCart(item, { kuah: 'campur', pedas: '1', sayur: 'lengkap', extras: [] }, 1);
  const updateCartItemQty = (id: string, delta: number) =>
    setCartItems((p) => p.map((i) => {
      if (i.cartItemId !== id) return i;
      const q = i.quantity + delta;
      return q <= 0 ? null : { ...i, quantity: q, totalPrice: (i.basePrice + i.extraCost) * q, subtitleDesc: `${q}x porsi (${formatRupiah(i.basePrice)})` };
    }).filter(Boolean) as CartItem[]);
  const removeCartItem = (id: string) => { setCartItems((p) => p.filter((i) => i.cartItemId !== id)); showToast('Menu dihapus dari keranjang', 'delete'); };

  const cartCount = cartItems.reduce((a, i) => a + i.quantity, 0);
  const b = billOfOrders(cartItems.length ? [cartItems.reduce((a, i) => a + i.totalPrice, 0)] : []);
  const cartSubtotal = b.subtotal, cartServiceFee = b.service, cartTax = b.tax, cartTotal = b.total;

  const submitOrder = async (paymentMethod: 'qris' | 'cashier', notes: string) => {
    if (!cartItems.length) return;
    const { data, error } = await supabase.rpc('place_order', {
      p_token: token, p_guests: guestsCount, p_note: notes, p_pay_pref: paymentMethod,
      p_items: cartItems.map((c) => ({
        id: Number(c.menuItemId), qty: c.quantity, note: noteOf(c.customization),
        extras: c.customization.extras.map((n) => extraIds.current[n]).filter(Boolean),
      })),
    });
    if (error || data?.error) { showToast(data?.error || 'Pesanan gagal dikirim, coba lagi', 'error'); return; }
    setCartItems([]);
    lastSeen.current = null;
    await loadOrders();
    showToast('Pesanan berhasil dikirim ke Dapur!', 'done_all');
  };

  const request = async (kind: 'waiter' | 'checkout') => {
    const { data, error } = await supabase.rpc('request_service', { p_token: token, p_kind: kind });
    if (error || data?.error) { showToast('Permintaan gagal, coba lagi', 'error'); return false; }
    return true;
  };
  const callWaiter = async () => {
    if (waiterCooldown > 0) {
      showToast(`Harap tunggu ${waiterCooldown}s sebelum memanggil pelayan kembali.`, 'info');
      return;
    }
    if (await request('waiter')) {
      setWaiterCalled(true);
      setWaiterCooldown(60);
      showToast(`Pelayan sedang menuju ke Meja ${selectedTable}. Mohon tunggu sejenak.`, 'room_service');
    }
  };

  const requestCheckout = async () => {
    if (checkoutCooldown > 0) {
      showToast(`Harap tunggu ${checkoutCooldown}s sebelum meminta tagihan lagi.`, 'info');
      return;
    }
    if (await request('checkout')) {
      setCheckoutRequested(true);
      setCheckoutCooldown(60);
      showToast('Kasir akan segera membawa tagihan ke meja Anda.', 'receipt_long');
    }
  };

  return (
    <AppContext.Provider value={{
      currentScreen, navigate, tableState, selectedTable, tableArea, guestsCount, isTableModalOpen,
      openTableModal: () => setIsTableModalOpen(true), closeTableModal: () => setIsTableModalOpen(false), setGuests,
      menuItems, menuCategories, extraOptions, cartItems, cartCount, cartSubtotal, cartServiceFee, cartTax, cartTotal,
      selectedMenuItem, setSelectedMenuItem, openDetail, addToCart, updateCartItemQty, removeCartItem, quickAddToCart,
      activeOrder, submitOrder, waiterCalled, waiterCooldown, callWaiter, checkoutRequested, checkoutCooldown, requestCheckout,
      toast, showToast, formatRupiah, tableNotes, setTableNotes,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
};
