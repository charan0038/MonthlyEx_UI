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
  ShoppingBasket,
  Pizza,
  Wine,
  Apple,
  Droplets,
  Wrench,
  Key,
  Bus,
  CarTaxiFront,
  Train,
  Bike,
  BadgePercent,
  Monitor,
  Landmark,
} from 'lucide-react';

interface CategoryIconProps extends LucideProps {
  name: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, ...props }) => {
  switch (name?.toLowerCase()) {
    case 'utensils':
    case 'food':
      return <Utensils {...props} />;
    case 'shoppingbasket':
    case 'groceries':
      return <ShoppingBasket {...props} />;
    case 'pizza':
    case 'fastfood':
      return <Pizza {...props} />;
    case 'wine':
    case 'drinks':
    case 'bar':
      return <Wine {...props} />;
    case 'apple':
    case 'fruit':
    case 'produce':
      return <Apple {...props} />;
    case 'car':
    case 'transport':
      return <Car {...props} />;
    case 'bus':
    case 'transit':
      return <Bus {...props} />;
    case 'cartaxifront':
    case 'taxi':
    case 'cab':
      return <CarTaxiFront {...props} />;
    case 'train':
    case 'metro':
      return <Train {...props} />;
    case 'bike':
    case 'bicycle':
      return <Bike {...props} />;
    case 'home':
    case 'rent':
      return <Home {...props} />;
    case 'receipt':
    case 'bills':
      return <Receipt {...props} />;
    case 'droplets':
    case 'water':
      return <Droplets {...props} />;
    case 'wrench':
    case 'repair':
    case 'maintenance':
      return <Wrench {...props} />;
    case 'key':
    case 'deposit':
      return <Key {...props} />;
    case 'shoppingbag':
    case 'shopping':
      return <ShoppingBag {...props} />;
    case 'heartpulse':
    case 'health':
    case 'pharma':
      return <HeartPulse {...props} />;
    case 'film':
    case 'entertainment':
    case 'movies':
      return <Film {...props} />;
    case 'banknote':
    case 'salary':
      return <Banknote {...props} />;
    case 'laptop':
    case 'freelance':
      return <Laptop {...props} />;
    case 'badgepercent':
    case 'sales':
    case 'commission':
      return <BadgePercent {...props} />;
    case 'monitor':
    case 'tech':
      return <Monitor {...props} />;
    case 'landmark':
    case 'tax':
    case 'govt':
      return <Landmark {...props} />;
    case 'trendingup':
    case 'investment':
    case 'invest':
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
    case 'flight':
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
    case 'petrol':
      return <Fuel {...props} />;
    case 'tv':
    case 'streaming':
      return <Tv {...props} />;
    case 'creditcard':
      return <CreditCard {...props} />;
    case 'briefcase':
    case 'business':
    case 'work':
    case 'office':
      return <Briefcase {...props} />;
    case 'shield':
    case 'insurance':
      return <Shield {...props} />;
    case 'piggybank':
    case 'savings':
      return <PiggyBank {...props} />;
    case 'smile':
    case 'fun':
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
