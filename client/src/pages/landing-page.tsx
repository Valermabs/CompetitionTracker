import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import arcuBannerImage from "@assets/486834526_1056649299817047_3489486387045719830_n.jpg";

export default function LandingPage() {
  return (
    <div className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={arcuBannerImage} 
          alt="USTP Claveria ArCu Days 2025" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-orange-500">
            USTP Claveria
          </span>
        </h1>
        <h2 className="text-5xl md:text-7xl font-extrabold text-white mb-6">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-orange-500 to-yellow-400">
            ArCu Days 2025
          </span>
        </h2>
        <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl">
          Live scoring platform for the University of Science and Technology 
          of Southern Philippines Claveria Arts and Culture Festival
        </p>
        
        <Button asChild size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 text-xl">
          <Link to="/home">
            View Live Scores
          </Link>
        </Button>
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-4 z-10 flex flex-col items-center text-white/80 text-sm">
        <div className="flex items-center space-x-4 mb-2">
          <a href="https://www.facebook.com/USTP.Claveria.Official" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
            </svg>
          </a>
          <a href="mailto:claveria.usg@ustp.edu.ph" className="hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </a>
        </div>
        <div>© {new Date().getFullYear()} Val Irvin F. Mabayo</div>
      </div>
    </div>
  );
}