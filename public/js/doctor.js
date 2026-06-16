const patientListTemplate = (first_name, last_name, age, gender, blood_group, patient_id) => {
    return ` <div class="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-start gap-4">
        <div class="flex-shrink-0 w-11 h-11 bg-teal-50 rounded-full flex items-center justify-center">
          <svg class="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-gray-900">${first_name} ${last_name}</p>
          <p class="text-xs text-gray-500 mt-0.5">Age ${age} &bull; ${gender}</p>
          <p class="text-xs text-gray-500 mt-0.5">Blood Group ${blood_group}</p>
      
        </div>
        <button class="flex-shrink-0 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">View History</button>
      </div>`
}

const medicalRecordTemplate = (record_id, patient_name, diagnosis, date, type) => {
    return ` <div class="bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4 flex items-start gap-4">
        <div class="flex-shrink-0 w-11 h-11 bg-teal-50 rounded-full flex items-center justify-center">
          <svg class="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-gray-900">${patient_name}</p>
          <p class="text-xs text-gray-500 mt-0.5">Diagnosis: ${diagnosis} &bull; ${type}</p>
          <p class="text-xs text-gray-500 mt-0.5">Record ID: ${record_id} &bull; Date: ${date}</p>
        </div>
        <button class="flex-shrink-0 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition">View Details</button>
      </div>`
}

function getAccessToken() {

    const accessToken = window.localStorage.getItem('accessToken')
    return accessToken
}

//patient list 
async function patientListLoad() {
    const patient_tab = document.getElementById("tab-patients")
    patient_tab.innerHTML = ""

    const accessToken = getAccessToken()

    const response = await fetch('/api/v1/doctor/get-patient-list', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    })
    const result = await response.json()
    const patient_list = result.data[0].result
    patient_list.forEach((l) => {
        patient_tab.innerHTML = patient_tab.innerHTML + patientListTemplate(l.first_name, l.last_name, l.age, l.gender, l.blood_group, l.patient_id)

    })
}


async function dashboardData() {

    const appointment = document.getElementById("appointment_count")
    const upcoming = document.getElementById("upcoming_count")
    const rescheduled = document.getElementById("rescheduled_count")
    const cancelled = document.getElementById("cancelled_count")

    const accessToken = getAccessToken()

    const response = await fetch("/api/v1/appointments/doctor/dashboard", {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    })

    const result = await response.json()
    const dashboardData = result.data.dashboardData
    console.log(dashboardData)
    appointment.innerText = dashboardData['TOTAL APPOINTMENT']
    upcoming.innerText = dashboardData['UPCOMING']
    rescheduled.innerText = dashboardData['RESCHEDULED']
    cancelled.innerText = dashboardData['CANCELLED']


}

async function medicalRecordsLoad() {
    const records_tab = document.getElementById("tab-records") || document.getElementById("recordsContainer");
    if(!records_tab) return;
    
    records_tab.innerHTML = "";

    const accessToken = getAccessToken();

    const response = await fetch('/api/v1/doctor/get-medical-records', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    });
    const result = await response.json();
    
    if(result.data && result.data[0] && result.data[0].result && result.data[0].result.length > 0) {
        const records_list = result.data[0].result;
        records_list.forEach((r) => {
            const date = r.created_at ? r.created_at.split('T')[0] : (r.slot_date || '--');
            records_tab.innerHTML += medicalRecordTemplate(r.record_id, `${r.patient_first_name} ${r.patient_last_name}`, r.diagnosis || 'No Diagnosis', date, r.appointment_type || 'IN_PERSON');
        });
    } else {
        records_tab.innerHTML = `<p class="text-gray-500 text-sm py-4">No medical records found.</p>`;
    }
}


dashboardData()
patientListLoad()


medicalRecordsLoad()
