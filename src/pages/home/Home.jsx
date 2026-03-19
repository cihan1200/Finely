import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import Hero from "./sections/Hero";
import Features from "./sections/Features";
import Pricing from "./sections/Pricing";
import Reviews from "./sections/Reviews";

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <Features />
      <Pricing />
      <Reviews />
      <Footer />
    </>
  );
}