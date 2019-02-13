import React from 'react';
import ReactDOM from 'react-dom'

const menuContainer = document.getElementById('navMenuContainer');

export default function (props) {
  return ReactDOM.createPortal(
    (
      <div class="NavMenu-menu clrBr">
        <ul>
          <li>Link Uno</li>
          <li>Link Dos</li>
          <li>Link Tres</li>
          <li>Link Cuatro</li>
          <li>Link Cinco</li>
        </ul>
      </div>
    ),
    menuContainer
  );
}