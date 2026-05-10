// 1. Simple RGB bar updater
function updateRGB(color, value) {
    const bar = document.getElementById(`bar-color-${color}`);
    const text = document.getElementById(`val-color-${color}`);
    if (bar && text) {
        const pct = Math.max(0, Math.min((value / 255) * 100, 100));
        bar.style.width = `${pct}%`;
        text.innerText = Math.round(value);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // 2. Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 3. Handle Auth State (Local Storage Only)
    const userToken = localStorage.getItem('userToken');
    const profileItem = document.getElementById('profile-item');
    const loginItem = document.getElementById('login-item');
    const greetingNameEl = document.getElementById('user-greeting-name');

    if (userToken) {
        if (profileItem) profileItem.classList.remove('hidden');
        if (loginItem) loginItem.classList.add('hidden');
        const storedName = localStorage.getItem('userName') || 'Farmer';
        if (greetingNameEl) {
            greetingNameEl.innerText = storedName;
        }
    }

    // 4. Theme Toggle Logic
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

    // 5. Live Clock
    function updateClock() {
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';

        hours = hours % 12;
        hours = hours ? hours : 12;
        minutes = minutes < 10 ? '0' + minutes : minutes;

        const timeString = hours + ':' + minutes + ' ' + ampm;
        const clockElement = document.getElementById('live-clock');
        if (clockElement) {
            clockElement.innerText = timeString;
        }
    }
    updateClock();
    setInterval(updateClock, 60000);

    // ==========================================
    // 6. GAUGE LOGIC ENGINE
    // ==========================================
    function updateGauge(id, value, maxVal) {
        const gaugeId = `gauge-${id}`;
        const textId = id === 'soil' ? 'val-soil-moist' : `val-${id}`;

        const gaugeFill = document.getElementById(gaugeId);
        const text = document.getElementById(textId);

        if (!gaugeFill || !text) return;

        const svg = gaugeFill.closest('svg'); 
        const unit = text.nextElementSibling;
        const numVal = parseFloat(value);
        
        // --- HEALTHY RANGES [MIN, MAX] ---
        const SAFE_LIMITS = {
            'soil': [40, 60],
            'ph': [5.5, 7.5],
            'n': [0, 120],
            'p': [0, 60],
            'k': [0, 100],
            'temp': [15, 35],
            'hum': [40, 80],
            'gas': [0, 300],
            'tds': [0.5, 1.5],   // ADDED: Safe EC limits in mS/cm
            'light': [20, maxVal] 
        };

        const limitMinPath = document.getElementById(`limit-min-${id}`);
        const limitMaxPath = document.getElementById(`limit-max-${id}`);

        let dangerFill = svg.querySelector(`.gauge-danger-fill`);
        if (!dangerFill) {
            dangerFill = document.createElementNS("http://www.w3.org/2000/svg", "path");
            dangerFill.setAttribute("class", "gauge-danger-fill");
            dangerFill.setAttribute("d", "M 10 50 A 40 40 0 0 1 90 50");
            dangerFill.style.fill = "none";
            dangerFill.style.strokeWidth = "10";
            dangerFill.style.strokeLinecap = "butt"; 
            dangerFill.style.transition = "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1), stroke-dasharray 1s cubic-bezier(0.4, 0, 0.2, 1)";
            gaugeFill.parentNode.insertBefore(dangerFill, gaugeFill.nextSibling);
        }

        // --- HANDLE "OFFLINE" / MISSING DATA ---
        if (value === undefined || value === null || value === '' || isNaN(numVal)) {
            text.innerText = '--';
            text.style.color = '#ef4444';   
            if (unit) unit.style.display = 'none'; 
            gaugeFill.style.stroke = "#d1d5db";       
            gaugeFill.style.strokeDashoffset = 125.6; 
            dangerFill.style.strokeDasharray = "0 125.6"; 
            if (limitMinPath) limitMinPath.style.opacity = '0';
            if (limitMaxPath) limitMaxPath.style.opacity = '0';
            return;
        }

        text.style.color = '';
        if (unit) unit.style.display = '';
        text.innerText = Number.isInteger(numVal) ? numVal : numVal.toFixed(1);

        let pct = (numVal / maxVal) * 100;
        pct = Math.max(0, Math.min(pct, 100));

        let maxLimitRaw = SAFE_LIMITS[id] ? SAFE_LIMITS[id][1] : maxVal;
        let maxLimitPct = Math.max(0, Math.min((maxLimitRaw / maxVal) * 100, 100));

        let safePct = Math.min(pct, maxLimitPct);
        let dangerPct = Math.max(0, pct - maxLimitPct);

        let safeLen = (safePct / 100) * 125.6;
        let dangerLen = (dangerPct / 100) * 125.6;

        gaugeFill.style.strokeDashoffset = 125.6 - safeLen;
        gaugeFill.style.stroke = '#16a34a';

        if (dangerLen > 0) {
            dangerFill.style.strokeDasharray = `${dangerLen} 125.6`;
            dangerFill.style.strokeDashoffset = -safeLen; 
            dangerFill.style.stroke = '#ef4444';
        } else {
            dangerFill.style.strokeDasharray = `0 125.6`; 
        }

        text.style.color = dangerLen > 0 ? '#ef4444' : '#16a34a';
        
        if (SAFE_LIMITS[id] !== undefined) {
            if (limitMinPath) limitMinPath.style.opacity = '0';
            if (limitMaxPath) {
                limitMaxPath.style.opacity = '1';
                let theta = Math.PI * (1 - (maxLimitPct / 100)); 
                let x1 = 50 + 32 * Math.cos(theta);
                let y1 = 50 - 32 * Math.sin(theta);
                let x2 = 50 + 48 * Math.cos(theta);
                let y2 = 50 - 48 * Math.sin(theta);
                limitMaxPath.setAttribute('d', `M ${x1} ${y1} L ${x2} ${y2}`);
            }
        }
    }

    // ==========================================
    // 7. EXACT CSV MATCHER WITH SYNC LOGIC
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

    function fetchSensorData() {
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

                // --- SYNC ENGINE (LEADER) ---
                const randomIndex = Math.floor(Math.random() * csvData.length);
                localStorage.setItem('shared_sensor_index', randomIndex); 

                const randomRow = csvData[randomIndex];

                // FIND KEYS
                const tempKey = findKey(randomRow, ['temp']);
                const humKey = findKey(randomRow, ['humidity', 'hum']);
                const gasKey = findKey(randomRow, ['gas']);
                const phKey = findKey(randomRow, ['ph']);
                const lightKey = findKey(randomRow, ['light']);
                const soilKey = findKey(randomRow, ['soil']);
                const tdsKey = findKey(randomRow, ['tds']);
                const weightKey = findKey(randomRow, ['weight']);
                const nKey = findKey(randomRow, ['npkn']);
                const pKey = findKey(randomRow, ['npkp']);
                const kKey = findKey(randomRow, ['npkk']);

                const rawTds = getSafeValue(tdsKey ? randomRow[tdsKey] : null, 450);

                const data = {
                    dht22_temp: getSafeValue(tempKey ? randomRow[tempKey] : null, 24.5),        
                    dht22_humidity: getSafeValue(humKey ? randomRow[humKey] : null, 65.0),    
                    air_quality_ppm: getSafeValue(gasKey ? randomRow[gasKey] : null, 250),  
                    ph: getSafeValue(phKey ? randomRow[phKey] : null, 6.5),                
                    light_level: getSafeValue(lightKey ? randomRow[lightKey] : null, 300),       
                    
                    // CONVERT TDS TO EC (mS/cm)
                    ec_val: parseFloat((rawTds / 640).toFixed(2)),

                    weight: getSafeValue(weightKey ? randomRow[weightKey] : null, 2.5),
                    soil_percent: getSafeValue(soilKey ? randomRow[soilKey] : null, 55.0),      
                    npk_n: getSafeValue(nKey ? randomRow[nKey] : null, 90),            
                    npk_p: getSafeValue(pKey ? randomRow[pKey] : null, 45),             
                    npk_k: getSafeValue(kKey ? randomRow[kKey] : null, 75)
                };

                // --- UPDATE THE WEATHER BAR ---
                const wTempEl = document.querySelector('.w-temp');
                const wDescEl = document.querySelector('.w-desc');
                const wMetrics = document.querySelectorAll('.w-metric');
                const wIconEl = document.querySelector('.weather-icon-small');

                if (wTempEl) {
                    wTempEl.innerText = `${Math.round(data.dht22_temp)}°C`;
                }

                if (wMetrics.length > 0) {
                    wMetrics[0].innerHTML = `<i data-lucide="droplets"></i> ${Math.round(data.dht22_humidity)}% Humidity`;
                }

                // Smart weather description
                if (wDescEl && wIconEl) {
                    let desc = "Partly Cloudy";
                    let icon = "cloud-sun";
                    
                    if (data.dht22_humidity > 80) {
                        desc = "Rain Expected";
                        icon = "cloud-rain";
                    } else if (data.dht22_temp > 30 && data.dht22_humidity < 50) {
                        desc = "Sunny & Clear";
                        icon = "sun";
                    } else if (data.dht22_temp < 20) {
                        desc = "Cool & Breezy";
                        icon = "wind";
                    }

                    wDescEl.innerHTML = `${desc} <span class="w-loc">• Delhi NCR</span>`;
                    wIconEl.setAttribute('data-lucide', icon);
                }

                // --- PARSE RGB ---
                let rgbStr = "034139034"; 
                if (randomRow['semsor.colour RGB'] !== undefined && randomRow['semsor.colour RGB'] !== null) {
                    rgbStr = String(randomRow['semsor.colour RGB']).padStart(9, '0');
                }
                let r = parseInt(rgbStr.substring(0,3), 10) || 0;
                let g = parseInt(rgbStr.substring(3,6), 10) || 0;
                let b = parseInt(rgbStr.substring(6,9), 10) || 0;

                // Update Gauges
                updateGauge('temp', data.dht22_temp, 50);
                updateGauge('hum', data.dht22_humidity, 100);
                updateGauge('gas', data.air_quality_ppm, 1000);
                updateGauge('ph', data.ph, 14);
                updateGauge('light', data.light_level, 500); 
                
                // PASSING THE CONVERTED EC VALUE AND A MAX SCALE OF 3.0
                updateGauge('tds', data.ec_val, 3.0); 

                updateGauge('weight', data.weight, 10);
                updateGauge('soil', data.soil_percent, 100);
                updateGauge('n', data.npk_n, 200);
                updateGauge('p', data.npk_p, 100);
                updateGauge('k', data.npk_k, 200);

                updateRGB('r', r);
                updateRGB('g', g);
                updateRGB('b', b);

                const toHex = (c) => {
                    const hex = Math.max(0, Math.min(255, Math.round(c))).toString(16);
                    return hex.length === 1 ? "0" + hex : hex;
                };
                let hexCode = "#" + toHex(r) + toHex(g) + toHex(b);
                
                if (document.getElementById('val-hex')) document.getElementById('val-hex').innerText = hexCode.toUpperCase();
                if (document.getElementById('color-swatch')) document.getElementById('color-swatch').style.backgroundColor = hexCode;

                // Reload the newly swapped lucide icons in the weather bar
                lucide.createIcons();

                const dateObj = new Date();
                let syncHours = dateObj.getHours() % 12 || 12;
                let syncMins = dateObj.getMinutes().toString().padStart(2, '0');
                const syncAmpm = dateObj.getHours() >= 12 ? 'PM' : 'AM';

                const lastUpdatedElement = document.getElementById('last-updated');
                if (lastUpdatedElement) {
                    lastUpdatedElement.innerText = `Live Data Fetched at ${syncHours}:${syncMins} ${syncAmpm}`;
                }
            },
            error: function(err) {
                console.error("Failed to parse CSV file. Ensure you are running on Localhost!", err);
            }
        });
    }

    fetchSensorData();

    // ==========================================
    // 8. GOOGLE TRANSLATE BANNER ASSASSIN
    // ==========================================
    const observer = new MutationObserver(() => {
        if (document.body.style.top !== '-10px') document.body.style.top = '-10px';
        if (document.documentElement.style.top !== '-10px') document.documentElement.style.top = '-10px';
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });
});