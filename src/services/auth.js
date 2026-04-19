import { showNotification } from '../utils/dom.js';

import { supabase } from './supabase.js';

export async function handleLogin(email, password, navigate) {
    if (!email || !password) {
        showNotification("Ingresa tus credenciales");
        return null;
    }

    const { data, error } = await supabase
        .from('users')
        .select('*, companies(name)')
        .eq('email', email)
        .eq('password_hash', password)
        .maybeSingle(); // Cambiado a maybeSingle para evitar el error 406

    if (error) {
        console.error("Error en Supabase:", error);
        showNotification("Error de conexión");
        return null;
    }

    if (!data) {
        showNotification("Credenciales inválidas o usuario no encontrado");
        return null;
    }

    const currentUser = { 
        id: data.id,
        name: data.full_name, 
        email: data.email, 
        role: data.role,
        company_id: data.company_id,
        company_name: data.companies.name
    };

    showNotification(`Bienvenido, ${data.full_name}`);
    navigate('dashboard');
    return currentUser;
}

export function handleLogout(navigate) {
    showNotification("Sesión cerrada");
    navigate('login');
    return null;
}
