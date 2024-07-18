import "./detail.css";
//Ce code importe des instances du service d'authentification (auth) et de la base de données Firestore (db) à partir d'un fichier de configuration Firebase situé dans ../../lib/firebase.
import { auth, db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import { arrayRemove, arrayUnion, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile } from "@fortawesome/free-regular-svg-icons";


const Detail = () => {
  // Extraction des variables nécessaires depuis les state global 
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } = useChatStore();
  const { currentUser } = useUserStore();
  const [openSection, setOpenSection] = useState(null);
  const [chat, setChat] = useState();

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

  // Fonction handleBlock : bloque ou débloque l'utilisateur selon l'état actuel de user
  // Si user n'est pas défini, la fonction retourne immédiatement sans rien faire, car il n'y a pas d'utilisateur à bloquer.
  const handleBlock = async () => {
    if (!user) return;

    // Référence au document de l'utilisateur courant dans Firestore
    const userDocRef = doc(db, "users", currentUser.id);

    try {
      // Met à jour le document de l'utilisateur courant pour ajouter ou retirer l'ID de l'utilisateur à bloquer/débloquer

      /**arrayRemove(user.id) :
      Cette fonction Firestore supprime l'élément user.id du tableau blocked. C'est utilisé lorsque isReceiverBlocked est vrai, ce qui signifie que l'utilisateur est déjà bloqué et doit être débloqué.

      arrayUnion(user.id) :
      Cette fonction Firestore ajoute l'élément user.id au tableau blocked. C'est utilisé lorsque isReceiverBlocked est faux, ce qui signifie que l'utilisateur doit être bloqué. */
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });

      // Appelle la fonction changeBlock du store pour mettre à jour l'état de blocage dans l'application
      changeBlock();
    } catch (err) {
      console.log(err); 
    }
}

//gestion des menus déroulant des photos partagées
const toggleSection = (section) => {
  setOpenSection(openSection === section ? null : section);
};

// Filtrer les messages qui contiennent une image
const messagesWithImg = chat?.messages.filter(message => message.img);


  return (
    <div className='detail'>
      {/*<div className="user">
        <img src={user?.avatar || "./avatar.png"} alt="" />
        <h2>{user?.username}</h2>
        <p>Lorem, ipsum dolor sit amet.</p>
      </div>*/}
      <div className="info">
        {/*<div className="option">
          <div className="title">
            <span>paramètres de discussion</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>*/}
        <div className="option" onClick={() => toggleSection('text')}>
          <div className="title">
            <span>Confidentialité % aide</span>
            <img src="./arrowDown.png" alt="" />
          </div>
          {/**Ajoute la classe "open" à la div uniquement si openSection est égal à 'text'. Sinon, ajoute une chaîne vide */}
          <div className={`text ${openSection === 'text' ? 'open' : ''}`}>
            <h2>Confidentialité</h2>
              <p>Nous prenons très au sérieux la confidentialité de vos données. Voici les principaux points concernant la gestion et la protection de vos informations personnelles :</p>
              <h3>1. Collecte de données</h3>
                <ul>
                  <li>
                    <strong>Informations recueillies</strong> : Nous collectons les informations que vous fournissez lors de l&#39;inscription (nom, adresse e-mail) ainsi que les messages échangés dans l&#39;application.
                  </li>
                  <li>
                    <strong>Données techniques</strong> : Nous pouvons également collecter des informations techniques telles que l&#39;adresse IP, le type de navigateur, et les données de connexion.
                  </li>
                </ul>
              <h3>2. Utilisation des données</h3>
                <ul>
                  <li>
                    Les informations collectées sont utilisées pour fournir et améliorer notre service, assurer la sécurité des utilisateurs, et offrir une expérience utilisateur personnalisée.
                  </li>
                  <li>
                    Nous ne partageons pas vos informations personnelles avec des tiers sans votre consentement explicite, sauf si la loi l&#39;exige.
                  </li>
                </ul>
              <h3>3. Sécurité des données</h3>
                <ul>
                  <li>
                    Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données contre tout accès non autorisé, modification, divulgation ou destruction.
                  </li>
                  <li>
                    Les communications sont chiffrées pour garantir la confidentialité et l&#39;intégrité de vos messages.
                  </li>
                </ul>
              <h3>4. Accès et contrôle</h3>
                <ul>
                  <li>
                    Vous avez le droit d&#39;accéder, de corriger, de supprimer ou de limiter l&#39;utilisation de vos informations personnelles. Vous pouvez exercer ces droits en nous contactant via les informations fournies dans l&#39;application.
                  </li>
                  <li>
                    Vous pouvez également choisir de désactiver votre compte à tout moment. Dans ce cas, vos données personnelles seront supprimées de nos serveurs conformément à notre politique de conservation des données.
                  </li>
                </ul>
              <h3>5. Cookies</h3>
                <ul>
                  <li>
                    Nous utilisons des cookies pour améliorer votre expérience sur notre application, par exemple en mémorisant vos préférences et en facilitant la navigation.
                  </li>
                  <li>
                    Vous pouvez configurer votre navigateur pour refuser les cookies ou pour vous avertir lorsque des cookies sont envoyés. Notez que certaines fonctionnalités de l&#39;application peuvent ne pas fonctionner correctement sans cookies.
                  </li>
                </ul>
            <h2>Aide</h2>
              <p>Pour toute assistance concernant l&#39;utilisation de notre application de chat, veuillez consulter les ressources suivantes :</p>
              <h3>1. FAQ</h3>
                <p>Visitez notre section FAQ pour trouver des réponses aux questions les plus courantes sur l&#39;utilisation de l&#39;application, la gestion des comptes, et les fonctionnalités disponibles.</p>
              <h3>2. Support technique</h3>
                <p>Si vous rencontrez des problèmes techniques, vous pouvez nous contacter via l&#39;option &quot;Support&quot; dans l&#39;application. Notre équipe de support est disponible 24h/24 et 7j/7 pour vous aider.</p>
              <h3>3. Tutoriels</h3>
                <p>Des tutoriels pas à pas sont disponibles dans l&#39;application pour vous guider à travers les différentes fonctionnalités et vous aider à tirer le meilleur parti de notre service.</p>
              <h3>4. Communauté</h3>
                <p>Rejoignez notre communauté d&#39;utilisateurs pour échanger des conseils, des astuces et obtenir de l&#39;aide d&#39;autres utilisateurs expérimentés.</p>
                <p>Pour toute autre question ou demande d&#39;assistance, n&#39;hésitez pas à nous contacter directement via l&#39;option &quot;Contactez-nous&quot; dans l&#39;application. Nous sommes là pour vous aider et nous nous efforçons de répondre à toutes les demandes dans les plus brefs délais.</p>
                <p>En utilisant notre application de chat, vous acceptez notre politique de confidentialité et nos conditions d&#39;utilisation. Nous vous remercions de votre confiance et espérons que vous apprécierez l&#39;utilisation de notre service.</p>
          </div>
        </div>
        <div className="option">
          <div className="title" onClick={() => toggleSection('photos')}>
            <span>Fichiers partagées</span>
            <img src="./arrowDown.png" alt="Toggle Photos" />
          </div>
          {/**Ajoute la classe "open" à la div uniquement si openSection est égal à 'photos'. Sinon, ajoute une chaîne vide */}
          <div className={`photos ${openSection === 'photos' ? 'open' : ''}`}>
            {/* Affichage des photos du chat */}
            {messagesWithImg?.map((oneImg, index) => (
              <div key={index} className="photoItem">
                <div className="photoDetail">
                  {oneImg.img && !oneImg.fileName? (
                    <img src={oneImg.img} alt={`Photo ${index + 1}`} />
                  ) : (
                    <FontAwesomeIcon icon={faFile} className="file-icon"/>
                  )}
                  {oneImg.fileName ? (
                    <span>{oneImg.fileName}</span>
                  ) : (
                    <span>Photo_{index + 1}.png</span>
                  )}
                </div>
                {oneImg.img && (
                  <a href={oneImg.img} download={oneImg.fileName || `Photo_${index + 1}.png`} target="_blank" rel="noopener noreferrer">
                    <img src="./download.png" alt="Download" className="icon" />
                  </a>
                )}
              </div>
            ))}


          </div>
        </div>
        {/*<div className="option">
          <div className="title">
            <span>Fichiers partagés</span>
            <img src="./arrowUp.png" alt="" />
          </div>
        </div>*/}
        <button onClick={handleBlock}>
          {isCurrentUserBlocked 
            ? "Vous êtes bloqué" 
            : isReceiverBlocked 
            ? "Utilisateur bloqué" 
            : `Bloquer ${user.username}`}
        </button>

        <button className="logout" onClick={()=>auth.signOut()}>Déconnexion</button>
      </div>
    </div>
  )
}

export default Detail