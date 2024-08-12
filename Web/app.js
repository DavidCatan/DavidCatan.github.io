'use strict';
/*
    Add win screen, update page accordingly -> pretty much done
    animation to coloring -> pretty much done
    check json vs javascript storage for cats
    ---------------------------------------
    Data to add:

*/
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
        console.log("catData...Done");
        console.log(randomCat);
        console.log(nameSource.length);
    })
    .catch(error => {
        console.error('Error:', error);
});

const submitText = document.getElementById("submitBtn");
const inputText = document.getElementById("catInput");
const descHint = document.getElementById("descHint");
const rulesBtn = document.getElementById("rulesBtn");
const okBtn = document.getElementById("okBtn");
var desc = document.getElementById("desc");
var popup = document.getElementById("popup");
var table = document.getElementById("table"); 
var remainingTime = document.getElementById("time");

desc.value = catData[randomCat].data.description; // add desc

submitText.addEventListener('click', getInput);
descHint.addEventListener('click', showHint);
rulesBtn.addEventListener('click', showRules);
okBtn.addEventListener('click', hideRules);

const ROW_SIZE = 7;
const CELL_WIDTH = 80;

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


//sessionStorage.removeItem("guesses");
console.log(JSON.parse(sessionStorage.getItem("guesses")));

// local storage restoring page
if(sessionStorage.getItem("guesses") != null){
    JSON.parse(sessionStorage.getItem("guesses")).forEach(
        (guess) => {
            guesses.add(guess);
            numGuesses++;
            updateTable(guess); //update table with previous guessses
            if(numGuesses > 1){
                descHint.type = "button";
             } 
        }
    );
    // show end screen if player loads in after winning
    if(sessionStorage.getItem("guesses").includes(randomCat)){
        endScreen();
    }
}

console.log(guesses);

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
    sessionStorage.setItem("guesses", (JSON.stringify(Array.from(guesses))));
    numGuesses++;
    updateTable(guess);
    inputText.value='';
    if (guess == randomCat){
        if (numGuesses == 1){
            alert("Amazing! Stupdendous! You got the correct answer in only 1 guess");
        }
        else{
            alert("You win! It took you " + numGuesses + " guesses"); // if in 1 guess: amazing! stupendous!
        }
        endScreen();
    }
    if(numGuesses > 1){
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
    let catImg = document.createElement('img');
    catImg.src = "images/" + guess + ".webp";
    catImg.alt = guess;
    catImg.style.width = "70%";
    catImg.style.display = "block";
    catImg.style.margin = "0 auto";
    cell1.appendChild(catImg);

    // rarity
    cells[0].innerHTML = catData[guess].data.rarity;
    rarityClue = getRarityClue(catData[guess].data.rarity, catData[randomCat].data.rarity);
    if (rarityClue){
        animateGreen(cells[0]);
    }
    else {
        animateRed(cells[0]);
    }

    

    // cost
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

    // range
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

    // target
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

    // trait
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

    // ability
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

    // Form
    cells[6].innerHTML = catData[guess].data.form;
    formClue = getFormClue(catData[guess].data.form, catData[randomCat].data.form);
    if (formClue){
        animateGreen(cells[6]);
    }
    else {
        animateRed(cells[6]);
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

function endScreen() {
    let inputDiv = document.getElementById("inputDiv");
    inputDiv.remove();
    sessionStorage.removeItem("guesses");
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