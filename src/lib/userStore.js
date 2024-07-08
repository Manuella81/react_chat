import { doc, getDoc } from 'firebase/firestore';
import { create } from 'zustand';
import { db } from './firebase'; 


//création d'un store avec Zustand pour gérer l'état utilisateur
export const useUserStore = create((set) => ({
  isLoading: true,
  currentUser: null,
  //fonction asynchrone pour récupérer les informations utilisateur depuis Firestore.
  fetchUserInfo: async (uid) =>{
    //Si uid (User ID) est absent, mise à jour le store avec currentUser: null et isLoading: false.
    if(!uid) return set({currentUser:null, isLoading: false});

    try{
      //firebase: récupérer le contenu d'un seul document à l'aide de get()
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      
      //Si le document existe, elle met à jour currentUser avec les données du document et définit isLoading à false sinon.
      //Si le document n'existe pas ou en cas d'erreur, elle met à jour currentUser avec null et définit isLoading à false.
      if (docSnap.exists()) {
        set({ currentUser: docSnap.data(), isLoading: false});
      } else {
        set({ currentUser: null, isLoading: false})
      }
    }catch(err){
        console.log(err);
        return set({currentUser:null, isLoading: false});
    }
  }
  
}))


