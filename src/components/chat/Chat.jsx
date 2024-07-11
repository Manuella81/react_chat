// Import des hooks React et des dépendances nécessaires
import { useState, useRef, useEffect } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import { onSnapshot, doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { db } from '../../lib/firebase'; 
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import upload from '../../lib/upload';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faXmarkCircle } from "@fortawesome/free-regular-svg-icons";
import Detail from "../detail/Detail"; // Import du composant Detail
import { faCalendarXmark } from "@fortawesome/free-regular-svg-icons/faCalendarXmark";
import { faCircleXmark } from "@fortawesome/free-regular-svg-icons/faCircleXmark";

// Composant principal Chat
const Chat = () => {
    const [showDetail, setShowDetail] = useState(false); // État local pour afficher ou masquer le détail
    const [chat, setChat] = useState(); // État local pour stocker les données du chat
    const [open, setOpen] = useState(false); // État local pour gérer l'état d'ouverture du sélecteur d'emoji
    const [text, setText] = useState(""); // État local pour le texte du message
    const [img, setImg] = useState({ // État local pour gérer les images
        file: null,
        url: ""
    });

    // Récupération des données utilisateur et du chat à partir des stores personnalisés
    const { currentUser } = useUserStore();
    const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, resetChat } = useChatStore();

    // Référence pour faire défiler automatiquement la vue des messages vers le bas
    const endRef = useRef(null);

    // Effet pour faire défiler automatiquement la vue vers le bas quand un nouveau message est ajouté
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    });

    // Effet pour écouter les mises à jour en temps réel du document de chat dans Firestore
    useEffect(() => {
        // Écoute les changements du document de chat avec l'ID chatId
        const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
            setChat(res.data());
        });

        // Nettoyage de l'effet pour arrêter l'écoute quand le composant est démonté ou quand chatId change
        return () => {
            unSub();
        }
    }, [chatId]); // Le tableau de dépendances inclut chatId pour relancer l'effet quand il change

    // Gestionnaire pour ajouter un emoji au texte du message
    const handleEmoji = (e) => {
        setText(prev => prev + e.emoji);
        setOpen(false); // Ferme le sélecteur d'emoji après la sélection
    };

    // Gestionnaire pour ajouter une image
    const handleImg = (e) => {
        if (e.target.files[0]) {
            console.log("Fichier sélectionné :", e.target.files[0]);
            setImg({
                file: e.target.files[0],
                url: URL.createObjectURL(e.target.files[0])
            })
        }
    }

    // Gestionnaire pour envoyer un message
    const handleSend = async () => {
        if (text === '') return; // Ne rien faire si le texte du message est vide

        let imgUrl = null;

        try {
            // Si une image est sélectionnée, l'uploader et récupérer son URL
            if (img.file) {
                imgUrl = await upload(img.file);
            }

            // Met à jour le document de chat avec le nouveau message
            await updateDoc(doc(db, "chats", chatId), {
                messages: arrayUnion({
                    senderId: currentUser.id,
                    text,
                    createdAt: new Date(),
                    ...(imgUrl && { img: imgUrl }), // Ajoute l'URL de l'image si disponible
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

        // Réinitialisation de l'état de l'image et du texte après l'envoi
        setImg({
            file: null,
            url: ""
        })

        setText("");
    };

    // Gestionnaire pour retourner à la liste des conversations
    const handleBackToList = () => {
        resetChat(); // Utilisation de la fonction resetChat pour réinitialiser chatId à null
    };

    // Gestionnaire pour basculer l'affichage du composant Detail
    const handleDetailClick = () => {
        setShowDetail(!showDetail);
    };


    // Rendu du composant Chat
    return (
        <div className="chat">
            <div className="top">
                <div className="user">
                    <img src={user?.avatar || "./avatar.png"} alt="" />
                    <div className="texts">
                        <span>{user?.username}</span>
                        <p>Lorem ipsum dolor sit amet.</p> {/* Placeholder pour des informations sur l'utilisateur */}
                    </div>
                </div>
                <div className="icons">
                 {/* Affiche l'image ou le bouton "Fermer" en fonction de showDetail */}
                 {!showDetail ? (
                    <img className="details" src="./more.png" alt="" onClick={handleDetailClick} />
                ) : (
                    <button className="closeButton" onClick={handleDetailClick}><span>X</span></button>
                )}
                </div>
            </div>
            <button className="backButton" onClick={handleBackToList}>{"<< Retour aux Conversations"}</button>

            <div className="center">
                {/* Affichage des messages du chat */}
                {chat?.messages?.map((message) => (
                    /* "?" est un opérateur de chaînage optionnel pour éviter les erreurs si message est null ou undefined */
                    <div className={message.senderId === currentUser?.id ? "message own" : "message"} key={message?.createdAt}>
                        <div className="texts">
                            {/* Affichage de l'image si le message contient une image */}
                            {message.img && <img src={message.img} alt="" />}
                            <p>{message.text}</p> {/* Affichage du texte du message */}
                        </div>
                    </div>
                ))}
                {/* Affichage de l'image sélectionnée avant l'envoi */}
                {img.url && <div className="message own">
                    <div className="texts">
                        <img src={img.url} alt="" />
                    </div>
                </div>}
                {/* Référence pour le défilement automatique */}
                <div ref={endRef} className="endRef"></div>
            </div>
            <div className="bottom">
                <div className="icons">
                    {/* Bouton pour sélectionner un fichier (image) */}
                    <label htmlFor="file">
                        <img src="./img.png" alt="" />
                    </label>
                    <input type="file" id="file" style={{ display: "none" }} onChange={handleImg} />
                    {/* Icônes pour d'autres fonctionnalités (caméra, microphone) */}
                    <img src="./camera.png" alt="" />
                    <img src="./mic.png" alt="" />
                </div>

                <div className="send">
                    {/* Champ de texte pour taper le message */}
                    <input
                        type="text"
                        placeholder={(isCurrentUserBlocked || isReceiverBlocked) ? "Vous ne pouvez pas envoyer de message!" : "Tapez votre message..."}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        disabled={isCurrentUserBlocked || isReceiverBlocked}
                    />
                    {/* Sélecteur d'emoji */}
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
                    {/* Bouton pour envoyer le message */}
                    <button className="sendButton" onClick={handleSend} disabled={isCurrentUserBlocked || isReceiverBlocked}><FontAwesomeIcon icon={faPaperPlane} /></button>
                </div>
            </div>

            {/* Affichage du composant Detail si showDetail est vrai */}
            {showDetail && <Detail />}
        </div>
    );
};

export default Chat; // Export du composant Chat
