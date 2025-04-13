document.addEventListener("DOMContentLoaded", function () {
  checkAndAlertBackup();
  displayHistory();
});

function checkAndAlertBackup(){
  const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

  let lastBackup = localStorage.getItem("lastBackup");
  const currentDate = new Date();
  
  if (!lastBackup || (currentDate.getTime() - new Date(lastBackup).getTime() >= SEVEN_DAYS_IN_MS)) {
    alert("Please backup now!");
  }
}
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
    // console.log(localStorage.getItem("rachbal_history"));
    // console.log(history);
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
  // console.log(JSON.stringify(history));

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
        let str = "מה הסיכויים? הייונו פה כבר פעם! " + '\n הפעמים הקודמות שהיינו בו הן: \n' ;
        for (let index = 0; index < pastEntry.dates.length; index++) {
          const date =  new Date(pastEntry.dates[index].date);
          // console.log(date );
          str+=  date.getDate()+"." + (date.getMonth()+1)+"." +date.getFullYear().toString().slice(2,4) +' בשעה '+ (date ).getHours() +":" + (date ).getMinutes()+'\n';
        }
        if(pastEntry.dates.length>3) str += '\n סך הכל '+  pastEntry.dates.length +' פעמים! '
        alert( str)
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

    // console.log(history);
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
    // console.log(history);

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
        // cabinData.textContent = createCabinData(element);

        const cabinNnumberSpan = document.createElement("span");
        cabinNnumberSpan.classList = "cabinNumberSpan";
        cabinNnumberSpan.textContent= element.id;
        cabinData.appendChild(cabinNnumberSpan);
        const cabinCountSpan = document.createElement("span");

        cabinCountSpan.classList = "cabinCountSpan";
        let date = new Date(element.dates[0].date);
        let cabinDatatext = '';
        cabinDatatext=  ": " + date.getDate()+"." + (date.getMonth()+1)+"." +date.getFullYear().toString().slice(2,4) +'\n' ;
        for (let index = 0; index < element.dates.length; index++) {
          cabinDatatext+=  '•';
          
        }
        cabinCountSpan.textContent= cabinDatatext
        cabinData.appendChild(cabinCountSpan);
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
  // console.log("lastAction: " + JSON.stringify(lastAction));
  if(!lastAction)
  {
    return;
  }
  if (lastAction.type == "create") {
    let history = getRachbalHistory();
    console.log(
      "was create! of " + lastAction.payload.id + "  " + history.length
    );
    for (let i = 0; i < history.length; i++) {
      let entry = history[i];
      // console.log("id: " + entry.id);
      if (entry.id == lastAction.payload.id) {
        // console.log("found entry" + JSON.stringify(entry));
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

    for (let i = 0; i < history.length; i++) {
      let entry = history[i];
      // console.log("id: " + entry.id);
      if (entry.id == lastAction.payload.id) {
        // console.log("found entry" + JSON.stringify(entry));
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

  // console.log(history);
  let sortedHistory = history.sort((a, b) => {
    // console.log(a.dates[a.dates.length - 1].date +"  "+ b.dates[b.dates.length - 1].date);
    if (a.dates[a.dates.length - 1].date > b.dates[b.dates.length - 1].date)
      return sortDirection;
    return -sortDirection;
  });
  // console.log(sortedHistory);

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


function copyHistoryToClipboard() {
  // Get the text field

  let copyText = (localStorage.getItem("rachbal_history"));
  const currentDate = new Date();
  localStorage.setItem("lastBackup", currentDate.toISOString());
   // Copy the text inside the text field
  navigator.clipboard.writeText(copyText);
}


async function loadHistoryFromClipboard() {
  try {
    // Check if clipboard API is available
    if (!navigator.clipboard || !navigator.clipboard.readText) {
      throw new Error("Clipboard API not supported in this browser");
    }

    // Read clipboard text
    const clipboardText = await navigator.clipboard.readText();
    
    if (!clipboardText.trim()) {
      alert("הלוח ריק או מכיל רק רווחים");
      return;
    }
    
    console.log("Text loaded from clipboard:", clipboardText);
    alert("טקסט שהועתק: " + clipboardText);
    // localStorage.setItem("rachbal_history")
  localStorage.setItem("rachbal_history", clipboardText);
displayHistory();
    // Here you would typically do something with the text
    // For example: document.getElementById("someInput").value = clipboardText;
    
  } catch (error) {
    console.error("שגיאה בטעינה מהלוח:", error);
    
    if (error.message.includes("permission") || error.name === "NotAllowedError") {
      alert("נדרש אישור גישה ללוח. אנא אשר את הבקשה.");
    } else {
      alert("לא ניתן לגשת ללוח: " + error.message);
    }
  }
}