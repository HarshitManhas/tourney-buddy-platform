
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="mt-auto border-t bg-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-bold">
              Sports<span className="text-accent">Folio</span>
            </h3>
            <p className="text-sm text-gray-600">
              Your all-in-one platform for creating, managing, and participating in sports tournaments.
            </p>
          </div>
          
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase text-gray-500">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/tournaments" className="text-gray-600 hover:text-primary">
                  Browse Tournaments
                </Link>
              </li>
              <li>
                <Link to="/create-tournament" className="text-gray-600 hover:text-primary">
                  Create Tournament
                </Link>
              </li>
              <li>
                <Link to="/teams" className="text-gray-600 hover:text-primary">
                  Teams
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-600 hover:text-primary">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase text-gray-500">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/help" className="text-gray-600 hover:text-primary">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/guides" className="text-gray-600 hover:text-primary">
                  Guides
                </Link>
              </li>
              <li>
                <Link to="/api" className="text-gray-600 hover:text-primary">
                  API Documentation
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-600 hover:text-primary">
                  Blog
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="mb-4 text-sm font-semibold uppercase text-gray-500">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-primary">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-gray-600 hover:text-primary">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-200 pt-6">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} SportsFolio. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
