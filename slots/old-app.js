let balanceOutput = document.getElementById("balance");
let betAmount = document.getElementsByClassName("bet-amount")[0];
let winningsOutput = document.getElementById("winnings");
let payFromSpin = document.getElementById("pays");
let audio = document.getElementById("quickhit-sound")

let audioOn = false;

let balance = 2500;
let bet = 20;
let amountWon = 0;

let slots = document.querySelector(".slots");

let icons = ["imgs/bell.webp", "imgs/7.webp", "imgs/quickhit.png", "imgs/horseshoe.webp", "imgs/cherry.png", "imgs/bar.png"]
let result = ["imgs/bell.webp", "imgs/7.webp", "imgs/quickhit.png", "imgs/7.webp", "imgs/quickhit.png", "imgs/7.webp", "imgs/quickhit.png"]

let pool = {
    1: "imgs/bell.webp",
    25: "imgs/horseshoe.webp",
    50: "imgs/cherry.png",
    75: "imgs/bar.png",
    76: "imgs/7.webp",
    100: "imgs/quickhit.png"
}

let results = [];
document.addEventListener("keypress", (e) => {
    if(e.key == "Enter" && balance > 0) {
        spinSlots()
    }

    if(e.key == ";") {
        audioOn = true
    }
})

function generateSlots(parent) {
    let randSlot = [];
    let res = ""
    let selected = false;
    for(let i = 0; i < 12; i++) {
        let rand = Math.floor(Math.random() * 101)
        rand = determineOutcome(rand)

        // Winning combo
        if(i > 8 && !isNaN(rand)) {
            randSlot.push(rand);
            selected = true
        }

        res = slotHTML(pool[rand], rand, selected);

        parent.prepend(res)
    }
    return randSlot;
}

function determineOutcome(rand) {
    if (rand < 25 || rand == 0) {
        return 1;
    } else if (rand < 50) {
        return 25;
    } else if (rand < 75) {
        return 50;
    } else if(rand > 75 && rand < 90) {
        return 76;
    }
      else if (rand < 95) {
        return 75;
    } else if (rand >= 95 && rand <= 100) {
        return 100;
    } 
}

function slotHTML(icon, rand, selected) {
    let div = document.createElement("div");
    let img = document.createElement("img");
    img.src = icon;

    if(rand >= 90 && rand <= 100) {
        div.classList.add("quickhit");
    }

    if(selected == true) {
        div.classList.add("selected-slot")
    }
    div.classList.add("new-slot");
    div.classList.add("generated-slot");
    div.classList.add(rand)

    div.appendChild(img);
    return div;
}


function spinSlots() {
    balanceOutput.innerHTML = "$" +balance + amountWon
    amountWon > 0 ? balance += amountWon : null
    amountWon = 0;
    payFromSpin.innerHTML = "Good luck!"
    winningsOutput.innerHTML = ""
    balance -= bet;
    let timeOut = 370;
    let slotRow = document.getElementsByClassName("slot-row");

    // Each row
    let finalTally = [];
    for(let i = 0; i < slotRow.length; i++) {
        let slotInRow = slotRow[i].getElementsByClassName("slot")
        let results = generateSlots(slotRow[i])
        finalTally.push(results)
        setTimeout(() => {
            deleteOldSlots(slotRow[i])
        }, 5000)
        // For each slot
        for(let n = 0; n < slotInRow.length; n++) {
            let currentPos = 0;
            
            while(currentPos < 300) {
                slotInRow[n].style.marginTop = currentPos + "%";
                currentPos += 25;
                console.log(currentPos)
            }

        }

        let newSlot = document.querySelectorAll(".new-slot");
        setTimeout(() => {
        for(let i = 0; i < newSlot.length; i++) {
            newSlot[i].style.position = "relative"
            newSlot[i].style.transition = "1s ease"
            newSlot[i].style.top = "0%";
            newSlot[i].classList.add("slot")
            if(newSlot[i].classList.contains("quickhit") && newSlot[i].classList.contains("selected-slot")) {
                setTimeout(() => {
                    newSlot[i].style.backgroundColor = "rgb(3, 21, 44)"
                    if(audioOn) {
                        audio.play()
                    }
                    newSlot[i].classList.remove("selected-slot")
                }, timeOut - 110)
            }

            if(newSlot[i].classList.contains("selected-slot")) {
                
            }
        }
        }, timeOut)
        timeOut += 230;

        setTimeout(() => {
            payFromSpin.innerHTML = "Game over"
        }, 1940)
    }
  
    determineWinnings(finalTally)
    results = []
}

function deleteOldSlots(el) {
    let slotRow = document.getElementsByClassName("slot-row");
        for(let i = 0; i < slotRow.length; i++) {
           
            let updatedSlots = slotRow[i].getElementsByClassName("slot");

            let slotCount = 0;
            for(let o = 0; o < updatedSlots.length; o++) {
                if(o > 2) {
                    updatedSlots[o].remove();
                }
            }
            
        }
}

function updateUI() {
    balanceOutput.innerHTML = "$" + balance.toFixed(2);
}

function determineWinnings(results) {
    let quickhits = 0;
    let bells = 0;
    let sevens = 0;
    let curPos = 0;
    let horseShoes = 0;
    let cherries = 0;
    let bars = 0;
    

    for(let i = 0; i < results.length; i++) {
       results[i].forEach((slot) => {
        switch(slot) {
            case 1:
                bells++;
                break;
            case 25:
                horseShoes++;
                break;
            case 50:
                cherries++;
                break;
            case 75:
                bars++;
                break;
            case 100: 
                quickhits++;
                break;
        }
       })

    }
    if(quickhits > 2) {
     payFromSpin.innerHTML = `Game pays: $${bet * 1.5}`;
     amountWon = bet * (quickhits * 1.5);
     winningsOutput.innerHTML = `Game pays $${bet * (quickhits * 1.5)}`
    }
    updateUI() 
}