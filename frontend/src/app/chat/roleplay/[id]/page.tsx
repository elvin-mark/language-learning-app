import RoleplayClient from '@/components/RoleplayClient';
import { use } from 'react';

export async function generateStaticParams() {
  return [
    { id: 'cafe-seoul' },
    { id: 'hotel-check-in' },
    { id: 'market-haggling' },
    { id: 'custom' },
  ];
}

export default function RoleplayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  return <RoleplayClient id={id} />;
}
