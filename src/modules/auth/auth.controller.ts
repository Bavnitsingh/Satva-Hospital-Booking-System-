import { Request,Response } from "express";

async function getHomePage(req:Request,res:Response){
    try {
         res.render('homepage');
    } catch (error) {
        
    }
}
export default getHomePage;