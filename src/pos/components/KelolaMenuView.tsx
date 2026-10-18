import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MenuItem, RawIngredient } from '../types';

const KelolaMenuViewInner: React.FC = () => {
  const {
    menuItems,
    menuCategories,
    updateMenuItem,
    addMenuItem,
    rawIngredients,
    updateIngredientStock,
    restockIngredient,
    updateIngredientMinimum,
    addRawIngredient,
    showToast
  } = useApp();

  // Active sub-tab in Kelola Menu: 'katalog' | 'stok'
  const [activeSubTab, setActiveSubTab] = useState<'katalog' | 'stok'>('katalog');

  // Edit panel open/close state
  const [editPanelOpen, setEditPanelOpen] = useState(false);

  // Selected menu item for edit in Katalog Menu
  const [selectedItem, setSelectedItem] = useState<MenuItem>(menuItems[0]);
  const [filterMenuCategory, setFilterMenuCategory] = useState<string>('Semua');
  const [searchMenuQuery, setSearchMenuQuery] = useState('');
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);

  // Form edit menu state
  const [editName, setEditName] = useState(selectedItem.name);
  const [editCategory, setEditCategory] = useState(selectedItem.category);
  const [editPrice, setEditPrice] = useState(selectedItem.price.toString());
  const [editDescription, setEditDescription] = useState(selectedItem.description);
  const [editIsAvailable, setEditIsAvailable] = useState(selectedItem.isAvailable);

  // New menu item form state
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState<string>(menuCategories[0] || '');
  const [newPrice, setNewPrice] = useState('25000');
  const [newDescription, setNewDescription] = useState('');

  // Stock monitoring state
  const [searchStockQuery, setSearchStockQuery] = useState('');
  const [stockStatusFilter, setStockStatusFilter] = useState<'semua' | 'kritis' | 'menipis' | 'aman'>('semua');
  const [stockCategoryFilter, setStockCategoryFilter] = useState<string>('Semua');

  // Modals for stock management
  const [restockModalIngredient, setRestockModalIngredient] = useState<RawIngredient | null>(null);
  const [restockQty, setRestockQty] = useState<string>('5');
  const [restockNote, setRestockNote] = useState<string>('Pengiriman rutin supplier');

  const [editThresholdIngredient, setEditThresholdIngredient] = useState<RawIngredient | null>(null);
  const [newThresholdVal, setNewThresholdVal] = useState<string>('5');

  const [showAddIngredientModal, setShowAddIngredientModal] = useState(false);
  const [newIngCode, setNewIngCode] = useState('');
  const [newIngName, setNewIngName] = useState('');
  const [newIngCategory, setNewIngCategory] = useState<RawIngredient['category']>('Bumbu & Rempah');
  const [newIngStock, setNewIngStock] = useState('10');
  const [newIngMin, setNewIngMin] = useState('5');
  const [newIngUnit, setNewIngUnit] = useState('kg');
  const [newIngCost, setNewIngCost] = useState('25000');
  const [newIngSupplier, setNewIngSupplier] = useState('');
  const [newIngLinkedMenus, setNewIngLinkedMenus] = useState<string>('Rawon Daging Spesial');

  // Helper to find raw ingredients linked to a menu item
  const getLinkedIngredients = (menuName: string): RawIngredient[] => {
    return rawIngredients.filter((ing) =>
      ing.linkedMenuItems.some(
        (m) =>
          menuName.toLowerCase().includes(m.toLowerCase()) ||
          m.toLowerCase().includes(menuName.toLowerCase())
      )
    );
  };

  // Check if a menu item has low-stock ingredients
  const getMenuStockStatus = (menuName: string) => {
    const linked = getLinkedIngredients(menuName);
    if (linked.length === 0) return { status: 'safe', label: 'Bahan Tersedia', count: 0 };
    const outOfStock = linked.filter((i) => i.currentStock <= 0);
    if (outOfStock.length > 0) {
      return { status: 'critical', label: `${outOfStock[0].name} Habis!`, count: outOfStock.length };
    }
    const lowStock = linked.filter((i) => i.currentStock <= i.minimumStock);
    if (lowStock.length > 0) {
      return { status: 'warning', label: `${lowStock.length} Bahan Menipis`, count: lowStock.length };
    }
    return { status: 'safe', label: 'Bahan Cukup', count: linked.length };
  };

  const handleSelectToEdit = (item: MenuItem) => {
    setSelectedItem(item);
    setEditName(item.name);
    setEditCategory(item.category);
    setEditPrice(item.price.toString());
    setEditDescription(item.description);
    setEditIsAvailable(item.isAvailable);
    setEditPanelOpen(true);
  };

  const handleSaveEdit = () => {
    const updated: MenuItem = {
      ...selectedItem,
      name: editName,
      category: editCategory as any,
      price: parseInt(editPrice.replace(/[^0-9]/g, ''), 10) || selectedItem.price,
      description: editDescription,
      isAvailable: editIsAvailable
    };
    updateMenuItem(updated);
    setSelectedItem(updated);
    showToast(`Menu "${updated.name}" berhasil diperbarui`, 'success');
  };

  const handleCancelEdit = () => {
    handleSelectToEdit(selectedItem);
    setEditPanelOpen(false);
  };

  const handleAddNewMenu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;
    const newItem: MenuItem = {
      id: `m-${Date.now()}`,
      code: `RG-${String(menuItems.length + 1).padStart(3, '0')}`,
      name: newName,
      category: newCategory,
      price: parseInt(newPrice, 10) || 20000,
      description: newDescription || 'Menu lezat khas Rawon Gusti.',
      image: selectedItem.image,
      isAvailable: true,
      portionsSold: 0
    };
    addMenuItem(newItem);
    setShowAddMenuModal(false);
    setNewName('');
    setNewDescription('');
  };

  // Stock Monitoring handlers
  const handleOpenRestock = (ing: RawIngredient) => {
    setRestockModalIngredient(ing);
    const deficit = Math.max(1, Math.ceil(ing.minimumStock * 2 - ing.currentStock));
    setRestockQty(deficit.toString());
    setRestockNote(`Pengadaan ulang ${ing.supplier}`);
  };

  const handleConfirmRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockModalIngredient) return;
    const qty = parseFloat(restockQty);
    if (isNaN(qty) || qty <= 0) {
      showToast('Masukkan jumlah restok yang valid', 'warning');
      return;
    }
    restockIngredient(restockModalIngredient.id, qty);
    setRestockModalIngredient(null);
  };

  const handleOpenEditThreshold = (ing: RawIngredient) => {
    setEditThresholdIngredient(ing);
    setNewThresholdVal(ing.minimumStock.toString());
  };

  const handleConfirmThreshold = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editThresholdIngredient) return;
    const threshold = parseFloat(newThresholdVal);
    if (isNaN(threshold) || threshold < 0) {
      showToast('Batas minimum harus angka positif', 'warning');
      return;
    }
    updateIngredientMinimum(editThresholdIngredient.id, threshold);
    setEditThresholdIngredient(null);
  };

  const handleAddNewIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngName) return;
    const newIngredient: RawIngredient = {
      id: `ing-${Date.now()}`,
      code: newIngCode || `BAHAN-${String(rawIngredients.length + 1).padStart(2, '0')}`,
      name: newIngName,
      category: newIngCategory,
      currentStock: parseFloat(newIngStock) || 0,
      minimumStock: parseFloat(newIngMin) || 1,
      unit: newIngUnit || 'kg',
      costPerUnit: parseInt(newIngCost.replace(/[^0-9]/g, ''), 10) || 10000,
      supplier: newIngSupplier || 'Supplier Lokal',
      lastRestocked: 'Hari ini',
      linkedMenuItems: newIngLinkedMenus ? newIngLinkedMenus.split(',').map((s) => s.trim()) : []
    };
    addRawIngredient(newIngredient);
    setShowAddIngredientModal(false);
    setNewIngCode('');
    setNewIngName('');
    setNewIngSupplier('');
  };

  // Quick simulation: deduct stock to test automatic alerts
  const handleSimulateUsage = (ingId: string, amount: number) => {
    const target = rawIngredients.find((i) => i.id === ingId);
    if (!target) return;
    const nextStock = Math.max(0, Math.round((target.currentStock - amount) * 10) / 10);
    updateIngredientStock(ingId, nextStock);
    if (nextStock <= target.minimumStock) {
      showToast(
        `⚠️ Peringatan Otomatis: Stok ${target.name} tersisa ${nextStock} ${target.unit} (mencapai batas min ${target.minimumStock} ${target.unit})!`,
        'warning'
      );
    } else {
      showToast(`Pengurangan bahan ${target.name}: -${amount} ${target.unit}`, 'info');
    }
  };

  // Filtered Menu Items
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchMenuQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterMenuCategory === 'Semua') return true;
    return item.category === filterMenuCategory;
  });

  // Filtered Stock Ingredients
  const filteredIngredients = rawIngredients.filter((ing) => {
    const matchesSearch =
      ing.name.toLowerCase().includes(searchStockQuery.toLowerCase()) ||
      ing.code.toLowerCase().includes(searchStockQuery.toLowerCase()) ||
      ing.supplier.toLowerCase().includes(searchStockQuery.toLowerCase()) ||
      ing.linkedMenuItems.some((m) => m.toLowerCase().includes(searchStockQuery.toLowerCase()));
    if (!matchesSearch) return false;

    if (stockCategoryFilter !== 'Semua' && ing.category !== stockCategoryFilter) {
      return false;
    }

    if (stockStatusFilter === 'kritis') return ing.currentStock <= 0;
    if (stockStatusFilter === 'menipis') return ing.currentStock > 0 && ing.currentStock <= ing.minimumStock;
    if (stockStatusFilter === 'aman') return ing.currentStock > ing.minimumStock;

    return true;
  });

  const availableCount = menuItems.filter((m) => m.isAvailable).length;

  // Stock KPI Counters
  const criticalCount = rawIngredients.filter((i) => i.currentStock <= 0).length;
  const warningCount = rawIngredients.filter((i) => i.currentStock > 0 && i.currentStock <= i.minimumStock).length;
  const safeCount = rawIngredients.filter((i) => i.currentStock > i.minimumStock).length;

  return (
    <div className="flex flex-col w-full p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1540px] mx-auto pb-28 md:pb-8">
      {/* Top Breadcrumb & Page Header Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-xs text-[#524344]">
          <span>Operasional</span>
          <span className="text-[#d7c2c2]">›</span>
          <span className="font-bold text-[#1c1c19]">Admin</span>
          <span className="text-[#d7c2c2]">›</span>
          <span className="font-medium text-[#994703]">
            {activeSubTab === 'katalog' ? 'Katalog Menu' : 'Pemantauan Stok Bahan Baku'}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1c1c19] tracking-tight">
              Kelola Menu &amp; Stok
            </h1>
            <p className="text-xs sm:text-sm text-[#524344] mt-0.5">
              Atur katalog hidangan dan pantau ketersediaan bahan baku mentah.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {activeSubTab === 'katalog' ? (
              <button
                onClick={() => setShowAddMenuModal(true)}
                className="inline-flex items-center justify-center gap-2 px-4 h-10 bg-[#58252c] hover:bg-[#3d1018] text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>Tambah menu</span>
              </button>
            ) : (
              <button
                onClick={() => setShowAddIngredientModal(true)}
                className="inline-flex items-center justify-center gap-2 px-4 h-10 bg-[#994703] hover:bg-[#7a3702] text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">add_box</span>
                <span>+ Tambah Bahan Baku</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Tab Switcher: Katalog Menu vs Pemantauan Stok */}
      <div className="flex items-center justify-between bg-white p-1.5 rounded-2xl border border-[#ebe8e3] shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('katalog')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeSubTab === 'katalog'
                ? 'bg-[#3d1018] text-white shadow-sm'
                : 'text-[#524344] hover:bg-[#f6f3ee] hover:text-[#1c1c19]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">restaurant_menu</span>
            <span>Katalog Menu ({menuItems.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('stok')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeSubTab === 'stok'
                ? 'bg-[#3d1018] text-white shadow-sm'
                : 'text-[#524344] hover:bg-[#f6f3ee] hover:text-[#1c1c19]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">inventory_2</span>
            <span>Pemantauan Stok Bahan Baku</span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-2 pr-2 text-xs text-[#524344]">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Stok Bahan Baku Aktif</span>
        </div>
      </div>


      {/* ========================================================================= */}
      {/* SUB-VIEW 1: KATALOG MENU (DAFTAR & EDIT MENU)                             */}
      {/* ========================================================================= */}
      {activeSubTab === 'katalog' && (
        <>
          {/* Search Bar & Fast Filters */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#847374] text-[20px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchMenuQuery}
                  onChange={(e) => setSearchMenuQuery(e.target.value)}
                  placeholder="Cari nama menu (contoh: Rawon Daging, Soto, dsb)..."
                  className="w-full h-11 pl-10 pr-4 bg-white text-[#1c1c19] text-sm rounded-xl shadow-sm border border-[#ebe8e3] outline-none focus:border-[#3d1018]"
                />
              </div>

              <button
                onClick={() =>
                  showToast(
                    `Ketersediaan: ${availableCount} tersedia dari ${menuItems.length} total menu`,
                    'info'
                  )
                }
                className="h-11 px-4 bg-white text-[#1c1c19] text-xs font-semibold rounded-xl shadow-sm border border-[#ebe8e3] hover:bg-[#f6f3ee] transition-colors inline-flex items-center justify-center gap-2 shrink-0"
              >
                <span className="material-symbols-outlined text-[18px] text-[#994703]">tune</span>
                <span>Ketersediaan ({availableCount}/{menuItems.length})</span>
              </button>
            </div>

            {/* Category Pills Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {['Semua', ...menuCategories].map((cat) => {
                const count =
                  cat === 'Semua'
                    ? menuItems.length
                    : menuItems.filter((m) => m.category === cat).length;
                const isActive = filterMenuCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setFilterMenuCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold shadow-xs shrink-0 transition-all ${
                      isActive
                        ? 'bg-[#3d1018] text-white shadow-sm'
                        : 'bg-white text-[#524344] border border-[#ebe8e3] hover:bg-[#f6f3ee]'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2-Column Core Layout */}
          <div className={`grid grid-cols-1 gap-6 items-start ${editPanelOpen ? 'lg:grid-cols-12' : ''}`}>
            {/* Left Column: Menu Table & Category Cards */}
            <div className={`${editPanelOpen ? 'lg:col-span-7 xl:col-span-8' : 'lg:col-span-12'} flex flex-col gap-6`}>
              <div className="bg-white rounded-2xl shadow-sm border border-[#ebe8e3] overflow-hidden">
                <div className="p-5 flex items-center justify-between pb-3 border-b border-[#ebe8e3]">
                  <div>
                    <h2 className="font-serif text-lg font-bold text-[#1c1c19]">Daftar menu</h2>
                    <p className="text-xs text-[#524344]">
                      Status stok bahan baku otomatis dipadukan dengan ketersediaan menu di meja dan kasir.
                    </p>
                  </div>
                  <span className="text-xs text-[#524344] font-medium">
                    {filteredMenuItems.length} menu ditampilkan
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#f6f3ee] text-[#847374] uppercase tracking-wider text-[10px] font-bold">
                        <th className="py-3 px-4 font-semibold">Menu</th>
                        <th className="py-3 px-3 font-semibold">Kategori</th>
                        <th className="py-3 px-3 font-semibold">Harga</th>
                        <th className="py-3 px-3 font-semibold">Ketersediaan</th>
                        <th className="py-3 px-4 text-right font-semibold">Tindakan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ebe8e3]">
                      {filteredMenuItems.map((item) => {
                        const isSelected = selectedItem.id === item.id;

                        return (
                          <tr
                            key={item.id}
                            onClick={() => {
                              if (editPanelOpen && isSelected) {
                                setEditPanelOpen(false);
                              } else {
                                handleSelectToEdit(item);
                              }
                            }}
                            className={`transition-colors cursor-pointer ${
                              editPanelOpen && isSelected
                                ? 'bg-[#ffdadc]/30 font-semibold'
                                : 'hover:bg-[#f6f3ee]'
                            }`}
                          >
                            <td className="py-3.5 px-4 font-bold text-[#3d1018]">
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-9 h-9 rounded-lg object-cover border border-[#ebe8e3] shrink-0"
                                />
                                <div>
                                  <div className="leading-tight">{item.name}</div>
                                  <div className="text-[10px] font-mono text-[#847374] font-normal">
                                    {item.code}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-3 text-[#524344]">{item.category}</td>
                            <td className="py-3.5 px-3 font-bold text-[#1c1c19] tabular-nums">
                              Rp {item.price.toLocaleString('id-ID')}
                            </td>
                            <td className="py-3.5 px-3">
                              {item.isAvailable ? (
                                <span className="text-xs font-medium text-emerald-700">
                                  Tersedia
                                </span>
                              ) : (
                                <span className="text-xs font-medium text-red-600">
                                  Habis
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (editPanelOpen && isSelected) {
                                    setEditPanelOpen(false);
                                  } else {
                                    handleSelectToEdit(item);
                                  }
                                }}
                                className={`font-bold text-xs px-3 py-1 rounded-lg transition-colors ${
                                  editPanelOpen && isSelected
                                    ? 'bg-[#3d1018] text-white shadow-xs'
                                    : 'text-[#3d1018] hover:bg-[#f0ede9]'
                                }`}
                              >
                                {editPanelOpen && isSelected ? 'Tutup' : 'Edit'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Operational Notice Callout */}
                <div className="m-4 p-3 bg-[#f6f3ee] rounded-xl flex items-center justify-between gap-2.5 text-[#524344] text-xs border border-[#ebe8e3]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#994703] text-[18px] shrink-0">
                      info
                    </span>
                    <span>
                      Perubahan ketersediaan tampil di katalog pelanggan dan kasir. Pantau detail stok bahan baku di tab sebelah.
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveSubTab('stok')}
                    className="text-[#994703] font-bold hover:underline shrink-0 text-xs"
                  >
                    Buka Pantau Stok →
                  </button>
                </div>
              </div>

              {/* Category Management Card */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#ebe8e3] flex flex-col gap-3">
                <h3 className="font-serif font-bold text-base text-[#1c1c19]">Kategori menu</h3>
                <div className="flex flex-wrap items-center gap-2">
                  {menuCategories.map((cat, idx) => (
                    <div key={cat} className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold ${idx === 0 ? 'bg-[#ffdadc]/40 text-[#3d1018]' : 'bg-[#f0ede9] text-[#1c1c19]'}`}>
                      <span>{cat}</span>
                      <span className="text-[#847374]">•</span>
                      <span className="text-[11px] opacity-80">{menuItems.filter((m) => m.category === cat).length} menu</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Edit Menu Form Panel — hanya tampil saat dipilih */}
            {editPanelOpen && (
            <div className="lg:col-span-5 xl:col-span-4 bg-white rounded-2xl p-5 shadow-sm border border-[#ebe8e3] flex flex-col gap-3.5 sticky top-20">
              <div className="flex items-center justify-between pb-2 border-b border-[#ebe8e3]">
                <h2 className="font-serif text-lg font-bold text-[#1c1c19]">Edit menu</h2>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-[#ffdadc] text-[#3d1018] font-mono font-bold tracking-wider">
                    {selectedItem.code || 'RG-001'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditPanelOpen(false)}
                    title="Tutup panel edit"
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-[#847374] hover:text-[#3d1018] hover:bg-[#f0ede9] transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              </div>

              {/* Food Image Preview */}
              <div className="relative w-full h-40 rounded-xl overflow-hidden shadow-inner bg-[#f0ede9] border border-[#ebe8e3]">
                <img
                  src={selectedItem.image}
                  alt={selectedItem.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Linked Ingredients Status Section in Menu Editor */}
              <div className="bg-[#fcf9f4] p-3 rounded-xl border border-[#ebe8e3] flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#3d1018] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">inventory</span>
                    <span>Bahan Baku Terkait</span>
                  </span>
                  <button
                    onClick={() => setActiveSubTab('stok')}
                    className="text-[11px] text-[#994703] font-semibold hover:underline"
                  >
                    Kelola Stok
                  </button>
                </div>

                {getLinkedIngredients(selectedItem.name).length === 0 ? (
                  <p className="text-[11px] text-[#847374] italic">
                    Belum ada bahan baku mentah yang dipetakan ke menu ini.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {getLinkedIngredients(selectedItem.name).map((ing) => {
                      const isLow = ing.currentStock <= ing.minimumStock;
                      const isZero = ing.currentStock <= 0;
                      return (
                        <div
                          key={ing.id}
                          className="flex items-center justify-between text-[11px] bg-white p-2 rounded-lg border border-[#ebe8e3]"
                        >
                          <div className="flex flex-col">
                            <span className="font-semibold text-[#1c1c19]">{ing.name}</span>
                            <span className="text-[10px] text-[#847374]">
                              Min: {ing.minimumStock} {ing.unit}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold tabular-nums px-2 py-0.5 rounded ${
                                isZero
                                  ? 'bg-red-100 text-red-700'
                                  : isLow
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {ing.currentStock} {ing.unit}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleOpenRestock(ing)}
                              title="Restok Cepat"
                              className="w-6 h-6 rounded bg-[#f0ede9] hover:bg-[#3d1018] hover:text-white flex items-center justify-center text-[#3d1018] font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <div className="flex flex-col gap-3 text-xs">
                {/* Nama Menu */}
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#1c1c19]">Nama menu</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-10 px-3 bg-[#f6f3ee] text-[#1c1c19] rounded-xl outline-none border border-[#ebe8e3] focus:border-[#3d1018] font-medium"
                  />
                </div>

                {/* Kategori Dropdown */}
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#1c1c19]">Kategori</label>
                  <div className="relative">
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value as any)}
                      className="w-full h-10 px-3 pr-8 bg-[#f6f3ee] text-[#1c1c19] rounded-xl outline-none border border-[#ebe8e3] focus:border-[#3d1018] cursor-pointer appearance-none font-medium"
                    >
                      {menuCategories.map((c) => (<option key={c} value={c}>{c}</option>))}
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[#847374] pointer-events-none text-[16px]">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Harga Jual */}
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#1c1c19]">Harga jual</label>
                  <input
                    type="text"
                    value={`Rp ${parseInt(editPrice.replace(/[^0-9]/g, '') || '0', 10).toLocaleString('id-ID')}`}
                    onChange={(e) => setEditPrice(e.target.value.replace(/[^0-9]/g, ''))}
                    className="h-10 px-3 bg-[#f6f3ee] text-[#1c1c19] rounded-xl outline-none border border-[#ebe8e3] focus:border-[#3d1018] font-bold"
                  />
                </div>

                {/* Deskripsi */}
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#1c1c19]">Deskripsi</label>
                  <textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    rows={2}
                    className="p-3 bg-[#f6f3ee] text-[#1c1c19] rounded-xl outline-none border border-[#ebe8e3] focus:border-[#3d1018] resize-none"
                  />
                </div>

                {/* Toggle Switch Ketersediaan */}
                <div className="flex items-center justify-between py-1">
                  <div className="flex flex-col">
                    <span className="font-bold text-[#1c1c19]">Tersedia</span>
                    <span className="text-[11px] text-[#524344]">Bisa dipesan pelanggan</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditIsAvailable(!editIsAvailable)}
                    className={`w-12 h-6 rounded-full p-0.5 flex items-center transition-colors cursor-pointer ${
                      editIsAvailable ? 'bg-[#3d1018] justify-end' : 'bg-[#d7c2c2] justify-start'
                    }`}
                  >
                    <span className="w-5 h-5 rounded-full bg-white shadow-sm"></span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="w-full h-11 bg-[#3d1018] hover:bg-[#58252c] text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">check</span>
                  <span>Simpan perubahan</span>
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="w-full h-10 bg-[#f6f3ee] hover:bg-[#ebe8e3] text-[#1c1c19] text-xs font-semibold rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                >
                  <span>Tutup panel</span>
                </button>
              </div>
            </div>
            )}
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 2: PEMANTAUAN STOK BAHAN BAKU (MONITORING & PERINGATAN OTOMATIS) */}
      {/* ========================================================================= */}
      {activeSubTab === 'stok' && (
        <div className="flex flex-col gap-6">
          {/* KPI Summary Header Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Bahan */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#ebe8e3] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#847374]">
                  Total Bahan Baku
                </span>
                <div className="text-2xl sm:text-3xl font-serif font-bold text-[#1c1c19] mt-1 tabular-nums">
                  {rawIngredients.length}
                </div>
                <span className="text-[11px] text-[#524344]">Inventaris bahan terpantau</span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-[#f0ede9] text-[#3d1018] flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">inventory_2</span>
              </div>
            </div>

            {/* Stok Kritis (Habis) */}
            <div
              onClick={() => setStockStatusFilter('kritis')}
              className={`rounded-2xl p-4 sm:p-5 border shadow-xs flex items-center justify-between cursor-pointer transition-all ${
                stockStatusFilter === 'kritis'
                  ? 'bg-red-50 border-red-400 ring-2 ring-red-400'
                  : 'bg-white border-[#ebe8e3] hover:border-red-300'
              }`}
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-700">
                  Stok Habis (0 Unit)
                </span>
                <div className="text-2xl sm:text-3xl font-serif font-bold text-red-700 mt-1 tabular-nums flex items-center gap-1.5">
                  <span>{criticalCount}</span>
                  {criticalCount > 0 && (
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
                  )}
                </div>
                <span className="text-[11px] text-red-600/80">Menu terkait tidak bisa dibuat</span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">cancel</span>
              </div>
            </div>

            {/* Stok Menipis (< Batas Min) */}
            <div
              onClick={() => setStockStatusFilter('menipis')}
              className={`rounded-2xl p-4 sm:p-5 border shadow-xs flex items-center justify-between cursor-pointer transition-all ${
                stockStatusFilter === 'menipis'
                  ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400'
                  : 'bg-white border-[#ebe8e3] hover:border-amber-300'
              }`}
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                  Stok Menipis (Batas Min)
                </span>
                <div className="text-2xl sm:text-3xl font-serif font-bold text-amber-800 mt-1 tabular-nums">
                  {warningCount}
                </div>
                <span className="text-[11px] text-amber-700/80">Perlu reorder ke supplier</span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">notification_important</span>
              </div>
            </div>

            {/* Stok Aman */}
            <div
              onClick={() => setStockStatusFilter('aman')}
              className={`rounded-2xl p-4 sm:p-5 border shadow-xs flex items-center justify-between cursor-pointer transition-all ${
                stockStatusFilter === 'aman'
                  ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400'
                  : 'bg-white border-[#ebe8e3] hover:border-emerald-300'
              }`}
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  Stok Aman (Normal)
                </span>
                <div className="text-2xl sm:text-3xl font-serif font-bold text-emerald-700 mt-1 tabular-nums">
                  {safeCount}
                </div>
                <span className="text-[11px] text-emerald-600/80">Diatas batas minimum</span>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">verified</span>
              </div>
            </div>
          </div>

          {/* Filter Bar, Search, and Action Strip */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#847374] text-[20px]">
                  search
                </span>
                <input
                  type="text"
                  value={searchStockQuery}
                  onChange={(e) => setSearchStockQuery(e.target.value)}
                  placeholder="Cari nama bahan, kode (BAHAN-01), supplier, atau menu terkait..."
                  className="w-full h-11 pl-10 pr-4 bg-white text-[#1c1c19] text-sm rounded-xl shadow-sm border border-[#ebe8e3] outline-none focus:border-[#3d1018]"
                />
              </div>

              {/* Status Filter Dropdown / Buttons */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {(
                  [
                    { key: 'semua', label: 'Semua Status' },
                    { key: 'kritis', label: `Habis (${criticalCount})` },
                    { key: 'menipis', label: `Menipis (${warningCount})` },
                    { key: 'aman', label: `Aman (${safeCount})` }
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setStockStatusFilter(tab.key)}
                    className={`h-11 px-3.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      stockStatusFilter === tab.key
                        ? 'bg-[#3d1018] text-white shadow-xs'
                        : 'bg-white text-[#524344] border border-[#ebe8e3] hover:bg-[#f6f3ee]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {[
                'Semua',
                'Daging & Unggas',
                'Bumbu & Rempah',
                'Beras & Pokok',
                'Sayur & Pelengkap',
                'Minuman'
              ].map((cat) => {
                const isActive = stockCategoryFilter === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setStockCategoryFilter(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#994703] text-white shadow-xs'
                        : 'bg-white text-[#524344] border border-[#ebe8e3] hover:bg-[#f6f3ee]'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Stock Monitoring Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#ebe8e3] overflow-hidden">
            <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#ebe8e3] bg-[#faf8f5]">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#1c1c19] flex items-center gap-2">
                  <span>Daftar Pemantauan Inventaris Bahan Baku</span>
                  <span className="text-xs font-sans font-normal text-[#847374]">
                    ({filteredIngredients.length} dari {rawIngredients.length} item)
                  </span>
                </h3>
                <p className="text-xs text-[#524344] mt-0.5">
                  Klik tombol <strong>+ Restok</strong> untuk menambah stok saat barang datang, atau ubah <strong>Batas Min</strong> untuk menyesuaikan sensor peringatan otomatis.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // Quick test: simulate deduction on first low stock item
                    const target = rawIngredients[0];
                    if (target) handleSimulateUsage(target.id, 0.5);
                  }}
                  className="px-3 py-1.5 bg-[#f6f3ee] hover:bg-[#ebe8e3] text-[#3d1018] rounded-xl text-xs font-bold border border-[#ebe8e3] transition-colors flex items-center gap-1.5"
                  title="Simulasikan pengurangan stok saat memasak pesanan"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#994703]">soup_kitchen</span>
                  <span>Uji Pengurangan Stok (-0.5)</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#f6f3ee] text-[#847374] uppercase tracking-wider text-[10px] font-bold">
                    <th className="py-3 px-4 font-semibold">Kode & Bahan Baku</th>
                    <th className="py-3 px-3 font-semibold">Kategori</th>
                    <th className="py-3 px-3 font-semibold">Supplier & Restok</th>
                    <th className="py-3 px-3 font-semibold text-center">Stok Saat Ini</th>
                    <th className="py-3 px-3 font-semibold text-center">Batas Minimum</th>
                    <th className="py-3 px-4 font-semibold">Kapasitas / Safety Buffer</th>
                    <th className="py-3 px-3 font-semibold text-center">Status</th>
                    <th className="py-3 px-3 font-semibold">Menu Terkait</th>
                    <th className="py-3 px-4 text-right font-semibold">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ebe8e3]">
                  {filteredIngredients.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-[#847374]">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-4xl text-[#d7c2c2]">
                            inventory_2
                          </span>
                          <span className="font-semibold text-sm">Tidak ada bahan baku yang cocok</span>
                          <span className="text-xs">Coba sesuaikan kata kunci pencarian atau filter status</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredIngredients.map((ing) => {
                      const isZero = ing.currentStock <= 0;
                      const isLow = ing.currentStock <= ing.minimumStock;
                      // Buffer percentage relative to minimum
                      const bufferPct = Math.min(200, Math.round((ing.currentStock / Math.max(1, ing.minimumStock)) * 100));

                      return (
                        <tr
                          key={ing.id}
                          className={`transition-colors hover:bg-[#faf8f5] ${
                            isZero
                              ? 'bg-red-50/50'
                              : isLow
                              ? 'bg-amber-50/40'
                              : ''
                          }`}
                        >
                          {/* Kode & Nama */}
                          <td className="py-3.5 px-4 font-bold text-[#1c1c19]">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-mono text-[#994703] font-bold">
                                {ing.code}
                              </span>
                              <span className="text-xs text-[#1c1c19]">{ing.name}</span>
                            </div>
                          </td>

                          {/* Kategori */}
                          <td className="py-3.5 px-3">
                            <span className="px-2 py-0.5 rounded-md bg-[#f0ede9] text-[#524344] text-[10px] font-semibold whitespace-nowrap">
                              {ing.category}
                            </span>
                          </td>

                          {/* Supplier & Terakhir Restok */}
                          <td className="py-3.5 px-3 text-[#524344]">
                            <div className="flex flex-col">
                              <span className="font-semibold text-[#1c1c19] text-[11px]">
                                {ing.supplier}
                              </span>
                              <span className="text-[10px] text-[#847374]">
                                Restok: {ing.lastRestocked} • Rp {ing.costPerUnit.toLocaleString('id-ID')}/{ing.unit}
                              </span>
                            </div>
                          </td>

                          {/* Stok Saat Ini dengan Stepper Cepat */}
                          <td className="py-3.5 px-3 text-center">
                            <div className="inline-flex items-center gap-1.5 bg-[#f6f3ee] px-2 py-1 rounded-xl border border-[#ebe8e3]">
                              <button
                                onClick={() => handleSimulateUsage(ing.id, 0.5)}
                                title="Kurangi 0.5 unit"
                                className="w-5 h-5 rounded bg-white hover:bg-[#d7c2c2] text-[#3d1018] font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
                              >
                                -
                              </button>
                              <span
                                className={`font-bold tabular-nums text-xs px-1 ${
                                  isZero
                                    ? 'text-red-700 font-extrabold'
                                    : isLow
                                    ? 'text-amber-800'
                                    : 'text-[#1c1c19]'
                                }`}
                              >
                                {ing.currentStock} {ing.unit}
                              </span>
                              <button
                                onClick={() => restockIngredient(ing.id, 1)}
                                title="Tambah 1 unit"
                                className="w-5 h-5 rounded bg-white hover:bg-[#d7c2c2] text-[#3d1018] font-bold text-xs flex items-center justify-center transition-colors cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          {/* Batas Minimum (Threshold) */}
                          <td className="py-3.5 px-3 text-center">
                            <button
                              onClick={() => handleOpenEditThreshold(ing)}
                              title="Klik untuk ubah ambang batas minimum"
                              className="group inline-flex items-center gap-1 font-mono font-bold text-xs text-[#524344] hover:text-[#3d1018] bg-[#f0ede9] hover:bg-[#ffdadc] px-2 py-1 rounded-lg transition-colors cursor-pointer"
                            >
                              <span>
                                {ing.minimumStock} {ing.unit}
                              </span>
                              <span className="material-symbols-outlined text-[12px] opacity-60 group-hover:opacity-100">
                                edit
                              </span>
                            </button>
                          </td>

                          {/* Kapasitas / Buffer Bar */}
                          <td className="py-3.5 px-4 min-w-[140px]">
                            <div className="flex flex-col gap-1">
                              <div className="flex justify-between text-[10px] text-[#524344]">
                                <span>{bufferPct}% safety</span>
                                <span className="font-semibold">
                                  {isZero ? '0%' : `${ing.currentStock}/${ing.minimumStock} ${ing.unit}`}
                                </span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-[#ebe8e3] overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-300 ${
                                    isZero
                                      ? 'w-0'
                                      : isLow
                                      ? 'bg-amber-500'
                                      : 'bg-emerald-600'
                                  }`}
                                  style={{ width: `${Math.min(100, (ing.currentStock / (ing.minimumStock * 1.5)) * 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>

                          {/* Status Stok */}
                          <td className="py-3.5 px-3 text-center whitespace-nowrap">
                            {isZero ? (
                              <span className="text-xs font-medium text-red-600">
                                Habis
                              </span>
                            ) : isLow ? (
                              <span className="text-xs font-medium text-amber-700">
                                Menipis
                              </span>
                            ) : (
                              <span className="text-xs font-medium text-emerald-700">
                                Aman
                              </span>
                            )}
                          </td>

                          {/* Menu Terkait */}
                          <td className="py-3.5 px-3">
                            <div className="flex flex-wrap gap-1 max-w-[180px]">
                              {ing.linkedMenuItems.map((menuName) => (
                                <span
                                  key={menuName}
                                  className="text-[10px] px-1.5 py-0.5 rounded bg-[#f6f3ee] text-[#524344] border border-[#ebe8e3] truncate max-w-[140px]"
                                  title={menuName}
                                >
                                  {menuName}
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* Tindakan */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenRestock(ing)}
                                className="px-2.5 py-1 bg-[#3d1018] hover:bg-[#58252c] text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[14px]">add</span>
                                <span>Restok</span>
                              </button>
                              <button
                                onClick={() => handleOpenEditThreshold(ing)}
                                title="Ubah batas minimum peringatan"
                                className="p-1 rounded-lg text-[#524344] hover:bg-[#ebe8e3] transition-colors cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px]">tune</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer info */}
            <div className="p-4 bg-[#fcf9f4] border-t border-[#ebe8e3] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#524344]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#994703] text-[18px]">verified_user</span>
                <span>
                  Sistem peringatan otomatis terus aktif di latar belakang dan memberi peringatan di bilah atas aplikasi.
                </span>
              </div>
              <span className="font-semibold text-[#1c1c19]">
                Terakhir disinkronkan: {new Date().toLocaleTimeString('id-ID')} WIB
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: RESTOK BAHAN BAKU CEPAT                                          */}
      {/* ========================================================================= */}
      {restockModalIngredient && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmRestock}
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-[#ebe8e3] pb-3">
              <div>
                <span className="text-[10px] font-mono text-[#994703] font-bold block">
                  {restockModalIngredient.code}
                </span>
                <span className="font-serif text-xl font-bold text-[#3d1018]">
                  Restok Bahan Baku
                </span>
              </div>
              <button
                type="button"
                onClick={() => setRestockModalIngredient(null)}
                className="w-8 h-8 rounded-full bg-[#f0ede9] flex items-center justify-center text-[#524344] hover:bg-[#d7c2c2]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Current Status Pill */}
            <div className="bg-[#fcf9f4] p-3 rounded-xl border border-[#ebe8e3] flex items-center justify-between text-xs">
              <div>
                <span className="text-[#847374] block">Nama Bahan:</span>
                <span className="font-bold text-[#1c1c19] text-sm">
                  {restockModalIngredient.name}
                </span>
                <span className="text-[11px] text-[#524344] block mt-0.5">
                  Supplier: {restockModalIngredient.supplier}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[#847374] block text-[11px]">Stok Saat Ini:</span>
                <span className="font-bold text-sm text-[#ba1a1a]">
                  {restockModalIngredient.currentStock} {restockModalIngredient.unit}
                </span>
                <span className="text-[10px] text-[#847374] block">
                  Batas Min: {restockModalIngredient.minimumStock} {restockModalIngredient.unit}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-bold text-[#1c1c19] block mb-1">
                  Jumlah yang Ditambahkan ({restockModalIngredient.unit})
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  min="0.1"
                  value={restockQty}
                  onChange={(e) => setRestockQty(e.target.value)}
                  className="w-full h-11 px-3.5 bg-[#f6f3ee] text-[#1c1c19] text-base font-bold rounded-xl outline-none border border-[#ebe8e3] focus:border-[#3d1018]"
                />

                {/* Quick Presets */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] text-[#847374]">Preset:</span>
                  {[2, 5, 10, 20, 50].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRestockQty(preset.toString())}
                      className="px-2.5 py-1 rounded-lg bg-[#f0ede9] hover:bg-[#3d1018] hover:text-white text-[11px] font-bold text-[#3d1018] transition-colors"
                    >
                      +{preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-[#1c1c19] block mb-1">
                  Catatan Pengiriman / No. Faktur (Opsional)
                </label>
                <input
                  type="text"
                  value={restockNote}
                  onChange={(e) => setRestockNote(e.target.value)}
                  className="w-full h-11 px-3.5 bg-[#f6f3ee] text-[#1c1c19] rounded-xl outline-none border border-[#ebe8e3] focus:border-[#3d1018]"
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">info</span>
                <span>
                  Setelah ditambah, stok baru akan menjadi{' '}
                  <strong>
                    {Math.round(
                      (restockModalIngredient.currentStock + (parseFloat(restockQty) || 0)) * 10
                    ) / 10}{' '}
                    {restockModalIngredient.unit}
                  </strong>{' '}
                  dan status peringatan otomatis akan diperbarui.
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRestockModalIngredient(null)}
                className="flex-1 h-11 rounded-xl bg-[#f0ede9] text-[#1c1c19] text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 h-11 rounded-xl bg-[#3d1018] hover:bg-[#58252c] text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                Simpan & Update Stok
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: UBAH AMBANG BATAS MINIMUM PERINGATAN                            */}
      {/* ========================================================================= */}
      {editThresholdIngredient && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmThreshold}
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-[#ebe8e3] pb-3">
              <span className="font-serif text-xl font-bold text-[#3d1018]">
                Atur Batas Minimum Stok
              </span>
              <button
                type="button"
                onClick={() => setEditThresholdIngredient(null)}
                className="w-8 h-8 rounded-full bg-[#f0ede9] flex items-center justify-center text-[#524344]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <p className="text-xs text-[#524344]">
              Tentukan batas minimum stok untuk <strong>{editThresholdIngredient.name}</strong>. Peringatan otomatis akan berbunyi dan tampil jika stok riil mencapai atau berada di bawah angka ini.
            </p>

            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-bold text-[#1c1c19] block mb-1">
                  Batas Minimum Peringatan ({editThresholdIngredient.unit})
                </label>
                <input
                  type="number"
                  step="0.5"
                  required
                  min="0"
                  value={newThresholdVal}
                  onChange={(e) => setNewThresholdVal(e.target.value)}
                  className="w-full h-11 px-3.5 bg-[#f6f3ee] text-[#1c1c19] text-base font-bold rounded-xl outline-none border border-[#ebe8e3] focus:border-[#3d1018]"
                />
              </div>

              <div className="bg-[#fcf9f4] p-3 rounded-xl border border-[#ebe8e3] text-xs text-[#524344]">
                <div className="flex justify-between py-0.5">
                  <span>Stok saat ini:</span>
                  <span className="font-bold text-[#1c1c19]">
                    {editThresholdIngredient.currentStock} {editThresholdIngredient.unit}
                  </span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span>Batas min baru:</span>
                  <span className="font-bold text-[#994703]">
                    {newThresholdVal || 0} {editThresholdIngredient.unit}
                  </span>
                </div>
                <div className="flex justify-between py-0.5 pt-1 border-t border-[#ebe8e3] font-semibold">
                  <span>Status setelah disimpan:</span>
                  <span
                    className={
                      editThresholdIngredient.currentStock <= (parseFloat(newThresholdVal) || 0)
                        ? 'text-red-700'
                        : 'text-emerald-700'
                    }
                  >
                    {editThresholdIngredient.currentStock <= (parseFloat(newThresholdVal) || 0)
                      ? '⚠️ Peringatan Otomatis Aktif'
                      : '✅ Stok Aman'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditThresholdIngredient(null)}
                className="flex-1 h-11 rounded-xl bg-[#f0ede9] text-[#1c1c19] text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 h-11 rounded-xl bg-[#3d1018] hover:bg-[#58252c] text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                Terapkan Batas Min
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: TAMBAH BAHAN BAKU BARU KE INVENTARIS                             */}
      {/* ========================================================================= */}
      {showAddIngredientModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddNewIngredient}
            className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-[#ebe8e3] pb-3">
              <span className="font-serif text-xl font-bold text-[#3d1018]">
                Tambah Bahan Baku Baru
              </span>
              <button
                type="button"
                onClick={() => setShowAddIngredientModal(false)}
                className="w-8 h-8 rounded-full bg-[#f0ede9] flex items-center justify-center text-[#524344]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="font-bold text-[#1c1c19] block mb-1">Nama Bahan Baku</label>
                <input
                  type="text"
                  required
                  value={newIngName}
                  onChange={(e) => setNewIngName(e.target.value)}
                  placeholder="Contoh: Daging Iga Sapi, Kerupuk Udang..."
                  className="w-full h-11 px-3.5 bg-[#f6f3ee] rounded-xl outline-none border border-[#ebe8e3] focus:border-[#3d1018]"
                />
              </div>

              <div>
                <label className="font-bold text-[#1c1c19] block mb-1">Kode Bahan</label>
                <input
                  type="text"
                  value={newIngCode}
                  onChange={(e) => setNewIngCode(e.target.value)}
                  placeholder={`BAHAN-${String(rawIngredients.length + 1).padStart(2, '0')}`}
                  className="w-full h-11 px-3.5 bg-[#f6f3ee] rounded-xl outline-none border border-[#ebe8e3] focus:border-[#3d1018] font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-[#1c1c19] block mb-1">Kategori</label>
                <select
                  value={newIngCategory}
                  onChange={(e) => setNewIngCategory(e.target.value as any)}
                  className="w-full h-11 px-3.5 bg-[#f6f3ee] rounded-xl outline-none border border-[#ebe8e3] focus:border-[#3d1018]"
                >
                  <option value="Daging & Unggas">Daging & Unggas</option>
                  <option value="Bumbu & Rempah">Bumbu & Rempah</option>
                  <option value="Beras & Pokok">Beras & Pokok</option>
                  <option value="Sayur & Pelengkap">Sayur & Pelengkap</option>
                  <option value="Minuman">Minuman</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#1c1c19] block mb-1">Stok Awal</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={newIngStock}
                  onChange={(e) => setNewIngStock(e.target.value)}
                  className="w-full h-11 px-3.5 bg-[#f6f3ee] rounded-xl outline-none border border-[#ebe8e3] focus:border-[#3d1018]"
                />
              </div>

              <div>
                <label className="font-bold text-[#1c1c19] block mb-1">Batas Minimum (Peringatan)</label>
                <input
                  type="number"
                  step="0.5"
                  required
                  value={newIngMin}
                  onChange={(e) => setNewIngMin(e.target.value)}
                  className="w-full h-11 px-3.5 bg-[#f6f3ee] rounded-xl outline-none border border-[#ebe8e3] focus:border-[#3d1018]"
                />
              </div>

              <div>
                <label className="font-bold text-[#1c1c19] block mb-1">Satuan</label>
                <input
                  type="text"
                  required
                  value={newIngUnit}
                  onChange={(e) => setNewIngUnit(e.target.value)}
                  placeholder="kg, butir, papan, pack, liter..."
                  className="w-full h-11 px-3.5 bg-[#f6f3ee] rounded-xl outline-none border border-[#ebe8e3] focus:border-[#3d1018]"
                />
              </div>

              <div>
                <label className="font-bold text-[#1c1c19] block mb-1">Harga Satuan (Rp)</label>
                <input
                  type="number"
                  value={newIngCost}
                  onChange={(e) => setNewIngCost(e.target.value)}
                  placeholder="Contoh: 35000"
                  className="w-full h-11 px-3.5 bg-[#f6f3ee] rounded-xl outline-none border border-[#ebe8e3] focus:border-[#3d1018]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-[#1c1c19] block mb-1">Nama Supplier / Pemasok</label>
                <input
                  type="text"
                  value={newIngSupplier}
                  onChange={(e) => setNewIngSupplier(e.target.value)}
                  placeholder="Contoh: UD Daging Segar, Pasar Pabean..."
                  className="w-full h-11 px-3.5 bg-[#f6f3ee] rounded-xl outline-none border border-[#ebe8e3] focus:border-[#3d1018]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="font-bold text-[#1c1c19] block mb-1">
                  Menu Terkait (pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={newIngLinkedMenus}
                  onChange={(e) => setNewIngLinkedMenus(e.target.value)}
                  placeholder="Rawon Daging Spesial, Rawon Campur..."
                  className="w-full h-11 px-3.5 bg-[#f6f3ee] rounded-xl outline-none border border-[#ebe8e3] focus:border-[#3d1018]"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddIngredientModal(false)}
                className="flex-1 h-11 rounded-xl bg-[#f0ede9] text-[#1c1c19] text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 h-11 rounded-xl bg-[#994703] hover:bg-[#7a3702] text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                Simpan Bahan Baku
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: TAMBAH MENU BARU                                                 */}
      {/* ========================================================================= */}
      {showAddMenuModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddNewMenu}
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-[#ebe8e3] pb-3">
              <span className="font-serif text-xl font-bold text-[#3d1018]">Tambah Menu Baru</span>
              <button
                type="button"
                onClick={() => setShowAddMenuModal(false)}
                className="w-7 h-7 rounded-full bg-[#f0ede9] flex items-center justify-center text-[#524344]"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs">
              <div>
                <label className="font-bold text-[#1c1c19] block mb-1">Nama Menu</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Rawon Iga Bakar"
                  className="w-full h-11 px-3.5 bg-[#f6f3ee] rounded-xl outline-none border border-[#ebe8e3] focus:border-[#3d1018]"
                />
              </div>

              <div>
                <label className="font-bold text-[#1c1c19] block mb-1">Kategori</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full h-11 px-3.5 bg-[#f6f3ee] rounded-xl outline-none border border-[#ebe8e3] focus:border-[#3d1018]"
                >
                  {menuCategories.map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#1c1c19] block mb-1">Harga (Rp)</label>
                <input
                  type="number"
                  required
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="Contoh: 35000"
                  className="w-full h-11 px-3.5 bg-[#f6f3ee] rounded-xl outline-none border border-[#ebe8e3] focus:border-[#3d1018]"
                />
              </div>

              <div>
                <label className="font-bold text-[#1c1c19] block mb-1">Deskripsi Singkat</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={2}
                  placeholder="Keterangan bahan dan bumbu..."
                  className="w-full p-3 bg-[#f6f3ee] rounded-xl outline-none border border-[#ebe8e3] focus:border-[#3d1018] resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddMenuModal(false)}
                className="flex-1 h-11 rounded-xl bg-[#f0ede9] text-[#1c1c19] text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 h-11 rounded-xl bg-[#3d1018] hover:bg-[#58252c] text-white text-xs font-bold shadow-sm"
              >
                Tambah ke Menu
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export const KelolaMenuView: React.FC = () => {
  const { menuItems } = useApp();
  if (!menuItems.length) return <div className="p-10 text-center text-sm text-[#524344]">Belum ada menu. Jalankan supabase/seed.sql terlebih dahulu.</div>;
  return <KelolaMenuViewInner />;
};
