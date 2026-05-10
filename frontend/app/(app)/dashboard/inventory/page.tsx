"use client";

import { useEffect, useState } from "react";
import { Package, Search, Plus, MoreHorizontal, Pencil, Trash2, AlertTriangle, Clock } from "lucide-react";
import { toast } from "sonner";
import { getProducts, createProduct, updateProduct, deleteProduct, Product } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const defaultForm = {
    name: "",
    sku: "",
    barcode: "",
    category: "",
    supplier_name: "",
    supplier_contact: "",
    current_stock: 0,
    min_threshold: 0,
    unit_price: 0,
    expiry_date: "",
  };
  const [formData, setFormData] = useState<any>(defaultForm);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts(search, category, page, pageSize);
      setProducts(data.items);
      setTotal(data.total);
      setTotalPages(data.total_pages);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search, category, page, pageSize]);

  const handleCreate = async () => {
    try {
      await createProduct({
        ...formData,
        expiry_date: formData.expiry_date || null,
      });
      toast.success("Product created!");
      setIsAddOpen(false);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleUpdate = async () => {
    if (!selectedProduct) return;
    try {
      await updateProduct(selectedProduct.id, {
        ...formData,
        expiry_date: formData.expiry_date || null,
      });
      toast.success("Product updated!");
      setIsEditOpen(false);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    if (!selectedProduct) return;
    try {
      await deleteProduct(selectedProduct.id);
      toast.success("Product deleted!");
      setIsDeleteOpen(false);
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const openEdit = (p: Product) => {
    setSelectedProduct(p);
    setFormData({
      ...p,
      expiry_date: p.expiry_date ? p.expiry_date.split("T")[0] : "",
      barcode: p.barcode || "",
      supplier_name: p.supplier_name || "",
      supplier_contact: p.supplier_contact || "",
    });
    setIsEditOpen(true);
  };

  const openDelete = (p: Product) => {
    setSelectedProduct(p);
    setIsDeleteOpen(true);
  };

  const isLowStock = (p: Product) => p.current_stock <= p.min_threshold;
  
  const isExpiringSoon = (p: Product) => {
    if (!p.expiry_date) return false;
    const expiry = new Date(p.expiry_date);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Package className="h-6 w-6 text-violet-400" /> Inventory
          </h1>
          <p className="mt-1 text-sm text-zinc-400">Manage your products and stock levels ({total} total)</p>
        </div>
        <Button
          onClick={() => {
            setFormData(defaultForm);
            setIsAddOpen(true);
          }}
          className="bg-violet-600 hover:bg-violet-500 text-white"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-500 rounded-xl focus:border-violet-500"
          />
        </div>
        <div className="w-48">
          <Select
            value={category}
            onValueChange={(val) => {
              setCategory(val || "All");
              setPage(1);
            }}
          >
            <SelectTrigger className="bg-white/5 border-white/10 text-white rounded-xl focus:border-violet-500">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="bg-[#111118] border-white/10 text-white rounded-xl">
              <SelectItem value="All" className="hover:bg-white/5 rounded-lg focus:bg-white/5 cursor-pointer">All Categories</SelectItem>
              <SelectItem value="Electronics" className="hover:bg-white/5 rounded-lg focus:bg-white/5 cursor-pointer">Electronics</SelectItem>
              <SelectItem value="Clothing" className="hover:bg-white/5 rounded-lg focus:bg-white/5 cursor-pointer">Clothing</SelectItem>
              <SelectItem value="Food" className="hover:bg-white/5 rounded-lg focus:bg-white/5 cursor-pointer">Food</SelectItem>
              <SelectItem value="Other" className="hover:bg-white/5 rounded-lg focus:bg-white/5 cursor-pointer">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-2xl border border-white/10 bg-[#111118] overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-b border-white/10 hover:bg-transparent">
              <TableHead className="text-zinc-400 text-xs uppercase tracking-wider">Product</TableHead>
              <TableHead className="text-zinc-400 text-xs uppercase tracking-wider">SKU</TableHead>
              <TableHead className="text-zinc-400 text-xs uppercase tracking-wider">Category</TableHead>
              <TableHead className="text-right text-zinc-400 text-xs uppercase tracking-wider">Stock</TableHead>
              <TableHead className="text-right text-zinc-400 text-xs uppercase tracking-wider">Price</TableHead>
              <TableHead className="text-zinc-400 text-xs uppercase tracking-wider">Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-zinc-500">
                  Loading products...
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <Package className="h-10 w-10 text-zinc-600" />
                    <p className="text-zinc-400">No products found</p>
                    <Button
                      variant="outline"
                      className="mt-2 border-white/[0.1] text-white hover:bg-white/[0.05]"
                      onClick={() => {
                        setSearch("");
                        setCategory("All");
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              products.map((p) => {
                const lowStock = isLowStock(p);
                const expiring = isExpiringSoon(p);

                return (
                  <TableRow key={p.id} className="border-b border-white/10 hover:bg-white/5 text-zinc-300">
                    <TableCell className="font-medium text-white">{p.name}</TableCell>
                    <TableCell className="text-zinc-400 text-xs font-mono">{p.sku}</TableCell>
                    <TableCell>{p.category || "—"}</TableCell>
                    <TableCell className="text-right">
                      <span className={lowStock ? "text-amber-400 font-bold" : ""}>
                        {p.current_stock}
                      </span>
                      <span className="text-zinc-600 text-xs ml-1">/ {p.min_threshold}</span>
                    </TableCell>
                    <TableCell className="text-right">${p.unit_price.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {lowStock && (
                          <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
                            <AlertTriangle className="h-3 w-3" /> Low
                          </div>
                        )}
                        {expiring && (
                          <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded">
                            <Clock className="h-3 w-3" /> Expiring
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-lg p-0 text-zinc-400 hover:bg-white/5 hover:text-white">
                          <MoreHorizontal className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-[#111118] border-white/10 text-zinc-300 rounded-xl">
                          <DropdownMenuItem onClick={() => openEdit(p)} className="hover:bg-white/5 hover:text-white cursor-pointer rounded-lg focus:bg-white/5">
                            <Pencil className="mr-2 h-4 w-4 text-violet-400" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDelete(p)} className="hover:bg-white/5 hover:text-white cursor-pointer text-red-400 focus:text-red-300 rounded-lg focus:bg-white/5">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-zinc-500">
            Showing {(page - 1) * pageSize + 1} to Math.min(page * pageSize, total) of {total} products
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="border-white/[0.1] text-zinc-300 hover:bg-white/[0.05]"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="border-white/[0.1] text-zinc-300 hover:bg-white/[0.05]"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Dialog open={isAddOpen || isEditOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddOpen(false);
          setIsEditOpen(false);
        }
      }}>
        <DialogContent className="bg-[#111118] border-white/10 text-white max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle>{isAddOpen ? "Add New Product" : "Edit Product"}</DialogTitle>
            <DialogDescription className="text-zinc-400">
              {isAddOpen ? "Enter the product details below." : "Update the product information."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400">Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-white/5 border-white/10 text-white rounded-xl focus:border-violet-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400">SKU *</label>
              <Input
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="bg-white/5 border-white/10 text-white rounded-xl focus:border-violet-500"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400">Category</label>
              <Input
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="bg-white/5 border-white/10 text-white rounded-xl focus:border-violet-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400">Barcode</label>
              <Input
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                className="bg-white/5 border-white/10 text-white rounded-xl focus:border-violet-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400">Unit Price ($)</label>
              <Input
                type="number"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                className="bg-white/5 border-white/10 text-white rounded-xl focus:border-violet-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400">Current Stock</label>
              <Input
                type="number"
                value={formData.current_stock}
                onChange={(e) => setFormData({ ...formData, current_stock: parseInt(e.target.value) || 0 })}
                className="bg-white/5 border-white/10 text-white rounded-xl focus:border-violet-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400">Min Threshold (Alert Level)</label>
              <Input
                type="number"
                value={formData.min_threshold}
                onChange={(e) => setFormData({ ...formData, min_threshold: parseInt(e.target.value) || 0 })}
                className="bg-white/5 border-white/10 text-white rounded-xl focus:border-violet-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400">Expiry Date</label>
              <Input
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                className="bg-white/5 border-white/10 text-white rounded-xl focus:border-violet-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400">Supplier Name</label>
              <Input
                value={formData.supplier_name}
                onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                className="bg-white/5 border-white/10 text-white rounded-xl focus:border-violet-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-400">Supplier Contact</label>
              <Input
                value={formData.supplier_contact}
                onChange={(e) => setFormData({ ...formData, supplier_contact: e.target.value })}
                className="bg-white/5 border-white/10 text-white rounded-xl focus:border-violet-500"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddOpen(false);
                setIsEditOpen(false);
              }}
              className="border-white/[0.1] text-zinc-300 hover:bg-white/[0.05]"
            >
              Cancel
            </Button>
            <Button
              onClick={isAddOpen ? handleCreate : handleUpdate}
              className="bg-violet-600 hover:bg-violet-500 text-white"
            >
              {isAddOpen ? "Create Product" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="bg-[#111118] border-white/10 text-white rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              This action cannot be undone. This will permanently delete the product
              "{selectedProduct?.name}" and remove its data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/[0.1] text-zinc-300 hover:bg-white/[0.05]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-500 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
