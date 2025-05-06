// scripts.js

  // تابع ذخیره بیمار در Firebase
async function savePatient(patientData) {
    try {
        // اضافه کردن تاریخ‌های تحویل دارو
        patientData.deliveryDates = calculateDeliveryDates(
            patientData.registrationDate, 
            patientData.duration
        );
        
        // ذخیره در Firebase
        const docRef = await db.collection('patients').add({
            ...patientData,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // ذخیره در localStorage برای دسترسی سریع
        const patients = JSON.parse(localStorage.getItem('clinicPatients')) || [];
        patients.push({ id: docRef.id, ...patientData });
        localStorage.setItem('clinicPatients', JSON.stringify(patients));
        
        return true;
    } catch (error) {
        console.error("Error saving patient:", error);
        throw error;
    }
}

// تابع محاسبه تاریخ‌های تحویل دارو
function calculateDeliveryDates(startDate, duration, interval = 14) {
    const dates = [];
    const start = new Date(startDate.replace(/(\d+)\/(\d+)\/(\d+)/, '$2/$1/$3'));
    
    for (let i = 0; i < duration; i += interval) {
        const nextDate = new Date(start);
        nextDate.setDate(start.getDate() + i);
        dates.push(nextDate.toLocaleDateString('fa-IR'));
    }
    
    return dates;
}


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
  return patients.filter(patient => 
    patient.nextDeliveryDate === today ||
    patient.prescriptionEnd === today
  );
};

// تبدیل تاریخ شمسی ساده
const toJalali = (date) => {
  const greg = new Date(date);
  const jalali = new Intl.DateTimeFormat('fa-IR').format(greg);
  return jalali;
};

// مدیریت تقویم
const initCalendar = (month, year) => {
  const daysInMonth = 30; // ساده‌سازی - برای پیاده‌سازی دقیق از کتابخانه‌های تبدیل تاریخ استفاده کنید
  let calendarHTML = '';
  
  for (let i = 1; i <= daysInMonth; i++) {
    const isDeliveryDay = patients.some(p => 
      p.deliveryDates.includes(`${year}/${month}/${i}`)
    );
    
    calendarHTML += `
      <div class="calendar-day ${isDeliveryDay ? 'delivery-day' : ''}" 
           data-date="${year}/${month}/${i}">
        ${i}
        ${isDeliveryDay ? `<span class="dose-badge">${getDoseForDate(year, month, i)}</span>` : ''}
      </div>
    `;
  }
  
  document.querySelector('.calendar-grid').innerHTML = calendarHTML;
};

// راه‌اندازی اولیه
document.addEventListener('DOMContentLoaded', () => {
  // اگر در صفحه داشبورد هستیم
  if (document.querySelector('#dashboard')) {
    renderTodayPatients();
    initCalendar(new Date().getMonth() + 1, new Date().getFullYear());
  }
  
  // اگر در صفحه لاگین هستیم
  if (document.querySelector('#login-form')) {
    document.getElementById('username').focus();
  }


});
