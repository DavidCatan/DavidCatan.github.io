var nameSource = new Array(); // source of names
var nameSet = new Set(); // set of names to check guesses with

var catData;
var randomCat;

await fetch('catList.json')
    .then(response => response.json())
    .then(catList => {
        catData = catList.cats;
        for (const key in catData){
            nameSource.push(catData[key].data.name);
            nameSet.add(catData[key].data.name);
        }
        randomCat = nameSource[Math.floor(Math.random() * nameSource.length)];
    })
    .catch(error => {
        alert(error + "\nThere was an error in fetching data for " + randomCat + ". Please refresh the page and try again");
        localStorage.clear();
});

const submitText = document.getElementById("submitBtn");
const inputText = document.getElementById("catInput");
const descHint = document.getElementById("descHint");
const rulesBtn = document.getElementById("rulesBtn");
const okBtn = document.getElementById("okBtn");
const newCatBtn = document.getElementById("newCatBtn");

var desc = document.getElementById("desc");
var popup = document.getElementById("popup");
var table = document.getElementById("table"); 
var remainingTime = document.getElementById("time");


submitText.addEventListener('click', getInput);
descHint.addEventListener('click', showHint);
rulesBtn.addEventListener('click', showRules);
okBtn.addEventListener('click', hideRules);
newCatBtn.addEventListener('click', reset);

const ROW_SIZE = 7;
const CELL_WIDTH = 80;
const HINT_GUESSES = 7;

var rarityClue;
var costClue;
var rangeClue;
var targetClue;
var traitClue;
var abilityClue;
var formClue;

var guess;
var numGuesses = 0;
var guesses = new Set();
var descHidden = true;
var media = window.matchMedia("(max-width: 480px)");

if(localStorage.getItem("guesses") == null){
    localStorage.setItem("answer", randomCat);
}

randomCat = localStorage.getItem("answer"); // keep same answer after page refresh

// local storage restoring page
if(localStorage.getItem("guesses") != null){
    JSON.parse(localStorage.getItem("guesses")).forEach(
        (guess) => {
            guesses.add(guess);
            numGuesses++;
            updateTable(guess); //update table with previous guessses
            if(numGuesses > HINT_GUESSES){
                descHint.type = "button";
             } 
        }
    );
    // show end screen if player loads in after winning
    if(localStorage.getItem("guesses").includes(randomCat)){
        endScreen();
    }
}

desc.value = catData[randomCat].data.description; // add desc

// enter data when pressing enter
inputText.onkeyup = function(e){
    if(e.keyCode == 13){
        getInput();
    }
};

function showHint(){
    if(descHidden){
        desc.style.display = "block";
        descHint.value = "Description";
        descHidden = false;
    }
    else{
        descHint.value = "Description click to reveal";
        desc.style.display = "none";
        descHidden = true;
    }
}

function showRules(){
    popup.style.display = "block";
}

function hideRules(){
    popup.style.display = "none";
}


function getInput() {
    guess = inputText.value;
    // check if guess was already made
    if (!nameSet.has(guess) || guesses.has(guess)){
        return;
    }
    guesses.add(guess);
    localStorage.setItem("guesses", (JSON.stringify(Array.from(guesses))));
    numGuesses++;
    updateTable(guess);
    inputText.value='';
    if (guess == randomCat){
        if (numGuesses == 1){
            alert("Amazing! Stupdendous! You got the correct answer in only 1 guess");
        }
        else{
            alert("You win! It took you " + numGuesses + " guesses"); 
        }
        endScreen();
    }
    if(numGuesses > 6){
       descHint.type = "button";
    }
}



function updateTable(guess) { 
    let row = table.insertRow(1);
    let cells = new Array(ROW_SIZE);
    let cell1 = row.insertCell();

    for(let i = 0; i < ROW_SIZE; i++){
        cells[i] = row.insertCell();
        cells[i].style.border = "3px solid black";
        cells[i].style.textAlign = "center";
    }
    
    $(cell1).fadeOut(1);
    $(cell1).fadeIn(700);
    $(cells).fadeOut(1);
    $(cells).fadeIn(500);

    // cat image
    try {
        let catImg = document.createElement('img');
        catImg.src = "images/" + guess + ".webp";
        catImg.alt = guess;
        catImg.style.width = "70%";
        catImg.style.display = "block";
        catImg.style.margin = "0 auto";
        cell1.appendChild(catImg);
    }
    catch{
        alert("There was an error fetching image data for " + guess);
    }


    

    // rarity
    try{
        cells[0].innerHTML = catData[guess].data.rarity;
        rarityClue = getRarityClue(catData[guess].data.rarity, catData[randomCat].data.rarity);
        if (rarityClue){
            animateGreen(cells[0]);
        }
        else {
            animateRed(cells[0]);
        }
    }
    catch{
        alert("There was an error fetching rarity data for " + guess);
    }
    
    // cost
    try{
        cells[1].innerHTML = catData[guess].data.cost + "¢";
        costClue = getCostClue(catData[guess].data.cost, catData[randomCat].data.cost);

        if (costClue > 0){
            animateRed(cells[1]);
            cells[1].innerHTML += " ↑";

        }
        else if (costClue < 0){
            animateRed(cells[1]);
            cells[1].innerHTML += " ↓";
        }
        else{
            animateGreen(cells[1]);
        }
    }
    catch{
        alert("There was an error fetching cost data for " + guess);
    }

    // range
    try{
        cells[2].innerHTML = catData[guess].data.range;
        rangeClue = getRangeClue(catData[guess].data.range, catData[randomCat].data.range)
        if (rangeClue > 0){
            animateRed(cells[2]);

            cells[2].innerHTML += " ↑";
        }
        else if (rangeClue < 0){
            animateRed(cells[2]);
            cells[2].innerHTML += " ↓";
        }
        else{
            animateGreen(cells[2]);
        }
    }
    catch{
        alert("There was an error fetching range data for " + guess);
    }
    

    // target
    try{
        let targetImg = document.createElement('img');
        targetImg.src = "images/" + catData[guess].data.target + ".webp"; 
        targetImg.alt = catData[guess].data.target;
        targetImg.style.width = "fit-contents";
        targetImg.style.display = "block";
        targetImg.style.margin = "0 auto";
        cells[3].appendChild(targetImg);

        targetClue = getTargetClue(catData[guess].data.target, catData[randomCat].data.target)
        if (targetClue){
        animateGreen(cells[3]);
        }
        else{
            animateRed(cells[3]);
        }
    }
    catch{
        alert("There was an error fetching target data for " + guess);
    }

    // trait
    try{
        for (let i = 0; i < catData[guess].data.trait.length; i++){
            let traitImg = document.createElement('img');
            traitImg.src = "images/" + catData[guess].data.trait[i] + ".webp"; 
            traitImg.alt = catData[guess].data.trait[i];
            traitImg.style.display = "in-line block";
            traitImg.style.margin = "0 auto";
            cells[4].appendChild(traitImg);
        }

        traitClue = getTraitClue(catData[guess].data.trait, catData[randomCat].data.trait);
        if (traitClue == "complete"){
            animateGreen(cells[4]);
        }
        else if (traitClue == "partial"){
            animateYellow(cells[4]);
        }
        else{
            animateRed(cells[4]);
        }
    }
    catch{
        alert("There was an error fetching trait data for " + guess);
    }

    // ability
    try{
        for (let i = 0; i < catData[guess].data.ability.length; i++){
            let abilityImg = document.createElement('img');
            abilityImg.src = "images/" + catData[guess].data.ability[i] + ".webp"; 
            abilityImg.alt = catData[guess].data.ability[i];
            abilityImg.style.width = "fit-contents";
            abilityImg.style.display = "in-line block"; 
            abilityImg.style.margin = "0 auto";
            cells[5].appendChild(abilityImg);
        }
    
        abilityClue = getAbilityClue(catData[guess].data.ability, catData[randomCat].data.ability);
        if (abilityClue == "complete"){
        animateGreen(cells[5]);
        }
        else if (abilityClue == "partial"){
            animateYellow(cells[5]);
        }
        else{
            animateRed(cells[5]);
        }
    }
    catch{
        alert("There was an error fetching ability data for " + guess);
    }

    // Form
    try{
        cells[6].innerHTML = catData[guess].data.form;
        formClue = getFormClue(catData[guess].data.form, catData[randomCat].data.form);
        if (formClue){
            animateGreen(cells[6]);
        }
        else {
            animateRed(cells[6]);
        }
    }
    catch{
        alert("There was an error fetching form data for " + guess);
    }
}

// clues
function getRarityClue(key, other) {
    return key==other;
}

function getCostClue(key, other) {
    return compareNum(key, other);
}

function getRangeClue(key, other) {
    return compareNum(key, other);  
}

function getTargetClue(key, other) {
    return key==other;
}

function getTraitClue(key, other) {
    return compareArray(key, other);
}

function getAbilityClue(key, other){
    return compareArray(key, other);
}

function getFormClue(key, other){
    return key==other
}

function compareNum(key, other){
    if (key > other) {
        return -1; // lower
    }
    else if (key < other){
        return 1; // higher
    }
    return 0; // correct
}

function compareArray(key, other){
    let complete = key.length == other.length;
    let partial = false;
    let set = new Set();

    for (let i = 0; i < other.length; i++){
        set.add(other[i]);
    }

    for (let i = 0; i < key.length; i++){
        if (set.has(key[i])){
            partial = true;
        }
        else{
            complete = false;
        }
    }

    if (complete){
        return "complete";
    }
    if (partial){
        return "partial";
    }
    return "None";
}

function reset() {
    window.location.reload();
}

function endScreen() {
    let inputDiv = document.getElementById("inputDiv");
    inputDiv.remove();
    newCatBtn.type = "button";
    descHint.style.display = "none";
    if (descHidden){
        desc.style.display = "block";
        descHint.value = "Description";
    }
    localStorage.removeItem("guesses");
}


// autocomplete
$( function() {
    $( "#catInput" ).autocomplete({
        source: function(request, response) { // limit max number of autocomplete options
            var results = $.ui.autocomplete.filter(nameSource, request.term);
    
            response(results.slice(0, 30));
        },
        position: {
            my: "left+0 top+10",
        }
    });
});

// animate colors

function animateGreen(cell){
    $( cell ).animate({
        backgroundColor: "green",
        width: CELL_WIDTH
      }, 1000 );
}

function animateRed(cell){
    $( cell ).animate({
        backgroundColor: "red",
        width: CELL_WIDTH
      }, 1000 );
}

function animateYellow(cell){
    $( cell ).animate({
        backgroundColor: "yellow",
        width: CELL_WIDTH
      }, 1000 );
}