import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ShoppingCart,
  MapPin,
  ImagePlus,
  X,
  Upload
} from 'lucide-react';

import MapPointPicker from '../../components/common/MapPointPicker.jsx';
import { loadPeruUbigeos, ubigeoName } from './ubigeos.js';
import './PublishSale.css';

const categories = ['Tecnología', 'Hogar', 'Moda', 'Deportes', 'Vehículos', 'Libros', 'Otros'];

const initialForm = {
  name: '',
  category: 'Tecnología',
  condition: 'Usado',
  price: '',
  description: '',
  location: ''
};

export default function PublishSale({ onBack, onSubmitSale, onPickLocation }) {
  const [form, setForm] = useState(initialForm);
  const [point, setPoint] = useState(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [geoCatalog, setGeoCatalog] = useState({ departments: [], provinces: [], districts: [] });
  const [departmentId, setDepartmentId] = useState('');
  const [provinceId, setProvinceId] = useState('');
  const [districtCode, setDistrictCode] = useState('');
  const [geoLoading, setGeoLoading] = useState(true);
  const [geoError, setGeoError] = useState('');

  useEffect(() => {
    if (!image) {
      setImagePreview('');
      return;
    }

    const objectUrl = URL.createObjectURL(image);
    setImagePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [image]);

  useEffect(() => {
    let active = true;
    loadPeruUbigeos()
      .then(data => {
        if (!active) return;
        setGeoCatalog(data);
        try {
          const saved = JSON.parse(localStorage.getItem('geofastpe_residence') || 'null');
          if (saved) {
            setDepartmentId(String(saved.departmentId || ''));
            setProvinceId(String(saved.provinceId || ''));
            setDistrictCode(String(saved.districtCode || ''));
            const district = data.districts.find(d => String(d.ubigeo) === String(saved.districtCode));
            const province = data.provinces.find(v => String(v.id) === String(saved.provinceId));
            const department = data.departments.find(v => String(v.id) === String(saved.departmentId));
            if (district && province && department) {
              setForm(previous => ({ ...previous, location: `${ubigeoName(district.distrito)}, ${ubigeoName(province.provincia)}, ${ubigeoName(department.departamento)}` }));
            }
          }
        } catch {}
      })
      .catch(error => { if (active) setGeoError('No se pudo cargar el listado nacional. Conéctate a internet una vez para guardarlo y usarlo después sin conexión.'); })
      .finally(() => { if (active) setGeoLoading(false); });
    return () => { active = false; };
  }, []);

  const provincesForDepartment = geoCatalog.provinces.filter(item => String(item.departamento_id) === String(departmentId));
  const districtsForProvince = geoCatalog.districts.filter(item => String(item.provincia_id) === String(provinceId));

  const chooseDepartment = event => {
    setDepartmentId(event.target.value);
    setProvinceId('');
    setDistrictCode('');
    setForm(previous => ({ ...previous, location: '' }));
    setError('');
  };
  const chooseProvince = event => {
    setProvinceId(event.target.value);
    setDistrictCode('');
    setForm(previous => ({ ...previous, location: '' }));
    setError('');
  };
  const chooseDistrict = event => {
    const code = event.target.value;
    const district = geoCatalog.districts.find(item => String(item.ubigeo) === String(code));
    const province = geoCatalog.provinces.find(item => String(item.id) === String(provinceId));
    const department = geoCatalog.departments.find(item => String(item.id) === String(departmentId));
    setDistrictCode(code);
    if (!district || !province || !department) {
      setForm(previous => ({ ...previous, location: '' }));
      return;
    }
    const location = `${ubigeoName(district.distrito)}, ${ubigeoName(province.provincia)}, ${ubigeoName(department.departamento)}`;
    setForm(previous => ({ ...previous, location }));
    try { localStorage.setItem('geofastpe_residence', JSON.stringify({ departmentId, provinceId, districtCode: code, location })); } catch {}
    setError('');
  };

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Selecciona una imagen JPG, PNG o WEBP.');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5 MB.');
      event.target.value = '';
      return;
    }

    setImage(file);
    setError('');
    setSuccess('');
  };

  const removeImage = () => {
    setImage(null);
    const input = document.getElementById('sale-image');
    if (input) input.value = '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    setError('');
    setSuccess('');

    const name = form.name.trim();
    const description = form.description.trim();
    const price = Number(form.price);

    if (!name) {
      setError('Ingresa el nombre del producto.');
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError('Ingresa un precio válido.');
      return;
    }

    if (!description) {
      setError('Ingresa una descripción.');
      return;
    }

    if (!form.location) {
      setError('Selecciona un distrito.');
      return;
    }

    if (!point) {
      setError('Elige la ubicación del producto haciendo clic en el mapa.');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmitSale?.({
        name,
        category: form.category,
        condition: form.condition,
        price,
        description,
        location: form.location,
        lat: point.lat,
        lng: point.lng,
        image
      });
      setSuccess('La publicación fue guardada correctamente.');
    } catch (submitError) {
      setError(submitError.message || 'No se pudo procesar la publicación.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="publish-sale-page">
      <div className="publish-sale-container">
        <button type="button" className="publish-sale-back" onClick={() => onBack?.()}>
          <ArrowLeft size={18} />
          Volver a Ventas Locales
        </button>

        <div className="publish-sale-hero">
          <ShoppingCart size={34} />
          <div>
            <h1>Publicar Nueva Venta</h1>
            <p>Publica un producto para tu comunidad.</p>
          </div>
        </div>

        <form className="publish-sale-form" onSubmit={handleSubmit}>
          <div className="publish-sale-field">
            <label htmlFor="sale-name">Nombre del producto *</label>
            <input id="sale-name" name="name" type="text" maxLength={120} placeholder="Ej. Laptop Lenovo ThinkPad" value={form.name} onChange={updateField} required />
          </div>

          <div className="publish-sale-row">
            <div className="publish-sale-field">
              <label htmlFor="sale-category">Categoría *</label>
              <select id="sale-category" name="category" value={form.category} onChange={updateField} required>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="publish-sale-field">
              <label htmlFor="sale-condition">Estado del producto *</label>
              <select id="sale-condition" name="condition" value={form.condition} onChange={updateField} required>
                <option value="Nuevo">Nuevo</option>
                <option value="Usado">Usado</option>
              </select>
            </div>
          </div>

          <div className="publish-sale-field">
            <label htmlFor="sale-price">Precio de venta (S/) *</label>
            <input id="sale-price" name="price" type="number" min="0.01" step="0.01" placeholder="Ej. 350.00" value={form.price} onChange={updateField} required />
          </div>

          <div className="publish-sale-field">
            <label htmlFor="sale-description">Descripción *</label>
            <textarea id="sale-description" name="description" rows={5} maxLength={1000} placeholder="Describe el producto, sus características y condiciones..." value={form.description} onChange={updateField} required />
            <small className="publish-sale-counter">{form.description.length}/1000</small>
          </div>

          <div className="publish-sale-field">
            <label htmlFor="sale-department">
              <MapPin size={16} />
              Distrito de residencia / ubicación del producto *
            </label>
            <div className="publish-sale-row publish-sale-location-row">
              <select id="sale-department" value={departmentId} onChange={chooseDepartment} required disabled={geoLoading || !geoCatalog.departments.length}>
                <option value="">{geoLoading ? 'Cargando departamentos...' : 'Selecciona departamento'}</option>
                {geoCatalog.departments.map(item => <option key={item.id} value={item.id}>{ubigeoName(item.departamento)}</option>)}
              </select>
              <select id="sale-province" value={provinceId} onChange={chooseProvince} required disabled={!departmentId}>
                <option value="">Selecciona provincia</option>
                {provincesForDepartment.map(item => <option key={item.id} value={item.id}>{ubigeoName(item.provincia)}</option>)}
              </select>
              <select id="sale-district" value={districtCode} onChange={chooseDistrict} required disabled={!provinceId}>
                <option value="">Selecciona distrito</option>
                {districtsForProvince.map(item => <option key={item.ubigeo} value={item.ubigeo}>{ubigeoName(item.distrito)}</option>)}
              </select>
            </div>
            {form.location && <small className="publish-sale-location-summary">Ubicación seleccionada: {form.location}</small>}
            {geoError && <small className="publish-sale-geo-error" role="status">{geoError}</small>}
          </div>

          <div className="publish-sale-field">
            <label>Punto exacto en el mapa *</label>
            <MapPointPicker value={point} onPick={onPickLocation} onChange={setPoint} />
          </div>

          <div className="publish-sale-field">
            <label htmlFor="sale-image">Imagen del producto</label>
            <input id="sale-image" className="publish-sale-file-input" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} />

            {imagePreview ? (
              <div className="publish-sale-preview">
                <img src={imagePreview} alt="Vista previa del producto" />
                <button type="button" onClick={removeImage} aria-label="Eliminar imagen">
                  <X size={18} />
                </button>
              </div>
            ) : (
              <label htmlFor="sale-image" className="publish-sale-upload">
                <ImagePlus size={30} />
                <strong>Seleccionar imagen</strong>
                <span>JPG, PNG o WEBP · Máximo 5 MB</span>
              </label>
            )}
          </div>

          {error && <div className="publish-sale-message error" role="alert">{error}</div>}
          {success && <div className="publish-sale-message success" role="status">{success}</div>}

          <div className="publish-sale-actions">
            <button type="button" className="publish-sale-cancel" onClick={() => onBack?.()} disabled={submitting}>
              Cancelar
            </button>
            <button type="submit" className="publish-sale-submit" disabled={submitting}>
              <Upload size={18} />
              {submitting ? 'Procesando...' : 'Publicar venta'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
