
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="border-b bg-white py-4">
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link to="/" className="flex items-center">
          <span className="text-xl font-bold text-primary">
            Sports<span className="text-accent">Folio</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center space-x-6 md:flex">
          <Link to="/" className="text-sm font-medium text-gray-700 hover:text-primary">
            Home
          </Link>
          <Link to="/tournaments" className="text-sm font-medium text-gray-700 hover:text-primary">
            Tournaments
          </Link>
          <Link to="/teams" className="text-sm font-medium text-gray-700 hover:text-primary">
            Teams
          </Link>
          <Link to="/about" className="text-sm font-medium text-gray-700 hover:text-primary">
            About
          </Link>
          <Button asChild variant="outline" className="ml-2">
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link to="/register">Register</Link>
          </Button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="container mx-auto px-4 md:hidden">
          <div className="flex flex-col space-y-4 pt-4 pb-6">
            <Link 
              to="/" 
              className="text-base font-medium text-gray-700 hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/tournaments" 
              className="text-base font-medium text-gray-700 hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Tournaments
            </Link>
            <Link 
              to="/teams" 
              className="text-base font-medium text-gray-700 hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Teams
            </Link>
            <Link 
              to="/about" 
              className="text-base font-medium text-gray-700 hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              About
            </Link>
            <div className="flex flex-col space-y-2 pt-2">
              <Button asChild variant="outline">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
              </Button>
              <Button asChild>
                <Link to="/register" onClick={() => setIsMenuOpen(false)}>Register</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
