/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useProductForm } from "./useProductForm"; // Using the hook from before for cleaner logic
import BasicInfoSection from "./BasicInfoSection";
import DescriptionSection from "./DescriptionSection";
import SpecificationsSection from "./SpecificationsSection";
import VariantSection from "./VariantSection";
import SummarySidebar from "./SummarySidebar";

export default function AddProduct() {
  const {
    brands, categories, loading, selectionSettings, setSelectionSettings,
    commonForm, setCommonForm, specifications, setSpecifications, variants, setVariants,
    handleCategorySelection, handleFileSelection, addVariantRow, updateVariant,
    updateAttributeValue, addAttributeValue, removeAttributeValue, handleCreateProduct
  } = useProductForm();

  return (
    <div className=" min-h-screen  pb-12 md:pb-20 font-sans antialiased px-2 sm:px-4 md:px-6">
      <div className="w-full grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-8">
        <div className="xl:col-span-8 space-y-4 md:space-y-8">
          <header className="mb-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Add New Product</h1>
          </header>

          <BasicInfoSection 
            commonForm={commonForm} 
            setCommonForm={setCommonForm} 
            categories={categories} 
            brands={brands}
            selectionSettings={selectionSettings}
            setSelectionSettings={setSelectionSettings}
            handleCategorySelection={handleCategorySelection}
            handleFileSelection={handleFileSelection}
          />

          <DescriptionSection 
            commonForm={commonForm} 
            setCommonForm={setCommonForm} 
            handleFileSelection={handleFileSelection}
          />

          <SpecificationsSection 
            specifications={specifications} 
            setSpecifications={setSpecifications} 
          />

          <VariantSection 
            variants={variants}
            setVariants={setVariants}
            selectionSettings={selectionSettings}
            commonForm={commonForm}
            updateVariant={updateVariant}
            handleFileSelection={handleFileSelection}
            updateAttributeValue={updateAttributeValue}
            addAttributeValue={addAttributeValue}
            removeAttributeValue={removeAttributeValue}
            addVariantRow={addVariantRow}
          />
        </div>

        <div className="xl:col-span-4">
          <SummarySidebar 
            commonForm={commonForm} 
            setCommonForm={setCommonForm} 
            variants={variants} 
            loading={loading} 
            handleCreateProduct={handleCreateProduct} 
          />
        </div>
      </div>
    </div>
  );
}