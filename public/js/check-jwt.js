export async function checkJwt(){
    const token = localStorage.getItem("accessToken");
    if(!token){
        window.location.href = "/api/v1/auth/login-page";
    }
}