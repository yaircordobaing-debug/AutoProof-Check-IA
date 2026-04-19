import { $, showNotification } from '../utils/dom.js';

import { supabase } from './supabase.js';

export async function initTripSetup(currentUser, navigate) {
    const driverInput = $('#tripDriver');
    const carSelect = $('#tripCar');

    if (currentUser && currentUser.company_id) {
        driverInput.value = currentUser.name;
        
        // Traer carros de Supabase
        const { data: vehicles, error } = await supabase
            .from('vehicles')
            .select('*')
            .eq('company_id', currentUser.company_id);

        if (error || !vehicles) {
            carSelect.innerHTML = `<option value="">No hay vehículos disponibles</option>`;
        } else {
            carSelect.innerHTML = vehicles.map(car => 
                `<option value="${car.plate}">${car.plate} - ${car.brand} ${car.model}</option>`
            ).join('');
        }
    } else {
        driverInput.value = 'Usuario Invitado';
        carSelect.innerHTML = `<option value="Vehículo Personal">Mi Vehículo Personal</option>`;
    }

    $('#tripCompanions').value = '';
    $('#tripTime').value = '';
    
    navigate('trip-setup');
}

export function confirmTripSetup(navigate) {
    const time = $('#tripTime').value;
    if (!time) {
        showNotification("Es obligatorio ingresar la hora estimada de entrega.");
        return null;
    }

    const pendingTrip = {
        car: $('#tripCar').value,
        driver: $('#tripDriver').value,
        companions: $('#tripCompanions').value,
        time: time
    };

    navigate('obd');
    return pendingTrip;
}

export function submitTripReview(currentRating, navigate) {
    if (currentRating === 0) {
        showNotification("Por favor califica el vehículo para continuar.");
        return false;
    }

    const reviewText = $('#tripReviewText').value;
    console.log("Reseña enviada:", currentRating, "Estrellas. Texto:", reviewText);

    $('#tripReviewText').value = '';
    showNotification("Reseña enviada exitosamente. Vehículo liberado.");
    navigate('dashboard');
    return true;
}
