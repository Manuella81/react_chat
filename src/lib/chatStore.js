import { create } from 'zustand';
import { useUserStore } from "./userStore";


//Ce store useChatStore permet de gérer l'état du chat et les vérifications de blocage des utilisateurs de manière centralisée. Les fonctions changeChat et changeBlock permettent de manipuler l'état en fonction des actions de l'utilisateur, tout en respectant les règles de blocage.
export const useChatStore = create((set) => ({
  chatId: null,
  user: null,
  isCurrentUserBlocked: false,
  isReceiverBlocked: false,
  changeChat: (chatId,user) => {
    const currentUser = useUserStore.getState().currentUser

    //Vérifier si l'utilisateur actuel est bloqué
    if(user.blocked.includes(currentUser.id)){
      return set({
        chatId,
        user: null,
        isCurrentUserBlocked: true,
        isReceiverBlocked: false,
      });
    }

    //Vérifier si le destinataire est bloqué
    else if(currentUser.blocked.includes(user.id)){
      return set({
        chatId,
        user: user,
        isCurrentUserBlocked: false,
        isReceiverBlocked: true,
      });
    } else {
      return set({
        chatId,
        user,
        isCurrentUserBlocked: false,
        isReceiverBlocked: false,
      });
    }

  },

  //cette fonction changeBlock est conçue pour inverser l'état de la propriété isReceiverBlocked dans le hook d'état. À chaque appel de changeBlock, elle met à jour l'état en changeant la valeur de isReceiverBlocked pour l'inverser par rapport à sa valeur actuelle. 
  changeBlock: () => {
    set(state=>({...state, isReceiverBlocked: !state.isReceiverBlocked }))
  },

  resetChat: () => {
    set({
      chatId: null,
      user: null,
      isCurrentUserBlocked: false,
      isReceiverBlocked: false,
    });
  },

  
}));


