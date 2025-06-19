class Navbar extends HTMLElement {
    constructor() {
      super();
    }
  
    connectedCallback() {
      this.innerHTML = `
      <style>
        /* Add a black background color to the top navigation */
        .topnav {
        background-color: #333;
        overflow: hidden;
        }
  
        /* Style the links inside the navigation bar */
        .topnav a {
        float: left;
        color: #f2f2f2;
        text-align: center;
        padding: 14px 16px;
        text-decoration: none;
        font-size: 17px;
        }
  
        /* Change the color of links on hover */
        .topnav a:hover {
        background-color: #ddd;
        color: black;
        }
  
        /* Add a color to the active/current link */
        .topnav a.active {
        background-color: rgb(225, 0, 0);
        color: white;
        }
  
        </style>
  
        <div class="topnav">
          <a class="active" href="index.html">Home</a>
          <a href="info.html">Info</a>
          <a href="results.html">Results</a>
        </div>
      `
    }
  }
  
  customElements.define('navbar-component', Navbar);