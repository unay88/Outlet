import React from 'react';
import WelcomeTemplate from '../templates/WelcomeTemplate';

type Props = { onGetStarted?: (outlet: string) => void };

export default function WelcomeScreen({ onGetStarted }: Props) {
  return <WelcomeTemplate onGetStarted={onGetStarted} />;
}
