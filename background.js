import { DOMParser } from 'https://cdn.skypack.dev/@xmldom/xmldom';

const oxClassName = {
    "us": {
        "phons": "phons_n_am",
        "phon": "phon",
        "sound": "pron-us",
        "sound_src": "data-src-mp3"
    }
}

const wInfo = {
    "phonetic": "",
    "sound": "",
    "def": "",
    "exam":"",             
    "idiom": "",
    "idiomDef": "",
    'idiomExam': "",
}

chrome.contextMenus.create({
    id: "show-icon",
    title: "show-icon",
    contexts: ["selection"],
})

chrome.contextMenus.onClicked.addListener(async function(info,tab) {
    if (info.menuItemId === "show-icon") {
        let newWord = info.selectionText.toLowerCase()
        let wordInfo = await getOxFordInfo(newWord)
        addCard(newWord,wordInfo)
    }
})


async function addNote(){
    // hcAnki();
    // var f = await getDeckStats()
    // deckName = Object.keys(f.result)[0]
    addCard()
}

function hcAnki() {
    fetch("http://localhost:8765",{
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
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

async function addCard(word,wordInfo) {
    let cWord = clozeWord(word)
    const body = {
        "action": "addNotes",
        "version": 6,
        "params": {
            "notes": [
                {
                    "deckName": "Vocab Daily",
                    "modelName": "1. English new words daily",
                    "fields": {
                        "Word": word,
                        "Cloze": cWord,
                        "Phonetic Symbol": wordInfo.phonetic,
                        "Audio": "",
                        "English Meaning": wordInfo.def,
                        "Extra Information": wordInfo.exam,
                        "Vietnamese Meaning": "",
                        "Picture": "",
                        "Idiom": wordInfo.idiom,
                        "Idiom Meaning": "",
                        "Extra Idiom": wordInfo.idiomExam,
                    },
                    "options": {
                        "allowDuplicate": true,
                        "duplicateScope": "deck",
                        // "duplicateScopeOptions": {
                        //     "deckName": "Vocab Daily",
                        //     "checkChildren": true,
                        //     "checkAllModels": false
                        // }
                    },
                    "audio": [{
                        "url": wordInfo.sound,
                        "filename": word+"_us.mp3",
                        "fields": [
                            "Audio"
                        ]
                    }],
                }
            ]
        }
    }

    await fetch("http://localhost:8765", {
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
}


async function getTabId() {
    tab = await chrome.tabs.query({active: true, currentWindow: true})
    return tab
}

function clozeWord(word) {
    let len = word.length
    let hLen = Math.round(len/2)
    let cWord = word.split("")
    for (let i = 0; i <= hLen ; i ++) {
        let c = Math.floor(Math.random() * len) + 1;
        cWord[c] = "_"
    }
    return cWord.join("")
}

async function getOxFordInfo(word){
    let oxUrl = "https://www.oxfordlearnersdictionaries.com/definition/english/"+word+"?q="+word
    let resLookup = await fetch(oxUrl,{
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        },
        //redirect: "follow"
    })
    .catch(function(err) {
        console.error(err)
    });

    let res = await fetch(resLookup.url,{
        method: "POST",
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        },
        redirect: "follow"
    })
    .catch(function(err) {
        console.error(err)
    });
    let htmlString = await res.text()
    let data = await getUsInfo(htmlString,oxClassName)
    return data
}  


function getUsInfo(htmlString,oxClassName) {
    let parser = new DOMParser();
    
    // Use the parser to convert the HTML string to a DOM element
    let wrapper = parser.parseFromString(htmlString, "text/html");
    let entryContent = wrapper.getElementById('entryContent')
    let [phoetic,sound,idiom,idiomExam] = getInfoWord(entryContent)
    let [def,exam] = getDefandExWord(entryContent)
    
    wInfo.phonetic = phoetic 
    wInfo.sound = sound 
    wInfo.def = def 
    wInfo.exam = exam
    wInfo.idiom = idiom 
    wInfo.idiomExam = idiomExam
    return wInfo
}

function getInfoWord(entryContent) {
    let po = ""
    let so = ""
    let idiomExam = ""
    let idiom = ""
    let infoWord = entryContent.getElementsByTagName("div")
    for(var i=0;i<infoWord.length;i++){
        if (infoWord[i].getAttribute("class")=="webtop") {
            let phoObject = infoWord[i].getElementsByTagName("span")
            for(let j=0;j<phoObject.length;j++){
                if (phoObject[j].getAttribute("class")=="phonetics") {
                    let pInfo = phoObject[j].getElementsByTagName("div")
                    for(let j=0;j<pInfo.length;j++){
                        if(pInfo[j].getAttribute("class")==oxClassName.us.phons){
                            let poObject = pInfo[j].getElementsByTagName("span")
                            if (poObject.length > 0) {
                                po = poObject[0].firstChild.data
                            }
                            let soObject = pInfo[j].getElementsByTagName("div")
                            if (soObject.length > 0) {
                                so = soObject[0].getAttribute(oxClassName.us.sound_src)
                            }
                            break
                        }
                    }
                    break
                }     
            }
            continue
        }
            
        if(infoWord[i].getAttribute("class")=="idioms"){
            let idiomObject = infoWord[i].getElementsByTagName("span")
            for(let j=0;j<idiomObject.length;j++){
                let id = ""
                let idiomDef = ""
                if (idiomObject[j].getAttribute("class") == "idm-g") {
                    let idionDefObj = idiomObject[j].getElementsByTagName("span")
                    for(let m=0;m<idionDefObj.length;m++){
                        if(idionDefObj[m].getAttribute("class")=="idm"){
                            id = idionDefObj[m].firstChild.data
                        }
                        if(idionDefObj[m].getAttribute("class")=="def"){
                            idiomDef += idionDefObj[m].firstChild.data + ", "
                        }
                    }
                    idiom += "-" + id + ": " + idiomDef + "<br>"
                }
                if(idiomObject[j].getAttribute("class")=="x") {
                    if (idiomObject[j].firstChild.nextSibling != null) {
                        continue
                    }
                    idiomExam += "-" + idiomObject[j].firstChild.data + "<br>"
                }
            }
            continue
        }
    }
    return [po, so, idiom,idiomExam]
}

function getDefandExWord(entryContent) {
    let infoWord = entryContent.getElementsByTagName("li")
    let def = ""
    let example = ""
    for(var i=0;i<infoWord.length;i++){
        let flag = 0
        if(infoWord[i].getAttribute("class")=="sense"){
            let defObject = infoWord[i].getElementsByTagName("span")
            let len = defObject.length
            for(let j=0;j<len; j++){
                if(defObject[j].getAttribute("class")=="def"){
                    if (defObject[j].firstChild.nextSibling != null) {
                        continue
                    }
                    def += "-" + defObject[j].firstChild.data + "<br>"
                }
                if(defObject[j].getAttribute("class")=="x") {
                    if (flag == 2) {
                        continue 
                    }
                    if (defObject[j].firstChild.nextSibling != null) {
                        continue
                    }
                    example += "-" + defObject[j].firstChild.data + "<br>"
                    flag++
                }
            }
           
        }
    }
    return [def,example]
}
