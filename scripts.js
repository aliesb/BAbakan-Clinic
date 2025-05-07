// scripts.js

// مدیریت لاگین
const validateUser = (username, password) => {
    const validUsers = [
        { username: 'babakanac', password: '00112234' },
        { username: 'admin', password: 'admin123' }
    ];
    return validUsers.some(user => user.username === username && user.password === password);
};

// مدیریت بیماران
let patients = JSON.parse(localStorage.getItem('clinicPatients')) || [];

const savePatient = (patientData) => {
    patients.push(patientData);
    localStorage.setItem('clinicPatients', JSON.stringify(patients));

    // اگر به Google Sheets متصل هستید:
    // saveToGoogleSheets(patientData);
};

const getTodayPatients = () => {
    const today = new Date().toLocaleDateString('fa-IR');
    return patients.filter(patient => {
        return patient.nextVisitDate === today || patient.prescriptionEnd === today;
    });
};

const countActivePatients = () => {
    return patients.filter(patient => patient.status === 'active').length;
};

const calculateTotalDose = (patientsArray) => {
    return patientsArray.reduce((total, patient) => total + parseInt(patient.dailyDose), 0);
};

const findMostDeliveredDrug = (patientsArray) => {
    if (patientsArray.length === 0) return 'ندارد';

    const drugCounts = {};
    patientsArray.forEach(patient => {
        drugCounts[patient.drugType] = (drugCounts[patient.drugType] || 0) + 1;
    });

    let mostFrequentDrug = '';
    let maxCount = 0;

    for (const drug in drugCounts) {
        if (drugCounts[drug] > maxCount) {
            mostFrequentDrug = drug;
            maxCount = drugCounts[drug];
        }
    }

    return mostFrequentDrug;
};

const toJalali = (dateString) => {
    const parts = dateString.split('/');
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; // ماه در جاوااسکریپت از 0 شروع میشه
    const day = parseInt(parts[2]);
    const gregorianDate = new Date(year, month, day);
    return new Intl.DateTimeFormat('fa-IR').format(gregorianDate);
};

const renderTodayPatients = () => {
    const todayPatients = getTodayPatients();
    const tableBody = document.querySelector('.patients-table tbody');
    tableBody.innerHTML = ''; // پاک کردن محتوای قبلی

    todayPatients.forEach(patient => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="patient-info">
                    <div class="patient-avatar">${patient.name.charAt(0)}</div>
                    <div>${patient.name}</div>
                    <span class="drug-indicator ${patient.drugType}"></span>
                </div>
            </td>
            <td>${patient.fileNumber}</td>
            <td>${patient.drugType}</td>
            <td>${patient.dailyDose} سی‌سی</td>
            <td><span class="status-badge badge-${patient.status === 'active' ? 'success' : 'warning'}">${patient.status === 'active' ? 'فعال' : 'در حال اتمام'}</span></td>
            <td>
                <button class="action-btn">
                    <i class="fas fa-pills"></i> تحویل دارو
                </button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // بروزرسانی آمار زیر جدول
    document.querySelector('.stat-value').textContent = todayPatients.length + " نفر";
    document.querySelectorAll('.stat-value')[1].textContent = calculateTotalDose(todayPatients) + " سی‌سی";
    document.querySelectorAll('.stat-value')[2].textContent = findMostDeliveredDrug(todayPatients);
};

document.addEventListener('DOMContentLoaded', () => {
    // اگر در صفحه داشبورد هستیم
    if (document.querySelector('#dashboard')) {
        renderTodayPatients();
        // بروزرسانی کارت‌های آمار
        document.querySelectorAll('.card-value')[0].textContent = countActivePatients();
        document.querySelectorAll('.card-value')[1].textContent = getTodayPatients().length;
    }

    // اگر در صفحه لاگین هستیم
    if (document.querySelector('#login-form')) {
        document.getElementById('username').focus();
    }
});
