
Bienvenue dans **react_app**, une application fictive de messagerie construite avec **React.js** et **Firebase**. Cette application permet aux utilisateurs de communiquer en temps réel via des messages textuels, tout en offrant des fonctionnalités avancées telles que l'**authentification sécurisée par email et mot de passe**, le **stockage de fichiers**, et la **gestion des données utilisateur avec Cloud Firestore**.

**STRUCTURE DU PROJET**

**Dossier public** : Contient les ressources statiques comme les images et les icônes utilisées dans l'application.

**Dossier src/components** : Chaque composant est structuré avec un fichier JSX et un fichier CSS pour le style, facilitant la maintenance et l'organisation du code.

 principaux composants:

 - **Chat.jsx:**
 gère l'affichage des messages de la conversation en temps réel et permet aux utilisateurs d'envoyer de nouveaux messages. Utilise Firebase Firestore pour stocker et récupérer les messages, et offre des fonctionnalités comme l'ajout d'emojis et d'images aux messages.
 
 - **Detail.jsx:**
 affiche la politique de confidentialité et les photos partagées dans la conversation en cours. Inclut une fonctionnalité pour bloquer/débloquer un utilisateur dans la conversation via Firebase Firestore.
 
 - **Login.jsx:**
 gère l'authentification des utilisateurs à l'application. Utilise Firebase pour les opérations d'inscription (**createUserWithEmailAndPassword**) et de connexion (**signInWithEmailAndPassword**), ainsi que Firestore pour la gestion des données utilisateur.
 
 - **List.jsx:**
 un conteneur pour les sous-composants UserInfo et ChatList. **ChatList.jsx** affiche en temps réel la liste des chats de l'utilisateur et **userinfo.jsx** gère l'affichage des informations de l'utilisateur connecté. .
 
 - **AddUser.jsx:**
 permet aux utilisateurs de rechercher et d'ajouter d'autres utilisateurs dans l'application, en utilisant Firebase Firestore pour la gestion des utilisateurs et des chats.
 
 - **Notification.jsx:**
 affiche les notifications toast utilisant **react-toastify** pour une expérience utilisateur améliorée.


**Dossier src/lib**

   - **chatStore.js:**
   utilise **Zustand** pour gérer l'état du chat, y compris les vérifications de blocage des utilisateurs.
   
   - **userStore.js:**
   gère l'état global de l'utilisateur en utilisant Firebase Firestore pour récupérer et mettre à jour les informations utilisateur.
   
   - **firebase.js:**
   initialise et configure Firebase pour l'application React, incluant l'authentification sécurisée, la base de données Firestore pour le stockage des messages et des utilisateurs, ainsi que le stockage Firebase pour l'enregistrement des fichiers.
   
   - **upload.js:**
   fonction utilitaire pour télécharger des fichiers via Firebase Storage, utilisée notamment pour l'enregistrement d'avatars et l'envoi d'images dans les conversations.

**OBJECTIF DU PROJET**

**react_app** démontre comment construire une application moderne de messagerie avec **React.js** et **Firebase**, en mettant l'accent sur la sécurité, la réactivité et la facilité d'utilisation. L'utilisation de Firebase permet une intégration simple des fonctionnalités backend nécessaires à une application de messagerie interactive et performante.

**HEBERGEMENT**
Hébergement gratuit avec Firebase Hosting.
Utilisation d'un domaine personnalisé que j'ai créé sur cPanel: Firebase Hosting permet d'utiliser un domaine personnalisé au lieu du sous-domaine par défaut fourni par Firebase. 

**PREREQUIS**

Pour utiliser et tester l'application localement, assurez-vous d'avoir **Node.js** installé sur votre machine.

**INSTALLATION ET UTILISATION**

Clonez ce repository sur votre machine locale.
Dans le répertoire racine du projet, exécutez **npm install** pour installer toutes les dépendances nécessaires.
Configurez votre projet Firebase en suivant les instructions dans **src/lib/firebase.js**.
Pour démarrer l'application en mode développement, exécutez **npm start**.
Ouvrez votre navigateur et accédez à **https://chat.manuellamaya.com/** pour voir l'application en action.
