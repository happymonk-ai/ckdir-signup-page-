import io from 'socket.io';
import server from './server';
import { socketIOOptions } from "../config/socketIOOptions";

const socket = io(server,socketIOOptions);

export default socket;