let balanceOutput = document.getElementById("balance");
let betAmount = document.getElementsByClassName("bet-amount")[0];
let winningsOutput = document.getElementById("winnings");
let payFromSpin = document.getElementById("pays");
let audio = document.getElementById("quickhit-sound")

let audioOn = false;

let balance = 50;
let bet = 5;
let amountWon = 0;

let sessionSpend = 0;
let timesSpun = 0;
let totalWon = 0;

let slotSpinning = false;
let skipAnimation = false;
let slots = document.querySelector(".slots");

let betButtons = document.getElementsByClassName("bet-button");

let icons = ["imgs/bell.webp", "imgs/7.webp", "imgs/quickhit.png", "imgs/horseshoe.webp", "imgs/cherry.png", "imgs/bar.png"]
let result = ["imgs/bell.webp", "imgs/7.webp", "imgs/quickhit.png", "imgs/7.webp", "imgs/quickhit.png", "imgs/7.webp", "imgs/quickhit.png"]
let winningOutputs = [];

const sounds = {
    startSlot: new Audio("https://github.com/user/project/blob/main/audio/start-slot.m4a"),
    quickhit: new Audio("https://github.com/user/project/blob/main/audio/audio/quickhit.mp3"),
    reelStop: new Audio("https://github.com/user/project/blob/main/audio/audio/reel-stop.mp3"),
    changeBet: new Audio("https://github.com/user/project/blob/main/audio/audio/stop-slot.m4a"),
    win: new Audio("https://github.com/user/project/blob/main/audio/audio/win.m4a"),
    playSound: function(audio, audioLevel) {
        audio.volume = audioLevel != null ? audioLevel : 0.2
        audio.play();
    }
}

let pool = {
    1: "imgs/bell.webp",
    25: "imgs/horseshoe.webp",
    50: "imgs/cherry.png",
    75: "imgs/bar.png",
    76: "imgs/7.webp",
    100: "imgs/quickhit.png"
}

for (let i = 0; i < betButtons.length; i++) {
    betButtons[i].addEventListener("click", changeBet);
}

let results = [];
document.addEventListener("keypress", (e) => {

    if (slotSpinning && e.key == "Enter") {
        // skipAnimation = true;
        return
    }

    if (e.key == ",") {
        let profit = sessionSpend > totalWon ? `$${0}` : `$${totalWon - sessionSpend}`
        alert(`\nSession stats:\n Money spent this session: $${sessionSpend}\n Money won this session: $${totalWon}\n Profit: ${profit}\n Number of spins: ${timesSpun}`)

        if (timesSpun > 5) {

        }
    }

    if (e.key == "Enter" && balance > 0) {
        spinSlots()
    }

    if (e.key == ";") {
        audioOn = true
    }

    if (e.key == "/") {
        let balanceInput = prompt("Insert cash:")

        balance = +balanceInput
        updateUI()
    }
})

function checkButtons() {
    for (let i = 0; i < betButtons.length; i++) {
        if (+betButtons[i].value > balance) {
            betButtons[i].disabled = true
        } else {
            betButtons[i].disabled = false;
        }
    }

}


function slotHTML(icon, selected) {
    let div = document.createElement("div");
    let img = document.createElement("img");
    img.src = icon;
    let reel = document.createElement("div");

    reel.classList.add("reel");

    // if(selected) {
    //     div.classList.add("selected")
    // }

    div.classList.add("slot");

    div.appendChild(reel)
    div.appendChild(img);
    return div;
}

function changeBet() {
    bet = +this.value
    betAmount.innerHTML = "$" + bet;

    if (!this.classList.contains("selected")) {
        this.classList.toggle("selected")
    }


    for (let i = 0; i < betButtons.length; i++) {
        if (betButtons[i] != this && betButtons[i].classList.contains("selected")) {
            betButtons[i].classList.toggle("selected")
        }

    }

    spinSlots()

    document.activeElement.blur()

    // Switch sound effect
    sounds.playSound(sounds.changeBet)
}

function generateSlots(parent) {
    let randSlot = [];
    let res = ""
    let selected = false;
    let numberofSlots = 12;
    let slotsPerRow = 3;

    for (let i = 0; i < numberofSlots; i++) {
        let rand = Math.floor(Math.random() * 101)
        rand = determineOutcome(rand, false)

        // Winning combo
        if (i >= numberofSlots - slotsPerRow && !isNaN(rand)) {
            randSlot.push(rand);
            selected = true
        }

        res = slotHTML(pool[rand], selected);

        parent.appendChild(res)
    }
    return randSlot;
}


function determineOutcome(rand, rigged) {
    if (rigged) {
        return rigged;
    }

    if (rand < 25 || rand == 0) {
        return 1;
    } else if (rand < 50) {
        return 25;
    } else if (rand < 75) {
        return 50;
    } else if (rand > 75 && rand < 90) {
        return 76;
    } else if (rand < 90) {
        return 75;
    } else if (rand >= 90 && rand <= 100) {
        return 100;
    }
}


function spinSlots() {
    // 0.25 is the minimum bet
    if (balance - bet < 0) {
        return
    }

    timesSpun++;

    slotSpinning = true

    sounds.playSound(sounds.startSlot, 0.01)

    balance -= bet;
    sessionSpend += bet;
    let wallet = +balance + +amountWon;
    balanceOutput.innerHTML = `$${wallet.toFixed(2)}`
    amountWon > 0 ? balance += amountWon : null
    amountWon = 0;
    payFromSpin.innerHTML = "Good luck!"
    winningsOutput.innerHTML = ""




    let res = []

    // Loop through all 4 of the rows
    let row = document.getElementsByClassName("slot-row")
    for (let i = 0; i < row.length; i++) {
        // For each row, generate 12 reels 
        res.push(generateSlots(row[i]))

    }
    animateReels(res);
    checkButtons()
}

function animateReels(res) {
    let row = document.getElementsByClassName("slot-row")
    let timer = 0;
    // 600 is default
    let duration = 600;
    // 450 is default
    let delayTimeIncrement = 450;
    let test = false;
    for (let i = 0; i < row.length; i++) {
        let oldChild = row[i].lastElementChild;
        let oldChildHeight = oldChild.getBoundingClientRect().bottom;
        const newHeight = oldChildHeight - (250 * 3);
        let animation = row[i].animate([{
                transform: `translateY(0px)`
            },
            {
                transform: `translateY(-${newHeight}px)`
            }
        ], {
            fill: "forwards",
            duration: duration,
            delay: timer
        })

        timer += delayTimeIncrement;

        // NOT IN USE FOR NOW 
        animation.oncancel = function() {
            row[i].style.transform = `translateY(-${newHeight}px)`;


            deleteOldSlots(i)
            if (i == row.length - 1) {
                determineWinnings(res)
                payFromSpin.innerHTML = "Game over"
                slotSpinning = false;
                skipAnimation = false;
            }
            checkSlots(i)
        }

        // NOT IN USE ^

        animation.onfinish = function() {
            test = true;
            let newAudio = new Audio("https://github.com/user/project/blob/main/audio/reel-stop.mp3");
            newAudio.volume = 0.2;

            if (skipAnimation) {
                removeAnimations(i, animation)
            }

            deleteOldSlots(i)

            // Last row animated displays result
            if (i == row.length - 1) {
                determineWinnings(res)
                payFromSpin.innerHTML = "Game over"
                slotSpinning = false;
                skipAnimation = false;
            }
            checkSlots(i)
            setTimeout(() => {
                newAudio.play();
            }, 50)
        }
    }
}

function removeAnimations(row, animationObj) {
    let rowEl = document.getElementsByClassName("slot-row")

    for (let i = 0; i < rowEl.length; i++) {
        rowEl[i].getAnimations()[0].cancel();
    }
}

function checkSlots(parent) {
    let row = document.getElementsByClassName("slot-row")[parent]
    let reel = row.querySelectorAll(".slot")
    for (let i = 0; i < reel.length; i++) {
        const img = reel[i].getElementsByTagName("img")[0].src;
        const src = img.substring(img.indexOf("i"))
        if (src == "imgs/quickhit.png") {
            let newQuickhit = new Audio("https://github.com/user/project/blob/main/audio/quickhit.mp3")
            newQuickhit.volume = 0.2;
            newQuickhit.play();
            reel[i].style.animation = "quickhit 0.4s"
        }

        // if(src == "imgs/bell.webp") {
        //     reel[i].style.animation = "bellAnimation 0.5s";
        // }

        // if(src == "imgs/bar.png") {
        //     reel[i].style.animation = "BarAnimation 0.5s"
        // }

        // if(src == "imgs/horseshoe.webp") {
        //     reel[i].style.animation = "HorseShoeAnimation 0.5s"
        // }

        // if(src == "imgs/cherry.png") {
        //     reel[i].style.animation = "CherryAnimation 0.5s"
        // }
    }
}

function deleteOldSlots(parent) {
    let row = document.getElementsByClassName("slot-row")[parent]
    let reel = row.querySelectorAll(".slot");
    let i = 0;
    reel.forEach((reelItem) => {
        if (i < reel.length - 3) {
            reelItem.remove();
        }
        i++;
    })
    row.animate([{

        transform: "translateY(0%)"
    }], {
        fill: "forwards"
    })
}

function updateUI() {

    balanceOutput.innerHTML = `$${balance.toFixed(2)}`
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
    for (let i = 0; i < results.length; i++) {
        results[i].forEach((slot) => {
            switch (slot) {
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
                case 76:
                    sevens++;
                    break;
                case 100:
                    quickhits++;
                    break;
            }
        })


    }

    checkPaylines(results)

    if (quickhits > 2 && quickhits < 5) {
        amountWon += displayWinningsUI(quickhits, 2)
        winningOutputs.push(`${quickhits} pay good`)
        sounds.playSound(sounds.win)
    } else if (quickhits >= 5 && quickhits < 7) {
        amountWon += displayWinningsUI(quickhits, 5)
    } else if (quickhits >= 7 && quickhits < 12) {
        amountWon += displayWinningsUI(quickhits, 13)
    } else if (quickhits == 12) {
        // JACKPOT
        triggerJackpot();
    }

    // if(bells > 5) {
    // amountWon += displayWinningsUI(bells, 0.01)

    // }

    totalWon += amountWon;



    console.log(`Bells canyon: ${bells}`, `Horseshoes: ${horseShoes}`, `Cherries: ${cherries}`, `Bars: ${bars}`, `Sevens: ${sevens}`, `Quickhits: ${quickhits}`)
    updateUI()
    checkButtons()
}

function animateSmallPayout(pos) {
    let slotRow = document.querySelector("slot-row")
    let reel = document.querySelectorAll(".slot")
    let index = 0;
    reel.forEach((reel) => {
        if (index == pos) {
            reel.style.animation = "bellAnimation 0.5s";
        }
        index++;

        if (index == 3) {
            index = 0;
        }
    })
}

function checkPaylines(results) {
    let i = 0;
    let itemindex = 0;
    console.log(results)
    results.forEach((payline) => {
        // First row
        if (i == 1) {
            payline.forEach((item) => {
                if (item == results[i + 1][itemindex]) {
                    if (validatePayline(results, item, itemindex)) {
                        alert("DOUBLE")
                        payFromSpin.innerHTML = "Double pays 20x";

                        // BAR
                        if(item == 75) {
                            alert("Bars pay 8x multiplier!");
                            amountWon += displayWinningsUI(4, 8);
                        } else {
                            amountWon += displayWinningsUI(4, 2)
                            animateSmallPayout(itemindex)

                        }
                    }
                }
                itemindex++;
            })

        }
        i++;
    })
}

function validatePayline(results, itemToCheck, paylineIndex) {
    let completedCheck = false;
    for (let i = 0; i < results.length; i++) {
        if (results[i][paylineIndex] != itemToCheck) {
            completedCheck = false;
            break;
        } else {
            completedCheck = true
        }
    }
    return completedCheck;
}

function triggerJackpot() {
    slots.style.border = "1px solid green"
    amountWon += 43700;

    payFromSpin.innerHTML = `JACKPOT!`;
    winningsOutput.innerHTML = `$${amountWon}<bR>
    <p style='color: green'><b>JACKPOT!</b></p>`;
    setTimeout(() => {
        alert("JACKPOT!")
    }, 400)
}

function displayWinningsUI(numIcons, prizeMultiplier) {
    let prizeCalc = bet * (numIcons * prizeMultiplier);
    payFromSpin.innerHTML = `Game pays: $${prizeCalc.toFixed(2)}`;
    winningsOutput.innerHTML = `Game pays: $${prizeCalc.toFixed(2)}`;
    amountWon = prizeCalc;
    return amountWon;

}
