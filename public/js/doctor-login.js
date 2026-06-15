
const submit_btn =document.getElementById("submit-btn")

async function login_form(email,passwordInput){

    if(!email || !passwordInput){
        return  
    }

    const formData=new FormData()
    formData.append("email",email)
    formData.append("password",passwordInput)
    const data=Object.fromEntries(formData)
    console.log(data)
    const response=await fetch("/api/v1/auth/login",{
        method:'POST',
        headers:{"Content-type":"application/json"},
        body:JSON.stringify(data)
        
    })
    const result =await response.json()

    return result.data.accessToken

}

submit_btn.addEventListener("click",async(e)=>{


const email=document.getElementById("email").value
const passwordInput=document.getElementById("passwordInput").value
const token = await login_form(email,passwordInput)
if(!token){
    return 
}
window.localStorage.setItem("accessToken",token)
window.location.href='/doctor/dashboard'



})
