import React from 'react';
import type { LucideProps } from 'lucide-react';
import {
  Utensils,
  Car,
  Home,
  Receipt,
  ShoppingBag,
  HeartPulse,
  Film,
  Sparkles,
  Banknote,
  Laptop,
  TrendingUp,
  Wallet,
  Coffee,
  Dumbbell,
  Plane,
  Gift,
  Book,
  GraduationCap,
  Music,
  Gamepad2,
  Fuel,
  Tv,
  CreditCard,
  Briefcase,
  Shield,
  PiggyBank,
  Smile,
  Dog,
  Wifi,
  Smartphone,
  Zap,
} from 'lucide-react';

interface CategoryIconProps extends LucideProps {
  name: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, ...props }) => {
  switch (name?.toLowerCase()) {
    case 'utensils':
    case 'food':
      return <Utensils {...props} />;
    case 'car':
    case 'transport':
      return <Car {...props} />;
    case 'home':
    case 'rent':
      return <Home {...props} />;
    case 'receipt':
    case 'bills':
      return <Receipt {...props} />;
    case 'shoppingbag':
    case 'shopping':
      return <ShoppingBag {...props} />;
    case 'heartpulse':
    case 'health':
      return <HeartPulse {...props} />;
    case 'film':
    case 'entertainment':
      return <Film {...props} />;
    case 'banknote':
    case 'salary':
      return <Banknote {...props} />;
    case 'laptop':
    case 'freelance':
      return <Laptop {...props} />;
    case 'trendingup':
    case 'investment':
      return <TrendingUp {...props} />;
    case 'wallet':
      return <Wallet {...props} />;
    case 'coffee':
      return <Coffee {...props} />;
    case 'dumbbell':
    case 'gym':
    case 'fitness':
      return <Dumbbell {...props} />;
    case 'plane':
    case 'travel':
      return <Plane {...props} />;
    case 'gift':
      return <Gift {...props} />;
    case 'book':
    case 'education':
      return <Book {...props} />;
    case 'graduationcap':
      return <GraduationCap {...props} />;
    case 'music':
      return <Music {...props} />;
    case 'gamepad2':
    case 'gaming':
      return <Gamepad2 {...props} />;
    case 'fuel':
      return <Fuel {...props} />;
    case 'tv':
      return <Tv {...props} />;
    case 'creditcard':
      return <CreditCard {...props} />;
    case 'briefcase':
    case 'business':
      return <Briefcase {...props} />;
    case 'shield':
    case 'insurance':
      return <Shield {...props} />;
    case 'piggybank':
    case 'savings':
      return <PiggyBank {...props} />;
    case 'smile':
      return <Smile {...props} />;
    case 'dog':
    case 'pets':
      return <Dog {...props} />;
    case 'wifi':
    case 'internet':
      return <Wifi {...props} />;
    case 'smartphone':
    case 'mobile':
      return <Smartphone {...props} />;
    case 'zap':
    case 'electricity':
      return <Zap {...props} />;
    case 'sparkles':
    default:
      return <Sparkles {...props} />;
  }
};
