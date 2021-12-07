import { AuthentificationController } from './Authentification/Authentification';
import { PostController } from './Post/PostController';
import { CadastreController } from './Cadastre/Cadastre';
import { AddressController } from './Address/Address';
import { ChatRoomsController } from './Chat/ChatRooms';
import { ChatMessagesController } from './Chat/ChatMessages';
import { TokenController } from './Token/Token';
import { UserController } from './User/User';

const authentificationController = new AuthentificationController();
const postController = new PostController();
const cadastreController = new CadastreController();
const addressController = new AddressController();
const chatRoomsController = new ChatRoomsController();
const chatMessagesController = new ChatMessagesController();
const tokenController = new TokenController();
const userController = new UserController();

export {
    authentificationController,
    postController,
    cadastreController,
    addressController,
    chatRoomsController,
    chatMessagesController,
    tokenController,
    userController,
};