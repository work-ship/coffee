import React, { useState, useEffect } from "react";
import { useApp, Product } from "../context/AppContext";
import { 
  Plus, Edit, Trash2, CheckCircle, PackageOpen, 
  X, Loader2, ArrowLeft, RefreshCw, Layers, Sparkles 
} from "lucide-react";
import { api } from "../utils/api";

export const Inventory: React.FC = () => {
  const { products, categories, refreshData, showNotification } = useApp();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [stock, setStock] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [availability, setAvailability] = useState(true);

  // Variants/Extras inputs inline
  const [variantName, setVariantName] = useState("");
  const [variantPrice, setVariantPrice] = useState("");
  const [extraName, setExtraName] = useState("");
  const [extraPrice, setExtraPrice] = useState("");

  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setDiscountPrice("");
    setImageUrl("");
    setStock("9999");
    setCategoryId(categories[0]?.id.toString() || "");
    setAvailability(true);
    setEditingProduct(null);
    setVariantName("");
    setVariantPrice("");
    setExtraName("");
    setExtraPrice("");
  };

  const handleEditClick = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setDescription(p.description || "");
    setPrice(p.price.toString());
    setDiscountPrice(p.discount_price?.toString() || "");
    setImageUrl(p.image_url || "");
    setStock(p.stock.toString());
    setCategoryId(p.category_id.toString());
    setAvailability(p.availability);
    setIsFormOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name,
        description: description || null,
        price: parseFloat(price),
        discount_price: discountPrice ? parseFloat(discountPrice) : null,
        image_url: imageUrl || null,
        stock: 9999,
        category_id: parseInt(categoryId),
        availability,
        is_favorite: editingProduct ? editingProduct.is_favorite : false
      };

      if (editingProduct) {
        await api.updateProduct(editingProduct.id, payload);
        showNotification("Product updated successfully", "success");
      } else {
        await api.createProduct(payload);
        showNotification("Product created successfully", "success");
      }
      await refreshData();
      setIsFormOpen(false);
      resetForm();
    } catch (err: any) {
      showNotification(err.message || "Failed to save product", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.deleteProduct(id);
      showNotification("Product deleted successfully", "success");
      await refreshData();
    } catch (err: any) {
      showNotification(err.message || "Failed to delete product", "error");
    }
  };

  const handleAddVariant = async () => {
    if (!editingProduct || !variantName) return;
    try {
      await api.addProductVariant(editingProduct.id, {
        name: variantName,
        price_override: variantPrice ? parseFloat(variantPrice) : null
      });
      showNotification("Variant added!", "success");
      setVariantName("");
      setVariantPrice("");
      // Refresh current editing state
      const updatedProds = await api.getProducts();
      const nextEdit = updatedProds.find((p: any) => p.id === editingProduct.id);
      if (nextEdit) setEditingProduct(nextEdit);
      await refreshData();
    } catch (err: any) {
      showNotification(err.message || "Failed to add variant", "error");
    }
  };

  const handleAddExtra = async () => {
    if (!editingProduct || !extraName || !extraPrice) return;
    try {
      await api.addProductExtra(editingProduct.id, {
        name: extraName,
        price: parseFloat(extraPrice)
      });
      showNotification("Extra option added!", "success");
      setExtraName("");
      setExtraPrice("");
      const updatedProds = await api.getProducts();
      const nextEdit = updatedProds.find((p: any) => p.id === editingProduct.id);
      if (nextEdit) setEditingProduct(nextEdit);
      await refreshData();
    } catch (err: any) {
      showNotification(err.message || "Failed to add extra option", "error");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-neutral-50/50">
      {/* Title */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-extrabold text-2xl text-neutral-800 tracking-tight">Product Inventory</h1>
          <p className="text-xs text-neutral-450 font-semibold font-medium">Update prices and variants</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsFormOpen(true); }}
          className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2.5 px-6 rounded-2xl shadow-md flex items-center gap-2 transition"
        >
          <Plus className="h-4.5 w-4.5" />
          <span>New Product</span>
        </button>
      </div>

      {isFormOpen ? (
        /* Add/Edit Product Panel Split view */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleSaveProduct} className="lg:col-span-2 bg-white p-6 rounded-3xl border border-neutral-150 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <span className="font-bold text-neutral-850 text-base">{editingProduct ? `Edit ${editingProduct.name}` : "Create New Coffee/Food"}</span>
              <button type="button" onClick={() => { setIsFormOpen(false); resetForm(); }} className="text-neutral-400 hover:text-neutral-650">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-450 uppercase tracking-wider mb-1">Product Name</label>
                <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-neutral-200 p-2.5 text-sm" placeholder="Cappuccino Regular" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-450 uppercase tracking-wider mb-1">Category</label>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full rounded-xl border border-neutral-200 p-2.5 text-sm">
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-450 uppercase tracking-wider mb-1">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-xl border border-neutral-200 p-2.5 text-sm h-20" placeholder="Steamed microfoam poured over double shot espresso..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-450 uppercase tracking-wider mb-1">Price (DH)</label>
                <input type="number" step="0.01" required value={price} onChange={(e) => setPrice(e.target.value)} className="w-full rounded-xl border border-neutral-200 p-2.5 text-sm" placeholder="4.50" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-450 uppercase tracking-wider mb-1">Promo Price (DH)</label>
                <input type="number" step="0.01" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} className="w-full rounded-xl border border-neutral-200 p-2.5 text-sm" placeholder="3.99" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-450 uppercase tracking-wider mb-1">Product Image URL</label>
              <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full rounded-xl border border-neutral-200 p-2.5 text-sm" placeholder="https://images.unsplash.com/... or blank" />
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <input type="checkbox" id="avail" checked={availability} onChange={(e) => setAvailability(e.target.checked)} className="rounded text-orange-500 focus:ring-orange-200" />
              <label htmlFor="avail" className="text-xs font-bold text-neutral-600 uppercase">Available for order immediately</label>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t">
              <button type="button" onClick={() => { setIsFormOpen(false); resetForm(); }} className="border px-6 py-2.5 rounded-xl font-bold text-xs text-neutral-600 hover:bg-neutral-50 transition">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
              </button>
            </div>
          </form>

          {/* Variants and Extras configuration details */}
          <div className="bg-white p-6 rounded-3xl border border-neutral-150 shadow-sm space-y-6">
            <div>
              <h3 className="font-bold text-neutral-800 text-sm">Product Variants</h3>
              <p className="text-[10px] text-neutral-400 font-semibold uppercase">Sizes or Milks configurations</p>
              
              {editingProduct ? (
                <div className="mt-3.5 space-y-3">
                  <div className="flex gap-2">
                    <input type="text" placeholder="e.g. Soy Milk" value={variantName} onChange={(e) => setVariantName(e.target.value)} className="flex-1 rounded-lg border border-neutral-200 p-2 text-xs" />
                    <input type="number" step="0.1" placeholder="+$0.50" value={variantPrice} onChange={(e) => setVariantPrice(e.target.value)} className="w-20 rounded-lg border border-neutral-200 p-2 text-xs" />
                    <button type="button" onClick={handleAddVariant} className="bg-orange-100 text-orange-600 font-bold px-3 rounded-lg text-xs hover:bg-orange-200 transition">Add</button>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto pt-1">
                    {editingProduct.variants.map((v) => (
                      <div key={v.id} className="flex justify-between items-center text-xs font-semibold text-neutral-600 bg-neutral-50 p-2 rounded-lg">
                        <span>{v.name}</span>
                        <span>{v.price_override ? `+${v.price_override.toFixed(2)} DH` : "Standard"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-neutral-400 mt-2.5">Save the product first to configure variants.</p>
              )}
            </div>

            <div className="border-t pt-4">
              <h3 className="font-bold text-neutral-800 text-sm">Add-on Extras</h3>
              <p className="text-[10px] text-neutral-400 font-semibold uppercase">Syrups, extras, toppings prices</p>

              {editingProduct ? (
                <div className="mt-3.5 space-y-3">
                  <div className="flex gap-2">
                    <input type="text" placeholder="e.g. Vanilla Shot" value={extraName} onChange={(e) => setExtraName(e.target.value)} className="flex-1 rounded-lg border border-neutral-200 p-2 text-xs" />
                    <input type="number" step="0.1" placeholder="+$0.60" value={extraPrice} onChange={(e) => setExtraPrice(e.target.value)} className="w-20 rounded-lg border border-neutral-200 p-2 text-xs" />
                    <button type="button" onClick={handleAddExtra} className="bg-orange-100 text-orange-600 font-bold px-3 rounded-lg text-xs hover:bg-orange-200 transition">Add</button>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto pt-1">
                    {editingProduct.extras.map((e) => (
                      <div key={e.id} className="flex justify-between items-center text-xs font-semibold text-neutral-600 bg-neutral-50 p-2 rounded-lg">
                        <span>{e.name}</span>
                        <span>+{e.price.toFixed(2)} DH</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-neutral-400 mt-2.5">Save the product first to configure extras.</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Inventory Table List */
        <div className="bg-white rounded-3xl border border-neutral-150 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-150 text-[10px] font-extrabold text-neutral-450 uppercase tracking-widest">
                  <th className="px-6 py-4.5">Product Name</th>
                  <th className="px-6 py-4.5">Category</th>
                  <th className="px-6 py-4.5">Base Price</th>
                  <th className="px-6 py-4.5">Discount Price</th>
                  <th className="px-6 py-4.5">Status</th>
                  <th className="px-6 py-4.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-sm font-semibold text-neutral-700">
                {products.map((p) => {
                  const cat = categories.find((c) => c.id === p.category_id);
                  return (
                    <tr key={p.id} className="hover:bg-neutral-50/50 transition">
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-3">
                          {p.image_url && <img src={p.image_url} alt={p.name} className="h-9 w-9 rounded-xl object-cover" />}
                          <div>
                            <span className="block font-bold text-neutral-850">{p.name}</span>
                            <span className="text-[10px] text-neutral-400 font-semibold line-clamp-1 max-w-[200px]">{p.description}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4.5 text-neutral-500">{cat?.name || "Uncategorized"}</td>
                      <td className="px-6 py-4.5">{p.price.toFixed(2)} DH</td>
                      <td className="px-6 py-4.5 text-rose-500">{p.discount_price ? `${p.discount_price.toFixed(2)} DH` : "-"}</td>
                      <td className="px-6 py-4.5">
                        <span className={`h-2.5 w-2.5 rounded-full inline-block mr-2 ${p.availability ? "bg-emerald-500 animate-pulse" : "bg-neutral-300"}`} />
                        {p.availability ? "Active" : "Unavailable"}
                      </td>
                      <td className="px-6 py-4.5 text-right space-x-1">
                        <button onClick={() => handleEditClick(p)} className="rounded-xl p-2 text-neutral-500 hover:bg-neutral-100 hover:text-orange-500 transition">
                          <Edit className="h-4.5 w-4.5" />
                        </button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="rounded-xl p-2 text-neutral-500 hover:bg-rose-50 hover:text-rose-600 transition">
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
