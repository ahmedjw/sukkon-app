// import styles from "./page.module.css";

import { HeroSection } from "@/components/HeroSection";
import Navbar from "@/components/NavBar/NavBar";
<link href="https://cdn.lineicons.com/4.0/lineicons.css" rel="stylesheet" />

export default function Home() {
  return (
    <div>
      <Navbar />
      <HeroSection />
    </div>
  );
}
