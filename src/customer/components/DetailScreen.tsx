import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';

export const DetailScreen: React.FC = () => {
  const {
    selectedMenuItem,
    selectedTable,
    addToCart,
    navigate,
    formatRupiah,
    extraOptions,
  } = useApp();

  const item = selectedMenuItem;

  // Form selections
  const [kuah, setKuah] = useState<'campur' | 'pisah'>('campur');
  const [pedas, setPedas] = useState<'0' | '1' | '2'>('1');
  const [selectedExtras, setSelectedExtras] = useState<string[]>(['Kerupuk Udang Jumbo']);
  const [kitchenNote, setKitchenNote] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Extras cost calculation
  const extrasCost = useMemo(() => {
    return selectedExtras.reduce((sum, extraName) => {
      const match = extraOptions.find((opt) => opt.name === extraName);
      return sum + (match ? match.price : 0);
    }, 0);
  }, [selectedExtras]);

  const portionPrice = item.price + extrasCost;
  const grandTotalPrice = portionPrice * quantity;

  const toggleExtra = (extraName: string) => {
    setSelectedExtras((prev) =>
      prev.includes(extraName) ? prev.filter((e) => e !== extraName) : [...prev, extraName]
    );
  };

  const handleSaveToTable = () => {
    setIsSubmitting(true);
    addToCart(
      item,
      {
        kuah,
        pedas,
        sayur: 'lengkap',
        extras: selectedExtras,
        kitchenNotes: kitchenNote,
      },
      quantity
    );

    setTimeout(() => {
      setIsSubmitting(false);
      navigate('menu');
    }, 450);
  };

  const heroImageSrc = item.heroImage || item.image;

  return (
    <div className="flex flex-col w-full pb-8 pt-16 bg-surface min-h-screen">
      {/* Hero Showcase Image */}
      <div className="relative w-full h-72 overflow-hidden bg-surface-container">
        <img
          src={heroImageSrc}
          alt={item.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-primary/40 pointer-events-none" />

        {/* Floating Quick Tags */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-full bg-primary/80 backdrop-blur-md text-on-primary font-sans text-[11px] font-semibold shadow-xs flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
            Resep Warisan 1974
          </span>
          <span className="px-3 py-1 rounded-full bg-secondary-container/90 backdrop-blur-md text-on-secondary-container font-sans text-[11px] font-bold shadow-xs">
            Best Seller #1
          </span>
        </div>

        {/* Rating & Serving Badge */}
        <div className="absolute bottom-3 right-4 bg-surface-container-lowest/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-xs flex items-center gap-1.5 border border-[#eae3d9]/60">
          <span
            className="material-symbols-outlined text-[16px] text-secondary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            star
          </span>
          <span className="font-sans font-bold text-[14px] text-primary leading-none">
            {item.rating || 4.9}
          </span>
          <span className="font-sans text-[11px] text-on-surface-variant font-medium">
            ({item.reviewCount || 320} ulasan)
          </span>
        </div>
      </div>

      {/* Content Canvas */}
      <div className="px-4 pt-4 flex flex-col gap-5">
        {/* Header Title & Price */}
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-serif text-[24px] font-bold text-primary leading-tight">
              {item.name}
            </h2>
            <span className="font-sans text-[18px] text-secondary font-bold whitespace-nowrap">
              {formatRupiah(item.price)}
            </span>
          </div>
          <p className="font-sans text-[13px] text-on-surface-variant leading-relaxed">
            {item.longDescription || item.description}
          </p>
        </div>

        {/* Customization Form */}
        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4">
          {/* Option 1: Pilihan Kuah (Wajib) */}
          <section className="bg-surface-container-low p-4 rounded-2xl flex flex-col gap-2.5 shadow-xs border border-[#eae3d9]/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[20px] text-primary">soup_kitchen</span>
                <span className="font-sans font-bold text-[15px] text-on-surface">Penyajian Kuah Rawon</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary font-sans text-[10px] font-bold uppercase tracking-wider">
                Wajib
              </span>
            </div>
            <p className="font-sans text-[12px] text-on-surface-variant">Pilih preferensi penyajian kuah kluwek hangat Anda.</p>

            <div className="grid grid-cols-1 gap-2 pt-1">
              {/* Option A: Campur */}
              <label
                onClick={() => setKuah('campur')}
                className={`relative flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                  kuah === 'campur'
                    ? 'bg-primary-fixed/40 border-primary/30'
                    : 'bg-surface-container-lowest border-[#eae3d9]/70 hover:bg-surface-container'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="kuah"
                    checked={kuah === 'campur'}
                    onChange={() => setKuah('campur')}
                    className="w-4 h-4 accent-primary"
                  />
                  <div className="flex flex-col">
                    <span className="font-sans font-bold text-[13px] text-on-surface">Kuah Dicampur Langsung</span>
                    <span className="font-sans text-[11px] text-on-surface-variant">Gaya otentik, bumbu rempah langsung meresap ke nasi</span>
                  </div>
                </div>
                <span className="font-sans text-[11px] text-secondary font-bold">Bawaan</span>
              </label>

              {/* Option B: Pisah */}
              <label
                onClick={() => setKuah('pisah')}
                className={`relative flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                  kuah === 'pisah'
                    ? 'bg-primary-fixed/40 border-primary/30'
                    : 'bg-surface-container-lowest border-[#eae3d9]/70 hover:bg-surface-container'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="kuah"
                    checked={kuah === 'pisah'}
                    onChange={() => setKuah('pisah')}
                    className="w-4 h-4 accent-primary"
                  />
                  <div className="flex flex-col">
                    <span className="font-sans font-bold text-[13px] text-on-surface">Kuah Dipisah</span>
                    <span className="font-sans text-[11px] text-on-surface-variant">Disajikan terpisah dalam mangkuk tanah liat panas</span>
                  </div>
                </div>
                <span className="font-sans text-[11px] text-on-surface-variant font-medium">Gratis</span>
              </label>
            </div>
          </section>

          {/* Option 2: Tingkat Pedas Sambal Terasi (Wajib) */}
          <section className="bg-surface-container-low p-4 rounded-2xl flex flex-col gap-2.5 shadow-xs border border-[#eae3d9]/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[20px] text-secondary">local_fire_department</span>
                <span className="font-sans font-bold text-[15px] text-on-surface">Pedas Sambal Terasi</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary font-sans text-[10px] font-bold uppercase tracking-wider">
                Wajib
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {/* Level 0 */}
              <button
                type="button"
                onClick={() => setPedas('0')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-center transition-all cursor-pointer ${
                  pedas === '0'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container-lowest text-on-surface border border-[#eae3d9]/70 hover:bg-surface-container'
                }`}
              >
                <span className="font-sans font-bold text-[12px]">Tidak Pedas</span>
                <span className="font-sans text-[10px] opacity-80 mt-0.5">Sambal Pisah</span>
              </button>

              {/* Level 1 (Default) */}
              <button
                type="button"
                onClick={() => setPedas('1')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-center transition-all cursor-pointer ${
                  pedas === '1'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container-lowest text-on-surface border border-[#eae3d9]/70 hover:bg-surface-container'
                }`}
              >
                <span className="font-sans font-bold text-[12px]">Sedang</span>
                <span className="font-sans text-[10px] text-secondary-fixed mt-0.5 font-semibold">Rekomendasi</span>
              </button>

              {/* Level 2 */}
              <button
                type="button"
                onClick={() => setPedas('2')}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl text-center transition-all cursor-pointer ${
                  pedas === '2'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container-lowest text-on-surface border border-[#eae3d9]/70 hover:bg-surface-container'
                }`}
              >
                <span className="font-sans font-bold text-[12px]">Mantap 🔥</span>
                <span className="font-sans text-[10px] opacity-80 mt-0.5">Ekstra Cabai</span>
              </button>
            </div>
          </section>

          {/* Option 3: Topping & Lauk Pendamping (Opsional) */}
          <section className="bg-surface-container-low p-4 rounded-2xl flex flex-col gap-2.5 shadow-xs border border-[#eae3d9]/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[20px] text-primary">add_circle_outline</span>
                <span className="font-sans font-bold text-[15px] text-on-surface">Topping &amp; Lauk Pendamping</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-sans text-[10px] font-bold uppercase tracking-wider">
                Opsional
              </span>
            </div>
            <p className="font-sans text-[12px] text-on-surface-variant">Tambahkan lauk pelengkap agar santapan kian berkesan.</p>

            <div className="flex flex-col gap-2 pt-1">
              {extraOptions.map((extra) => {
                const isChecked = selectedExtras.includes(extra.name);
                return (
                  <label
                    key={extra.id}
                    onClick={() => toggleExtra(extra.name)}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                      isChecked
                        ? 'bg-primary-fixed/25 border-primary/25'
                        : 'bg-surface-container-lowest border-[#eae3d9]/70 hover:bg-surface-container'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleExtra(extra.name)}
                        className="w-4 h-4 rounded accent-primary cursor-pointer"
                      />
                      <div className="flex flex-col">
                        <span className="font-sans font-bold text-[13px] text-on-surface">{extra.name}</span>
                        <span className="font-sans text-[11px] text-on-surface-variant">{extra.description}</span>
                      </div>
                    </div>
                    <span className="font-sans font-bold text-[13px] text-primary">
                      +{formatRupiah(extra.price)}
                    </span>
                  </label>
                );
              })}
            </div>
          </section>

          {/* Option 4: Catatan Khusus untuk Kitchen (KDS) */}
          <section className="bg-surface-container-low p-4 rounded-2xl flex flex-col gap-2.5 shadow-xs border border-[#eae3d9]/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[20px] text-primary">dinner_dining</span>
                <label htmlFor="kitchen-note" className="font-sans font-bold text-[15px] text-on-surface cursor-pointer">
                  Catatan Khusus Kitchen
                </label>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-sans text-[10px] font-bold tracking-wider">
                KDS Pos
              </span>
            </div>
            <div className="relative">
              <textarea
                id="kitchen-note"
                value={kitchenNote}
                onChange={(e) => setKitchenNote(e.target.value)}
                placeholder="Misal: Tauge dipisah, kuah minta panas membara, kuah tidak terlalu banyak minyak..."
                rows={2}
                maxLength={100}
                className="w-full bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant/60 font-sans text-[13px] p-3 rounded-xl resize-none focus:outline-none border border-[#eae3d9]/70 focus:border-primary/50 shadow-inner"
              />
            </div>
            <div className="flex items-center gap-1 text-on-surface-variant font-sans text-[11px]">
              <span className="material-symbols-outlined text-[14px]">info</span>
              Instruksi langsung dicetak di station dapur rawon.
            </div>
          </section>

          {/* Sticky-Bottom Order Execution Unit */}
          <div className="sticky bottom-0 -mx-4 px-4 py-3 bg-[#fcf9f4]/95 backdrop-blur-md shadow-[0_-4px_16px_rgba(43,35,37,0.08)] border-t border-[#eae3d9]/70 flex flex-col gap-2 z-30">
            {/* Sub-row: Quantity counter & Unit calculation preview */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-sans text-[11px] text-on-surface-variant">Jumlah Pesanan</span>
                <span className="font-sans text-[13px] text-primary font-bold">
                  {formatRupiah(portionPrice)} / porsi
                </span>
              </div>

              {/* Quantity Stepper Counter */}
              <div className="flex items-center bg-surface-container-high rounded-full p-1 shadow-inner gap-2 border border-[#eae3d9]/60">
                <button
                  type="button"
                  aria-label="Kurang satu"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-full bg-surface-container-lowest text-primary flex items-center justify-center font-bold active:scale-90 transition-all shadow-xs disabled:opacity-40 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">remove</span>
                </button>
                <span className="font-sans text-[15px] text-on-surface font-bold min-w-[24px] text-center">
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label="Tambah satu"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold active:scale-90 transition-all shadow-xs cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                </button>
              </div>
            </div>

            {/* Big Primary CTA Button */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSaveToTable}
              className="w-full h-12 rounded-xl bg-primary-container text-on-primary hover:bg-primary active:scale-[0.98] transition-all flex items-center justify-between px-4 shadow-md cursor-pointer disabled:opacity-80"
            >
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px]">restaurant</span>
                <span className="font-sans font-bold text-[14px]">
                  Simpan ke Meja {selectedTable}
                </span>
              </div>
              <span className="font-sans font-bold text-[15px] tracking-tight">
                {formatRupiah(grandTotalPrice)}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
