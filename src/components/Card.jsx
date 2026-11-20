// src/components/Card.jsx

import { Button } from "./ui/button";
import { Card as ShadcnCard } from "./ui/card";

export default function Card({ children, className = "" }) {
  return <ShadcnCard className={className}>{children}</ShadcnCard>;
}
