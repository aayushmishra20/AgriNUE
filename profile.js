document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. Authentication Guard
    const userToken = localStorage.getItem('userToken');
    if (!userToken) {
        window.location.href = 'login.html';
        return; 
    } else {
        document.getElementById('profile-item')?.classList.remove('hidden');
        document.getElementById('login-item')?.classList.add('hidden');
        fetchUserProfile(userToken); // Simulated fetch call below
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

    // 4. Tab Switching Logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons and panes
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            // Add active class to clicked button and target pane
            btn.classList.add('active');
            const targetId = btn.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // 5. Edit Profile Toggle Logic
    const editBtn = document.getElementById('edit-profile-btn');
    const lockedInputs = document.querySelectorAll('.locked-input');
    let isEditing = false;

    if (editBtn) {
        editBtn.addEventListener('click', () => {
            if (!isEditing) {
                // Enter Edit Mode
                lockedInputs.forEach(input => {
                    input.removeAttribute('readonly');
                    input.removeAttribute('disabled');
                    input.classList.remove('locked-input');
                });
                
                editBtn.innerHTML = '<i data-lucide="save"></i> Save Changes';
                editBtn.classList.remove('edit-btn');
                editBtn.classList.add('save-btn');
                isEditing = true;
                lucide.createIcons();
            } else {
                // Save & Exit Edit Mode
                lockedInputs.forEach(input => {
                    input.setAttribute('readonly', 'true');
                    if(input.tagName === 'SELECT') input.setAttribute('disabled', 'true');
                    input.classList.add('locked-input');
                });

                editBtn.innerHTML = '<i data-lucide="edit-2"></i> Edit Profile';
                editBtn.classList.remove('save-btn');
                editBtn.classList.add('edit-btn');
                isEditing = false;
                lucide.createIcons();
                
                // Show a quick save notification
                alert("Profile settings saved successfully!");
            }
        });
    }

    // 6. Logout Functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('userToken');
            window.location.href = 'home.html';
        });
    }
});

// --- API FETCH FUNCTION (Simulated for Frontend) ---
async function fetchUserProfile(token) {
    try {
        // Simulating network delay
        setTimeout(() => {
            // MOCK DATA: Changed to generic placeholder details
            const userData = {
                firstName: "John",
                lastName: "Doe",
                email: "john.doe@example.com",
                phone: "+91 00000 00000",
                city: "Delhi",
                state: "Delhi",
                country: "India",
                joinYear: "2025",
                isVerified: true
            };

            // Inject Header Data
            document.getElementById('display-fullname').innerHTML = 
                `${userData.firstName} ${userData.lastName} <i data-lucide="check-circle-2" class="icon-verified" id="badge-verified"></i>`;
            document.getElementById('display-memberdate').innerText = `Member since ${userData.joinYear}`;
            
            if(userData.isVerified) {
                document.getElementById('display-status').innerHTML = `Verified Account <i data-lucide="check-circle-2" class="icon-verified-small"></i>`;
            } else {
                document.getElementById('display-status').innerText = `Unverified Account`;
            }

            // Inject Form Inputs
            document.getElementById('input-firstname').value = userData.firstName;
            document.getElementById('input-lastname').value = userData.lastName;
            document.getElementById('input-email').value = userData.email;
            document.getElementById('input-phone').value = userData.phone;

            // Inject Dropdowns
            document.getElementById('input-city').innerHTML = `<option value="${userData.city}">${userData.city}</option><option>Mumbai</option>`;
            document.getElementById('input-state').innerHTML = `<option value="${userData.state}">${userData.state}</option><option>Maharashtra</option>`;
            document.getElementById('input-country').innerHTML = `<option value="${userData.country}">${userData.country}</option>`;

            if (typeof lucide !== 'undefined') lucide.createIcons();
        }, 600);

    } catch (error) {
        console.error("Error loading profile:", error);
    }
}