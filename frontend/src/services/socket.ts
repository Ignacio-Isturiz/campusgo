import { io } from 'socket.io-client';

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  'https://campusgo-jjzy.onrender.com';

const socket = io(API_URL);

export default socket;