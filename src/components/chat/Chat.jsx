// Importation des hooks React et des dépendances nécessaires
import { useState, useRef, useEffect } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import { onSnapshot, doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { db } from '../../lib/firebase'; 
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from '../../lib/upload';


// Composant principal Chat
const Chat = () => {
    // État local pour stocker les données du chat, l'état d'ouverture du sélecteur d'emoji, et le texte du message
    const [chat, setChat] = useState();
    const [open, setOpen] = useState(false);
    const [text, setText] = useState("");
    const [img, setImg] = useState({
        file:null,
        url:""
    });


    // Récupération des données utilisateur et chat à partir des stores
    const { currentUser } = useUserStore();
    const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();

    // Référence pour faire défiler automatiquement la vue des messages
    const endRef = useRef(null);

    // Effet pour faire défiler automatiquement la vue vers le bas quand un nouveau message est ajouté
    useEffect(() => {
        // Vérifie si endRef.current est défini avant d'appeler scrollIntoView
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    // Effet pour écouter les mises à jour en temps réel du document de chat dans Firestore
    useEffect(() => {
        // Écoute les changements du document de chat avec l'ID chatId
        const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
            setChat(res.data());
        });

        // Nettoyage de l'effet pour arrêter l'écoute quand le composant est démonté
        return () => {
            unSub();
        }
    }, [chatId]); // Le tableau de dépendances inclut chatId pour relancer l'effet quand il change

    console.log(chat);
    
    // Gestionnaire pour ajouter un emoji au texte du message
    const handleEmoji = (e) => {
        setText(prev => prev + e.emoji);
        setOpen(false); // Ferme le sélecteur d'emoji après la sélection
    };

    //gestionnaire pour ajouter une image
    const handleImg = (e) =>{
        if(e.target.files[0]){
          console.log("Fichier sélectionné :", e.target.files[0]);
          setImg({
            file:e.target.files[0],
            url: URL.createObjectURL(e.target.files[0])
          })
        }   
    }

    // Gestionnaire pour envoyer un message
    const handleSend = async () => {
        if (text === '') return; // Ne rien faire si le texte du message est vide

        let imgUrl = null;

        try {

            if(img.file){
                imgUrl = await upload(img.file);
            }
            // Met à jour le document de chat avec le nouveau message
            await updateDoc(doc(db, "chats", chatId), {
                messages: arrayUnion({
                    senderId: currentUser.id,
                    text,
                    createdAt: new Date(),
                    //...(imgUrl && {img: imgUrl }) permet d'ajouter la propriété img à l'objet messages uniquement si imgUrl est défini et truthy. 
                    ...(imgUrl && {img: imgUrl }),
                }),               
            });

            // Mise à jour des données de chat pour les utilisateurs concernés
            const userIDs = [currentUser.id, user.id];
            userIDs.forEach(async (id) => {
                const userChatsRef = doc(db, "userchats", id);
                const userChatsSnapshot = await getDoc(userChatsRef);

                if (userChatsSnapshot.exists()) {
                    const userChatsData = userChatsSnapshot.data();

                    // Trouve le chat correspondant dans les données utilisateur
                    const chatIndex = userChatsData.chats.findIndex((c) => c.chatId === chatId);

                    // Met à jour les informations du chat
                    userChatsData.chats[chatIndex].lastMessage = text;
                    userChatsData.chats[chatIndex].isSeen = id === currentUser.id ? true : false;
                    userChatsData.chats[chatIndex].updatedAt = Date.now();

                    // Enregistre les modifications dans Firestore
                    await updateDoc(userChatsRef, {
                        chats: userChatsData.chats,
                    });
                }
            });

        } catch (err) {
            console.log(err);
        }   

        //on remet en état initial après l'envoi d'un message ou d'une image
        setImg({
            file:null,
            url:""
        })

        setText("");
    };

    // Rendu du composant Chat
    return (
        <div className="chat">
            <div className="top">
                <div className="user">
                <img src={user?.avatar || "./avatar.png"} alt="" />
                    <div className="texts">
                        <span>{user?.username}</span>
                        <p>Lorem ipsum dolor sit amet.</p>
                    </div>
                </div>
                <div className="icons">
                    <img src="./phone.png" alt="" />
                    <img src="./video.png" alt="" />
                    <img src="./info.png" alt="" />
                </div>
            </div>
            <div className="center">
                {/* Affichage des messages du chat */}
                {chat?.messages?.map((message) => (
                    /* "?" est un opérateur de chainage optionnel et permet de dire dans ce cas:
                    Si message est null ou undefined, l'expression message?.createdAt retournera undefined au lieu de lancer une erreur.
                    Si message est défini et a une propriété createdAt, cette valeur sera utilisée. */
                    <div className={message.senderId === currentUser?.id ? "message own" : "message"} key={message?.createdAt}>
                        <div className="texts">
                            {/**Si une image est envoyé */}
                            {message.img && <img src={message.img} alt="" />}
                            {/**Si un fichier est envoyé */}
                            {/*{message.doc && (
                                <div className="pdf-preview">
                                    <a href={message.doc} target="_blank" rel="noopener noreferrer">Document envoyé</a>
                                </div>
                            )}*/}
                            <p>
                                {message.text}
                            </p>
                            {/*<span> Il y a une minute</span>*/}
                        </div>
                    </div>
                ))}
                {img.url && <div className="message own">
                    <div className="texts">
                        <img src={img.url} alt="" />
                    </div>
                </div>}
                {/* Référence pour le défilement automatique */}
                <div ref={endRef}></div>
            </div>
            <div className="bottom">
                <div className="icons">
                    <label htmlFor="file">
                       <img src="./img.png" alt="" /> 
                    </label>                    
                    <input type="file" id="file" style={{display:"none"}} onChange={handleImg}/>
                    <img src="./camera.png" alt="" />
                    <img src="./mic.png" alt="" />
                </div>
                <input 
                    type="text" 
                    placeholder={(isCurrentUserBlocked || isReceiverBlocked) 
                        ? "Vous ne pouvez pas envoyer de message!" 
                        : "Tapez votre message..."} 
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    disabled={isCurrentUserBlocked || isReceiverBlocked}
                />
                <div className="emoji">
                    <img 
                        src="./emoji.png" 
                        alt="" 
                        onClick={() => setOpen((prev) => !prev)}
                    />
                    <div className="picker">
                        <EmojiPicker open={open} onEmojiClick={handleEmoji} />
                    </div>
                </div>
                <button className="sendButton" onClick={handleSend} disabled={isCurrentUserBlocked || isReceiverBlocked}>Envoyer</button>
            </div>
        </div>
    );
};

export default Chat;
