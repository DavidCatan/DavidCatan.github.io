'use strict';
/*
    updated to battle cats ver 14.5
    ---------------------------------------
    Data to add:
    
*/

// show elements on page open, maybe makes loading a bit smoother artificially
document.getElementById("hintDiv").style.display="block";
document.getElementById("inputDiv").style.display="flex";
document.getElementById("logo").style.display="block";
document.getElementById("rulesDiv").style.display="block";



var nameSource = new Array(); // source of names
var nameSet = new Set(); // set of names to check guesses with

var catData;
var randomCat;

const submitText = document.getElementById("submitBtn");
const inputText = document.getElementById("catInput");
const descHint = document.getElementById("descHint");
const imgHint = document.getElementById("imgHint");
const rulesBtn = document.getElementById("rulesBtn");
const okBtn = document.getElementById("okBtn");
const blurredAnswer = document.getElementById("blurredAnswer");
const newCatBtn = document.getElementById("newCatBtn");

var table = document.getElementById("table"); 
var inputDiv = document.getElementById("inputDiv");
var desc = document.getElementById("desc");
var popup = document.getElementById("popup");
var blackout = document.getElementById("blackout");


submitText.addEventListener('click', getInput);
descHint.addEventListener('click', showDescHint);
imgHint.addEventListener('click', showImgHint);
rulesBtn.addEventListener('click', showRules);
okBtn.addEventListener('click', hideRules);
newCatBtn.addEventListener('click', reset);

const ROW_SIZE = 7;
const CELL_WIDTH = 80;
const DESC_HINT_GUESSES = 4;
const IMG_HINT_GUESSES = 6;

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
var imgHidden = true;
var descActive = false;
var imgActive = false;

const orange = window.getComputedStyle(document.body).getPropertyValue('--orange');
const lightOrange = window.getComputedStyle(document.body).getPropertyValue('--lightOrange');


//await sleep(500); 

inputText.type = "text";
submitText.type = "submit";

/*if (localStorage.getItem("table") != null){
    table.innerHTML = localStorage.getItem("table");
}

$(table).fadeIn(1000); // fade in table for smooth loading*/

/*if(localStorage.getItem("win") == "true"){
    endScreen();
}*/

await fetch('catList.json')
    .then(response => response.json())
    .then(catList => {
        catData = catList.cats;
        for (const key in catData){
            nameSource.push(catData[key].data.name);
            nameSet.add(catData[key].data.name);
        }
        if(localStorage.getItem("guesses") == null){
            randomCat = nameSource[Math.floor(Math.random() * nameSource.length)];
            localStorage.setItem("answer", randomCat);
        }
        else{
            randomCat = localStorage.getItem("answer");
        }
    })
    .catch(error => {
        alert(error + "\nThere was an error in fetching data for " + randomCat + ". Please refresh the page and try again");
        localStorage.clear();
});

if(localStorage.getItem("guesses") != null){
    JSON.parse(localStorage.getItem("guesses")).forEach(
        (guess) => {
            guesses.add(guess);
            numGuesses++;
            updateTable(guess); //update table with previous guessses
        }
    );
}

updateHints();  



/*const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};*/

// remove guess from autocomplete
if(localStorage.getItem("guesses") != null){
    JSON.parse(localStorage.getItem("guesses")).forEach(
        (guess) => {
            nameSource.splice(nameSource.indexOf(guess),1);
            $("#autocomplete").autocomplete("option", "source", nameSource);

        }
    );
}


// encrypt descrytion
let description = catData[randomCat].data.description; 
description = encryptDescription(description);
desc.value = description; // add desc


// enter data when pressing enter
inputText.onkeyup = function(e){
    if(e.keyCode == 13){
        getInput();
    }
};

// show description if it is not currently shown and guess threshold is met
function showDescHint(){
    if(descHidden && descActive){ 
        desc.style.display = "block";
        descHint.value = "Description";
        descHidden = false;
        if(!imgHidden){showImgHint();}  
    }
    else if(descActive){
        descHint.value = "Description \n (click to reveal)";
        desc.style.display = "none";
        descHidden = true;
    }
}

// show image if it is not currently shown and guess threshold is met
function showImgHint(){
    if(imgHidden && imgActive){ 
        imgHint.value = "Blurred Image";
        imgHidden = false;
        blurredAnswer.src = "images/" + randomCat + ".webp";
        if(!descHidden){showDescHint();}  
    }
    else if(imgActive){
        imgHint.value = "Blurred Image \n (click to reveal)";
        blurredAnswer.src = "";
        imgHidden = true;
    }
}

function showRules(){
    $(popup).fadeIn();
    blackout.style.display = "block";
}

function hideRules(){
    $(popup).fadeOut();
    blackout.style.display = "none";
}

/*function saveTable(){
    if (localStorage.getItem("guesses") != null){
        localStorage.setItem("table",table.innerHTML);
    }
}*/

function reset() {
    window.location.reload();
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
    //saveTable();
    inputText.value='';
    // remove guess from autocomplete
    nameSource.splice(nameSource.indexOf(guess),1);
    $("#autocomplete").autocomplete("option", "source", nameSource);
    
    if (guess == randomCat){
        if (numGuesses == 1){
            alert("Amazing! Stupdendous! You got the correct answer in only 1 guess");
        }
        else{
            alert("You win! It took you " + numGuesses + " guesses"); // if in 1 guess: amazing! stupendous!
        }
        localStorage.setItem("win",true);
        endScreen();
    }
    updateHints();
}

function updateHints(){
    if(localStorage.getItem("win") != "true"){
        let threshold = DESC_HINT_GUESSES - numGuesses;
        let guessPlural = threshold==0 ? "guess" :"guesses";
        if (threshold >= 0){
            descHint.value = "Description \n in " + (threshold + 1) + " " + guessPlural;
        }
        else{
            descHint.value = "Description \n (click to reveal)";
            descHint.style.backgroundImage = `linear-gradient(${lightOrange},${orange})`;
            descHint.style.color = "white";
            descActive = true;
        }

        threshold = IMG_HINT_GUESSES - numGuesses;
        guessPlural = threshold==0 ? "guess" :"guesses";
        if (threshold >= 0){
            imgHint.value = "Blurred Image \n in " + (threshold + 1) + " " + guessPlural;
        }
        else{
            imgHint.value = "Blurred Image \n (click to reveal)";
            imgHint.style.backgroundImage = `linear-gradient(${lightOrange},${orange})`;
            imgHint.style.color = "white";
            imgActive = true;
        }
    }
    else{
         descHint.value = "Description \n (click to reveal)";
         imgHint.value = "Blurred Image \n (click to reveal)";
    }
   
}

function updateTable(guess) { 

    let row = table.insertRow(1);
    let cells = new Array(ROW_SIZE);
    let cell1 = row.insertCell();

    // fill rest of new row with cells
    for(let i = 0; i < ROW_SIZE; i++){
        cells[i] = row.insertCell();
        cells[i].style.border = "3px solid black";
        cells[i].style.textAlign = "center";
    }
    
   
    $(cells).fadeOut(1);
    $(cells).fadeIn(500);
    $(cell1).fadeOut(1);
    $(cell1).fadeIn(700);

    /*
        cat image
    */
    let catImg = document.createElement('img');
    catImg.src = "images/" + guess + ".webp";
    catImg.alt = guess;
    catImg.style.width = "70%";
    catImg.style.display = "block";
    catImg.style.margin = "0 auto";
    cell1.appendChild(catImg);

    /*
        rarity
    */
    cells[0].innerHTML = catData[guess].data.rarity;
    rarityClue = getRarityClue(catData[guess].data.rarity, catData[randomCat].data.rarity);
    if (rarityClue){
        animateGreen(cells[0]);
    }
    else {
        animateRed(cells[0]);
    }

    

    /*
        cost
    */
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

    /*
        range
    */
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

    /*
        target
    */
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

    /*
        trait
    */
    for (let i = 0; i < catData[guess].data.trait.length; i++){
        let traitImg = document.createElement('img');
        traitImg.src = "images/" + catData[guess].data.trait[i] + ".webp"; 
        traitImg.alt = catData[guess].data.trait[i];
        traitImg.style.display = "in-line block";
        traitImg.style.margin = "0 auto";
        traitImg.style.width = "20%";
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

    /*
        ability
    */
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

    /*
        Form
    */ 
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

// check for same traits/abilities
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

// remove input and update hint buttons on win
function endScreen() {
    inputDiv.remove();
    descActive = true;
    imgActive = true;
    newCatBtn.type = "button";
    descHint.style.backgroundImage = `linear-gradient(${lightOrange},${orange})`;
    descHint.style.color = "white";
    imgHint.style.backgroundImage = `linear-gradient(${lightOrange},${orange})`;
    imgHint.style.color = "white";
    localStorage.clear();
}

// make every word with more than two letters have dashes for characters past 2nd letter
function encryptDescription(str){
    return str.replace(/(?<=\w{2})[^\s!%&'",.?()]/g, "-");
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


/*
    animate colors
*/

function animateGreen(cell){
    $( cell ).animate({
        backgroundColor: "green",
        width: CELL_WIDTH
      }, 1000 );
    //cell.style.backgroundColor = "green";
}

function animateRed(cell){
    $( cell ).animate({
        backgroundColor: "red",
        width: CELL_WIDTH
      }, 1000 );
    //cell.style.backgroundColor = "red";
}

function animateYellow(cell){
    $( cell ).animate({
        backgroundColor: "yellow",
        width: CELL_WIDTH
      }, 1000 );
    //cell.style.backgroundColor = "yellow";
}




