let balanceOutput = document.getElementById("balance");
let betAmount = document.getElementsByClassName("bet-amount")[0];
let winningsOutput = document.getElementById("winnings");
let payFromSpin = document.getElementById("pays");
let audio = document.getElementById("quickhit-sound")

let audioOn = false;

let balance = 50;
let bet = 5;
let amountWon = 0;

let slots = document.querySelector(".slots");

let betButtons = document.getElementsByClassName("bet-button");

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

for(let i = 0; i < betButtons.length; i++) {
    betButtons[i].addEventListener("click", changeBet);
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

function checkButtons() {
    for(let i = 0; i < betButtons.length; i++) {
        console.log(betButtons[i].value, balance)
        if(+betButtons[i].value > balance) {
            console.log(betButtons[i].value, balance)
            betButtons[i].disabled = true
        } else {
            betButtons[i].disabled = false;
        }
}

}

function changeBet() {
    bet = +this.value
    betAmount.innerHTML = "$" + bet;

    if(!this.classList.contains("selected")) {
        this.classList.toggle("selected")
    } 


    for(let i = 0; i < betButtons.length; i++) {
        if(betButtons[i] != this && betButtons[i].classList.contains("selected")) {
            betButtons[i].classList.toggle("selected")
        }

    }

    spinSlots()

    document.activeElement.blur()

    // Switch sound effect
    new Audio("audio/reel-stop.mp3").play()
}

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

        res = slotHTML(pool[rand], selected);

        parent.appendChild(res)
    }
    return randSlot;
}

function startReel(reel, len, timeout) {
    let parent = reel.parentElement
    let height = (len - 3) * reel.offsetHeight;


    let spinReels = reel.animate([
        {
            transform: "translateY(0%)"
        }   ,
        {
            transform: `translateY(-${height}px)`
        }
    ], {
        duration: 500,
        fill: "forwards",
        delay: timeout
    })

    spinReels.onfinish = () => {
        if(reel.getElementsByTagName("img")[0].src == "http://127.0.0.1:5500/imgs/quickhit.png") {
            console.log("Quick hit")
        }

        setTimeout(() => {
        if(amountWon <= 0) {
            payFromSpin.innerHTML = "Game over"
        }
        }, 500)
    };
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
      else if (rand < 90) {
        return 75;
    } else if (rand >= 90 && rand <= 100) {
        return 100;
    } 
}

function slotHTML(icon,  selected) {
    let div = document.createElement("div");
    let img = document.createElement("img");
    img.src = icon;

    // if(selected) {
    //     div.classList.add("selected")
    // }
  

    div.classList.add("slot");

    div.appendChild(img);
    return div;
}


function spinSlots() {
    // 0.25 is the minimum bet
    if(balance - bet < 0.25) {
        alert("All out of credits! You have been given $10")
        balance += 10;
    }
    
    deleteOldSlots();

    balanceOutput.innerHTML = "$" +balance + amountWon
    amountWon > 0 ? balance += amountWon : null
    amountWon = 0;
    payFromSpin.innerHTML = "Good luck!"
    winningsOutput.innerHTML = ""

    balance -= bet;

    
    let delay = 0;

    let res = []
    
    // Loop through all 4 of the rows
    let row = document.getElementsByClassName("slot-row")
    for(let i = 0; i < row.length; i++) {
        
        // For each row, generate 12 reels 
        res.push(generateSlots(row[i]))
        
        delay += 120;
        
        // Each reel
        let reel = row[i].getElementsByClassName("slot");
        
        // Looping through each reel
        for(let o = 0; o < reel.length; o++) {
            startReel(reel[o], reel.length, delay, o, reel.length)
        }
    }

    determineWinnings(res)
    checkButtons()
}

function deleteOldSlots() {     
    let row = document.getElementsByClassName("slot-row")
    for(let i = 0; i < row.length; i++) {

        // Each reel
        let reel = row[i].getElementsByClassName("slot");


        // Looping through each reel
        for(let o = 0; o < reel.length; o++) {
            reel[o].remove()
        }
    }
}

function updateUI() {
    balanceOutput.innerHTML = "$" + balance.toFixed(2);
    betAmount.innerHTML = "$" + bet;

    // Set Lifetime Spent
    let totalSpend = localStorage.getItem("lifeTimeSpend");
    let newSpend = +totalSpend + +bet;
    localStorage.setItem("lifeTimeSpend", newSpend)

    // Set Lifetime Won
    let totalWon = localStorage.getItem("lifeTimeWon")
    let newWon = +totalWon + +amountWon
    localStorage.setItem("lifeTimeWon", newWon)

    // Set Lifetime Spins
    let lifeTimeSpins = localStorage.getItem("lifeTimeSpins");
    localStorage.setItem("lifeTimeSpins", +lifeTimeSpins + 1)
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
     payFromSpin.innerHTML = `Game pays: $${bet * (quickhits * 1.5).toFixed(2)}`;
     amountWon = bet * (quickhits * 1.5);
     winningsOutput.innerHTML = `Game pays $${(bet * (quickhits * 1.5)).toFixed(2)}`
    }

    console.log(`Bells canyon: ${bells}`, `Horseshoes: ${horseShoes}`, `Cherries: ${cherries}`, `Bars: ${bars}`, `Quickhits: ${quickhits}`)
    updateUI() 
}
