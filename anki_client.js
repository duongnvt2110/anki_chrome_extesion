const ANKI_HOST_URL = "http://localhost:8765"

async function ankiPost(body) {
  let resp = await fetch(ANKI_HOST_URL,{
      method: "POST",
      headers: {
          "Content-type": "application/json; charset=UTF-8"
      },
      body: JSON.stringify(body),
  }).catch(function(err) {
    console.error(err)
  });

  let respJson = await resp.json()
  return respJson
}

export async function getDeck() {
  let body = {
    "action": "deckNames",
    "version": 6
  }
  
  let resp = await ankiPost(body)
  return resp
}


export async function getDeckDefault() {
  let body = {
    "action": "createDeck",
    "version": 6,
    "params": {
        "deck": deckName
    }
  }
  let resp = await ankiPost(body)
  return resp
}


export async function createDeck(deckName) {
  let body = {
    "action": "createDeck",
    "version": 6,
    "params": {
        "deck": deckName
    }
  }
  let resp = await ankiPost(body)
  return resp
}


async function getDeckStats() {
  const body = {
      "action": "getDeckStats",
      "version": 6,
      "params": {
          "decks": ["Vocab Daily"]
      }
  }

  var data = await fetch("http://localhost:8765", {
         // Adding method type
      method: "POST",
      body: JSON.stringify(body),
      headers: {
          "Content-type": "application/json; charset=UTF-8"
      }
  })
  .catch(function(err) {
      console.error(err)
  });
  var f = await data.json();
  return f;

}