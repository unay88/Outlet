import React from 'react';
import WelcomeTemplate from '../templates/WelcomeTemplate';
import { AuthUser } from '../api/auth';

type Props = { onGetStarted?: (user: AuthUser) => void };

export default function WelcomeScreen({ onGetStarted }: Props) {
  return <WelcomeTemplate onGetStarted={onGetStarted} />;
}
