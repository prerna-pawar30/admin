/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { ProductService } from '../../../backend/ApiService';
import StockGrid from './StockGrid';
import StockEditor from './StockEditor';
import Swal from 'sweetalert2';

const StockManager = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 100;

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await ProductService.getAllProducts(limit, currentPage);
      const productList = response?.data?.products || [];
      const total = response?.data?.totalProducts || 0;
      
      setProducts(productList);
      setTotalProducts(total);
      setTotalPages(Math.ceil(total / limit) || 1);
    } catch (error) {
      console.error("Fetch error:", error);
      setProducts([]); 
    } finally {
      setLoading(false);
    }
  };

const submitUpdate = async (updatedProduct) => {
    // 1. Ask for confirmation before updating
    const result = await Swal.fire({
      title: "Update Stock?",
      text: "This will synchronize the warehouse levels immediately.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#f97316", // Tailwind orange-500
      cancelButtonColor: "#94a3b8", // Tailwind slate-400
      confirmButtonText: "Yes, Update It",
    });

    if (!result.isConfirmed) return;

    setIsUpdating(true);
    const isVariantType = updatedProduct.stockType === "VARIANT";
    const stockData = {
      permission: "stock.listing.update",
      stockType: updatedProduct.stockType,
      ...(isVariantType 
        ? { variantStocks: updatedProduct.variants.map(v => ({ variantId: v.variantId, stock: v.variantStock })) }
        : { productStock: updatedProduct.productStock }
      )
    };

    try {
      const res = await ProductService.updateStock(updatedProduct.productId || updatedProduct._id, stockData);
      
      // 2. Success Alert
      if (res.status === 200 || res.success) {
        await Swal.fire({
          icon: "success",
          title: "Inventory Synchronized",
          text: "Stock levels have been updated successfully!",
          confirmButtonColor: "#f97316",
          timer: 2000, // Optional: Auto-close after 2 seconds
        });
        
        setSelectedProduct(null);
        fetchProducts();
      }
    } catch (err) {
      // 3. Error Alert
      console.error("Update Error:", err);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: err.response?.data?.message || "Please check your connection and try again.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="w-12 h-12 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin mb-4"></div>
      <p className="font-bold text-orange-900 animate-pulse uppercase tracking-widest text-sm">Loading Warehouse...</p>
    </div>
  );

  return (
    <div className=" min-h-screen font-sans bg-gray-50/50">
      <div className="max-w-7xl mx-auto p-6 lg:p-10">
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              Stock <span className="text-orange-500">Master</span>
            </h1>
            <p className="text-gray-500 mt-1 font-medium">Manage your digital inventory and variant levels.</p>
          </div>
          <div className="flex items-center gap-3 bg-white shadow-sm border border-orange-100 px-5 py-2.5 rounded-2xl">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-ping"></div>
            <span className="text-sm font-bold text-gray-700">{totalProducts} Total Products</span>
          </div>
        </header>

        <StockGrid 
          products={products} 
          onSelect={setSelectedProduct}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => {
            setCurrentPage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />

        {selectedProduct && (
          <StockEditor 
            product={selectedProduct} 
            isUpdating={isUpdating}
            onClose={() => setSelectedProduct(null)}
            OnSubmit={submitUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default StockManager;