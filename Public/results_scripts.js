  // adds the polling stations to the dropdown of results
  async function getPollingStations() {
      const response = await fetch('/getPollingStations', {
        method: 'GET',
      })

      const myobject = await response.json();
      const select = document.getElementById('riding-view');
      
      for(index in myobject) {
          select.options[select.options.length] = new Option(myobject[index], index);
      }
  }

  // gets the results
  async function getResults(event) {
      event.preventDefault();
      console.log("in listener");

      const tableElement = document.getElementById('winners');
      const tableBody = tableElement.querySelector('tbody');

      const response = await fetch('/groupBy', {
        method: 'GET',
      })

      const responseData = await response.json();
      const demotableContent = responseData.data;

      // Always clear old, already fetched data before new fetching process.
      if (tableBody) {
        tableBody.innerHTML = '';
      }

      demotableContent.forEach(user => {
        const row = tableBody.insertRow();
        user.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
      });
  }

  // gets the number of seats per party
  async function getSeats(event) {
    event.preventDefault();

    const response = await fetch('/having', {
      method: 'GET',
    })

    const responseData = await response.json();
    const tableElement = document.getElementById("official");
    const tableBody = tableElement.querySelector("tbody");
    const messageElement = document.getElementById("officialResultMsg");

    console.log(responseData);
    // console.log(responseData.success);

    if (responseData.success) {
      messageElement.textContent = "Please view results below!";
    } else {
      messageElement.textContent = "No parties have enough votes";
    }

    // Always clear old, already fetched data before new fetching process.
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    responseData.data.forEach(user => {
        const row = tableBody.insertRow();
        user.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });    
  }
  
  
  // ---------------------------------------------------------------
  // Initializes the webpage functionalities.
  // Add or remove event listeners based on the desired functionalities.
  window.onload = function() {
    document.getElementById("refresh").addEventListener("click", getResults);
    document.getElementById("get-official").addEventListener("submit", getSeats);
  };

  function fetchTableData() {
    
  }
  