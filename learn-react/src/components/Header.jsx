import React from "react";
import { Link } from "react-router";

const Header = () => {
  return (
    <header>
      <div className="logo">Logo</div>
      <nav>
        <ul>
          <li>
            <Link to={"/"}>Home</Link>
            {/* http://domain.com/ */}
          </li>
          <li>
            <Link to={"/san-pham"}>San pham</Link>
            {/* http://domain.com/san-pham */}
          </li>

          <li>
            <Link to={"/lien-he"}>Lien he</Link>
          </li>

          <li>
            <Link to={"/ve-chung-toi"}>Ve chung toi</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
