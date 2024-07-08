import "./login.css";
import { useState } from "react";
import { toast } from 'react-toastify';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from '../../lib/firebase';
import { setDoc, doc } from "firebase/firestore";
import upload from '../../lib/upload';


const Login = () => {
  const [avatar, setAvatar] = useState({
    file: null,
    url:""
  });

  const [loading, setLoading] = useState(false);

  const handleAvatar = e =>{
    if(e.target.files[0]){
      console.log("Fichier sélectionné :", e.target.files[0]);
      setAvatar({
        file:e.target.files[0],
        url: URL.createObjectURL(e.target.files[0])
      })
    }   
  }

  const handleLogin = async (e) =>{
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const {email, password} = Object.fromEntries(formData);

    try{
      await signInWithEmailAndPassword(auth,email,password);
    }catch(err){
      console.log(err);
      toast.error(err.message);
    }
    finally{
      setLoading(false);
    }
    
    //toast.success("Hello")
  }

  const handleRegister = async(e) =>{
    e.preventDefault();
    const formData = new FormData(e.target);

    const {username, email, password} = Object.fromEntries(formData);

    setLoading(true);

    try{

      const res = await createUserWithEmailAndPassword(auth,email,password)

      const imgUrl = await upload(avatar.file)

      // Ajouter une nouveau document dans la collection "users"
      //lorsqu'on crée un user, on crée automatiquement un user et un chat dans la bdd
      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        avatar:imgUrl,
        id: res.user.uid,
        blocked: [],
      });

      await setDoc(doc(db, "userchats", res.user.uid), {
        chats: [],
      });

      toast.success("Votre compte a bien été créé! Vous pouvez maintenant vous connecter!")

    }catch(err){
      console.log(err)
      toast.error(err.message)
    } finally{
      setLoading(false);
    }
  }

  return (
    <div className="login">
      <div className="item">
        <h2>Content de te revoir</h2>
        <form onSubmit={handleLogin}>
          <input type="text" placeholder="Email" name="email"/>
          <input type="password" placeholder="Mot de passe" name="password"/>
          <button disabled={loading}>{loading ? "Chargement..." : "Se connecter"}</button>
        </form>
      </div>
      <div className="separator"></div>
      <div className="item">
        <h2>Créer un compte</h2>
        <form onSubmit={handleRegister}>
          <label htmlFor="file">
            <img src={avatar.url || "./avatar.png"} alt="" />
            Télécharger une image
          </label>
          <input type="file" id="file" style={{display:"none"}} onChange={handleAvatar} />
          <input type="text" placeholder="Nom d'utilisateur" name="username"/>
          <input type="text" placeholder="Email" name="email"/>
          <input type="password" placeholder="Mot de passe" name="password"/>
          <button disabled={loading}>{loading ? "Chargement..." : "S'inscrire"}</button>
        </form>
      </div>
    </div>
  )
}

export default Login