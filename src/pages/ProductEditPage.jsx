// src/pages/ProductEditPage.jsx
import React, { useState, useEffect } from 'react';
import {
  useParams,
  useNavigate,
  useLocation
} from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection
} from 'firebase/firestore';
import WindowPreview from '../components/WindowPreview';
import '../assets/styles/pages/product-edit.scss';

const STEP_TITLES = [
  'Basic Info',
  'Dimensions',
  'Window Type',
  'Pricing',
  'Options',
];

// ← design1 & design2 added at the front
const WINDOW_TYPES = [
  { id: 'design1',     label: 'Design 1'    },
  { id: 'design2',     label: 'Design 2'    },
  { id: 'single_hung', label: 'Single Hung' },
  { id: 'double_hung', label: 'Double Hung' },
  { id: 'casement',    label: 'Casement'    },
  { id: 'awning',      label: 'Awning'      },
  { id: 'hopper',      label: 'Hopper'      },
  { id: 'sliding',     label: 'Sliding'     },
  { id: 'fixed',       label: 'Fixed'       },
  { id: 'bay',         label: 'Bay'         },
  { id: 'bow',         label: 'Bow'         },
  { id: 'picture',     label: 'Picture'     },
];

export default function ProductEditPage() {
  const { source, id } = useParams();            // "user" or "global"
  const isNew          = id === 'new';
  const { user }       = useAuth();
  const navigate       = useNavigate();
  const location       = useLocation();
  const db             = getFirestore();

  // If opened via the "New Product" modal, it may pass us the chosen design:
  const preselectType = location.state?.windowType;

  const [loading, setLoading] = useState(!isNew);
  const [step, setStep]       = useState(0);
  const [errors, setErrors]   = useState({});
  const [data, setData] = useState({
    name:        '',
    description: '',
    width:       '',
    height:      '',
    weight:      '',
    windowType:  preselectType || WINDOW_TYPES[0].id,
    netPrice:    '',
    vat:         '',
    grossPrice:  '',
    options:     [],
  });

  // Load existing product if editing
  useEffect(() => {
    if (!isNew && user) {
      const path =
        source === 'user'
          ? ['users', user.uid, 'products', id]
          : ['products', id];

      getDoc(doc(db, ...path)).then(snap => {
        if (snap.exists()) {
          const d = snap.data();
          setData({
            name:        d.name        || '',
            description: d.description || '',
            width:       d.width       || '',
            height:      d.height      || '',
            weight:      d.weight      || '',
            windowType:  d.windowType  || WINDOW_TYPES[0].id,
            netPrice:    d.netPrice    || '',
            vat:         d.vat         || '',
            grossPrice:  d.grossPrice  || '',
            options:     d.options     || [],
          });
        }
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [isNew, source, id, user, db]);

  // Auto-calc gross price
  useEffect(() => {
    const n = parseFloat(data.netPrice),
          v = parseFloat(data.vat);
    if (!isNaN(n) && !isNaN(v)) {
      setData(d => ({ ...d, grossPrice: (n * (1 + v/100)).toFixed(2) }));
    }
  }, [data.netPrice, data.vat]);

  const onChange = e => {
    const { name, value } = e.target;
    setData(d => ({ ...d, [name]: value }));
  };

  const validate = () => {
    const errs = {};
    if (step === 0) {
      if (!data.name.trim())        errs.name        = 'Required';
      if (!data.description.trim()) errs.description = 'Required';
    }
    if (step === 1) {
      if (!data.width)  errs.width  = 'Required';
      if (!data.height) errs.height = 'Required';
      if (!data.weight) errs.weight = 'Required';
    }
    if (step === 2) {
      if (!WINDOW_TYPES.some(w => w.id === data.windowType)) {
        errs.windowType = 'Select a window type';
      }
    }
    if (step === 3) {
      if (!data.netPrice) errs.netPrice = 'Required';
      if (!data.vat)      errs.vat      = 'Required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next   = () => validate() && setStep(s => s + 1);
  const back   = () => setStep(s => Math.max(0, s - 1));

  const finish = async () => {
    const payload = {
      name:        data.name,
      description: data.description,
      width:       parseFloat(data.width),
      height:      parseFloat(data.height),
      weight:      parseFloat(data.weight),
      windowType:  data.windowType,
      netPrice:    parseFloat(data.netPrice),
      vat:         parseFloat(data.vat),
      grossPrice:  parseFloat(data.grossPrice),
      options:     data.options,
    };

    if (isNew) {
      await addDoc(
        collection(db, 'users', user.uid, 'products'),
        payload
      );
    } else {
      const path =
        source === 'user'
          ? ['users', user.uid, 'products', id]
          : ['products', id];
      await updateDoc(doc(db, ...path), payload);
    }

    navigate('/products', { replace: true });
  };

  const cancel = () => navigate('/products');

  if (loading) {
    return (
      <div className="product-edit-page">
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <div className="product-edit-page wizard-container">
      {/* Progress */}
      <div className="wizard-progress">
        {STEP_TITLES.map((t, i) => (
          <div
            key={i}
            className={
              'step-indicator ' +
              (i === step ? 'active' : i < step ? 'done' : '')
            }
          >
            {t}
          </div>
        ))}
      </div>

      {/* Panels */}
      <div className="wizard-panels">
        {step === 0 && (
          <div className="slide-panel">
            <label>
              <span className="label-text">Name*</span>
              <input name="name" value={data.name} onChange={onChange} />
              {errors.name && <div className="error">{errors.name}</div>}
            </label>
            <label>
              <span className="label-text">Description*</span>
              <textarea
                name="description"
                value={data.description}
                onChange={onChange}
              />
              {errors.description && (
                <div className="error">{errors.description}</div>
              )}
            </label>
          </div>
        )}

        {step === 1 && (
          <div className="slide-panel">
            <label>
              <span className="label-text">Width (mm)*</span>
              <input
                name="width"
                type="number"
                value={data.width}
                onChange={onChange}
              />
              {errors.width && <div className="error">{errors.width}</div>}
            </label>
            <label>
              <span className="label-text">Height (mm)*</span>
              <input
                name="height"
                type="number"
                value={data.height}
                onChange={onChange}
              />
              {errors.height && <div className="error">{errors.height}</div>}
            </label>
            <label>
              <span className="label-text">Weight (kg)*</span>
              <input
                name="weight"
                type="number"
                value={data.weight}
                onChange={onChange}
              />
              {errors.weight && <div className="error">{errors.weight}</div>}
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="slide-panel">
            <label>
              <span className="label-text">Window Type*</span>
              <select
                name="windowType"
                value={data.windowType}
                onChange={onChange}
              >
                {WINDOW_TYPES.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.label}
                  </option>
                ))}
              </select>
              {errors.windowType && (
                <div className="error">{errors.windowType}</div>
              )}
            </label>
            <div className="preview-box">
              <WindowPreview
                type={data.windowType}
                widthMm={data.width}
                heightMm={data.height}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="slide-panel">
            <label>
              <span className="label-text">Net Price*</span>
              <input
                name="netPrice"
                type="number"
                value={data.netPrice}
                onChange={onChange}
              />
              {errors.netPrice && (
                <div className="error">{errors.netPrice}</div>
              )}
            </label>
            <label>
              <span className="label-text">VAT (%)*</span>
              <input
                name="vat"
                type="number"
                value={data.vat}
                onChange={onChange}
              />
              {errors.vat && <div className="error">{errors.vat}</div>}
            </label>
            <label>
              <span className="label-text">Gross Price</span>
              <input
                name="grossPrice"
                type="number"
                value={data.grossPrice}
                readOnly
              />
            </label>
          </div>
        )}

        {step === 4 && (
          <div className="slide-panel">
            <label>
              <span className="label-text">
                Add Option <small>(Label:value + Enter)</small>
              </span>
              <input
                placeholder="Label:value"
                onKeyDown={e => {
                  if (e.key === 'Enter' && e.target.value.includes(':')) {
                    const [label, value] = e.target.value.split(':', 2);
                    setData(d => ({
                      ...d,
                      options: [...d.options, { label, value }]
                    }));
                    e.target.value = '';
                  }
                }}
              />
            </label>
            <ul className="options-list">
              {data.options.map((opt, i) => (
                <li key={i}>
                  {opt.label}: {opt.value}{' '}
                  <button
                    onClick={() =>
                      setData(d => ({
                        ...d,
                        options: d.options.filter((_, idx) => idx !== i)
                      }))
                    }
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="wizard-actions">
        <button onClick={cancel} className="btn-secondary">
          Cancel
        </button>
        {step > 0 && (
          <button onClick={back} className="btn-secondary">
            Back
          </button>
        )}
        {step < STEP_TITLES.length - 1 ? (
          <button onClick={next} className="btn-primary">
            Next
          </button>
        ) : (
          <button onClick={finish} className="btn-primary">
            Finish
          </button>
        )}
      </div>
    </div>
  );
}
