document.addEventListener("DOMContentLoaded", function () {
  displayHistory();
});

// history[]
/* entry: {
id: numer,
dates: [{}, {}, {}, {}, {}, {}, {}, {},]
nuame: text
rank :0
 }*/

function setHistoryTo(history) {
//   localStorage.setItem("rachbal_history", JSON.stringify([]));

  localStorage.setItem("rachbal_history", JSON.stringify(history));
}
function getRachbalHistory() {
  if (localStorage.getItem("rachbal_history")) {
    let history = localStorage.getItem("rachbal_history");
    console.log(localStorage.getItem("rachbal_history"));
    console.log(history);
    return JSON.parse(history);
  }
  return ([]);
}


function setLastActions(actions) {
  localStorage.setItem("rachbal_lastActions", JSON.stringify(actions));
}
function getLastActions() {
  return JSON.parse(localStorage.getItem("rachbal_lastActions")) || [];
}

function recordTaxi() {
  const taxiNumberInput = document.getElementById("taxiNumber");
  const taxiNumber = taxiNumberInput.value.trim();
  const date = new Date();
  let history = getRachbalHistory();
  console.log(JSON.stringify(history));

  if (history.length == 0) {
    console.log("empty history!");
  }
  if (taxiNumber !== "") {
    // Retrieve existing history from local storage
    let found = false;
    let currentAction;
    //* none zero
    // Add new entry to history

    for (const element of history) {
      let pastEntry = element;
      if (pastEntry.id == taxiNumber) {
        alert("מה הסיכויים? הייונו פה כבר פעם! מספר "+ taxiNumber)
        let nowDate = date.getTime();
        pastEntry.dates.push({ date: nowDate });
        currentAction = {
          type: "increment",
          payload: { id: pastEntry.id, date: nowDate },
        };
        found = true;
        break;
      }
    }
    if (!found) {
      currentAction = {
        type: "create",
        payload: {
          id: taxiNumber,
          dates: [{ date: date.getTime() }],
          name: null,
          rank: 0,
        },
      };
      history.push({
        id: taxiNumber,
        dates: [{ date: date.getTime() }],
        name: null,
        rank: 0,
      });
    }

    console.log(history);
    // Save updated history to local storage
    setHistoryTo(history);
    setLastActions( [...getLastActions(),currentAction]);
    // Clear input field
    taxiNumberInput.value = "";

    // Update displayed history
    displayHistory();
  }

}
function setNumInput(id) {
  if (id) {
    const taxiNumberInput = document.getElementById("taxiNumber");
    taxiNumberInput.value = id;
  }
}

function createCabinData(cabin) {
  return cabin.id + ": " + cabin.dates.length;
}

function displayHistory() {
  const historyList = document.getElementById("historyList");
  historyList.innerHTML = "";

  // Retrieve history from local storage
  const history = getRachbalHistory();
  if (history.length > 0) {
    //sort the history by date
    // Display history on the page
    console.log(history);

    for (const element of history) {
      {
        const cableCarDiv = document.createElement("div");
        cableCarDiv.classList = "cable-car";
        cableCarDiv.onclick = function () {
          setNumInput(element.id);
        };
        const cabinDiv = document.createElement("div");
        cabinDiv.classList = "cabin";
        cableCarDiv.appendChild(cabinDiv);

        const windows = document.createElement("div");
        windows.classList = "windows";
        cabinDiv.appendChild(windows);

        //cabin data structure
        const cabinData = document.createElement("div");
        cabinData.classList = "cabinData";
        cabinData.textContent = createCabinData(element);

        cabinDiv.appendChild(cabinData);
        const window1 = document.createElement("div");
        window1.classList = "window";
        windows.appendChild(window1);
        const window2 = document.createElement("div");
        window2.classList = "window";
        windows.appendChild(window2);
        const window3 = document.createElement("div");
        window3.classList = "window";
        windows.appendChild(window3);

        historyList.appendChild(cableCarDiv);
      }
    }
  }
}

function undoLastAction() {
  let lastActions = getLastActions();
  let lastAction = lastActions[lastActions.length - 1];
  console.log("lastAction: " + JSON.stringify(lastAction));
  if (lastAction.type == "create") {
    let history = getRachbalHistory();
    console.log(
      "was create! of " + lastAction.payload.id + "  " + history.length
    );
    for (let i = 0; i < history.length; i++) {
      let entry = history[i];
      console.log("id: " + entry.id);
      if (entry.id == lastAction.payload.id) {
        console.log("found entry" + JSON.stringify(entry));
        const arrayOfObjects = history.filter(
          (obj) => obj.id !== lastAction.payload.id
        );
        setHistoryTo(arrayOfObjects);
        break;
      }
    }
  }
  if (lastAction.type == "increment") {
    let history = getRachbalHistory();
    console.log(
      "was increment! of " + lastAction.payload.id + "  " + history.length
    );
    for (let i = 0; i < history.length; i++) {
      let entry = history[i];
      console.log("id: " + entry.id);
      if (entry.id == lastAction.payload.id) {
        console.log("found entry" + JSON.stringify(entry));
        history[i].dates.pop();
        setHistoryTo(history);
        break;
      }
    }
  }
  lastActions.pop();
setLastActions(lastActions)
  displayHistory();
}


let sortDirection =1;
function sortHistoryByDate() {
    sortDirection= -1*sortDirection;
  let history = getRachbalHistory();

  console.log(history);
  let sortedHistory = history.sort((a, b) => {
    console.log(a.dates[a.dates.length - 1].date +"  "+ b.dates[b.dates.length - 1].date);
    if (a.dates[a.dates.length - 1].date > b.dates[b.dates.length - 1].date)
      return sortDirection;
    return -sortDirection;
  });
  console.log(sortedHistory);

  setHistoryTo(sortedHistory);
  displayHistory();
}

function sortHistoryByCount(){
    sortDirection= -1*sortDirection;
    let history = getRachbalHistory();
    let sortedHistory = history.sort((a, b) => {
      if (a.dates.length > b.dates.length )
        return sortDirection;
      return -sortDirection;
    });
    setHistoryTo(sortedHistory);
    displayHistory();
}