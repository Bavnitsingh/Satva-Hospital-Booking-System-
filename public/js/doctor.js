


function getAccessToken(){

const accessToken=window.localStorage.getItem('accessToken')
return accessToken
}




async function  dashboardData(){

const appointment=document.getElementById("appointment_count")
const upcoming=document.getElementById("upcoming_count")
const rescheduled=document.getElementById("rescheduled_count")
const cancelled=document.getElementById("cancelled_count")

const accessToken=getAccessToken()

const response=await fetch("/api/v1/doctor/get-dashboard-data",{
    method:'GET',
    headers:{
        'Content-Type':'application/json',
        'Authorization':`Bearer ${accessToken}`
    }
})

const result=await response.json()
const dashboardData=result.data[0].dashboard_data

appointment.innerText=dashboardData['TOTAL APPOINTMENT']
upcoming.innerText=dashboardData['UPCOMING']
rescheduled.innerText=dashboardData['RESCHEDULED']
cancelled.innerText=dashboardData['CANCELLED']


}

dashboardData()

