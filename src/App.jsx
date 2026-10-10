import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  Settings2,
  History,
  Search,
  Plus,
  AlertTriangle,
  Cloud,
  CloudOff,
  Trash2,
  Pencil,
  Save,
  Instagram,
  MessageCircle,
  X,
  CheckCircle2,
  LogOut,
  LockKeyhole,
} from "lucide-react";

import { hasConfig } from "./firebase";
import {
  observeAuth,
  loginUser,
  logoutUser,
} from "./auth";

import {
  addMovement,
  addProduct,
  deleteProduct,
  getMovements,
  getProducts,
  updateProduct,
} from "./inventory";

// SIN FUNCIÓN ACTUAL
//       const demo = [
//         {
//           id: "d1",
//           nombre: "Serum Facial",
//           sku: "SKU-001",
//           categoria: "Skincare",
//           stock: 42,
//         },
//         {
//           id: "d2",
//           nombre: "Mascarilla Capilar",
//           sku: "SKU-002",
//           categoria: "Cabello",
//           stock: 18,
//         },
//         {
//           id: "d3",
//           nombre: "Gloss Hidratante",
//           sku: "SKU-003",
//           categoria: "Maquillaje",
//           stock: 7,
//         },
//         {
//           id: "d4",
//           nombre: "Brocha Facial",
//           sku: "SKU-004",
//           categoria: "Accesorios",
//           stock: 26,
//         },
//       ];
// 

function App() {
  const [user, setUser] = useState(undefined);
  const [authError, setAuthError] = useState("");
  const [sec, setSec] = useState("inicio");

  const [ps, setPs] = useState([]);
  const [ms, setMs] = useState([]);

  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");

  const [modal, setModal] = useState(null);
  const [edit, setEdit] = useState(null);
  const [loading, setLoading] = useState(false);

  const ig =
    import.meta.env.VITE_INSTAGRAM_URL ||
    "https://www.instagram.com/rgbeautyspa/";

  const wa =
    import.meta.env.VITE_WHATSAPP_URL ||
    "https://wa.me/56976304273";


  useEffect(() => {
    observeAuth(setUser);
  }, []);


  const load = async () => {
    if (!hasConfig || !user) return;

    try {
      const [p, m] = await Promise.all([
        getProducts(),
        getMovements(),
      ]);

      setPs(p);
      setMs(m);
    } catch (e) {
      console.error(e);
    }
  };


  useEffect(() => {
    load();
  }, [user]);


  const filtered = useMemo(() => {
    return ps.filter((p) => {
      const text = `${p.nombre} ${p.sku} ${p.categoria}`
        .toLowerCase();

      return (
        text.includes(q.toLowerCase()) &&
        (!cat || p.categoria === cat)
      );
    });
  }, [ps, q, cat]);


  const total = ps.reduce(
    (a, p) => a + Number(p.stock || 0),
    0
  );

  const low = ps.filter(
    (p) => p.stock <= 10
  ).length;


  async function save(data) {
    setLoading(true);

    try {
      if (hasConfig) {
        if (edit) {
          await updateProduct(edit.id, data);
        } else {
          await addProduct(data, user);
        }

        await load();
      } else {
        if (edit) {
          setPs((x) =>
            x.map((p) =>
              p.id === edit.id
                ? { ...p, ...data }
                : p
            )
          );
        } else {
          setPs((x) => [
            {
              ...data,
              id: crypto.randomUUID(),
            },
            ...x,
          ]);
        }
      }

      setModal(null);
      setEdit(null);
    } catch (e) {
      alert(e.message || "No se pudo guardar.");
    } finally {
      setLoading(false);
    }
  }


  async function op(type, p, n) {
    n = Number(n);

    if (!n || n < 1) return;

    const prev = Number(p.stock || 0);

    const stock =
      type === "entrada"
        ? prev + n
        : prev - n;

    if (stock < 0) {
      return alert("Stock insuficiente.");
    }

    setLoading(true);

    try {
      if (hasConfig) {
        await updateProduct(p.id, {
          ...p,
          stock,
        });

        await addMovement(
          {
            type,
            productId: p.id,
            productName: p.nombre,
            quantity: n,
            previousStock: prev,
            newStock: stock,
            detail:
              type === "entrada"
                ? "Entrada de stock"
                : "Salida de stock",
          },
          user
        );

        await load();
      } else {
        setPs((x) =>
          x.map((a) =>
            a.id === p.id
              ? { ...a, stock }
              : a
          )
        );

        setMs((x) => [
          {
            id: crypto.randomUUID(),
            type,
            productName: p.nombre,
            quantity: n,
            detail:
              type === "entrada"
                ? "Entrada de stock"
                : "Salida de stock",
          },
          ...x,
        ]);
      }

      setModal(null);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }


  async function adjust(p, newStock, reason) {
    const stock = Number(newStock);

    if (Number.isNaN(stock) || stock < 0) {
      return alert("Stock inválido.");
    }

    setLoading(true);

    try {
      const prev = Number(p.stock || 0);

      if (hasConfig) {
        await updateProduct(p.id, {
          ...p,
          stock,
        });

        await addMovement(
          {
            type: "ajuste",
            productId: p.id,
            productName: p.nombre,
            quantity: Math.abs(stock - prev),
            previousStock: prev,
            newStock: stock,
            detail: "Ajuste de stock",
            reason,
          },
          user
        );

        await load();
      } else {
        setPs((x) =>
          x.map((a) =>
            a.id === p.id
              ? { ...a, stock }
              : a
          )
        );
      }

      setModal(null);
    } catch (e) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }


  async function remove(p) {
    if (!confirm(`¿Eliminar ${p.nombre}?`)) {
      return;
    }

    try {
      if (hasConfig) {
        await deleteProduct(p.id);
      }

      setPs((x) =>
        x.filter((a) => a.id !== p.id)
      );
    } catch (e) {
      alert(e.message);
    }
  }




  if (!hasConfig) {
    return (
      <div className="loading-screen">
        <h2>RG Beauty</h2>
        <p>
          Firebase no está configurado.
          No es posible acceder al inventario.
        </p>
      </div>
    );
  }

  if (user === undefined) {
    return (
      <div className="loading-screen">
        Cargando RG Beauty...
      </div>
    );
  }


  if (!user) {
    return (
      <AuthScreen
        error={authError}
        setError={setAuthError}
      />
    );
  }


  const nav = [
    ["inicio", "Inicio", LayoutDashboard],
    ["productos", "Productos", Package],
    ["entradas", "Entradas", ArrowDownToLine],
    ["salidas", "Salidas", ArrowUpFromLine],
    ["ajustes", "Ajustes de stock", Settings2],
    ["historial", "Historial", History],
  ];


  return (
    <div className="app">

      <aside>

        <div className="brand">
          <div className="mark">RG</div>

          <div>
            <b>RG BEAUTY</b>
            <small>SPA & BEAUTY</small>
          </div>
        </div>

        <p>GESTIÓN DE INVENTARIO</p>


        {nav.map(([id, t, I]) => (
          <button
            className={
              sec === id
                ? "active"
                : ""
            }
            onClick={() => setSec(id)}
            key={id}
          >
            <I size={18} />
            {t}
          </button>
        ))}


        <div className="bottom">

          <div className="help">
            <b>¿Necesitas ayuda?</b>

            <small>
              Soporte RG Beauty
            </small>

            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
          </div>


          <button
            className="logout"
            onClick={logoutUser}
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>

        </div>

      </aside>


      <main>

        <header>

          <div>
            <label>RG BEAUTY SPA</label>

            <h1>
              Gestión de Inventario
            </h1>

            <div className="sub">
              Controla productos, existencias y
              movimientos desde un solo lugar.
            </div>
          </div>


          <div className="user">

            <span
              className={
                hasConfig
                  ? "online"
                  : "offline"
              }
            >
              {hasConfig ? (
                <Cloud size={16} />
              ) : (
                <CloudOff size={16} />
              )}
            </span>


            <i>
              {(user?.displayName ||
                user?.email ||
                "D")
                .slice(0, 1)
                .toUpperCase()}
            </i>


            <div>
              <b>
                {user?.displayName ||
                  "Dueña"}
              </b>

              <small>
                {user?.email ||
                  "Administradora"}
              </small>
            </div>

          </div>

        </header>


        <section className="stats">

          <Stat
            i={<Package />}
            t="rose"
            a="Productos registrados"
            v={ps.length}
            s="Catálogo actual"
          />

          <Stat
            i={<CheckCircle2 />}
            t="green"
            a="Stock disponible"
            v={total}
            s="Unidades actuales"
          />

          <Stat
            i={<AlertTriangle />}
            t="gold"
            a="Stock bajo"
            v={low}
            s="Requieren revisión"
          />

          <Stat
            i={<History />}
            t="lilac"
            a="Movimientos"
            v={ms.length}
            s="Registrados"
          />

        </section>


        <section className="actions">

          <div>
            <label>
              ACCIONES RÁPIDAS
            </label>

            <h2>
              ¿Qué necesitas hacer?
            </h2>
          </div>


          <div className="buttons">

            <button
              className="primary"
              onClick={() => {
                setEdit(null);
                setModal("product");
              }}
            >
              <Plus />
              Registrar producto
            </button>


            <button
              onClick={() =>
                setModal("entry")
              }
            >
              <ArrowDownToLine />
              Entrada
            </button>


            <button
              onClick={() =>
                setModal("exit")
              }
            >
              <ArrowUpFromLine />
              Salida
            </button>


            <button
              onClick={() =>
                setModal("adjust")
              }
            >
              <Settings2 />
              Ajustar stock
            </button>

          </div>

        </section>


        <section className="grid">

          <article className="panel">

            <div className="head">

              <div>
                <label>INVENTARIO</label>

                <h2>
                  Productos
                </h2>
              </div>

            </div>


            <div className="filters">

              <div className="search">

                <Search size={16} />

                <input
                  value={q}
                  onChange={(e) =>
                    setQ(e.target.value)
                  }
                  placeholder="Buscar producto..."
                />

              </div>


              <select
                value={cat}
                onChange={(e) =>
                  setCat(e.target.value)
                }
              >
                <option value="">
                  Todas las categorías
                </option>

                <option>
                  Skincare
                </option>

                <option>
                  Cabello
                </option>

                <option>
                  Maquillaje
                </option>

                <option>
                  Accesorios
                </option>
              </select>

            </div>


            <div className="table">

              <table>

                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Stock</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>


                <tbody>

                  {filtered.map((p) => (
                    <tr key={p.id}>

                      <td>

                        <div className="prod">

                          <span>
                            {p.nombre
                              .slice(0, 2)
                              .toUpperCase()}
                          </span>

                          <div>

                            <b>
                              {p.nombre}
                            </b>

                            <small>
                              {p.sku ||
                                "SIN SKU"}
                            </small>

                          </div>

                        </div>

                      </td>


                      <td>
                        {p.categoria}
                      </td>


                      <td>
                        <b>
                          {p.stock}
                        </b>
                      </td>


                      <td>

                        <em
                          className={
                            p.stock <= 10
                              ? "low"
                              : "ok"
                          }
                        >
                          {p.stock <= 10
                            ? "Stock bajo"
                            : "Disponible"}
                        </em>

                      </td>


                      <td>

                        <button
                          className="mini"
                          onClick={() => {
                            setEdit(p);
                            setModal("product");
                          }}
                        >
                          <Pencil size={13} />
                        </button>


                        <button
                          className="mini"
                          onClick={() =>
                            remove(p)
                          }
                        >
                          <Trash2 size={13} />
                        </button>

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

          </article>


          <article className="panel">

            <div className="head">

              <div>
                <label>
                  TRAZABILIDAD
                </label>

                <h2>
                  Últimos movimientos
                </h2>
              </div>

            </div>


            {ms.length ? (

              <div>

                {ms.slice(0, 6).map((m) => (

                  <div
                    className="movement"
                    key={m.id}
                  >

                    <span
                      className={m.type}
                    >
                      {m.type ===
                      "entrada"
                        ? "↓"
                        : m.type ===
                          "salida"
                        ? "↑"
                        : "↕"}
                    </span>


                    <div>

                      <b>
                        {m.detail}
                      </b>

                      <small>
                        {m.productName} ·{" "}
                        {m.quantity} unidades
                      </small>

                    </div>

                  </div>

                ))}

              </div>

            ) : (

              <div className="empty">
                Aún no hay movimientos.
                <br />
                Registra una entrada o salida.
              </div>

            )}

          </article>

        </section>


        <section className="flow">

          <div>
            <label>
              CONTROL DEL INVENTARIO
            </label>

            <h2>
              Un flujo simple y trazable
            </h2>
          </div>


          <div className="steps">

            <Step
              n="01"
              t="Producto"
              s="Registrar"
            />

            <i>→</i>

            <Step
              n="02"
              t="Entrada / salida"
              s="Movimiento"
            />

            <i>→</i>

            <Step
              n="03"
              t="Stock"
              s="Actualizar"
            />

            <i>→</i>

            <Step
              n="04"
              t="Historial"
              s="Trazabilidad"
            />

          </div>

        </section>


        <footer>

          <span>
            © 2026 RG BEAUTY SPA · Inventario
          </span>


          <div>
            Visítanos:

            <a
              href={ig}
              target="_blank"
              rel="noreferrer"
            >
              <Instagram size={18} />
            </a>

            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={18} />
            </a>
          </div>

        </footer>

      </main>


      {modal && (
        <Modal
          type={modal}
          product={edit}
          products={ps}
          save={save}
          op={op}
          adjust={adjust}
          loading={loading}
          close={() => {
            setModal(null);
            setEdit(null);
          }}
        />
      )}

    </div>
  );
}


function AuthScreen({ error, setError }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginUser(email, password);
    } catch (err) {
      setError(
        err.code === "auth/invalid-credential"
          ? "Correo o contraseña incorrectos."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">RG</div>

        <label>RG BEAUTY SPA</label>

        <h1>Gestión de Inventario</h1>

        <p>Inicia sesión para administrar el inventario.</p>

        <div className="auth-security">
          <LockKeyhole size={17} />
          Acceso protegido con Firebase Authentication
        </div>

        <form onSubmit={submit}>
          <Field l="Correo electrónico">
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.cl"
            />
          </Field>

          <Field l="Contraseña">
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
            />
          </Field>

          {error && (
            <div className="auth-error">{error}</div>
          )}

          <button
            className="primary full"
            disabled={loading}
          >
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}






function Stat({ i, t, a, v, s }) {
  return (
    <div className="stat">

      <span className={`si ${t}`}>
        {i}
      </span>

      <div>

        <small>{a}</small>

        <strong>{v}</strong>

        <small>{s}</small>

      </div>

    </div>
  );
}


function Step({ n, t, s }) {
  return (
    <div className="step">

      <span>{n}</span>

      <b>{t}</b>

      <small>{s}</small>

    </div>
  );
}


function Field({ l, children }) {
  return (
    <label className="field">
      {l}
      {children}
    </label>
  );
}


function Modal({
  type,
  product,
  products,
  save,
  op,
  adjust,
  loading,
  close,
}) {
  const [f, setF] = useState(
    product || {
      nombre: "",
      sku: "",
      categoria: "Skincare",
      stock: 0,
    }
  );

  const [id, setId] = useState(
    products[0]?.id || ""
  );

  const [n, setN] = useState(1);

  const [newStock, setNewStock] =
    useState(
      product?.stock ||
        products[0]?.stock ||
        0
    );

  const [reason, setReason] =
    useState("");


  const p = products.find(
    (x) => x.id === id
  );

  const isP = type === "product";


  return (
    <div className="overlay">

      <div className="modal">

        <button
          className="close"
          onClick={close}
        >
          <X />
        </button>


        <label>
          RG BEAUTY · INVENTARIO
        </label>


        <h2>
          {isP
            ? product
              ? "Editar producto"
              : "Registrar producto"
            : type === "entry"
            ? "Registrar entrada"
            : type === "exit"
            ? "Registrar salida"
            : "Ajustar stock"}
        </h2>


        {isP ? (

          <form
            onSubmit={(e) => {
              e.preventDefault();
              save(f);
            }}
          >

            <Field l="Nombre">

              <input
                required
                value={f.nombre}
                onChange={(e) =>
                  setF({
                    ...f,
                    nombre: e.target.value,
                  })
                }
              />

            </Field>


            <Field l="SKU">

              <input
                value={f.sku}
                onChange={(e) =>
                  setF({
                    ...f,
                    sku: e.target.value,
                  })
                }
              />

            </Field>


            <Field l="Categoría">

              <select
                value={f.categoria}
                onChange={(e) =>
                  setF({
                    ...f,
                    categoria:
                      e.target.value,
                  })
                }
              >

                <option>
                  Skincare
                </option>

                <option>
                  Cabello
                </option>

                <option>
                  Maquillaje
                </option>

                <option>
                  Accesorios
                </option>

              </select>

            </Field>


            <Field l="Stock inicial">

              <input
                type="number"
                min="0"
                value={f.stock}
                onChange={(e) =>
                  setF({
                    ...f,
                    stock: e.target.value,
                  })
                }
              />

            </Field>


            <button
              className="primary full"
              disabled={loading}
            >
              <Save />
              Guardar
            </button>

          </form>

        ) : type === "adjust" ? (

          <>

            <Field l="Producto">

              <select
                value={id}
                onChange={(e) =>
                  setId(e.target.value)
                }
              >

                {products.map((x) => (
                  <option
                    key={x.id}
                    value={x.id}
                  >
                    {x.nombre} · Stock{" "}
                    {x.stock}
                  </option>
                ))}

              </select>

            </Field>


            <Field l="Nuevo stock">

              <input
                type="number"
                min="0"
                value={newStock}
                onChange={(e) =>
                  setNewStock(
                    e.target.value
                  )
                }
              />

            </Field>


            <Field l="Motivo del ajuste">

              <input
                required
                value={reason}
                onChange={(e) =>
                  setReason(
                    e.target.value
                  )
                }
                placeholder="Ej.: conteo físico"
              />

            </Field>


            {p && (
              <p className="hint">
                Stock actual:{" "}
                <b>{p.stock}</b>
              </p>
            )}


            <button
              className="primary full"
              disabled={
                !p ||
                loading ||
                !reason.trim()
              }
              onClick={() =>
                adjust(
                  p,
                  newStock,
                  reason
                )
              }
            >
              Confirmar ajuste
            </button>

          </>

        ) : (

          <>

            <Field l="Producto">

              <select
                value={id}
                onChange={(e) =>
                  setId(e.target.value)
                }
              >

                {products.map((x) => (
                  <option
                    key={x.id}
                    value={x.id}
                  >
                    {x.nombre} · Stock{" "}
                    {x.stock}
                  </option>
                ))}

              </select>

            </Field>


            <Field l="Cantidad">

              <input
                type="number"
                min="1"
                value={n}
                onChange={(e) =>
                  setN(e.target.value)
                }
              />

            </Field>


            {p && (
              <p className="hint">
                Stock actual:{" "}
                <b>{p.stock}</b>
              </p>
            )}


            <button
              className="primary full"
              disabled={!p || loading}
              onClick={() =>
                op(
                  type === "entry"
                    ? "entrada"
                    : "salida",
                  p,
                  n
                )
              }
            >
              Confirmar operación
            </button>

          </>

        )}

      </div>

    </div>
  );
}


export default App;
