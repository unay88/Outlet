import React from 'react';
import DashboardTemplate from '../templates/DashboardTemplate';
import { AuthUser } from '../api/auth';

type Props = {
  onNavigate?: (screen: string) => void;
  user?: AuthUser | null;
  onLogout?: () => void;
};

export default function DashboardScreen({ onNavigate, user, onLogout }: Props) {
  return <DashboardTemplate onNavigate={onNavigate} user={user} onLogout={onLogout} />;
}
