
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Trophy, Plus, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, username, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav className="border-b bg-white py-4">
      <div className="container mx-auto flex items-center justify-between px-4">
        <Link to="/" className="flex items-center">
          <img 
            src="/lovable-uploads/ece7698e-20da-4282-bbd3-6b1af82f4fff.png" 
            alt="SportsFolio Logo" 
            className="h-10 w-auto"
          />
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
          
          {user ? (
            <>
              <Button asChild variant="outline" className="ml-2 gap-2">
                <Link to="/create-tournament">
                  <Trophy size={16} />
                  <span>Create Tournament</span>
                </Link>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <User size={16} />
                    <span>{username || 'User'}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/my-tournaments">My Tournaments</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button asChild variant="outline" className="ml-2">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Register</Link>
              </Button>
            </>
          )}
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
              {user ? (
                <>
                  <Button asChild variant="outline" className="gap-2 w-full justify-center">
                    <Link to="/create-tournament" onClick={() => setIsMenuOpen(false)}>
                      <Trophy size={16} />
                      <span>Create Tournament</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="gap-2 w-full justify-center">
                    <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                      <User size={16} />
                      <span>{username || 'Profile'}</span>
                    </Link>
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="w-full justify-center"
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline">
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>Login</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/register" onClick={() => setIsMenuOpen(false)}>Register</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
