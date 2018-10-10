//BUDGET CONTROLLER
var budgetController = (function () {

    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }    
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var data = {
        allItems: {
            exp: [],
            inc:[]
        },

        totals: {
            exp: 0,
            inc: 0
        },

        budget: 0,

        percentage: -1
    };

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        });

        data.totals[type] = sum;
    };

    return {
        addItem: function(type, desc, val) {
            var newItem, ID;
            //Create new ID
            if (data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length-1].id+1;
            } else {
                ID = 0;           
            }   
            //Create new item based on exp or inc type
            if(type === "exp") {
                newItem = new Expense(ID, desc, val);
            } else if (type === "inc") {
                newItem = new Income(ID, desc, val);
            }
            //Push it into the data structure
            data.allItems[type].push(newItem);
            //Return the new element
            return newItem;    
        },

        deleteItem: function (type, id) {
            var ids, index;

            ids = data.allItems[type].map(function (current){
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1); 
            }


            /*
            function(type, Id).... //my solution

            if(data.allItems[type].length > 0){

                for(var i = 0; i < data.allItems[type].length; i++){

                   console.log(data.allItems[type][i]);

                    if(data.allItems[type][i].id === Id){

                        console.log(data.allItems[type][i].id, Id);
                        
                        data.allItems[type].splice(data.allItems[type][i], 1);
                        
                        console.log(data.allItems[type]);
                    }
                }
            }

            */

    
        },

        calculateBudget: function() {

            //Calculate total income and expenses
            calculateTotal("exp");
            calculateTotal("inc");

            //Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //Calculate the percentage of the income that we spent
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp/data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }   
        },

        calculatePercentages: function() {
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function() {
           var allPerc = data.allItems.exp.map(function(cur) {
            return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: function() {
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp,
                percentage: data.percentage
            }
        },

        test: function() {
            return data;
        }

    };

})();






// UI CONTROLLER
var UIController = (function (){

    var DOMstrings = {
        inputType: ".add__type",
        inputDescription: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn",
        incomeContainer: ".income__list",
        expensesContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel:".budget__income--value",
        expensesLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container",
        expensesPercLabel: ".item__percentage",
        dateLabel: ".budget__title--month"
    }

        /* 
        Alternative solution:

            var formatNumber = function(num, type) {
            num = Math.abs(num).toFixed(2);
            num = num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
            return type === 'inc' ? '+ ' + num : '- ' + num;
        };
        */

    var formatNumber = function(num, type) {
        var numSplit, int, dec;
        num = Math.abs(num).toFixed(2);
        numSplit = num.split(".");

        int = numSplit[0];
      if(int.length > 3) {
          int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);

      }

        dec = numSplit[1];

        return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
    };

    var nodeListForEach = function(list, callback) {
        for(var i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    };

    return {
        getinput: function(){
            return {
                type: document.querySelector(DOMstrings.inputType).value, //will be either income or expense
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },

        addListItem: function(obj, type) {
            var html, newHtml, element;

            // Create HTML string with placeholder text
            if(type === "inc") {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if(type === "exp") {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }                    

            // Replace the placeholder text with actual data
            newHtml = html.replace("%id%", obj.id);
            newHtml = newHtml.replace("%description%", obj.description);
            newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
        },

        deleteListItem: function (selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function(){
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ", " + DOMstrings.inputValue);
            //below is the the old method that Jonas used to turn fields into an array in order to iterate though it! 
            //Nowdays we can use forEach on nodeLists (fields is a nodeList) as well (as i did after ;) )
            /*
            fieldsArr = Array.prototype.slice.call(fields);
           fields.forEach(function(current){           //function(current, index, array)
            current.value = "";
           });
           fieldsArr[0].focus();
           */
           fields.forEach(function(current){
            current.value = "";
           });
           fields[0].focus();
        },

        displayBudget: function(obj) {
            obj.budget > 0 ? type = "inc" : type = "exp";

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalIncome, "inc");
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExpenses, "exp");
            
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = "---";
            }
        },

        displayPercentages: function(percentages) {
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, function(current, index){
                if(percentages[index] > 0) {
                    current.textContent = percentages[index] + "%";
                } else {
                    current.textContent = "---";
                }
                
            });

            /* 
                var nodeListForEach = function(list, callback) {
                    for(var i = 0; i < list.length; i++){
                    callback(list[i], i);
        }
    };
            */
        },

        displayMonth: function() {
            var now, months, month, year;
            now = new Date();
            months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + " " + year;
        },

        changedType: function() {
            var fields = document.querySelectorAll(DOMstrings.inputType + "," + DOMstrings.inputDescription + "," + DOMstrings.inputValue);
            nodeListForEach(fields, function(cur) {
                cur.classList.toggle("red-focus");
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle("red");
        },

        getDOMstrings: function() {
            return DOMstrings;
        }
    };

})();






//GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListeners = function () {
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);
        document.addEventListener("keypress", function(eventobj){
            if(eventobj.key === 13 || eventobj.which === 13) {
                //eventobj.preventDefault(); // prevents the enter key from also triggering a click event
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changedType);
    }

    var updateBudget = function(){
        
        //1.Calculate the budget
        budgetCtrl.calculateBudget();

        //2. Return the budget
        var budget = budgetCtrl.getBudget();

        //3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function () {
        //1. Calculate percentages
        budgetCtrl.calculatePercentages();

        //2. Read the percentages from the budget controler
        var percentages = budgetCtrl.getPercentages();

        //3. Update the UI with the nw percentages
        UICtrl.displayPercentages(percentages);

    };

    var ctrlAddItem = function() {
        var input, newItem;
        //1.Get the field input data
        input = UICtrl.getinput();  

        if (input.description !== "" && !isNaN(input.value) && input.value > 0){
            //2.Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3.Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            //4.Clear the value fields
            UICtrl.clearFields();

            //5. Calculate and update budget
            updateBudget();

            //6. Calculate and Update percentages
            updatePercentages();
        }
    };

    var ctrlDeleteItem = function(eventobj) {
        var itemID, splitID, type, ID;
        //itemID = eventobj.target.parentNode.parentNode.parentNode.parentNode.id; //Jonas' hardcoded version
        itemID = eventobj.target.closest(".item").id;
        
        if (itemID) {
            splitID = itemID.split("-");
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1. Delete item from the data
            budgetCtrl.deleteItem(type, ID);

            //2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);

            //3. Update and show new budget
            updateBudget();

            //4. Calculate and Update percentages
            updatePercentages();
        }
    };

    return {
        init: function() {
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpenses: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };

})(budgetController, UIController);

controller.init();





///////////////////////////////////////////////////////////////
/*
(function game () {

    function Question(question, answers, correct) {
        this.question = question;
        this.answers = answers;
        this.correct = correct;
    }

    Question.prototype.displayQuestion = function (){
        console.log(this.question);
        for (var i = 0; i < this.answers.length; i++){
            console.log(i + ": " + this.answers[i]);
        }
    }

    Question.prototype.checkAnswer = function(){ 
        if (this.answers[Number(ask)] === this.correct){
            console.log("Congrats, you have guessed the right answer! :)");
            score +=1;
        } else {
            console.log("Sorry, your answer is incorrect... Try again! ;(");
        }
        console.log("Your current score is " + score);
        console.log("-------------------------------------------------------");
    }

    var q1 = new Question("What is the color of the sky?", ["Yellow", "Red", "Blue"], "Blue");
    var q2 = new Question("What is the name of the course instructor?", ["Mike", "Harvey", "Louis", "Jonas"], "Jonas");
    var q3 = new Question("WHat is the color of the sun?", ["Brown", "Yellow", "Blue"], "Yellow");
    var q4 = new Question("Which day is today?", ["Monday", "Sunday", "Friday"], "Friday");
    
    var questions = [q1, q2, q3, q4];

    var score = 0;

    var playGame = true;
    
    function random (){
        return Math.floor(Math.random() * questions.length);
    }

    var num = random();

    questions[num].displayQuestion();

    function askQuestion () {
        var askQ = prompt("Guess the raight answer by inserting its index number ;)");
        return askQ;
    }
        
    var ask = askQuestion();
        
    function checkingAskAnswer() {
        if(ask === "exit") {
            playGame = false;
            console.log("Thank you for playing! Your final score is " + score + "!");
        } else {
            questions[num].checkAnswer();
        }
    }

    checkingAskAnswer();
    playing();

    
    function playing() {
        if(playGame) {
            num = random();
            questions[num].displayQuestion();
            ask = askQuestion();
            checkingAskAnswer();
            playing();
        }
    }


})();
*/

var a = 2;

(function IIFE (def){
    def(window);
})(function def(global){
    var a = 3;
    console.log(a);
    console.log(global.a);
});

console.log("------------------");

(function IIFE(global){
    (function (global){
        var a = 3;
        console.log(a);
        console.log(global.a);
    })(global);
})(window);

console.log("------------------");

(function IIFE(global){
    function def (){
        var a = 3;
        console.log(a);
        console.log(global.a);
    }
    def();
})(window);

console.log("------------------");
/*
function() {
    var allPerc = data.allItems.exp.map(function(cur) {
     return cur.getPercentage();
     });
     return allPerc;
 }
 */




 function map (obj, callback){
     var arr = [];
    for(var i = 0; i < obj.length; i++){
        arr.push(callback(obj[i], i));
    }
    return arr;
 }




 function myForEach (list, callback){
    for(var i = 0; i < list.length; i++){
        callback(list[i], i);
    }
 }