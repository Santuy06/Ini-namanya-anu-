import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { MenuItem } from '../types';
import { CustomizationModal } from './CustomizationModal';

export const MenuScreen: React.FC = () => {
  const {
    selectedTable,
    tableArea,
    cartCount,
    cartTotal,
    quickAddToCart,
    openDetail,
    navigate,
    callWaiter,
    waiterCalled,
    formatRupiah,
    menuItems,
    menuCategories,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);

  const categories = [{ id: 'all', label: 'Semua' }, ...menuCategories.filter((c) => menuItems.some((m) => m.category === c.id))];

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesCategory =
        activeCategory === 'all' || item.categories.includes(activeCategory);
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, menuItems]);

  const mainCards = filteredItems;
  const sideGridItems: MenuItem[] = [];
  const drinkRowItem: MenuItem | undefined = undefined;
  const featured = menuItems.find((m) => m.badge?.type === 'best_seller') || menuItems[0];

  return (
    <div className="flex flex-col w-full pb-28 pt-16 bg-surface min-h-screen">
      {/* Meja Info & Panggil Pelayan Action Card */}
      <section className="px-4 pt-3">
        <div className="bg-surface-container-low rounded-2xl p-4 shadow-xs flex items-center justify-between border border-[#eae3d9]/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center shadow-inner">
              <span className="material-symbols-outlined text-[20px]">table_restaurant</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-sans font-bold text-[14px] text-on-surface">Meja {selectedTable}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                <span className="font-sans text-[12px] font-semibold text-secondary">{tableArea}</span>
              </div>
              <p className="font-sans text-[12px] text-on-surface-variant">Pesan langsung dari genggaman Anda</p>
            </div>
          </div>

          {/* Panggil Pelayan Micro-interaction */}
          <button
            onClick={callWaiter}
            className={`px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-xs active:scale-95 transition-all cursor-pointer ${
              waiterCalled
                ? 'bg-secondary-fixed text-on-secondary-fixed ring-1 ring-secondary/40'
                : 'bg-surface-container text-primary hover:bg-primary-container hover:text-on-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {waiterCalled ? 'hourglass_top' : 'notifications_active'}
            </span>
            <span className="font-sans text-[11px] font-semibold whitespace-nowrap">
              {waiterCalled ? 'Pelayan Dipanggil' : 'Panggil Pelayan'}
            </span>
          </button>
        </div>
      </section>

      {/* Search Input */}
      <section className="px-4 pt-3">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
            search
          </span>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari rawon, sambal, minuman segar..."
            type="text"
            className="w-full h-11 pl-11 pr-10 rounded-xl bg-surface-container-lowest text-on-surface font-sans text-[14px] placeholder:text-on-surface-variant/70 shadow-xs border border-[#eae3d9]/70 focus:outline-none focus:border-primary/60 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary p-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>
      </section>

      {/* Category Pills Filter Bar (Horizontal Scroll) */}
      <section className="pt-3">
        <div className="flex items-center gap-2 overflow-x-auto px-4 pb-1 no-scrollbar">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-full font-sans text-[12px] font-semibold shadow-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary-container text-on-primary shadow-sm scale-102'
                    : 'bg-surface-container-lowest text-on-surface-variant hover:text-primary border border-[#eae3d9]/70'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Special Banner: Resep Warisan 1974 */}
      <section className="px-4 pt-3">
        <div
          onClick={() => {
            if (featured) openDetail(featured);
          }}
          className="bg-gradient-to-r from-primary-container to-secondary-container/90 rounded-2xl p-4 text-on-primary flex items-center justify-between shadow-md relative overflow-hidden cursor-pointer group active:scale-[0.99] transition-transform"
        >
          <div className="relative z-10 max-w-[70%]">
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-surface-bright/20 font-sans text-[10px] font-bold uppercase tracking-wider mb-1 text-on-primary">
              Resep Warisan 1974
            </span>
            <h2 className="font-serif text-[22px] font-bold text-on-primary leading-tight">
              Rawon Gurih Medok
            </h2>
            <p className="font-sans text-[12px] text-on-primary/90 mt-1 leading-snug">
              Kluwek pilihan pegunungan dengan potongan daging empuk berkeringat sambal terasi.
            </p>
          </div>
          <div className="w-16 h-16 rounded-full bg-on-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-[36px] text-on-primary">
              local_fire_department
            </span>
          </div>
        </div>
      </section>

      {/* Menu Catalog List Section */}
      <section className="px-4 pt-4 flex flex-col gap-3.5">
        {/* Main large cards */}
        {mainCards.map((item) => (
          <article
            key={item.id}
            className="bg-surface-container-lowest rounded-2xl p-3.5 shadow-xs border border-[#eae3d9]/70 flex flex-col gap-2.5 hover:shadow-md transition-shadow"
          >
            <div className="flex gap-3.5">
              {/* Product Image */}
              <div
                onClick={() => openDetail(item)}
                className="relative w-28 h-28 shrink-0 rounded-xl overflow-hidden bg-surface-container cursor-pointer group"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {item.badge && (
                  <span
                    className={`absolute top-1.5 left-1.5 font-sans text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-0.5 ${
                      item.badge.type === 'best_seller'
                        ? 'bg-secondary text-on-secondary'
                        : item.badge.type === 'chef'
                        ? 'bg-primary-container text-on-primary'
                        : item.badge.type === 'favorite'
                        ? 'bg-secondary text-on-secondary'
                        : 'bg-primary-container text-on-primary'
                    }`}
                  >
                    {item.badge.type === 'best_seller' && (
                      <span
                        className="material-symbols-outlined text-[11px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                    )}
                    {item.badge.text}
                  </span>
                )}
              </div>

              {/* Product Details */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                <div onClick={() => openDetail(item)} className="cursor-pointer">
                  <h3 className="font-sans font-bold text-[15px] text-on-surface truncate group-hover:text-primary transition-colors">
                    {item.name}
                  </h3>
                  <p className="font-sans text-[12px] text-on-surface-variant line-clamp-2 mt-0.5 leading-snug">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-sans font-bold text-[17px] text-primary">
                    {formatRupiah(item.price)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Row */}
            <div className="flex items-center justify-between pt-1 border-t border-[#eae3d9]/40">
              <div className="flex items-center gap-1.5 overflow-hidden">
                {item.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-surface-container-high text-on-surface-variant font-sans text-[11px] px-2 py-0.5 rounded-md truncate"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {item.id === 'rawon-spesial' && (
                  <button
                    onClick={() => setCustomizingItem(item)}
                    className="bg-surface-container text-on-surface-variant font-sans font-medium text-[11px] px-2.5 py-1.5 rounded-lg hover:bg-surface-variant active:scale-95 transition-all cursor-pointer"
                  >
                    Kustomisasi
                  </button>
                )}
                <button
                  onClick={() => quickAddToCart(item)}
                  className="bg-primary-container text-on-primary font-sans font-semibold text-[12px] px-3.5 py-1.5 rounded-lg flex items-center gap-1 active:scale-95 transition-all shadow-xs hover:bg-primary cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Tambah
                </button>
              </div>
            </div>
          </article>
        ))}

        {/* Two-column row for Sides & Drinks (Telur Asin & Es Jeruk) */}
        {sideGridItems.length > 0 && (
          <div className="grid grid-cols-2 gap-3.5">
            {sideGridItems.map((item) => (
              <article
                key={item.id}
                className="bg-surface-container-lowest rounded-2xl p-3.5 shadow-xs border border-[#eae3d9]/70 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <div
                    onClick={() => openDetail(item)}
                    className="relative w-full h-24 rounded-xl overflow-hidden bg-surface-container mb-2 cursor-pointer group"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h4
                    onClick={() => openDetail(item)}
                    className="font-sans font-bold text-[14px] text-on-surface line-clamp-1 cursor-pointer"
                  >
                    {item.name}
                  </h4>
                  <p className="font-sans text-[11px] text-on-surface-variant mt-0.5 line-clamp-2 leading-tight">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-[#eae3d9]/40">
                  <span className="font-sans font-bold text-[14px] text-primary">
                    {formatRupiah(item.price)}
                  </span>
                  <button
                    onClick={() => quickAddToCart(item)}
                    className="w-8 h-8 rounded-lg bg-surface-container text-primary hover:bg-primary-container hover:text-on-primary flex items-center justify-center transition-all shadow-xs active:scale-90 cursor-pointer"
                    title={`Tambah ${item.name}`}
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Row for Es Teh Melati Solo */}
        {drinkRowItem && (
          <article className="bg-surface-container-lowest rounded-2xl p-3.5 shadow-xs border border-[#eae3d9]/70 flex items-center justify-between gap-3 hover:shadow-md transition-shadow">
            <div
              onClick={() => openDetail(drinkRowItem)}
              className="flex items-center gap-3 min-w-0 cursor-pointer group"
            >
              <div className="w-16 h-16 rounded-xl bg-surface-container shrink-0 overflow-hidden">
                <img
                  src={drinkRowItem.image}
                  alt={drinkRowItem.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="min-w-0">
                <h4 className="font-sans font-bold text-[14px] text-on-surface truncate">
                  {drinkRowItem.name}
                </h4>
                <p className="font-sans text-[11px] text-on-surface-variant truncate">
                  {drinkRowItem.description}
                </p>
                <span className="font-sans font-bold text-[14px] text-primary mt-0.5 inline-block">
                  {formatRupiah(drinkRowItem.price)}
                </span>
              </div>
            </div>

            <button
              onClick={() => quickAddToCart(drinkRowItem)}
              className="bg-primary-container text-on-primary font-sans font-semibold text-[12px] px-3.5 py-1.5 rounded-lg flex items-center gap-1 active:scale-95 transition-all shadow-xs hover:bg-primary shrink-0 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Tambah
            </button>
          </article>
        )}

        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl mb-2 text-outline">search_off</span>
            <p className="font-sans font-medium text-sm">Tidak ditemukan menu dengan kata kunci tersebut.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="mt-3 text-secondary text-xs font-semibold underline"
            >
              Tampilkan semua menu
            </button>
          </div>
        )}
      </section>

      {/* Sticky Floating Bottom Cart Bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-20 left-0 right-0 z-30 px-4 pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto bg-primary text-on-primary rounded-2xl p-3 shadow-xl flex items-center justify-between gap-3 transform translate-y-0 transition-transform border border-primary-fixed/20 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-on-secondary shadow-inner">
                <span className="material-symbols-outlined text-[20px]">shopping_basket</span>
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-surface-container-lowest text-primary rounded-full font-sans text-[10px] leading-tight font-bold">
                  {cartCount}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-sans text-[11px] text-on-primary/80">
                  {cartCount} Item dipilih
                </span>
                <span className="font-sans text-[15px] text-on-primary font-bold">
                  {formatRupiah(cartTotal)}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('cart')}
              className="bg-secondary hover:bg-secondary/90 active:scale-95 text-on-secondary px-4 py-2 rounded-xl font-sans font-semibold text-[12px] flex items-center gap-1 shadow-md transition-all cursor-pointer"
            >
              <span>Lihat Pesanan</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* Quick Customization Drawer Modal */}
      {customizingItem && (
        <CustomizationModal
          isOpen={!!customizingItem}
          onClose={() => setCustomizingItem(null)}
          item={customizingItem}
        />
      )}
    </div>
  );
};
