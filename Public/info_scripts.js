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
    const select = document.getElementById('party-delete');

    for(index in myobject) {
        var opt = myobject[index];
        select.innerHTML += "<option value=\"" + opt + "\">" + opt + "</option>";
    }
  }
    
  
  // delete a party
  async function deleteParty(event) {
    event.preventDefault();
    const partySelection = document.getElementById('party-delete');
    const partyName = partySelection.value;
    const response = await fetch('/deleteParty/' + partyName, {
        method: 'DELETE'
    });

    const responseData = await response.json();
    const messageElement = document.getElementById('deletePartyResultMsg');

    if (responseData.success) {
        messageElement.textContent = "Party deleted successfully!";
        fetchTableData();
    } else {
        messageElement.textContent = "Error deleting party!";
    }
}


async function getCommonPolicies(event) {
    event.preventDefault();
    const tableElement = document.getElementById('platforms');
    const tableBody = tableElement.querySelector('tbody');
    
    const response = await fetch('/division', {
        method: 'GET',
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

// fetches party platforms and display them in a table
async function fetchAndDisplayPlatform() {
    const tableElement = document.getElementById('platforms');
    const tableBody = tableElement.querySelector('tbody');

      const response = await fetch('/policies', {
          method: 'GET',
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
};


// function to query overview of party info
async function fetchAndDisplayParty() {
    const tableElement = document.getElementById('overview');
    const tableHead = tableElement.querySelector('thead');
    const tableBody = tableElement.querySelector('tbody');

    const selectedAttributes = Array.from(document.querySelectorAll
    ('input[name="partyAttributes"]:checked')).map(input => input.value);
    if (selectedAttributes.length === 0) {
       selectedAttributes.push("PartyName", "FoundingYear", "Incumbent");
    }

    const queryString = selectedAttributes.join(',');

      const response = await fetch('/projection', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            queryString: queryString
        })
      });

    const responseData = await response.json();
    const demotableContent = responseData.data;

      // Always clear old, already fetched data before new fetching process.
      if (tableHead) {
        tableHead.innerHTML = '';
        //Now, create new heads based on projected attributes.
        const headRow = tableHead.insertRow();
        selectedAttributes.forEach(attribute => {
            const cell = document.createElement('th');
            cell.textContent = attribute;
            headRow.appendChild(cell);
        });
      }

      // Always clear old, already fetched data before new fetching process. No exception here
     if (tableBody) {
        tableBody.innerHTML = '';
    }
    // Produces body of table
    demotableContent.forEach(user => {
        const row = tableBody.insertRow();
        user.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
    
};

// displays all ridings
async function fetchAndDisplayRidings() {
    const tableElement = document.getElementById('ridingtable');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/getRidings', {
        method: 'GET',
      });
      
      const responseData = await response.json();
      const tableContent = responseData.data;
     
    // clears old, already fetched data
    if (tableBody) {
        tableBody.innerHTML = '';
    }
    // Produces body of table
    tableContent.forEach(user => {
        const row = tableBody.insertRow();
        user.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });

};

// function to provide response to selection query of ridings
async function ridingSelection(event) {
    event.preventDefault();

    const tableElement = document.getElementById('ridingtable');
    const tableBody = tableElement.querySelector('tbody');
    const query = document.getElementById('querier').value;

    const response = await fetch('/riding', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            queryString: query
        })
      });
      
      const responseData = await response.json();
      const tableContent = responseData.data;

    // clears old, already fetched data
    if (tableBody) {
        tableBody.innerHTML = '';
    }

    // Produces body of table
    tableContent.forEach(user => {
        const row = tableBody.insertRow();
        user.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
    fetchTableData();
}

async function nested(event) {
    event.preventDefault();

    const tableElement = document.getElementById('ridingtable');
    const tableBody = tableElement.querySelector('tbody');

    const response = await fetch('/nestedGroupBy', {
        method: 'GET',
      });
      
      const responseData = await response.json();
      const tableContent = responseData.data;
    
    // clears old, already fetched data
    if (tableBody) {
        tableBody.innerHTML = '';
    }
    // Produces body of table
    tableContent.forEach(user => {
        const row = tableBody.insertRow();
        user.forEach((field, index) => {
            const cell = row.insertCell(index);
            cell.textContent = field;
        });
    });
    fetchTableData();
}

window.onload = function() {
    fetchTableData();
    fetchAndDisplayPlatform();
    fetchAndDisplayRidings();
    fetchParties();
    document.getElementById("all").addEventListener("click", fetchAndDisplayPlatform);
    document.getElementById("common").addEventListener("click", getCommonPolicies);
    document.getElementById("partygone").addEventListener("submit", deleteParty);
    document.getElementById("querySubmit").addEventListener("click", ridingSelection);
    document.getElementById("attributeProjector").addEventListener("change", fetchAndDisplayParty);
    document.getElementById("average").addEventListener("click", nested);
};

// General function to refresh the displayed party table data, for all tables. 
// You can invoke this after any table-modifying operation to keep consistency.
  
  function fetchTableData() {
    fetchAndDisplayParty();
    //fetchParties();
  }
