import { getDeck } from '../anki_client.js';


const deckList = document.getElementById("deck-select");

document.addEventListener('DOMContentLoaded', initialize);

async function initialize() {
  await getListDeck()
  loadDefaultOption()
  document.getElementById('save').addEventListener('click', saveOptions);
}

async function getListDeck() {
  let listDeckResp = await getDeck()
  let deckNames = listDeckResp.result

  // append to html
  for (var j = 0; j <= deckNames.length; j++) {
    var option = document.createElement("option");
    option.text = deckNames[j]
    option.value = deckNames[j]
    deckList.appendChild(option);
  }

}
function loadDefaultOption() {
  chrome.storage.sync.get(["defaultDeck"],
  (items) => {
    deckList.value = items.defaultDeck
  }
  );
}

function saveOptions() {
  const deckName = deckList.value;
  chrome.storage.sync.set(
    { defaultDeck: deckName },
    () => {
      // Update status to let user know options were saved.
      const status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(() => {
        status.textContent = '';
      }, 750);
    }
  );
}