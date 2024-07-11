import { useEffect } from "react";
import Login from "./components/login/Login";
import Chat from "./components/chat/Chat";
import Detail from "./components/detail/Detail";
import List from "./components/list/List";
import Notification from "./components/notification/Notification";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useUserStore } from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";


const App = () => {
  //On obtient currentUser, isLoading et fetchUserInfo avec useUserStore.
  const  {currentUser, isLoading,fetchUserInfo} = useUserStore();

  const  {chatId} = useChatStore();

  useEffect(() => {
    //onAuthStateChanged: fonction de firebase qui surveille les changements d'état de l'utilisateur et appelle fetchUserInfo avec le uid de l'utilisateur authentifié ou null s'il est déconnecté.
    ///Chaque fois que l'utilisateur se connecte ou se déconnecte, la fonction de rappel fournie ((user) => { fetchUserInfo(user ? user.uid : null); }) est appelée.
    const unSub = onAuthStateChanged(auth,(user)=>{
      //? est un opérateur de chaînage optionnel, qui permet d'écrire ce qui précède de manière beaucoup plus concise
      //si user est non null et non undefined, alors accéder à user.uid, sinon renvoyer undefined.
      fetchUserInfo(user?.uid);
    });
    //unSub() est une fonction anonyme de nettoyage qui peut être appelée pour se désabonner de l'écouteur d'état d'authentification.
    //React appelle automatiquement cette fonction de nettoyage lorsque le composant est démonté
    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

  console.log(currentUser)

  if(isLoading) return <div className="loading">Chargement en cours...</div>

  return (
    <div className='container'>
      {/**Si currentUser est défini (utilisateur authentifié), il rend les composants List, Chat, et Detail. Sinon il rend le composant Login*/}
      {currentUser ? (
          <>
            <List/>
            {chatId && <Chat/>}
          </>
        ) : (
          <Login/>
        )}  
        <Notification/>   
    </div>
  )
}

export default App