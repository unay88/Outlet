import React from 'react';
import DashboardTemplate from '../templates/DashboardTemplate';

type Props = {
  onNavigate?: (screen: string) => void;
};

export default function DashboardScreen({ onNavigate }: Props) {
  return <DashboardTemplate onNavigate={onNavigate} />;
}
