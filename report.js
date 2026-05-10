document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. Handle Auth State
    const userToken = localStorage.getItem('userToken');
    const profileItem = document.getElementById('profile-item');
    const loginItem = document.getElementById('login-item');

    if (userToken) {
        if (profileItem) profileItem.classList.remove('hidden');
        if (loginItem) loginItem.classList.add('hidden');
    }

    // 3. Theme Toggle Logic
    const themeBtn = document.getElementById('theme-toggle');
    const body = document.body;

    const savedTheme = localStorage.getItem('farmsafe-theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-theme');
        updateThemeIcon(true);
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            body.classList.toggle('dark-theme');
            const isDark = body.classList.contains('dark-theme');
            localStorage.setItem('farmsafe-theme', isDark ? 'dark' : 'light');
            updateThemeIcon(isDark);
        });
    }

    function updateThemeIcon(isDark) {
        if (themeBtn) {
            themeBtn.innerHTML = isDark ? '<i data-lucide="sun"></i>' : '<i data-lucide="moon"></i>';
            lucide.createIcons();
        }
    }

    // ==========================================
    // NUE ALGORITHM ENGINE
    // ==========================================
    function calculateNUE(r, g, b, n, p, ec, gas, threshold = 2.0) {
        const epsilon = 1e-6; 
        const chlorophyll = g / (r + b + epsilon);
        const photosynthesis = (g - r) / (g + r + epsilon);
        const psi = r / (g + 1);

        const e = chlorophyll * photosynthesis * (1 - psi);
        const load = n + p + ec + gas;

        const nue = e / (load + epsilon);
        const nueScaled = nue * 1000;
        const classification = nueScaled > threshold ? "Efficient" : "Inefficient";

        return { nueScaled, classification };
    }

    // ==========================================
    // 5. PRESCRIPTION ENGINE LOGIC
    // ==========================================
    const prescriptions = {
        'temperature': {
            'low': "Cold Stress: Plant metabolism slowing. Consider row covers or frost protection.",
            'high': "Heat Stress: High evaporation rate. Increase irrigation frequency to prevent wilting.",
            'ok': "Optimal range for steady photosynthesis and growth.",
        },
        'humidity': {
            'low': "Air too dry: High risk of rapid water loss. Run overhead sprinklers.",
            'high': "Air too wet: High risk of fungal infections. Delay watering and clear weeds.",
            'ok': "Perfect moisture balance for leaf health.",
        },
        'soil_moisture': {
            'low': "Soil is too dry. Water your field now.",
            'high': "Soil has too much water. Stop watering and make drainage channels.",
            'ok': "Soil has the right amount of water",
        },
        'tds': {
            'low': "Soil nutrients are low. Add fertilizer or compost.",
            'high': "Too much salt in soil. Flush the field with clean water.",
            'ok': "Soil nutrient level is good",
        },
        'ph': {
            'low': "Soil is too sour (acidic). Add lime powder.",
            'high': "Soil is too sweet (alkaline). Add gypsum or sulfur powder.",
            'ok': "Soil pH is good for your crop",
        },
        'air_quality_ppm': {
            'low': "Air sensor is warming up.",
            'high': "Air around your crop is not clean. Check for smoke nearby.",
            'ok': "Air quality is good",
        },
        'pesticide_usage': {
            'low': "Minimal chemical footprint.",
            'high': "High toxicity risk. Switch to bio-pesticides.",
            'ok': "Within safe limits."
        },
        'npk_n': {
            'low': "Soil needs nitrogen. Add urea or compost. ",
            'high': "Too much nitrogen. Stop adding urea for now.",
            'ok': "Nitrogen level is good.",
        },
        'npk_p': {
            'low': "Soil needs phosphorus. Add DAP or bone meal.",
            'high': "Too much phosphorus. Stop adding DAP for now.",
            'ok': "Phosphorus level is good",
        },
        'npk_k': {
            'low': "Soil needs potassium. Add potash (MOP) or wood ash.",
            'high': "Too much potassium. Stop adding potash for now.",
            'ok': "Potassium level is good",
        }
    };

    const thresholds = {
        'temperature': { min: 18, max: 32 },
        'humidity': { min: 40, max: 80 },
        'soil_moisture': { min: 30, max: 70 },
        'tds': { min: 300, max: 900 },
        'ph': { min: 5.5, max: 7.5 },
        'air_quality_ppm': { min: 10, max: 300 },
        'pesticide_usage': { min: 0, max: 2.5 },
        'npk_n': { min: 40, max: 120 },
        'npk_p': { min: 20, max: 60 },
        'npk_k': { min: 30, max: 80 }
    };

    function getStatus(metric, value) {
        if (!thresholds[metric]) return 'ok';
        if (value < thresholds[metric].min) return 'low';
        if (value > thresholds[metric].max) return 'high';
        return 'ok';
    }

    function injectAdviceIntoCard(cardTitlePartial, adviceText, status) {
        const cards = Array.from(document.querySelectorAll('.stat-card'));
        const targetCard = cards.find(card => card.querySelector('h3')?.innerText.includes(cardTitlePartial));

        if (targetCard) {
            let oldAdvice = targetCard.querySelector('.main-card-advice');
            if (oldAdvice) oldAdvice.remove();

            let adviceDiv = document.createElement('div');
            adviceDiv.className = 'main-card-advice';
            let textColor = status === 'ok' ? 'var(--color-green)' : (status === 'low' ? '#f59e0b' : 'var(--color-red)');

            adviceDiv.style.cssText = `background-color: transparent; color: var(--text-dark); padding: 8px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 500; line-height: 1.4; margin-bottom: 12px; border-left: 3px solid ${textColor};`;
            adviceDiv.innerHTML = `&bull; ${adviceText}`;
            
            let footer = targetCard.querySelector('.stat-footer');
            if (footer) targetCard.insertBefore(adviceDiv, footer);
            else targetCard.appendChild(adviceDiv);
        }
    }

    let activeAlertsCount = 0;
    function addActiveAlert(title, adviceText, status) {
        if (status === 'ok') return; 

        const cards = Array.from(document.querySelectorAll('.stat-card'));
        const alertCard = cards.find(card => card.querySelector('h3')?.innerText.includes('Active Alerts'));
        
        if (alertCard) {
            activeAlertsCount++;
            
            const countDisplay = alertCard.querySelector('.stat-value');
            if (countDisplay) {
                countDisplay.innerText = activeAlertsCount;
                countDisplay.className = `stat-value ${status === 'high' || status === 'low' ? 'text-red' : 'text-yellow'}`;
            }

            let alertDiv = document.createElement('div');
            alertDiv.className = 'main-card-advice dynamic-alert';
            let textColor = status === 'low' ? '#f59e0b' : 'var(--color-red)';

            alertDiv.style.cssText = `background-color: transparent; color: var(--text-dark); padding: 8px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 500; line-height: 1.4; margin-bottom: 8px; border-left: 3px solid ${textColor};`;
            alertDiv.innerHTML = `&bull; <strong>${title}:</strong> ${adviceText}`;
            
            let footer = alertCard.querySelector('.stat-footer');
            if (footer) alertCard.insertBefore(alertDiv, footer);
            else alertCard.appendChild(alertDiv);
        }
    }

    function clearActiveAlerts() {
        activeAlertsCount = 0;
        const cards = Array.from(document.querySelectorAll('.stat-card'));
        const alertCard = cards.find(card => card.querySelector('h3')?.innerText.includes('Active Alerts'));
        if (alertCard) {
            const countDisplay = alertCard.querySelector('.stat-value');
            if (countDisplay) { countDisplay.innerText = "0"; countDisplay.className = "stat-value text-green"; }
            alertCard.querySelectorAll('.dynamic-alert').forEach(el => el.remove());
        }
    }

    // ==========================================
    // 6. SYNCED CSV MATCHER WITH FALLBACKS
    // ==========================================
    function findKey(row, keywords) {
        const keys = Object.keys(row);
        for (let k of keys) {
            let cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
            for (let word of keywords) {
                if (cleanK.includes(word)) return k;
            }
        }
        return null;
    }

    function getSafeValue(csvValue, fallbackValue) {
        if (csvValue === undefined || csvValue === null || csvValue === '') return fallbackValue;
        return parseFloat(csvValue);
    }

    function fetchAndApplyPrescriptions() {
        clearActiveAlerts();

        if (typeof Papa === 'undefined') {
            console.error("PapaParse is missing! Add the script tag to your HTML.");
            return;
        }

        Papa.parse("sensor_data.csv", {
            download: true,
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
            complete: function(results) {
                const csvData = results.data;
                if (csvData.length === 0) return;

                let randomIndex = localStorage.getItem('shared_sensor_index');
                if (randomIndex === null || isNaN(randomIndex)) {
                    randomIndex = Math.floor(Math.random() * csvData.length);
                    localStorage.setItem('shared_sensor_index', randomIndex);
                } else {
                    randomIndex = parseInt(randomIndex, 10);
                    if (randomIndex >= csvData.length) randomIndex = 0; 
                }
                
                const randomRow = csvData[randomIndex];

                const tempKey = findKey(randomRow, ['temp']);
                const humKey = findKey(randomRow, ['humidity', 'hum']);
                const gasKey = findKey(randomRow, ['gas']);
                const phKey = findKey(randomRow, ['ph']);
                const soilKey = findKey(randomRow, ['soil']);
                const tdsKey = findKey(randomRow, ['tds']);
                const nKey = findKey(randomRow, ['npkn']);
                const pKey = findKey(randomRow, ['npkp']);
                const kKey = findKey(randomRow, ['npkk']);

                const rawTds = getSafeValue(tdsKey ? randomRow[tdsKey] : null, 450);

                const liveSensorData = {
                    temperature: getSafeValue(tempKey ? randomRow[tempKey] : null, 24.5),        
                    soil_moisture: getSafeValue(soilKey ? randomRow[soilKey] : null, 55.0),      
                    ph: getSafeValue(phKey ? randomRow[phKey] : null, 6.5),                
                    pesticide_usage: parseFloat((rawTds / 100).toFixed(1)), 
                    humidity: getSafeValue(humKey ? randomRow[humKey] : null, 65.0),           
                    tds: rawTds,              
                    conductivity: parseFloat((rawTds / 640).toFixed(2)),      
                    air_quality_ppm: getSafeValue(gasKey ? randomRow[gasKey] : null, 250),   
                    npk_n: getSafeValue(nKey ? randomRow[nKey] : null, 90),
                    npk_p: getSafeValue(pKey ? randomRow[pKey] : null, 45),
                    npk_k: getSafeValue(kKey ? randomRow[kKey] : null, 75)
                };

                liveSensorData.fertilizer_usage = (liveSensorData.npk_n + liveSensorData.npk_p + liveSensorData.npk_k) / 2.5;
                let healthRisk = Math.min(10, (liveSensorData.pesticide_usage * 1.5) + (liveSensorData.air_quality_ppm / 100)).toFixed(1);

                let rgbStr = "034139034"; // Default Green
                if (randomRow['semsor.colour RGB'] !== undefined && randomRow['semsor.colour RGB'] !== null) {
                    rgbStr = String(randomRow['semsor.colour RGB']).padStart(9, '0');
                }
                let r = parseInt(rgbStr.substring(0,3), 10) || 0;
                let g = parseInt(rgbStr.substring(3,6), 10) || 0;
                let b = parseInt(rgbStr.substring(6,9), 10) || 0;

                const nueData = calculateNUE(r, g, b, liveSensorData.npk_n, liveSensorData.npk_p, liveSensorData.conductivity, liveSensorData.air_quality_ppm, 2.0);

                // Rolling Histories
                let pastMoisture = JSON.parse(localStorage.getItem('farmsafe_moist_hist')) || [65, 59, 80, 81, 83, 88];
                const allMoistureDays = [...pastMoisture, liveSensorData.soil_moisture];
                localStorage.setItem('farmsafe_moist_hist', JSON.stringify(pastMoisture));

                let pastPesticide = JSON.parse(localStorage.getItem('farmsafe_pest_hist')) || [1.2, 1.4, 1.8, 2.5, 3.1, 2.8, 2.2];
                const allPesticideWeeks = [...pastPesticide, liveSensorData.pesticide_usage];
                localStorage.setItem('farmsafe_pest_hist', JSON.stringify(pastPesticide));

                let pastFertilizer = JSON.parse(localStorage.getItem('farmsafe_fert_hist')) || [80, 95, 110, 120];
                const allFertilizerWeeks = [...pastFertilizer, liveSensorData.fertilizer_usage];
                localStorage.setItem('farmsafe_fert_hist', JSON.stringify(pastFertilizer));


                // --- 1. UPDATE THE TOP DASHBOARD NUMBERS ---
                const cards = Array.from(document.querySelectorAll('.stat-card'));
                const setCardValue = (title, value) => {
                    const card = cards.find(c => c.querySelector('h3')?.innerText.includes(title));
                    if (card && card.querySelector('.stat-value')) card.querySelector('.stat-value').innerText = value;
                };

                const tempEl = document.getElementById('val-temp');
                if (tempEl) tempEl.innerText = `${liveSensorData.temperature.toFixed(1)}°C`;
                const humEl = document.getElementById('val-hum');
                if (humEl) humEl.innerText = `${liveSensorData.humidity.toFixed(1)}%`;

                setCardValue('Soil Moisture', `${liveSensorData.soil_moisture.toFixed(1)}%`);
                setCardValue('Pesticide Usage', `${liveSensorData.pesticide_usage.toFixed(1)} Kg`);
                setCardValue('Soil pH Level', liveSensorData.ph.toFixed(1));
                setCardValue('Fertilizer Usage', `${liveSensorData.fertilizer_usage.toFixed(1)} Kg/ha`);
                setCardValue('Health Risk Index', `${healthRisk} / 10`);


                // --- 2. TRIGGER THE AI PRESCRIPTIONS ---
                const moistStatus = getStatus('soil_moisture', liveSensorData.soil_moisture);
                injectAdviceIntoCard('Moisture', prescriptions.soil_moisture[moistStatus], moistStatus);

                const phStatus = getStatus('ph', liveSensorData.ph);
                injectAdviceIntoCard('pH', prescriptions.ph[phStatus], phStatus);

                const pestStatus = getStatus('pesticide_usage', liveSensorData.pesticide_usage);
                injectAdviceIntoCard('Pesticide', prescriptions.pesticide_usage[pestStatus], pestStatus);

                // Custom Weather & Humidity Logic
                const weatherCard = cards.find(c => c.querySelector('h3')?.innerText.includes('Weather'));
                if (weatherCard) {
                    weatherCard.querySelectorAll('.main-card-advice, .stat-subtext').forEach(el => el.remove()); 
                    
                    const addWeatherAdvice = (title, text, status) => {
                        let div = document.createElement('div');
                        div.className = 'main-card-advice';
                        let color = status === 'ok' ? 'var(--color-green)' : (status === 'low' ? '#f59e0b' : 'var(--color-red)');
                        div.style.cssText = `background: transparent; color: var(--text-dark); padding: 4px 8px; font-size: 0.8rem; font-weight: 500; margin-bottom: 6px; border-left: 3px solid ${color}; line-height: 1.3;`;
                        div.innerHTML = `&bull; <strong>${title}:</strong> ${text}`;
                        weatherCard.insertBefore(div, weatherCard.querySelector('.stat-footer'));
                    };

                    const tStat = getStatus('temperature', liveSensorData.temperature);
                    const hStat = getStatus('humidity', liveSensorData.humidity);
                    
                    addWeatherAdvice('Temp', prescriptions.temperature[tStat], tStat);
                    addWeatherAdvice('Humidity', prescriptions.humidity[hStat], hStat);
                }

                const airStatus = getStatus('air_quality_ppm', liveSensorData.air_quality_ppm);
                addActiveAlert('Air Quality', prescriptions.air_quality_ppm[airStatus], airStatus);

                // Smart Conflict Resolver
                const nStatus = getStatus('npk_n', liveSensorData.npk_n);
                const pStatus = getStatus('npk_p', liveSensorData.npk_p);
                const kStatus = getStatus('npk_k', liveSensorData.npk_k);
                const tdsStatus = getStatus('tds', liveSensorData.tds);

                if (tdsStatus === 'low' && (nStatus === 'high' || pStatus === 'high' || kStatus === 'high')) {
                    addActiveAlert('Nutrient Imbalance', 'TDS is low, but NPK is HIGH. Check soil for lockout.', 'low');
                } else {
                    addActiveAlert('TDS', prescriptions.tds[tdsStatus], tdsStatus);
                }

                if (nStatus === 'high') addActiveAlert('High Nitrogen', 'Critically high. Stop urea.', 'high');
                if (pStatus === 'high') addActiveAlert('High Phosphorus', 'Critically high. Stop DAP.', 'high');
                if (kStatus === 'high') addActiveAlert('High Potassium', 'Critically high. Stop Potash.', 'high');


                // --- 3. DYNAMIC TREND ANALYSIS ---
                const moistureChartCard = Array.from(document.querySelectorAll('.card')).find(card => card.querySelector('h3')?.innerText.includes('Soil Moisture Levels'));
                
                if (moistureChartCard) {
                    moistureChartCard.querySelectorAll('.moisture-alert').forEach(el => el.remove());

                    const addMoistureAlert = (title, text, status) => {
                        let textColor = status === 'ok' ? 'var(--color-green)' : (status === 'low' ? '#f59e0b' : 'var(--color-red)');
                        let alertDiv = document.createElement('div');
                        alertDiv.className = 'moisture-alert';
                        alertDiv.style.cssText = `background: transparent; color: var(--text-dark); padding: 6px 0 6px 12px; margin-top: 12px; border-left: 3px solid ${textColor}; font-size: 0.85rem; font-weight: 500; line-height: 1.4;`;
                        alertDiv.innerHTML = `&bull; <strong>${title}:</strong> ${text}`;
                        moistureChartCard.appendChild(alertDiv);
                    };

                    const currentMoist = allMoistureDays[6];
                    let trendStatus = 'ok';
                    let trendText = "Moisture levels are stable across the week.";

                    if (currentMoist < 30) {
                        trendStatus = 'low'; trendText = "Critical: Soil is currently too dry. Immediate irrigation required.";
                    } else if (currentMoist > 80) {
                        trendStatus = 'high'; trendText = "Critical: Soil is heavily saturated. Stop watering.";
                    }
                    addMoistureAlert('Weekly Trend', trendText, trendStatus);
                }

                // --- 4. INJECT INTO CHARTS ---
                if (typeof window.updateNPKChart === 'function') window.updateNPKChart(liveSensorData);
                if (typeof window.updateNUEChart === 'function') window.updateNUEChart(nueData);
                if (typeof window.updatePesticideChart === 'function') window.updatePesticideChart(allPesticideWeeks);
                if (typeof window.updateMoistureChart === 'function') window.updateMoistureChart(allMoistureDays);
                if (typeof window.updateFertilizerChart === 'function') window.updateFertilizerChart(allFertilizerWeeks);
            }
        });
    }

    fetchAndApplyPrescriptions();


    // ==========================================
    // 7. CHARTS LOGIC
    // ==========================================
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.color = '#6b7280';

    // PESTICIDE CHART
    let pesticideChart;
    const ctxPesticide = document.getElementById('pesticideChart');
    if (ctxPesticide) {
        pesticideChart = new Chart(ctxPesticide, {
            type: 'line',
            data: {
                labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'Wk 6', 'Wk 7', 'Current'],
                datasets: [
                    { label: 'Actual Usage (Kg)', data: [0,0,0,0,0,0,0,0], borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.05)', borderWidth: 2, tension: 0.4, fill: true },
                    { label: 'Safe Limit Threshold', data: [2.0, 2.0, 2.0, 2.0, 2.5, 2.5, 2.5, 2.5], borderColor: '#16a34a', borderWidth: 2, borderDash: [5, 5], tension: 0, fill: false }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { x: { grid: { display: false } }, y: { beginAtZero: true, suggestedMax: 4 } } }
        });
        window.updatePesticideChart = function(dataArray) {
            if(pesticideChart) { pesticideChart.data.datasets[0].data = dataArray; pesticideChart.update(); }
        };
    }

    // FERTILIZER CHART
    let fertilizerChart;
    const ctxFertilizer = document.getElementById('fertilizerChart');
    if (ctxFertilizer) {
        fertilizerChart = new Chart(ctxFertilizer, {
            type: 'line',
            data: {
                labels: ['Wk 1','Wk 2','Wk 3','Wk 4','Current'],
                datasets: [
                    { label: 'Fertilizer Applied', data: [0,0,0,0,0], borderColor: '#ca8a04', backgroundColor: 'rgba(202,138,4,0.1)', fill: true, tension: 0.4 },
                    { label: 'Optimal Range', data: [100,100,100,100,100], borderColor: '#16a34a', borderDash: [5,5] }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
        window.updateFertilizerChart = function(dataArray) {
            if(fertilizerChart) { fertilizerChart.data.datasets[0].data = dataArray; fertilizerChart.update(); }
        };
    }

    // MOISTURE CHART
    let moistureChart;
    const ctxMoisture = document.getElementById('moistureChart');
    if (ctxMoisture) {
        moistureChart = new Chart(ctxMoisture, {
            type: 'bar',
            data: { labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], datasets: [{ data: [0,0,0,0,0,0,0], backgroundColor: '#2563eb', borderRadius: 4 }] },
            options: { 
                responsive: true, 
                maintainAspectRatio: false, 
                layout: { padding: { top: 25 } }, /* Added padding so text isn't cut off */
                plugins: { legend: { display: false } }, 
                scales: { y: { beginAtZero: true, max: 100 }, x: { grid: { display: false } } } 
            },
            plugins: [{
                id: 'barLabels',
                afterDatasetsDraw(chart) {
                    const { ctx } = chart;
                    ctx.fillStyle = document.body.classList.contains('dark-theme') ? '#9ca3af' : '#6b7280'; 
                    ctx.font = '600 0.75rem Inter'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
                    chart.data.datasets.forEach((dataset, i) => {
                        chart.getDatasetMeta(i).data.forEach((bar, index) => {
                            if(dataset.data[index] > 0) ctx.fillText(dataset.data[index] + '%', bar.x, bar.y - 4);
                        });
                    });
                }
            }]
        });
        window.updateMoistureChart = function(dataArray) {
            if(moistureChart) { moistureChart.data.datasets[0].data = dataArray.map(v => Math.round(v)); moistureChart.update(); }
        };
    }

    // NPK CHART
    window.updateNPKChart = function(liveSensorData) {
        const chart = Chart.getChart("npkChart");
        if (chart) {
            chart.data.datasets[0].data = [Math.round(liveSensorData.npk_n), Math.round(liveSensorData.npk_p), Math.round(liveSensorData.npk_k)];
            chart.update();
        }

        const nStatus = getStatus('npk_n', liveSensorData.npk_n);
        const pStatus = getStatus('npk_p', liveSensorData.npk_p);
        const kStatus = getStatus('npk_k', liveSensorData.npk_k);

        const npkCard = Array.from(document.querySelectorAll('.card')).find(card => card.querySelector('h3')?.innerText.includes('Nutrient Distribution'));
        if (npkCard) {
            npkCard.querySelectorAll('.npk-alert').forEach(el => el.remove());
            const addNpkAlert = (title, text, status) => {
                let color = status === 'ok' ? 'var(--color-green)' : (status === 'low' ? '#f59e0b' : 'var(--color-red)');
                let alertDiv = document.createElement('div');
                alertDiv.className = 'npk-alert';
                alertDiv.style.cssText = `background: transparent; color: var(--text-dark); padding: 6px 0 6px 12px; margin-top: 8px; border-left: 3px solid ${color}; font-size: 0.85rem; font-weight: 500;`;
                alertDiv.innerHTML = `&bull; <strong>${title}:</strong> ${text}`;
                npkCard.appendChild(alertDiv);
            };
            addNpkAlert('Nitrogen', prescriptions.npk_n[nStatus], nStatus);
            addNpkAlert('Phosphorus', prescriptions.npk_p[pStatus], pStatus);
            addNpkAlert('Potassium', prescriptions.npk_k[kStatus], kStatus);
        }
    };

    const ctxNpk = document.getElementById('npkChart');
    if (ctxNpk) {
        new Chart(ctxNpk, {
            type: 'doughnut',
            data: { labels: ['Nitrogen', 'Phosphorus', 'Potassium'], datasets: [{ data: [0, 0, 0], backgroundColor: ['#ca8a04', '#ec4899', '#2563eb'], borderWidth: 0 }] },
            options: { responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { position: 'right' } } },
            plugins: [{
                id: 'centerTextPlugin',
                beforeDraw: function(chart) {
                    const ctx = chart.ctx; const data = chart.data.datasets[0].data;
                    const { left, right, top, bottom } = chart.chartArea;
                    const cX = (left + right) / 2; const cY = (top + bottom) / 2;
                    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                    ctx.fillStyle = document.body.classList.contains('dark-theme') ? '#9ca3af' : '#6b7280';
                    ctx.font = "500 0.8rem Inter"; ctx.fillText("N | P | K", cX, cY - 12);
                    ctx.fillStyle = document.body.classList.contains('dark-theme') ? '#ffffff' : '#1a1a1a';
                    ctx.font = "bold 1.1rem Inter"; ctx.fillText(`${data[0]}|${data[1]}|${data[2]}`, cX, cY + 8);
                }
            }]
        });
    }

    const ctxCarbon = document.getElementById('carbonChart');
    if (ctxCarbon) {
        new Chart(ctxCarbon, {
            type: 'line',
            data: { labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Current'], datasets: [{ label: 'SOC (%)', data: [1.9, 2.05, 2.15, 2.25, 2.20], borderColor: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.05)', borderWidth: 2, tension: 0.3, fill: true }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } } } }
        });
    }

    const ctxRadar = document.getElementById('radarChart');
    if (ctxRadar) {
        new Chart(ctxRadar, {
            type: 'radar',
            data: { labels: ['Water', 'Fertilizer', 'Energy', 'Labor', 'Pesticide'], datasets: [{ data: [85, 90, 75, 80, 60], backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: '#3b82f6', borderWidth: 2 }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { r: { ticks: { display: false }, suggestedMin: 0, suggestedMax: 100 } } }
        });
        
        // --- ADDED RUE SUGGESTIONS LOGIC BACK HERE ---
        const resCard = Array.from(document.querySelectorAll('.trends-card')).find(card => card.querySelector('h3')?.innerText.includes('Resource Usage'));
        if (resCard) {
            // Prevent duplicates
            resCard.querySelectorAll('.rue-alert').forEach(el => el.remove());

            const addResAlert = (title, score, text, status) => {
                let textColor = status === 'ok' ? 'var(--color-green)' : (status === 'low' ? '#f59e0b' : 'var(--color-red)');
                let alertDiv = document.createElement('div');
                alertDiv.className = 'rue-alert main-card-advice';
                
                alertDiv.style.cssText = `background: transparent; color: var(--text-dark); padding: 6px 0 6px 12px; margin-top: 12px; border-left: 3px solid ${textColor}; font-size: 0.85rem; font-weight: 500; line-height: 1.4;`;
                alertDiv.innerHTML = `&bull; <strong>${title} (${score}%):</strong> ${text}`;
                
                resCard.appendChild(alertDiv);
            };

            addResAlert('Energy', 75, "Usage high. Consider off-peak pump hours.", 'low');
            addResAlert('Pesticide', 60, "High waste detected. Switch to targeted spraying.", 'high');
        }
    }

    // NUE HORIZONTAL BAR CHART
    window.updateNUEChart = function(nueResult) {
        const maxScore = 5.0; 
        const visualScore = Math.max(0, Math.min(nueResult.nueScaled, maxScore));
        const widthPercent = (visualScore / maxScore) * 100;
        const barColor = nueResult.classification === "Efficient" ? 'var(--color-green)' : 'var(--color-red)';

        const scoreTextEl = document.getElementById('nue-score-text');
        if (scoreTextEl) scoreTextEl.innerText = nueResult.nueScaled.toFixed(2);

        const barFillEl = document.getElementById('nue-bar-fill');
        if (barFillEl) { barFillEl.style.width = `${widthPercent}%`; barFillEl.style.backgroundColor = barColor; }

        const alertContainer = document.getElementById('nue-alert-container');
        if (alertContainer) {
            alertContainer.innerHTML = ''; 
            let alertDiv = document.createElement('div');
            alertDiv.className = 'main-card-advice';
            alertDiv.style.cssText = `background: transparent; color: var(--text-dark); padding: 4px 8px; border-left: 3px solid ${barColor}; font-size: 0.8rem; font-weight: 500;`;
            let msg = nueResult.classification === "Efficient" ? "Nutrient usage is optimal." : "High waste detected.";
            alertDiv.innerHTML = `&bull; <strong>${nueResult.classification}:</strong> ${msg}`;
            alertContainer.appendChild(alertDiv);
        }
    };

    const observer = new MutationObserver(() => {
        if (document.body.style.top !== '0px') document.body.style.top = '0px';
        if (document.documentElement.style.top !== '0px') document.documentElement.style.top = '0px';
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });
});