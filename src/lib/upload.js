import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import {storage} from "./firebase"

const upload = async (file)=>{

    const date = new Date();
    const storageRef = ref(storage, `images/${date + file.name}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

    // Retourner une promesse pour gérer les états de téléchargement
    return new Promise((resolve, reject) =>{
        
        uploadTask.on('state_changed', 
            (snapshot) => {
                // Suivre la progression du téléchargement
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
               
            }, 
            (error) => {
                // Gérer les erreurs de téléchargement
                reject("quelque chose s'est mal passé!" + error.code)
            }, 
            () => {
                // Obtenir l'URL de téléchargement lorsque le téléchargement est terminé    
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                    resolve(downloadURL)
                });
            }
        );  
    });

};



export default upload