/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useCallback } from "react";
import { ProductService, BrandService, CategoryService } from "../../../backend/ApiService";
import Swal from "sweetalert2";
import ProductTableView from "./ProductTable";
import ProductEditModal from "./ProductEditModal";
import Pagination from "../../ui/Pagination";

const categoryNumberMap = {
  "category 1": "1",
  "category 2": "2",
  "category 3": "3",
  "category 4": "4",
  "category5": "5"
};

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 100;
  const [totalProducts, setTotalProducts] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryPrefix, setCategoryPrefix] = useState("");
  const [editForm, setEditForm] = useState(null);

  const [originalImages, setOriginalImages] = useState([]);
  const [originalDescImages, setOriginalDescImages] = useState([]);
  const [originalVariantImages, setOriginalVariantImages] = useState([]);

  const MaterialOptions = [
    { value: "Titanium", label: "Titanium" },
    { value: "Stainless Steel", label: "Stainless Steel" },
  ];
  /* ---------------- FETCH PRODUCTS ---------------- */

const fetchProducts = useCallback(async () => {
  try {
    setLoading(true);
    // Pass 'query' to the API service
    const res = await ProductService.getAllProducts(itemsPerPage, currentPage, query);
    
    const productList = res?.data?.products || res?.products || [];
    const total = res?.data?.totalProducts || res?.totalCount || 0;
    
    setProducts(productList);
    setTotalProducts(total);
  } catch (err) {
    console.error("Failed to fetch products", err);
  } finally {
    setLoading(false);
  }
}, [currentPage, query]); // Add query to dependencies to refetch when typing

  /* ---------------- FETCH INITIAL DATA ---------------- */
  const fetchInitialData = useCallback(async () => {
    try {
      const [brandsData, categoriesData] = await Promise.all([
        BrandService.getAllBrands(),
        CategoryService.getCategories()
      ]);
      setBrands(brandsData.map(b => ({ value: b._id, label: b.brandName })));
      setCategories(categoriesData || []);
    } catch (err) {
      console.error("Data fetch error", err);
    }
  }, []);

  useEffect(() => {
  setCurrentPage(1);
}, [query]);

  useEffect(() => {
    fetchInitialData();
    fetchProducts();
  }, [fetchInitialData, fetchProducts]);

  /* ---------------- SKU AUTO GENERATION ---------------- */
  useEffect(() => {
    if (showModal && editForm) {
      const s = editForm.seriesNumber || "";
      const ss = editForm.subSeriesNumber || "";

      if (categoryPrefix !== "") {
        const newSku = `${categoryPrefix}.${s}${ss}`;
        if (newSku !== editForm.sku) {
          setEditForm(prev => ({
            ...prev,
            sku: newSku
          }));
        }
      }
    }
  }, [categoryPrefix, editForm?.seriesNumber, editForm?.subSeriesNumber, showModal]);

  /* ---------------- CATEGORY CHANGE HANDLER ---------------- */
  // Added this to ensure prefix updates when user selects a different category in the modal
  const handleCategoryChange = (categoryId) => {
    const selectedCat = categories.find(c => c._id === categoryId);
    if (selectedCat) {
      const catName = selectedCat.name?.toLowerCase().trim();
      setCategoryPrefix(categoryNumberMap[catName] || "0");
      setEditForm(prev => ({ ...prev, category: categoryId }));
    }
  };

  /* ---------------- OPEN EDIT MODAL ---------------- */
  const openEditModal = async (productId) => {
    try {
      const product = await ProductService.getProductById(productId);
      setOriginalImages(product.images || []);
      setOriginalDescImages((product.description || []).map(d => d.image || []));
      setOriginalVariantImages((product.variants || []).map(v => v.variantImages || []));

      const catName = product.category?.name?.toLowerCase().trim();
      setCategoryPrefix(categoryNumberMap[catName] || "0");

      setEditForm({
        productId: product.productId,
        name: product.name || "",
        category: product.category?._id || "",
        brand: product.brand?.map(b => b._id) || [],
        material: product.material || "",
        shortDescription: product.shortDescription || "",
        status: product.status || "draft",
        seriesNumber: product.seriesNumber || "",
        subSeriesNumber: product.subSeriesNumber || "",
        sku: product.sku,
        globalPrice: product.price || "",
        globalStock: product.productStock || "",
        stockMode: product.stockType || "PRODUCT",
        existingGlobalImages: product.images || [],
        newGlobalImages: [],
        specifications: product.specification?.length > 0
          ? product.specification.map(s => ({ key: s.key, value: s.value }))
          : [{ key: "", value: "" }],
        descriptionSections: (product.description || []).map(d => ({
          text: d.text || "",
          existingImage: Array.isArray(d.image) ? d.image[0] : d.image,
          newImages: []
        })),
        variants: (product.variants || []).map((v, idx) => ({
          id: v.variantId || Date.now() + idx,
          variantName: v.name || "",
          price: v.variantPrice || "",
          stock: v.variantStock || "",
          existingImages: v.variantImages || [],
          newImages: [],
          settings: {
            priceMode: v.priceType || "PRODUCT",
            imageMode: v.imageType || "PRODUCT"
          },
          dynamicAttributes: (v.attributes || []).length > 0
            ? v.attributes.map(a => ({
                key: a.key,
                values: Array.isArray(a.value) ? a.value : [a.value]
              }))
            : [{ key: "", values: [""] }]
        }))
      });
      setShowModal(true);
    } catch (err) {
      Swal.fire("Error", "Could not fetch details", "error");
    }
  };

  /* ---------------- FILE HANDLER ---------------- */
  const handleFileSelection = (e, variantId = null, type, descIndex = null) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setEditForm(prev => {
      const updated = { ...prev };
      if (type === "globalImage") {
        updated.newGlobalImages = [...(updated.newGlobalImages || []), ...files];
      }
      if (type === "descImages") {
        const desc = [...updated.descriptionSections];
        desc[descIndex] = {
          ...desc[descIndex],
          newImages: [...(desc[descIndex].newImages || []), ...files]
        };
        updated.descriptionSections = desc;
      }
      if (type === "image") {
        updated.variants = updated.variants.map(v => {
          if (v.id === variantId) {
            return { ...v, newImages: [...(v.newImages || []), ...files] };
          }
          return v;
        });
      }
      return updated;
    });
  };

  /* ---------------- UPDATE PRODUCT ---------------- */
  const handleUpdateProduct = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      const p = editForm;

      formData.append("permission", "product.listing.update"); // Ensure permission is included in FormData for backend authorization
      formData.append("name", p.name);
      formData.append("category", p.category);
      formData.append("brand", JSON.stringify(p.brand));
      formData.append("price", Number(p.globalPrice));
      formData.append("stockType", p.stockMode);
      formData.append("status", p.status);
      formData.append("shortDescription", p.shortDescription);
      formData.append("material", p.material);
      formData.append("sku", p.sku); // The auto-generated SKU
      formData.append("seriesNumber", p.seriesNumber);
      formData.append("subSeriesNumber", p.subSeriesNumber);

      if (p.stockMode === "PRODUCT") {
        formData.append("productStock", Number(p.globalStock));
      }

      formData.append("specification", JSON.stringify(p.specifications.filter(s => s.key.trim())));

      formData.append("images", JSON.stringify(p.existingGlobalImages));
      p.newGlobalImages.forEach(file => formData.append("productImages", file));

      const descPayload = p.descriptionSections.map(sec => ({
        text: sec.text,
        image: sec.existingImage ? [sec.existingImage] : []
      }));
      formData.append("description", JSON.stringify(descPayload));

      p.descriptionSections.forEach((sec, i) => {
        sec.newImages.forEach(file => {
          formData.append("descriptionImages", file);
          formData.append("descriptionImageMap[]", String(i));
        });
      });

      const variantPayload = p.variants.map((v, i) => {
        v.newImages.forEach(file => {
          formData.append("variantImages", file);
          formData.append("variantImageMap[]", String(i));
        });
        return {
          name: v.variantName,
          sku: `${p.sku}-${i}`, // Variant SKU based on new Parent SKU
          priceType: v.settings.priceMode,
          imageType: v.settings.imageMode,
          variantPrice: v.settings.priceMode === "VARIANT" ? Number(v.price) : undefined,
          variantStock: Number(v.stock),
          variantImages: v.existingImages,
          attributes: v.dynamicAttributes
            .filter(a => a.key.trim())
            .map(a => ({ key: a.key, value: a.values.filter(Boolean) }))
        };
      });
      formData.append("variants", JSON.stringify(variantPayload));

      await ProductService.updateProduct(p.productId, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      Swal.fire("Success", "Updated successfully", "success");
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      console.error("Update Error:", err);
      Swal.fire("Error", err.response?.data?.message || "Update failed", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- DELETE & DUPLICATE ---------------- */
  const handleDeleteProduct = async id => {
    const res = await Swal.fire({ title: "Are you sure?", icon: "warning", showCancelButton: true });
    if (res.isConfirmed) {
      try {
        await ProductService.deleteProduct(id);
        fetchProducts();
      } catch {
        Swal.fire("Error", "Delete failed", "error");
      }
    }
  };

  const handleDuplicateProduct = async id => {
    try {
      await ProductService.duplicateProduct(id);
      fetchProducts();
      Swal.fire("Success", "Duplicated", "success");
    } catch {
      Swal.fire("Error", "Failed", "error");
    }
  };

  return (
    <div className="min-h-screen py-6 px-2 sm:px-6 font-sans">
      <ProductTableView
        products={products}
        query={query}
        setQuery={setQuery}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalProducts={totalProducts}
        itemsPerPage={itemsPerPage}
        onEdit={openEditModal}
        onDelete={handleDeleteProduct}
        onDuplicate={handleDuplicateProduct}
      />
      <div className="mt-8">
            <Pagination
              totalItems={totalProducts}
              itemsPerPage={itemsPerPage} // Use the constant itemsPerPage (8)
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
            />
          </div>

      <ProductEditModal
        showModal={showModal}
        setShowModal={setShowModal}
        editForm={editForm}
        setEditForm={setEditForm}
        categories={categories}
        brands={brands}
        handleUpdateProduct={handleUpdateProduct}
        handleCategoryChange={handleCategoryChange} // Ensure Modal calls this on category dropdown change
        categoryNumberMap={categoryNumberMap}
        MaterialOptions={MaterialOptions}
        handleFileSelection={handleFileSelection}
      />
    </div>
  );
}