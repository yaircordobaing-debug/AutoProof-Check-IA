import './styles/main.css';
import { callGeminiAPI, generateReportAPI } from './services/api.js';
import { inspectionData } from './utils/data.js';

        const apiKey = ""; 

        // Global State
        let currentUser = null;
        let currentView = 'splash';
        
        // Fleet Data (Mock DB)
        const companyFleet = [
            "Mazda 3 (ABC-123)",
            "Toyota Hilux (XYZ-789)",
            "Chevrolet Tracker (DEF-456)",
            "Ford Ranger (GHI-012)",
            "Renault Duster (JKL-345)"
        ];

        // Trip Management
        let pendingTrip = null; // Trip currently being configured/inspected
        let activeTrip = null;  // Trip currently "En curso"

        let reportsHistory = [
            { id: 'AP-2026-085', date: '25 Feb 2026', status: 'APTO', score: 95 },
            { id: 'AP-2026-072', date: '20 Feb 2026', status: 'ADVERTENCIA', score: 78 }
        ];

        // UI Helpers
        function showMessage(msg) {
            const toast = document.getElementById('notification');
            document.getElementById('notificationText').innerText = msg;
            toast.classList.remove('hidden');
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 3000);
        }

        // --- Navigation System ---
        function navigate(viewId) {
            document.querySelectorAll('.view').forEach(el => el.classList.add('hidden'));
            const target = document.getElementById(`view-${viewId}`);
            if (target) {
                target.classList.remove('hidden');
                target.style.animation = 'none';
                target.offsetHeight; 
                target.style.animation = null;
            }
            currentView = viewId;
            document.getElementById('main-content').scrollTop = 0;

            const bottomNav = document.getElementById('bottom-nav');
            const showNavViews = ['dashboard', 'history', 'settings', 'profile'];
            
            if (showNavViews.includes(viewId)) {
                bottomNav.classList.remove('hidden');
                document.querySelectorAll('.nav-btn').forEach(btn => {
                    btn.classList.remove('text-jungle', 'bg-jungle/10');
                    btn.classList.add('text-gray-400');
                });
                const activeBtn = document.getElementById(`nav-${viewId}`);
                if (activeBtn) {
                    activeBtn.classList.remove('text-gray-400');
                    activeBtn.classList.add('text-jungle', 'bg-jungle/10');
                }
            } else {
                bottomNav.classList.add('hidden');
            }

            // Sub-routines
            if (viewId === 'dashboard') updateDashboard();
            if (viewId === 'profile') updateProfile();
            if (viewId === 'history') updateHistory();
        }

        window.onload = () => {
            setTimeout(() => { navigate('login'); }, 2500);
            renderChecklist();
        };

        // --- Auth Logic ---
        function login(isUser) {
            if (isUser) {
                currentUser = { name: 'Juan Perez', email: 'juan.perez@transporte.co', role: 'Conductor Autorizado' };
                showMessage("Sesión corporativa iniciada");
            } else {
                currentUser = null;
                showMessage("Modo invitado activado");
            }
            navigate('dashboard');
        }

        function logout() {
            currentUser = null;
            activeTrip = null; // Also clear trips on logout for security
            pendingTrip = null;
            showMessage("Sesión cerrada");
            navigate('login');
        }

        // --- View Updaters ---
        function updateDashboard() {
            document.getElementById('dashName').innerText = currentUser ? `Hola, ${currentUser.name.split(' ')[0]}` : 'Bienvenido';
            document.getElementById('dashRole').innerText = currentUser ? currentUser.role : 'Modo Invitado';
            
            const lastReportBox = document.getElementById('dashLastReport');
            if (reportsHistory.length > 0) {
                const r = reportsHistory[0];
                const color = r.status === 'APTO' ? 'green' : (r.status === 'ADVERTENCIA' ? 'yellow' : 'red');
                lastReportBox.innerHTML = `
                    <div class="flex items-center justify-between bg-${color}-50 p-4 rounded-2xl border border-${color}-100">
                       <div>
                          <p class="text-xs font-bold text-${color}-700">${r.id}</p>
                          <p class="text-[10px] text-${color}-600"><i class="fa-solid fa-clock mr-1"></i>${r.date}</p>
                       </div>
                       <div class="text-right">
                          <p class="text-xs font-black text-${color}-800">${r.score}% Score</p>
                          <p class="text-[10px] font-bold text-${color}-700 bg-white px-2 py-1 rounded mt-1 inline-block">${r.status}</p>
                       </div>
                    </div>`;
            } else {
                lastReportBox.innerHTML = `
                    <div class="bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200 text-center">
                       <p class="text-xs text-gray-400">Sin historial disponible</p>
                    </div>`;
            }

            // Trip Status Management
            if (activeTrip) {
                document.getElementById('dashActiveTrip').classList.remove('hidden');
                document.getElementById('btnStartNewTrip').classList.add('hidden');
                
                document.getElementById('activeCarName').innerText = activeTrip.car;
                document.getElementById('activeEndTime').innerText = activeTrip.time;
                document.getElementById('activeDriverName').innerText = activeTrip.driver;
                document.getElementById('activeCompanions').innerText = activeTrip.companions || 'Sin acompañantes';
            } else {
                document.getElementById('dashActiveTrip').classList.add('hidden');
                document.getElementById('btnStartNewTrip').classList.remove('hidden');
            }
        }

        function updateProfile() {
            document.getElementById('profileName').innerText = currentUser ? currentUser.name : 'Invitado';
            document.getElementById('profileEmail').innerText = currentUser ? currentUser.email : 'Sin cuenta vinculada';
            
            const icon = document.getElementById('profileIcon');
            icon.className = currentUser ? "fa-solid fa-user-tie text-4xl text-jungle" : "fa-solid fa-user text-4xl text-gray-300";

            // Mostrar el carro asignado actualmente en el perfil
            document.getElementById('profileCarInfo').innerText = activeTrip ? activeTrip.car : "Ninguno";
        }

        function updateHistory() {
            const container = document.getElementById('historyContainer');
            if (!container) return;
            
            if (!currentUser) {
                container.innerHTML = `
                    <div class="flex-1 flex flex-col items-center justify-center py-20 text-center opacity-60">
                        <i class="fa-solid fa-lock text-5xl mb-4 text-gray-300"></i>
                        <p class="text-sm font-medium">Inicia sesión para registrar <br/>tus diagnósticos.</p>
                    </div>`;
                return;
            }

            container.className = "responsive-grid pb-10";

            container.innerHTML = reportsHistory.map(report => `
                <div class="bg-white p-5 rounded-3xl border border-gray-100 flex justify-between items-center shadow-sm premium-card cursor-pointer hover:border-jungle/30 transition-all mb-4 md:mb-0" onclick="window.open('${report.url || '#'}', '_blank')">
                     <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-jungle/5 text-jungle rounded-2xl flex items-center justify-center text-xl shadow-inner">
                             <i class="fa-solid fa-file-invoice"></i>
                        </div>
                        <div>
                           <p class="text-xs font-bold text-gray-800 mb-1">${report.id}</p>
                           <div class="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase">
                             <i class="fa-solid fa-calendar"></i> ${report.date}
                           </div>
                        </div>
                     </div>
                     <div class="flex items-center gap-3">
                        <div class="text-right">
                           <p class="text-[10px] font-black tracking-tighter ${report.status === 'APTO' ? 'text-green-600' : 'text-amber-500'}">
                            ${report.status}
                           </p>
                           <p class="text-[10px] font-bold text-gray-400">${report.score}% Validado</p>
                        </div>
                        <i class="fa-solid fa-eye text-gray-200"></i>
                     </div>
                  </div>
            `).join('');
        }

        // --- Trip Setup Flow ---
        function initTripSetup() {
            const driverInput = document.getElementById('tripDriver');
            const carSelect = document.getElementById('tripCar');

            if (currentUser) {
                driverInput.value = currentUser.name;
                // Llenar flota
                carSelect.innerHTML = companyFleet.map(car => `<option value="${car}">${car}</option>`).join('');
            } else {
                driverInput.value = 'Usuario Invitado';
                // Si es invitado, mostrar solo una opción genérica o dejar que escriba (aquí forzamos una genérica)
                carSelect.innerHTML = `<option value="Vehículo Personal">Mi Vehículo Personal</option>`;
            }

            document.getElementById('tripCompanions').value = '';
            document.getElementById('tripTime').value = '';
            
            navigate('trip-setup');
        }

        function confirmTripSetup() {
            const time = document.getElementById('tripTime').value;
            
            if (!time) {
                showMessage("Es obligatorio ingresar la hora estimada de entrega.");
                return;
            }

            pendingTrip = {
                car: document.getElementById('tripCar').value,
                driver: document.getElementById('tripDriver').value,
                companions: document.getElementById('tripCompanions').value,
                time: time
            };

            navigate('obd');
        }

        // --- End Trip / Review Flow ---
        let currentRating = 0;

        function setRating(stars) {
            currentRating = stars;
            const starElements = document.querySelectorAll('#starRating i');
            starElements.forEach((el, index) => {
                if (index < stars) {
                    el.classList.remove('text-gray-200');
                    el.classList.add('text-warning');
                } else {
                    el.classList.add('text-gray-200');
                    el.classList.remove('text-warning');
                }
            });
        }

        function submitTripReview() {
            if (currentRating === 0) {
                showMessage("Por favor califica el vehículo para continuar.");
                return;
            }

            // Aquí se enviaría la reseña a la base de datos
            console.log("Reseña enviada:", currentRating, "Estrellas. Texto:", document.getElementById('tripReviewText').value);

            // Liberamos el vehículo
            activeTrip = null;
            currentRating = 0;
            setRating(0);
            document.getElementById('tripReviewText').value = '';

            showMessage("Reseña enviada exitosamente. Vehículo liberado.");
            navigate('dashboard');
        }

        // --- OBD Scan Logic ---
        const obdSteps = [
            { label: 'Sistema de Inyección', icon: 'fa-gas-pump' },
            { label: 'Sensores de Emisión (O2)', icon: 'fa-wind' },
            { label: 'Temperatura del Motor', icon: 'fa-temperature-half' },
            { label: 'Voltaje de Batería', icon: 'fa-car-battery' }
        ];

        function startOBDScan() {
            document.getElementById('obd-connect').classList.add('hidden');
            const scanningBox = document.getElementById('obd-scanning');
            scanningBox.classList.remove('hidden');
            scanningBox.classList.add('flex');
            
            const checksContainer = document.getElementById('obd-checks');
            checksContainer.innerHTML = obdSteps.map((s, i) => `
                <div id="obd-chk-${i}" class="flex justify-between items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 transition-colors">
                    <div class="flex items-center gap-3">
                        <i class="fa-solid ${s.icon} text-gray-400 w-5 text-center"></i>
                        <span class="text-sm font-medium text-gray-700">${s.label}</span>
                    </div>
                    <i id="obd-icon-${i}" class="fa-solid fa-circle-notch fa-spin text-blue-400 text-lg"></i>
                </div>
            `).join('');

            let progress = 0;
            const bar = document.getElementById('obd-progress');
            
            const interval = setInterval(() => {
                progress += 2;
                bar.style.width = `${progress}%`;
                if (progress >= 100) {
                    clearInterval(interval);
                    setTimeout(() => {
                        scanningBox.classList.add('hidden');
                        scanningBox.classList.remove('flex');
                        const done = document.getElementById('obd-done');
                        done.classList.remove('hidden');
                        done.classList.add('flex');
                    }, 500);
                }
            }, 30); // sped up slightly for demo

            setTimeout(() => markObdCheck(0), 600);
            setTimeout(() => markObdCheck(1), 1200);
            setTimeout(() => markObdCheck(2), 1800);
            setTimeout(() => markObdCheck(3), 2200);
        }

        function markObdCheck(index) {
            const container = document.getElementById(`obd-chk-${index}`);
            const icon = document.getElementById(`obd-icon-${index}`);
            if(container && icon) {
                container.classList.add('bg-green-50', 'border-green-100');
                container.classList.remove('bg-gray-50');
                icon.className = "fa-solid fa-circle-check text-green-500 text-lg slide-up";
            }
        }

        // --- IA Checklist Logic ---
        

        let results = {}; 
        let currentImageBase64 = null;
        let currentItemId = null;

        function renderChecklist() {
            const container = document.getElementById('checklistContainer');
            container.innerHTML = '';
            
            let totalItems = 0;
            let completedItems = 0;

            inspectionData.forEach(cat => {
                const catDiv = document.createElement('div');
                catDiv.className = 'mb-8';
                
                catDiv.innerHTML = `
                    <h2 class="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2 pl-2">
                        <i class="fa-solid ${cat.icon} text-jungle"></i> ${cat.category}
                    </h2>
                `;

                const list = document.createElement('div');
                list.className = 'checklist-grid';

                cat.items.forEach(item => {
                    totalItems++;
                    const hasResult = results[item.id] !== undefined;
                    if(hasResult) completedItems++;

                    let statusClass = "bg-white border-gray-100";
                    let statusBadge = `<span class="text-[10px] font-bold px-2 py-1 bg-gray-100 text-gray-400 rounded-lg uppercase">Pendiente</span>`;
                    
                    if (hasResult) {
                        const res = results[item.id];
                        if (res.method === 'LEG') {
                            statusClass = "bg-amber-50 border-amber-200";
                            statusBadge = `<span class="text-[10px] font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded-lg uppercase"><i class="fa-solid fa-scale-balanced mr-1"></i> Validado Manual (LEG)</span>`;
                        } else {
                            const isOk = res.status === 'Cumple';
                            statusClass = isOk ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100";
                            statusBadge = isOk 
                                ? `<span class="text-[10px] font-bold px-2 py-1 bg-green-100 text-green-700 rounded-lg uppercase"><i class="fa-solid fa-check mr-1"></i> Aprobado</span>`
                                : `<span class="text-[10px] font-bold px-2 py-1 bg-red-100 text-red-700 rounded-lg uppercase"><i class="fa-solid fa-xmark mr-1"></i> Fallo</span>`;
                        }
                    }

                    const itemDiv = document.createElement('div');
                    let borderClass = "";
                    if (hasResult) {
                        const res = results[item.id];
                        if (res.method === 'LEG') borderClass = "verified-leg";
                        else if (res.status === 'No Cumple') borderClass = "verified-err";
                        else borderClass = "verified-ia";
                    }
                    
                    itemDiv.className = `rounded-3xl p-4 shadow-sm flex items-center justify-between border-2 transition-all duration-300 checklist-item ${borderClass} ${statusClass}`;
                    
                    itemDiv.innerHTML = `
                        <div class="flex-1 pr-3 cursor-pointer" onclick="openModal('${item.id}')">
                            <h3 class="font-bold text-gray-800 text-sm mb-1">${item.name}</h3>
                            <p class="text-xs text-gray-500 leading-snug line-clamp-2">${item.desc}</p>
                            <div class="mt-2">${statusBadge}</div>
                        </div>
                        <button onclick="openModal('${item.id}')" class="shrink-0 w-14 h-14 ${hasResult ? 'bg-white' : 'bg-jungle text-white'} shadow-md rounded-2xl flex items-center justify-center transition-transform active:scale-90">
                            <i class="fa-solid ${hasResult ? 'fa-pen text-gray-400' : 'fa-camera'} text-xl"></i>
                        </button>
                    `;
                    list.appendChild(itemDiv);
                });

                catDiv.appendChild(list);
                container.appendChild(catDiv);
            });

            const percentage = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);
            document.getElementById('progressText').innerText = `${percentage}%`;
            document.getElementById('progressBar').style.width = `${percentage}%`;
        }

        function openModal(itemId) {
            currentItemId = itemId;
            let itemData;
            inspectionData.forEach(cat => cat.items.forEach(i => { if(i.id === itemId) itemData = i; }));

            document.getElementById('modalTitle').innerText = itemData.name;
            document.getElementById('modalInstructions').innerHTML = itemData.prompt 
                ? `<strong>Instrucción:</strong> ${itemData.prompt}` 
                : `<strong>Instrucción:</strong> Confirma el estado de este componente manualmente.`;
            
            resetModalState();
            
            // Toggle UI based on type
            const imgContainer = document.getElementById('imagePreviewContainer');
            const numContainer = document.getElementById('numericalInputContainer');
            const audioContainer = document.getElementById('audioInputContainer');
            const btnAnalyze = document.getElementById('btnAnalyze');
            const btnBypass = document.getElementById('btnBypassIA');

            // Reset visibility
            imgContainer.classList.add('hidden');
            numContainer.classList.add('hidden');
            audioContainer.classList.add('hidden');
            btnAnalyze.classList.add('hidden');
            btnBypass.classList.remove('hidden');

            if (itemData.type === 'IA-V' || itemData.type === 'EVD' || itemData.type === 'VAL') {
                imgContainer.classList.remove('hidden');
                btnAnalyze.classList.remove('hidden');
                if (itemData.type === 'VAL') {
                    numContainer.classList.remove('hidden');
                    document.getElementById('valUnit').innerText = itemData.unit;
                }
            } else if (itemData.type === 'IA-A') {
                audioContainer.classList.remove('hidden');
                btnAnalyze.classList.remove('hidden');
                btnAnalyze.innerHTML = '<i class="fa-solid fa-microchip"></i> Analizar Audio';
            } else if (itemData.type === 'USR') {
                // USR type: Manual Yes/No validation
                btnAnalyze.classList.add('hidden');
                document.getElementById('btnSaveResult').classList.remove('hidden');
                document.getElementById('btnSaveResult').innerHTML = '<i class="fa-solid fa-circle-check"></i> Sí, Cumple';
                document.getElementById('btnSaveResult').onclick = function() { saveResultWithStatus('Cumple'); };
                
                // Create/show "No Cumple" button
                let btnNoCumple = document.getElementById('btnNoCumple');
                if (!btnNoCumple) {
                    btnNoCumple = document.createElement('button');
                    btnNoCumple.id = 'btnNoCumple';
                    btnNoCumple.className = 'w-full bg-red-600 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-red-700 transition-all mt-2 flex items-center justify-center gap-2';
                    document.getElementById('btnSaveResult').parentNode.appendChild(btnNoCumple);
                }
                btnNoCumple.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> No Cumple';
                btnNoCumple.classList.remove('hidden');
                btnNoCumple.onclick = function() { saveResultWithStatus('No Cumple'); };
            }

            const modal = document.getElementById('cameraModal');
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            
            if(results[itemId]) showResultInModal(results[itemId]);
        }

        function closeModal() {
            const modal = document.getElementById('cameraModal');
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            currentItemId = null;
        }

        function resetModalState() {
            currentImageBase64 = null;
            if (document.getElementById('fileInput')) document.getElementById('fileInput').value = '';
            if (document.getElementById('cameraInput')) document.getElementById('cameraInput').value = '';
            if (document.getElementById('galleryInput')) document.getElementById('galleryInput').value = '';
            if (document.getElementById('imagePreview')) {
                document.getElementById('imagePreview').src = '';
                document.getElementById('imagePreview').classList.add('hidden');
            }
            if (document.getElementById('uploadPrompt')) document.getElementById('uploadPrompt').classList.remove('hidden');
            if (document.getElementById('valInput')) document.getElementById('valInput').value = '';
            
            const btn = document.getElementById('btnAnalyze');
            if (btn) {
                btn.disabled = true;
                btn.innerHTML = '<i class="fa-solid fa-microchip"></i> Analizar con IA';
            }
            
            if (document.getElementById('btnSaveResult')) {
                document.getElementById('btnSaveResult').classList.add('hidden');
                document.getElementById('btnSaveResult').innerHTML = '<i class="fa-solid fa-check"></i> Confirmar y Guardar';
                document.getElementById('btnSaveResult').onclick = saveResult; // Reset onclick
            }
            // Hide the No Cumple button if it exists
            const btnNoCumple = document.getElementById('btnNoCumple');
            if (btnNoCumple) btnNoCumple.classList.add('hidden');
            if (document.getElementById('analysisState')) document.getElementById('analysisState').classList.add('hidden');
            if (document.getElementById('analysisResult')) document.getElementById('analysisResult').classList.add('hidden');
        }

        function handleImageSelect(e) {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(event) {
                currentImageBase64 = event.target.result;
                const imgPreview = document.getElementById('imagePreview');
                imgPreview.src = currentImageBase64;
                imgPreview.classList.remove('hidden');
                document.getElementById('uploadPrompt').classList.add('hidden');
                
                checkEnableAnalyze();
            };
            reader.readAsDataURL(file);
        }

        document.getElementById('fileInput').addEventListener('change', handleImageSelect);
        document.getElementById('cameraInput').addEventListener('change', handleImageSelect);
        document.getElementById('galleryInput').addEventListener('change', handleImageSelect);

        document.getElementById('valInput').addEventListener('input', checkEnableAnalyze);

        function checkEnableAnalyze() {
            let itemData;
            if (!currentItemId) return;
            inspectionData.forEach(cat => cat.items.forEach(i => { if(i.id === currentItemId) itemData = i; }));

            const btn = document.getElementById('btnAnalyze');
            if (itemData.type === 'VAL') {
                btn.disabled = !(currentImageBase64 && document.getElementById('valInput').value);
            } else if (itemData.type === 'IA-V' || itemData.type === 'EVD') {
                btn.disabled = !currentImageBase64;
            } else if (itemData.type === 'IA-A') {
                btn.disabled = false; // Always enabled for simulated recording
            }
        }

        async function startAnalysis() {
            if (!currentItemId) return;
            
            let itemData;
            inspectionData.forEach(cat => cat.items.forEach(i => { if(i.id === currentItemId) itemData = i; }));

            document.getElementById('btnAnalyze').classList.add('hidden');
            document.getElementById('analysisState').classList.remove('hidden');
            document.getElementById('analysisState').classList.add('flex');

            // Simulate Audio recording if needed
            if (itemData.type === 'IA-A') {
                await new Promise(r => setTimeout(r, 2000)); // Simulate recording / processing
            }

            try {
                // If it's pure EVD or VAL, we don't necessarily NEED Gemini for the demo, 
                // but let's keep it for visual consistency.
                const response = await callGeminiAPI(currentImageBase64 || "audio_placeholder", itemData.prompt);
                showResultInModal(response);
            } catch (error) {
                console.error("API Error:", error);
                
                // Fallback for demo if API key is missing or fails
                const mockResponse = {
                    status: "Error",
                    observation: "[ERR-FRONT] El servidor no respondió. Verifica que el backend esté corriendo en el puerto 8000.",
                    detected_values: ""
                };
                setTimeout(() => showResultInModal(mockResponse), 500);
            }
        }

        

        let currentAIResult = null;

        function showResultInModal(result) {
            currentAIResult = result;
            document.getElementById('analysisState').classList.add('hidden');
            document.getElementById('analysisState').classList.remove('flex');
            
            const resultBox = document.getElementById('analysisResult');
            resultBox.classList.remove('hidden');

            const statusEl = document.getElementById('resultStatus');
            const iconEl = document.getElementById('resultIcon');
            const valuesEl = document.getElementById('resultValues');
            
            statusEl.innerText = result.status;
            
            if (result.status === 'Cumple' || result.status === 'Validado Manual') {
                statusEl.className = "font-bold text-xl text-green-700";
                iconEl.innerHTML = '<i class="fa-solid fa-circle-check text-green-600 text-3xl"></i>';
                resultBox.className = "bg-green-50 rounded-2xl p-5 border border-green-200 mt-4";
                if (result.status === 'Validado Manual') statusEl.innerText = 'Validado (Manual)';
            } else if (result.status === 'No Cumple') {
                statusEl.className = "font-bold text-xl text-red-700";
                iconEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation text-red-600 text-3xl"></i>';
                resultBox.className = "bg-red-50 rounded-2xl p-5 border border-red-200 mt-4";
            } else {
                statusEl.className = "font-bold text-xl text-yellow-700";
                iconEl.innerHTML = '<i class="fa-solid fa-magnifying-glass text-yellow-600 text-3xl"></i>';
                resultBox.className = "bg-yellow-50 rounded-2xl p-5 border border-yellow-200 mt-4";
            }

            if (result.detected_values) {
                valuesEl.innerText = "IA Detectó: " + result.detected_values;
                valuesEl.classList.remove('hidden');
            } else {
                valuesEl.classList.add('hidden');
            }

            document.getElementById('resultObservation').innerText = result.observation;
            document.getElementById('btnSaveResult').classList.remove('hidden');
        }

        function saveResult() {
            if (currentItemId) {
                let itemData;
                inspectionData.forEach(cat => cat.items.forEach(i => { if(i.id === currentItemId) itemData = i; }));

                if (itemData.type === 'USR' && !currentAIResult) {
                    // Manual validation
                    results[currentItemId] = {
                        status: 'Cumple',
                        method: 'USR',
                        observation: 'Validado manualmente por el conductor.'
                    };
                } else if (currentAIResult) {
                    // IA Result
                    if (itemData.type === 'VAL') {
                        currentAIResult.detected_values = document.getElementById('valInput').value + " " + itemData.unit;
                    }
                    results[currentItemId] = currentAIResult;
                }

                renderChecklist();
                closeModal();
            }
        }

        // --- Generación de Reporte Final ---
        function saveResultWithStatus(status) {
            if (currentItemId) {
                results[currentItemId] = {
                    status: status,
                    method: 'USR',
                    observation: status === 'Cumple' 
                        ? 'Validado manualmente por el conductor.' 
                        : 'Marcado como NO CUMPLE por el conductor.'
                };
                renderChecklist();
                closeModal();
            }
        }

        let currentFinalReport = null;

        function evaluarReporte() {
            let total = 0, completados = 0;
            let fallos = [];

            inspectionData.forEach(cat => {
                cat.items.forEach(i => {
                    total++;
                    if (results[i.id]) {
                        completados++;
                        if (results[i.id].status === 'No Cumple') fallos.push(i.name);
                    }
                });
            });

            if (completados < total) {
                alert(`Debes completar la inspección con cámara. Te faltan ${total - completados} puntos.`);
                return;
            }

            let score = 100 - (fallos.length * (100/total));
            score = Math.max(0, Math.round(score));
            
            let hasManualValidation = Object.values(results).some(r => r.method === 'LEG');

            currentFinalReport = {
                trip_id: `AP-2026-${Math.floor(Math.random() * 900 + 100)}`,
                driver_name: currentUser ? currentUser.name : "Invitado",
                vehicle_plate: activeTrip ? activeTrip.car : (pendingTrip ? pendingTrip.car : "ABC-123"),
                items: Object.keys(results).map(id => {
                    let item;
                    inspectionData.forEach(cat => cat.items.forEach(i => { if(i.id === id) item = i; }));
                    return {
                        id: id,
                        name: item.name,
                        status: results[id].status,
                        method: results[id].method || item.type,
                        observation: results[id].observation || "",
                        detected_values: results[id].detected_values || ""
                    };
                }),
                score: score,
                status: fallos.length === 0 ? (hasManualValidation ? 'APTO CON OBSERVACIONES' : 'APTO') : (fallos.length <= 2 ? 'ADVERTENCIA' : 'NO APTO'),
                hasManual: hasManualValidation
            };

            renderReportView();
            navigate('report');
        }

        function renderReportView() {
            const r = currentFinalReport;
            document.getElementById('reportScoreText').innerText = `${r.score}/100`;
            
            const badge = document.getElementById('reportStatusBadge');
            const icon = document.getElementById('reportIcon');
            const iconBox = document.getElementById('reportIconBox');
            const failsBox = document.getElementById('reportFailsContainer');
            
            badge.innerText = r.status;

            const fallos = r.items.filter(i => i.status === 'No Cumple').map(i => i.name);

            if (fallos.length === 0) {
                badge.className = "font-bold px-3 py-1 rounded-full text-xs bg-green-100 text-green-700";
                icon.className = "fa-solid fa-check text-5xl text-green-600";
                iconBox.className = "w-24 h-24 rounded-full flex items-center justify-center mb-4 shadow-inner bg-green-50 border-4 border-green-100";
                failsBox.classList.add('hidden');
            } else {
                badge.className = "font-bold px-3 py-1 rounded-full text-xs bg-amber-100 text-amber-700";
                icon.className = "fa-solid fa-triangle-exclamation text-5xl text-amber-600";
                iconBox.className = "w-24 h-24 rounded-full flex items-center justify-center mb-4 shadow-inner bg-amber-50 border-4 border-amber-100";
                
                failsBox.classList.remove('hidden');
                document.getElementById('reportFailsList').innerHTML = fallos.map(f => `<li>${f}</li>`).join('');
            }
        }

        function simulateSend(target) {
            showMessage(`Procesando envío cifrado a ${target}...`);
            setTimeout(() => {
                showMessage(`✅ Evidencia enviada exitosamente a ${target}.`);
            }, 1500);
        }

        // --- Legal Waiver Logic ---
        let signaturePad = null;
        let isSigning = false;

        function openLegalWaiver() {
            document.getElementById('legalModal').classList.remove('hidden');
            document.getElementById('legalModal').classList.add('flex');
            initSignaturePad();
        }

        function closeLegalModal() {
            document.getElementById('legalModal').classList.add('hidden');
            document.getElementById('legalModal').classList.remove('flex');
        }

        function initSignaturePad() {
            const canvas = document.getElementById('signature-pad');
            const ctx = canvas.getContext('2d');
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            
            canvas.onmousedown = (e) => startSign(e.offsetX, e.offsetY);
            canvas.onmousemove = (e) => sign(e.offsetX, e.offsetY);
            canvas.onmouseup = () => stopSign();
            
            canvas.ontouchstart = (e) => {
                const rect = canvas.getBoundingClientRect();
                startSign(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top); e.preventDefault();
            };
            canvas.ontouchmove = (e) => {
                const rect = canvas.getBoundingClientRect();
                sign(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top); e.preventDefault();
            };
            canvas.ontouchend = () => stopSign();

            function startSign(x, y) { isSigning = true; ctx.beginPath(); ctx.moveTo(x, y); }
            function sign(x, y) { if (!isSigning) return; ctx.lineTo(x, y); ctx.stroke(); }
            function stopSign() { isSigning = false; }
        }

        function clearSignature() {
            const canvas = document.getElementById('signature-pad');
            canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        }

        function confirmLegalValidation() {
            const checked = document.getElementById('legalCheckbox').checked;
            if (!checked) {
                showMessage("Debes aceptar el descargo de responsabilidad.");
                return;
            }

            // In a real app, we'd save the canvas as base64
            results[currentItemId] = {
                status: 'Validado Manual',
                method: 'LEG',
                observation: document.getElementById('legalComment').value || 'Validado bajo responsabilidad del conductor.',
                signature: true
            };

            closeLegalModal();
            closeModal();
            renderChecklist();
            showMessage("Componente validado bajo firma legal.");
        }

        async function finishReport() {
            if (currentFinalReport) {
                try {
                    showMessage("Generando reporte legal con firma digital...");
                    const response = await fetch('/v1/generate-report', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(currentFinalReport)
                    });
                    const data = await response.json();
                    
                    reportsHistory.unshift({
                        id: data.report_id,
                        date: new Date().toLocaleDateString(),
                        score: currentFinalReport.score,
                        status: currentFinalReport.status,
                        url: data.url
                    });
                    
                    showMessage(`✅ Reporte ${data.report_id} generado y firmado.`);
                } catch (error) {
                    console.error("Report Error:", error);
                    showMessage("Error al guardar reporte en servidor.");
                }
            }

            if (pendingTrip) {
                activeTrip = pendingTrip;
                pendingTrip = null;
            }

            results = {}; 
            renderChecklist();
            navigate('dashboard');
        }

    

// Expose globals for inline event handlers
window.login = login;
window.logout = logout;
window.navigate = navigate;
window.initTripSetup = initTripSetup;
window.confirmTripSetup = confirmTripSetup;
window.setRating = setRating;
window.submitTripReview = submitTripReview;
window.startOBDScan = startOBDScan;
window.openModal = openModal;
window.closeModal = closeModal;
window.startAnalysis = startAnalysis;
window.saveResult = saveResult;
window.evaluarReporte = evaluarReporte;
window.simulateSend = simulateSend;
window.openLegalWaiver = openLegalWaiver;
window.closeLegalModal = closeLegalModal;
window.clearSignature = clearSignature;
window.confirmLegalValidation = confirmLegalValidation;
window.finishReport = finishReport;
