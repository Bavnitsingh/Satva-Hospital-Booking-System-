function showPatientHistory(patientid,first_name,last_name,age,gender){
    localStorage.setItem("patient_id",patientid)
    const patient_details={name:first_name+" "+last_name, age:age, gender:gender}
    localStorage.setItem("patient_detail",JSON.stringify(patient_details))
    window.location.href=window.location.origin+'/doctor/view-patient-medical-records'
}

const patientListTemplate=(first_name,last_name,age,gender,blood_group,patient_id)=>{
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
        <button class="flex-shrink-0 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition" onclick='showPatientHistory(${patient_id},"${first_name}","${last_name}","${age}","${gender}")'>View History</button>
      </div>`
}


let currentPage = 1
let totalPages = 1
const PAGE_SIZE = 10
let isLoading = false

function renderPaginationControls(){
    if(totalPages <= 1) return ""

    let buttons = ""
    for(let i=1; i<=totalPages; i++){
        buttons += `<button
            class="w-8 h-8 rounded-lg text-sm font-medium transition ${i===currentPage ? 'bg-teal-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}"
            onclick="goToPage(${i})">${i}</button>`
    }

    return `<div class="flex items-center justify-center gap-2 mt-6">
        <button
            class="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            onclick="goToPage(${currentPage - 1})" ${currentPage===1 ? 'disabled' : ''}>Prev</button>
        ${buttons}
        <button
            class="px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            onclick="goToPage(${currentPage + 1})" ${currentPage===totalPages ? 'disabled' : ''}>Next</button>
    </div>`
}

function goToPage(page){
    if(page < 1 || page > totalPages || page === currentPage) return
    currentPage = page
    patientListLoad()
}

async function patientListLoad(){
    if(isLoading) return
    isLoading = true

    const patient_tab=document.getElementById("tab-patients")
    patient_tab.innerHTML=`<p class="text-sm text-gray-400 text-center py-6">Loading...</p>`

    const accessToken=getAccessToken()

    try{
        const response = await fetch(`/api/v1/doctor/get-patient-list?page=${currentPage}&limit=${PAGE_SIZE}`,{
            method:'GET',
            headers:{
                'Content-Type':'application/json',
                'Authorization':`Bearer ${accessToken}`
            }
        })
        const result = await response.json()
        console.log(result)
        const patient_list = result.data[0].rows
        const total = result.data[0].countResult[0].total
        totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

        let html = ""
        if(patient_list.length === 0){
            html = `<p class="text-sm text-gray-500 text-center py-6">No patients found.</p>`
        } else {
            patient_list.forEach((l)=>{
                html += patientListTemplate(l.first_name,l.last_name,l.age,l.gender,l.blood_group,l.patient_id)
            })
        }

        patient_tab.innerHTML = html + renderPaginationControls()
    } catch(err){
        patient_tab.innerHTML = `<p class="text-sm text-red-500 text-center py-6">Failed to load patients.</p>`
        console.error(err)
    } finally {
        isLoading = false
    }
}

patientListLoad()