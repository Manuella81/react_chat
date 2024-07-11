import "./userInfo.css";
import {useUserStore} from "../../../lib/userStore";
import { useChatStore } from "../../../lib/chatStore";


const UserInfo = () => {
  const { currentUser } = useUserStore();
  const { chatId } = useChatStore();

  return (
    <div className={`userInfo ${chatId ? 'hide-on-conversation' : ''}`}>
      <div className="user">
        <img src={currentUser.avatar || "./avatar.png"} alt="" />
        <h2>{currentUser.username}</h2>
      </div>
      <div className="icons">
        <img src="./more.png" alt="" />
        <img src="./video.png" alt="" />
        <img src="./edit.png" alt="" />
      </div>
    </div>
  );
};

export default UserInfo