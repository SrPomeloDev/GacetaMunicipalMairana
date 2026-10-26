#!/usr/bin/env node
// Crea las cuentas del panel a partir del CSV de "Solicitud de acceso al Panel".
// Para cada solicitud crea el usuario en Supabase Auth y su perfil en `usuarios`,
// usando un correo institucional cerrado (por defecto <local>@mairana.bo).
//
// Uso:
//   node scripts/crear-usuarios-solicitudes.mjs --dry-run --csv "C:\ruta\solicitudes"
//   node scripts/crear-usuarios-solicitudes.mjs --csv "C:\ruta\solicitudes"
//
// Opciones:
//   --csv <archivo|directorio>  CSV o carpeta que lo contiene (busca "Solicitud*.csv")
//   --dominio <dominio>         Dominio del correo cerrado (default: mairana.bo)
//   --salida <archivo>          CSV de credenciales generadas (default: ~/Downloads/credenciales-gaceta.csv)
//   --password <clave>          Contraseña fija para todos (default: aleatoria por usuario)
//   --dry-run                   Solo muestra el plan, no escribe en Supabase
//
// - Idempotente: si el correo ya existe se omite (no cambia la contraseña).
// - Lee credenciales de .env.local (no las imprime).

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";

const DOMINIO_DEFAULT = "mairana.bo";

function parseArgs(argv) {
  const args = {
    dryRun: false,
    csv: null,
    dominio: DOMINIO_DEFAULT,
    salida: path.join(os.homedir(), "Downloads", "credenciales-gaceta.csv"),
    password: null,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dry-run") args.dryRun = true;
    else if (a === "--csv") args.csv = argv[++i];
    else if (a === "--dominio") args.dominio = argv[++i];
    else if (a === "--salida") args.salida = argv[++i];
    else if (a === "--password") args.password = argv[++i];
  }
  return args;
}

function loadEnvLocal(cwd) {
  const file = path.join(cwd, ".env.local");
  if (!fs.existsSync(file)) return;
  const text = fs.readFileSync(file, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#") || !t.includes("=")) continue;
    const eq = t.indexOf("=");
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  const src = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      quoted = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") {
      field += c;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((v) => v.trim() !== ""));
}

const sinAcentos = (s) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

function indiceColumna(header, ...busquedas) {
  const claves = header.map(sinAcentos);
  for (const b of busquedas) {
    const i = claves.findIndex((c) => c.includes(b));
    if (i !== -1) return i;
  }
  return -1;
}

function mapearRol(valor) {
  const k = sinAcentos(valor);
  if (k.startsWith("admin")) return "admin";
  if (k.startsWith("edit")) return "editor";
  if (k.startsWith("public")) return "publicador";
  return "publicador";
}

function localDeCorreo(correo) {
  const base = String(correo ?? "").split("@")[0] ?? "";
  return base
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "");
}

function generarPassword() {
  const alfabeto = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = crypto.randomBytes(14);
  let out = "";
  for (const b of bytes) out += alfabeto[b % alfabeto.length];
  return out;
}

function resolverCsv(entrada) {
  if (!entrada) throw new Error("Falta --csv (archivo o carpeta)");
  const stat = fs.statSync(entrada);
  if (stat.isDirectory()) {
    const hit = fs
      .readdirSync(entrada)
      .filter((f) => /solicitud.*\.csv$/i.test(f))
      .sort()[0];
    if (!hit) throw new Error(`No se encontró "Solicitud*.csv" en ${entrada}`);
    return path.join(entrada, hit);
  }
  return entrada;
}

const cwd = process.cwd();
loadEnvLocal(cwd);

const args = parseArgs(process.argv);
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let csvPath;
try {
  csvPath = resolverCsv(args.csv);
} catch (e) {
  console.error(e.message);
  process.exit(1);
}

const rows = parseCsv(fs.readFileSync(csvPath, "utf8"));
if (rows.length < 2) {
  console.error(`El CSV ${csvPath} no contiene filas de datos.`);
  process.exit(1);
}

const header = rows[0];
const idx = {
  nombre: indiceColumna(header, "nombre completo", "nombre"),
  correo: indiceColumna(header, "correo electronico", "correo"),
  dependencia: indiceColumna(header, "dependencia"),
  cargo: indiceColumna(header, "cargo"),
  rol: indiceColumna(header, "rol"),
};

if (idx.nombre === -1 || idx.correo === -1 || idx.rol === -1) {
  console.error("No se reconocen las columnas obligatorias (Nombre completo / Correo / Rol).");
  console.error("Cabecera leída:", header.join(" | "));
  process.exit(1);
}

const { data: dependencias, error: depError } = await supabase
  .from("dependencias")
  .select("id,nombre,slug");
if (depError) {
  console.error(`No se pudieron leer las dependencias: ${depError.message}`);
  process.exit(1);
}

const ALIAS_DEPENDENCIAS = {
  "concejo municipal": "OEM",
  "secretaria general": "MAE",
  "secretaria municipal administrativa": "MAE",
};

function buscarDependencia(valor) {
  const k = sinAcentos(valor);
  if (!k || k === "otra" || k === "otro") return null;
  const slug = k.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  const alias = ALIAS_DEPENDENCIAS[k];
  const hit = (dependencias ?? []).find(
    (d) =>
      sinAcentos(d.nombre) === k ||
      d.slug === slug ||
      (alias && d.slug === alias),
  );
  return hit ?? null;
}

async function buscarUsuarioPorEmail(email) {
  for (let page = 1; page <= 10; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) return { error };
    const users = data?.users ?? [];
    const hit = users.find((u) => (u.email ?? "").toLowerCase() === email.toLowerCase());
    if (hit) return { user: hit };
    if (users.length < 200) break;
  }
  return {};
}

const plan = [];
for (let i = 1; i < rows.length; i++) {
  const r = rows[i];
  const nombre = (r[idx.nombre] ?? "").trim();
  const correoOriginal = (r[idx.correo] ?? "").trim();
  const local = localDeCorreo(correoOriginal);
  const cargo = idx.cargo !== -1 ? (r[idx.cargo] ?? "").trim() : "";
  const depValor = idx.dependencia !== -1 ? (r[idx.dependencia] ?? "").trim() : "";

  if (!nombre || !local) continue;

  const dep = buscarDependencia(depValor);
  plan.push({
    nombre,
    correoOriginal,
    email: `${local}@${args.dominio}`,
    rol: mapearRol(r[idx.rol]),
    cargo,
    dependencia: dep ? dep.nombre : null,
    dependencia_id: dep ? dep.id : null,
    password: args.password ?? generarPassword(),
  });
}

console.log(`CSV: ${csvPath}`);
console.log(`Dominio cerrado: ${args.dominio}`);
console.log(`Solicitudes a procesar: ${plan.length}\n`);

const creados = [];
const omitidos = [];
const errores = [];

for (const p of plan) {
  const etiqueta = `${p.nombre} <${p.email}> · ${p.rol}`;
  if (args.dryRun) {
    console.log(`[dry-run] ${etiqueta}${p.dependencia ? ` · ${p.dependencia}` : ""}`);
    continue;
  }

  const { data: existente } = await supabase
    .from("usuarios")
    .select("id")
    .eq("email", p.email)
    .maybeSingle();

  if (existente) {
    omitidos.push({ ...p, motivo: "perfil ya existe" });
    console.log(`[omitido] ${etiqueta} (ya existe)`);
    continue;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: p.email,
    password: p.password,
    email_confirm: true,
    user_metadata: { nombre: p.nombre, rol: p.rol },
  });

  if (error || !data?.user) {
    const { user } = await buscarUsuarioPorEmail(p.email);
    if (user) {
      const { error: upErr } = await supabase.from("usuarios").upsert({
        id: user.id,
        nombre: p.nombre,
        email: p.email,
        rol: p.rol,
        dependencia_id: p.dependencia_id,
        activo: true,
      });
      if (upErr) {
        errores.push({ ...p, motivo: upErr.message });
        console.error(`[error] ${etiqueta}: ${upErr.message}`);
      } else {
        omitidos.push({ ...p, motivo: "auth ya existía; perfil sincronizado" });
        console.log(`[sync] ${etiqueta} (auth existente, perfil actualizado)`);
      }
      continue;
    }
    errores.push({ ...p, motivo: error?.message ?? "desconocido" });
    console.error(`[error] ${etiqueta}: ${error?.message ?? "desconocido"}`);
    continue;
  }

  const { error: insertError } = await supabase.from("usuarios").upsert({
    id: data.user.id,
    nombre: p.nombre,
    email: p.email,
    rol: p.rol,
    dependencia_id: p.dependencia_id,
    activo: true,
  });

  if (insertError) {
    errores.push({ ...p, motivo: insertError.message });
    console.error(`[error] ${etiqueta}: ${insertError.message}`);
    continue;
  }

  creados.push(p);
  console.log(`[creado] ${etiqueta}${p.dependencia ? ` · ${p.dependencia}` : ""}`);
}

if (args.dryRun) {
  console.log("\nDry-run: no se escribió nada.");
  process.exit(0);
}

if (creados.length > 0) {
  const filas = [
    ["nombre", "email", "rol", "password", "dependencia", "cargo", "correo_solicitud"],
    ...creados.map((c) => [c.nombre, c.email, c.rol, c.password, c.dependencia ?? "", c.cargo, c.correoOriginal]),
  ];
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const contenido = filas.map((f) => f.map(esc).join(",")).join("\r\n") + "\r\n";
  fs.writeFileSync(args.salida, contenido, "utf8");
  console.log(`\nCredenciales escritas en: ${args.salida}`);
}

console.log(`\nResumen: ${creados.length} creados, ${omitidos.length} omitidos, ${errores.length} errores.`);
if (errores.length > 0) process.exitCode = 1;
