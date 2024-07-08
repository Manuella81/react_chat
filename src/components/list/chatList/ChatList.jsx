// Importation des hooks React et des dépendances nécessaires
import { useEffect, useState } from "react";
import "./chatList.css";
import AddUser from "./addUser/AddUser";
import { useUserStore } from "../../../lib/userStore";
import { useChatStore } from "../../../lib/chatStore";
import { onSnapshot, doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

// Composant principal ChatList
const ChatList = () => {
  // État local pour stocker les chats et l'état d'ajout de mode
  const [chats, setChats] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [input, setInput] = useState("");


  // Récupération des données utilisateur et chat à partir des stores
  const { currentUser } = useUserStore();
  const { changeChat } = useChatStore();

  // Effet pour obtenir des mises à jour en temps réel des chats de l'utilisateur
  useEffect(() => {
    // Obtenir des mises à jour en temps réel des chats de l'utilisateur courant
    const unSub = onSnapshot(
      doc(db, "userchats", currentUser.id), 
      async (res) => {
        // Extraction des chats du document utilisateur
        const items = res.data().chats;

        // Pour chaque chat, récupérer les données de l'utilisateur correspondant
        const promises = items.map(async (item) => {
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);

          const user = userDocSnap.data();

          return { ...item, user };
        });

        // Attendre que toutes les promesses soient résolues et trier les chats par date de mise à jour
        const chatData = await Promise.all(promises);
        setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
      }
    );

    // Nettoyer l'effet pour arrêter l'écoute quand le composant est démonté
    return () => {
      unSub();
    }
  }, [currentUser.id]); // Le tableau de dépendances inclut currentUser.id pour relancer l'effet quand il change

  // Gestionnaire pour sélectionner un chat
  const handleSelect = async (chat) => {
    // Créer une copie des chats sans les données de l'utilisateur
    const userChats = chats.map(item => {
      const { ...rest } = item;
      //const { user, ...rest } = item;

      return rest;
    });

    // Trouver l'index du chat sélectionné et le marquer comme vu
    const chatIndex = userChats.findIndex(item => item.chatId === chat.chatId);
    userChats[chatIndex].isSeen = true;

    // Référence du document userchats de l'utilisateur courant
    const userChatsRef = doc(db, "userchats", currentUser.id);

    try {
      // Mettre à jour le document avec les nouvelles informations de chat
      await updateDoc(userChatsRef, {
        chats: userChats,
      });
      // Changer le chat courant dans le store
      changeChat(chat.chatId, chat.user);

    } catch (err) {
      console.log(err);
    }
  }

  //filtre du tableau chats. Filter permlet de créer un nouveau tableau contenant tous les élements du tableau d'origine qui passent le test 
  const filteredChats = chats.filter((c) =>
    c.user.username.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <img src="./search.png" alt="" />
          <input type="text" placeholder="Rechercher" onChange={(e)=>setInput(e.target.value)}/>
        </div>
        <img 
          // Si addMode est true, l'image affichée sera ./minus.png. Sinon, ce sera ./plus.png.
          src={addMode ? "./minus.png" : "./plus.png"} 
          alt="" 
          className="add"
          // Inverse l'état de addMode
          onClick={() => setAddMode((prev) => !prev)}
        />
      </div>

      {/* Affichage des chats */}
      {filteredChats.map((chat) => (
        <div className="item" 
          key={chat.chatId} 
          onClick={() => handleSelect(chat)}
          style={{
            // Change la couleur de fond si le chat n'a pas été vu
            backgroundColor: chat?.isSeen ? "transparent" : "#5183fe",
          }}
        >
          <img src={
            chat.user.blocked.includes(currentUser.id) 
              ? "./avatar.png" 
              : chat.user.avatar || "./avatar.png"
          } 
          alt="" 
          />
          <div className="texts">
            <span>
              {chat.user.blocked.includes(currentUser.id) 
                ? "user" 
                : chat.user.username}
            </span>
            <p>{chat.lastMessage}</p>
          </div>
        </div>
      ))}
      
      {/* Afficher le composant AddUser si addMode est true */}
      {addMode && <AddUser />}
    </div>
  )
}

export default ChatList;
