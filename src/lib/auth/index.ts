import { getServerSession } from 'next-auth';
import { authConfig } from './config';

export const auth = () => getServerSession(authConfig);
