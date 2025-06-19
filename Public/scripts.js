/*
 * Code below was taken from the CPSC 304 sample project that was provided us
 */

// This function checks the database connection and updates its status on the frontend.
async function checkDbConnection() {
    const statusElem = document.getElementById('dbStatus');
    const loadingGifElem = document.getElementById('loadingGif');
  
    const response = await fetch('/check-db-connection', {
        method: "GET"
    });
  
    // Hide the loading GIF once the response is received.
    loadingGifElem.style.display = 'none';
    // Display the statusElem's text in the placeholder.
    statusElem.style.display = 'inline';
  
    response.text()
    .then((text) => {
        statusElem.textContent = text;
    })
    .catch((error) => {
        statusElem.textContent = 'connection timed out';  // Adjust error handling if required.
    });
  }
  
  
  // This function resets or initializes the demotable.
  async function resetProject() {
    const response = await fetch("/initiate-demotable", {
        method: 'POST'
    });
    const responseData = await response.json();
  
    if (responseData.success) {
        const messageElement = document.getElementById('resetResultMsg');
        messageElement.textContent = "demotable initiated successfully!";
        fetchTableData();
    } else {
        alert("Error initiating table!");
    }
  }
  
  // Inserts new records into the votertable.
  async function insertVoter(event) {
    event.preventDefault();
  
    // gets the selected province from the dropdown
    var sel = document.getElementById("prov-select");
  
    const SINValue = parseInt(document.getElementById('insertSIN').value);
    const nameValue = document.getElementById('insertName').value;
    const emailValue = document.getElementById('insertEmail').value;
    const dobValue = document.getElementById('insertDOB').value;
    const addressValue = document.getElementById('insertAddress').value;
    const cityValue = document.getElementById('insertCity').value;
    const provValue = sel.value;
    const pcValue = document.getElementById('insertPC').value;
  
    const response = await fetch('/insertVoter', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fullName: nameValue,
          postalCode: pcValue,
          dob: dobValue,
          province: provValue,
          streetAddress: addressValue,
          city: cityValue,
          email: emailValue,
          sin: SINValue,
          voted: 0,
          party_PartyName: null,
          role: null
      })
    });
  
    // tells the user if the voter was registered successfully
    const responseData = await response.json();
    const messageElement = document.getElementById('insertResultMsg');
  
    if (responseData.success) {
        messageElement.textContent = "Data inserted successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error inserting data!";
    }
  }
  
  // Fetches data from the votertable and displays it.
  async function fetchAndDisplayVoters() {
      const tableElement = document.getElementById('votertable');
      const tableBody = tableElement.querySelector('tbody');
      
      const response = await fetch('/votertable', {
          method: 'GET'
      });
      
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

  
    // adds the available parties to the dropdown
    async function fetchParties() {
        const response = await fetch('/projection', {
          method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            queryString: "PartyName"
        })
      });
    
        const myobject = (await response.json()).data;
        const select = document.getElementById('party-select');

        for(index in myobject) {
            var opt = myobject[index];
            select.innerHTML += "<option value=\"" + opt + "\">" + opt + "</option>";
        }
      }
  
  // Updates voter party in the table.
  async function updateVoterParty(event) {
    event.preventDefault();
    const SINValue = parseInt(document.getElementById('updateSIN').value);
    var party = document.getElementById('party-select').value;
    const response = await fetch('/updateVoter', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sin: SINValue,
          party_PartyName: party
      })
      
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('updateResultMsg');
  
    if (responseData.success) {
        messageElement.textContent = "Party updated successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error updating Party!";
    }
  }

    // adds the polling stations to the dropdown
    async function getPollingStations() {
        const response = await fetch('/getPollingStations', {
          method: 'GET'
        })
    
        const myobject = await response.json();
        const select = document.getElementById('station-select');

        for(index in myobject) {
            var opt = myobject[index];
            select.innerHTML += "<option value=\"" + opt + "\">" + opt + "</option>";
        }
      }
  

  // gets the candidates running in a specific riding and add them to the dropdown
  async function getCandidates(event) {
    event.preventDefault();
    const station = document.getElementById('station-select').value;

    const response = await fetch('/join/' + station, {
        method: 'GET',
    });

    const candidates = (await response.json()).data;
    const select = document.getElementById('vote');

    // clears the previously queried candidates
    select.innerHTML = "";
      
    for(const name of candidates) {
        console.log("in candidate array");
        select.options[select.options.length] = new Option(name[0], name[1]);
    }
  }

  async function vote(event) {
    event.preventDefault();

    const voter = parseInt(document.getElementById('voterSIN').value);
    const candidate = document.getElementById('vote').value;
    const station = document.getElementById('station-select').value;

    const response = await fetch('/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          voterSIN: voter,
          candidateSIN: candidate,
          pollingStationName: station
        })
      });

    const responseData = await response.json();
    const messageElement = document.getElementById('votingResult');
  
    if (responseData.success) {
        messageElement.textContent = "Thank you for voting!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error!";
    }
  }
  
  
  // ---------------------------------------------------------------
  // Initializes the webpage functionalities.
  // Add or remove event listeners based on the desired functionalities.
  window.onload = function() {
    checkDbConnection();
    fetchTableData();
    fetchParties();
    getPollingStations();
    document.getElementById("register").addEventListener("submit", insertVoter);
    document.getElementById("cast").addEventListener("click", vote);
    document.getElementById("affiliation").addEventListener("submit", updateVoterParty);
    document.getElementById("choose-riding").addEventListener("submit", getCandidates);
  };
  
  // General function to refresh the displayed table data. 
  // You can invoke this after any table-modifying operation to keep consistency.
  
  function fetchTableData() {
    fetchAndDisplayVoters();
  }