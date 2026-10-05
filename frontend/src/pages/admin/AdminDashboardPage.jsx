import { useEffect, useState } from 'react';
import { Box, ClipboardList, ImagePlus, Pencil, Plus, Save, Sparkles, Trash2, Truck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { getAdminOrderById, getAdminOrders, updateOrderStatus, updateShipping } from '../../services/adminService';
import { createProduct, deleteProduct, getProducts, updateProduct } from '../../services/productService';

const productCategories = ['hair-accessories', 'soft-toys', 'keychains', 'flowers', 'valentine-gifts', 'rakhi'];
const orderStatuses = ['pending_payment', 'paid', 'confirmed', 'processing', 'ready_to_ship', 'shipped', 'delivered', 'cancelled'];
const statusTransitions = {
  pending_payment: ['confirmed', 'paid', 'cancelled'],
  paid: ['confirmed', 'processing', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['ready_to_ship', 'cancelled'],
  ready_to_ship: ['shipped'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};
const emptyProduct = { name: '', description: '', price: '', category: productCategories[0], stock: '', readyToShip: true, preparationTime: '' };

const formatCategory = (value) =>
  String(value || '')
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const formatPrice = (value) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value || 0));

const formatStatus = (value) => String(value || '').split('_').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');

const toProductFormData = (product, files) => {
  const formData = new FormData();
  Object.entries(product).forEach(([key, value]) => formData.append(key, String(value)));
  Array.from(files || []).forEach((file) => formData.append('images', file));
  return formData;
};

export default function AdminDashboardPage() {
  const { pathname } = useLocation();
  const { notify } = useNotifications();
  const activeSection = pathname.endsWith('/orders') ? 'orders' : 'products';
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [imageFiles, setImageFiles] = useState([]);
  const [editingProductId, setEditingProductId] = useState('');
  const [shippingOrderId, setShippingOrderId] = useState('');
  const [shippingForm, setShippingForm] = useState({ courierName: '', trackingId: '', trackingUrl: '' });
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadProducts = async () => {
    const response = await getProducts();
    setProducts(Array.isArray(response?.products) ? response.products : []);
  };

  const loadOrders = async () => {
    const response = await getAdminOrders();
    setOrders(Array.isArray(response?.orders) ? response.orders : []);
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');
    const load = activeSection === 'orders' ? getAdminOrders() : getProducts();
    load
      .then((response) => {
        if (!isMounted) return;
        if (activeSection === 'orders') setOrders(Array.isArray(response?.orders) ? response.orders : []);
        else setProducts(Array.isArray(response?.products) ? response.products : []);
      })
      .catch((requestError) => {
        if (isMounted) setError(requestError?.response?.data?.message || 'Unable to load the admin workspace.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeSection]);

  const handleProductSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    const payload = {
      ...productForm,
      price: Number(productForm.price),
      stock: Number(productForm.stock),
      preparationTime: productForm.readyToShip ? '' : productForm.preparationTime,
    };

    try {
      if (editingProductId) {
        await updateProduct(editingProductId, toProductFormData(payload, imageFiles));
        notify('Product details updated.', 'success');
      } else {
        await createProduct(toProductFormData(payload, imageFiles));
        notify('Product added to the shop.', 'success');
      }
      await loadProducts();
      setProductForm(emptyProduct);
      setImageFiles([]);
      setEditingProductId('');
      event.target.reset();
    } catch (requestError) {
      notify(requestError?.response?.data?.message || 'Unable to save this product right now.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEditProduct = (product) => {
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price ?? '',
      category: product.category || productCategories[0],
      stock: product.stock ?? '',
      readyToShip: Boolean(product.readyToShip),
      preparationTime: product.preparationTime || '',
    });
    setImageFiles([]);
    setEditingProductId(product._id);
    document.getElementById('admin-product-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`Remove “${product.name}” from the shop?`)) return;
    try {
      await deleteProduct(product._id);
      await loadProducts();
      notify('Product removed.', 'success');
    } catch (requestError) {
      notify(requestError?.response?.data?.message || 'Unable to remove this product right now.', 'error');
    }
  };

  const handleOrderStatus = async (order, orderStatus) => {
    try {
      await updateOrderStatus(order._id, { orderStatus });
      await loadOrders();
      notify('Order status updated.', 'success');
    } catch (requestError) {
      notify(requestError?.response?.data?.message || 'Unable to update the order status.', 'error');
    }
  };

  const handleViewOrder = async (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId('');
      setExpandedOrder(null);
      return;
    }
    setExpandedOrderId(orderId);
    setExpandedOrder(null);
    try {
      const response = await getAdminOrderById(orderId);
      setExpandedOrder(response?.order || null);
    } catch (requestError) {
      setExpandedOrderId('');
      notify(requestError?.response?.data?.message || 'Unable to load order details.', 'error');
    }
  };

  const openShippingForm = (order) => {
    setShippingOrderId(order._id);
    setShippingForm({
      courierName: order.shippingDetails?.courierName || '',
      trackingId: order.shippingDetails?.trackingId || '',
      trackingUrl: order.shippingDetails?.trackingUrl || '',
    });
  };

  const handleShippingSubmit = async (event) => {
    event.preventDefault();
    try {
      await updateShipping(shippingOrderId, shippingForm);
      await loadOrders();
      setShippingOrderId('');
      notify('Shipping details saved.', 'success');
    } catch (requestError) {
      notify(requestError?.response?.data?.message || 'Unable to save shipping details.', 'error');
    }
  };

  return (
    <section className="yb-section yb-admin-page">
      <div className="container">
        <div className="yb-page-heading">
          <span className="yb-eyebrow"><Sparkles size={14} /> Yarnberri studio</span>
          <h1 className="yb-section-title">Admin workspace</h1>
          <p>Keep the handmade collection and customer parcels in good hands.</p>
        </div>

        <nav className="yb-admin-tabs" aria-label="Admin sections">
          <Link to="/admin/products" className={activeSection === 'products' ? 'active' : ''}><Box size={16} /> Products</Link>
          <Link to="/admin/orders" className={activeSection === 'orders' ? 'active' : ''}><ClipboardList size={16} /> Orders</Link>
        </nav>

        {loading ? (
          <p className="yb-muted-copy" role="status">Loading the studio workspace...</p>
        ) : error ? (
          <div className="yb-page-alert" role="alert">{error}</div>
        ) : activeSection === 'products' ? (
          <div className="yb-admin-products-layout">
            <section className="yb-account-panel" id="admin-product-form">
              <div className="yb-account-panel-heading">
                <div>
                  <h2>{editingProductId ? 'Edit product' : 'Add a product'}</h2>
                  <p>Product information and images are saved to the live shop.</p>
                </div>
                {editingProductId ? <Pencil size={19} /> : <Plus size={19} />}
              </div>
              <form className="yb-form-grid" onSubmit={handleProductSubmit}>
                <label><span>Product name</span><input required minLength={2} value={productForm.name} onChange={(event) => setProductForm({ ...productForm, name: event.target.value })} /></label>
                <label><span>Category</span><select value={productForm.category} onChange={(event) => setProductForm({ ...productForm, category: event.target.value })}>{productCategories.map((category) => <option key={category} value={category}>{formatCategory(category)}</option>)}</select></label>
                <label><span>Price (INR)</span><input type="number" min="0" step="1" required value={productForm.price} onChange={(event) => setProductForm({ ...productForm, price: event.target.value })} /></label>
                <label><span>Stock</span><input type="number" min="0" step="1" required value={productForm.stock} onChange={(event) => setProductForm({ ...productForm, stock: event.target.value })} /></label>
                <label className="wide"><span>Description</span><textarea rows="4" required value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} /></label>
                <label className="yb-checkbox-label wide">
                  <input type="checkbox" checked={productForm.readyToShip} onChange={(event) => setProductForm({ ...productForm, readyToShip: event.target.checked })} />
                  Ready to ship
                </label>
                {!productForm.readyToShip && <label className="wide"><span>Preparation time</span><input required value={productForm.preparationTime} onChange={(event) => setProductForm({ ...productForm, preparationTime: event.target.value })} placeholder="e.g. 3–5 working days" /></label>}
                <label className="wide yb-file-label">
                  <span><ImagePlus size={16} /> Product images {editingProductId && '(select to replace current images)'}</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(event) => {
                    if (event.target.files.length > 5) {
                      notify('Choose no more than five product images.', 'error');
                      event.target.value = '';
                      setImageFiles([]);
                    } else {
                      setImageFiles(event.target.files);
                    }
                  }}
                />
                  <small>Choose up to five images. Existing images remain when editing without new uploads.</small>
                </label>
                <div className="yb-form-actions wide">
                  <button className="yb-btn yb-btn-primary" type="submit" disabled={saving}><Save size={16} /> {saving ? 'Saving...' : editingProductId ? 'Save product' : 'Add product'}</button>
                  {editingProductId && <button className="yb-btn yb-btn-outline" type="button" onClick={() => { setEditingProductId(''); setProductForm(emptyProduct); setImageFiles([]); }}>Cancel edit</button>}
                </div>
              </form>
            </section>

            <section className="yb-admin-product-list" aria-label="Current products">
              <div className="yb-admin-list-heading"><h2>Shop products</h2><span>{products.length} total</span></div>
              {products.length === 0 ? <p className="yb-account-empty">No products are currently available.</p> : products.map((product) => (
                <article className="yb-admin-product" key={product._id}>
                  <div className="yb-admin-product-image">
                    {product.images?.[0] ? <img src={product.images[0]} alt={product.name} /> : <div className="yb-product-fallback" aria-hidden="true" />}
                  </div>
                  <div className="yb-admin-product-info">
                    <span>{formatCategory(product.category)} · {product.stock > 0 ? `${product.stock} in stock` : 'Sold out'}</span>
                    <h3>{product.name}</h3>
                    <strong>{formatPrice(product.price)}</strong>
                    <small>{product.readyToShip ? 'Ready to ship' : `Made to order${product.preparationTime ? ` · ${product.preparationTime}` : ''}`}</small>
                  </div>
                  <div className="yb-address-actions">
                    <button type="button" className="yb-icon-action" aria-label={`Edit ${product.name}`} onClick={() => handleEditProduct(product)}><Pencil size={16} /></button>
                    <button type="button" className="yb-icon-action" aria-label={`Delete ${product.name}`} onClick={() => handleDeleteProduct(product)}><Trash2 size={16} /></button>
                  </div>
                </article>
              ))}
            </section>
          </div>
        ) : (
          <section className="yb-admin-orders" aria-label="Customer orders">
            <div className="yb-admin-list-heading"><h2>Customer orders</h2><span>{orders.length} total</span></div>
            {orders.length === 0 ? <p className="yb-account-empty">There are no orders to manage yet.</p> : orders.map((order) => (
              <article className="yb-admin-order" key={order._id}>
                <div className="yb-admin-order-summary">
                  <div>
                    <span>{order.orderNumber || order._id} · {order.user?.name || order.user?.email || 'Customer'}</span>
                    <h3>{formatPrice(order.totalAmount)} <small>{order.paymentStatus}</small></h3>
                    <p>{order.items?.length || 0} pieces · {order.shippingAddress?.city || 'Address unavailable'}</p>
                  </div>
                  <button type="button" className="yb-link-btn" onClick={() => handleViewOrder(order._id)}>
                    {expandedOrderId === order._id ? 'Hide details' : 'View details'}
                  </button>
                </div>
                <div className="yb-admin-order-controls">
                  <label>
                    <span>Order status</span>
                    <select value={order.orderStatus} onChange={(event) => handleOrderStatus(order, event.target.value)}>
                      <option value={order.orderStatus}>{formatStatus(order.orderStatus)}</option>
                      {(statusTransitions[order.orderStatus] || []).map((status) => <option key={status} value={status}>{formatStatus(status)}</option>)}
                    </select>
                  </label>
                  <button type="button" className="yb-btn yb-btn-outline" onClick={() => openShippingForm(order)}><Truck size={16} /> Shipping details</button>
                </div>
                {shippingOrderId === order._id && (
                  <form className="yb-admin-shipping-form" onSubmit={handleShippingSubmit}>
                    <label><span>Courier</span><input value={shippingForm.courierName} onChange={(event) => setShippingForm({ ...shippingForm, courierName: event.target.value })} /></label>
                    <label><span>Tracking ID</span><input value={shippingForm.trackingId} onChange={(event) => setShippingForm({ ...shippingForm, trackingId: event.target.value })} /></label>
                    <label><span>Tracking URL</span><input type="url" value={shippingForm.trackingUrl} onChange={(event) => setShippingForm({ ...shippingForm, trackingUrl: event.target.value })} /></label>
                    <button className="yb-btn yb-btn-primary" type="submit">Save shipping</button>
                    <button className="yb-link-btn" type="button" onClick={() => setShippingOrderId('')}>Cancel</button>
                  </form>
                )}
                {expandedOrderId === order._id && (
                  <div className="yb-admin-order-detail">
                    {!expandedOrder ? <p role="status">Loading order details...</p> : (
                      <>
                        <p><strong>Deliver to:</strong> {expandedOrder.shippingAddress?.fullName}, {expandedOrder.shippingAddress?.addressLine1}, {expandedOrder.shippingAddress?.city}, {expandedOrder.shippingAddress?.state} {expandedOrder.shippingAddress?.pincode}</p>
                        <p><strong>Phone:</strong> {expandedOrder.shippingAddress?.phone}</p>
                        <ul>{(expandedOrder.items || []).map((item, index) => <li key={`${item.product}-${index}`}>{item.name} × {item.quantity} — {formatPrice(item.price * item.quantity)}</li>)}</ul>
                      </>
                    )}
                  </div>
                )}
              </article>
            ))}
          </section>
        )}
      </div>
    </section>
  );
}
