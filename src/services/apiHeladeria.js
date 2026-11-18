import { supabase } from './supabaseClient';

export async function loginUsuario(correo, password) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('correo', correo)
    .eq('password', password)
    .single();

  if (error || !data) {
    throw new Error('Correo o contraseña incorrectos');
  }
  return data;
}

export async function obtenerTodosLosProductos() {
  const { data: productos, error } = await supabase
    .from('productos')
    .select('*')
    .order('id', { ascending: true });

  if (error) throw error;

  // Consultamos la relación producto_ingrediente y los ingredientes por separado de forma segura
  const { data: rels } = await supabase.from('producto_ingrediente').select('*');
  const { data: ings } = await supabase.from('ingredientes').select('*');
  const { data: calorias } = await supabase.from('v_calorias_producto').select('*');
  const { data: costos } = await supabase.from('v_costo_producto').select('*');
  const { data: rentabilidades } = await supabase.from('v_rentabilidad_producto').select('*');

  return productos.map((prod) => {
    const idsIngsDelProd = rels?.filter((r) => r.producto_id === prod.id).map((r) => r.ingrediente_id) || [];
    const listaIngs = ings?.filter((i) => idsIngsDelProd.includes(i.id)) || [];

    const cal = calorias?.find((c) => c.producto_id === prod.id);
    const cos = costos?.find((c) => c.producto_id === prod.id);
    const ren = rentabilidades?.find((r) => r.producto_id === prod.id);

    return {
      ...prod,
      listaIngredientes: listaIngs,
      total_calorias: cal ? Number(cal.total_calorias) : 0,
      costo: cos ? Number(cos.costo) : 0,
      rentabilidad: ren ? Number(ren.rentabilidad) : 0,
    };
  });
}

export async function venderProducto(producto, userId = null) {
  for (const ing of producto.listaIngredientes) {
    if (ing.inventario <= 0) {
      throw new Error(`No hay inventario suficiente de: ${ing.nombre}`);
    }
  }

  for (const ing of producto.listaIngredientes) {
    const { error } = await supabase
      .from('ingredientes')
      .update({ inventario: ing.inventario - 1 })
      .eq('id', ing.id);
    if (error) throw error;
  }

  const { error: errorVenta } = await supabase.from('ventas').insert([
    {
      producto_id: producto.id,
      user_id: userId,
      cantidad: 1,
      total: producto.precio_publico,
    },
  ]);

  if (errorVenta) throw errorVenta;
  return true;
}

export async function obtenerVentasDelDia() {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('ventas')
    .select('*')
    .gte('fecha', hoy.toISOString());

  if (error) throw error;
  return data || [];
}

export async function obtenerTodosLosIngredientes() {
  const { data, error } = await supabase
    .from('ingredientes')
    .select('*')
    .order('id', { ascending: true });
  if (error) throw error;
  return data;
}

export async function obtenerIngredientePorId(id) {
  const { data, error } = await supabase.from('ingredientes').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function crearIngrediente(nuevo) {
  const { data, error } = await supabase.from('ingredientes').insert([nuevo]).select();
  if (error) throw error;
  return data[0];
}

export async function actualizarIngrediente(id, campos) {
  const { data, error } = await supabase
    .from('ingredientes')
    .update(campos)
    .eq('id', id)
    .select();
  if (error) throw error;
  return data[0];
}

export async function eliminarIngrediente(id) {
  const { error } = await supabase.from('ingredientes').delete().eq('id', id);
  if (error) throw error;
  return true;
}

export async function reabastecerIngrediente(id, cantidadAgregar = 10) {
  const actual = await obtenerIngredientePorId(id);
  const { error } = await supabase
    .from('ingredientes')
    .update({ inventario: actual.inventario + cantidadAgregar })
    .eq('id', id);
  if (error) throw error;
}

export async function renovarInventarioComplemento(ingrediente) {
  if (ingrediente.tipo !== 'complemento') {
    throw new Error('Solo los complementos pueden renovarse a 0');
  }
  const { error } = await supabase
    .from('ingredientes')
    .update({ inventario: 0 })
    .eq('id', ingrediente.id);
  if (error) throw error;
}