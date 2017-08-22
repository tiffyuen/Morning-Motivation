"use strict";
var APP_ID = undefined;  // TODO replace with your app ID (OPTIONAL).

var ANSWER_COUNT = 4; // The number of possible answers per trivia question.
//var GAME_LENGTH = 5;  // The number of questions per trivia game.
var QUOTE_STATES = {
    APP: "_APPMODE", // Asking trivia questions.
    START: "_STARTMODE", // Entry point, start the game.
    HELP: "_HELPMODE" // The user is asking for help.
};
var quotes = require("./quotes");

/**
 * When editing your questions pay attention to your punctuation. Make sure you use question marks or periods.
 * Make sure the first answer is the correct one. Set at least ANSWER_COUNT answers, any extras will be shuffled in.
 */
var languageString = {
    "en": {
        "translation": {
            "QUOTES" : quotes["QUOTES_EN_US"],
            "APP_NAME" : "Morning Alexa", // Be sure to change this for your skill.
            "HELP_MESSAGE": "This app aims to provide motivation for the start of your day!",
            "REPEAT_QUOTE_MESSAGE": "To repeat the quote, say, repeat. ",
            "ASK_MESSAGE_START": "Would you like to listen to the quote of the day?",
            "HELP_REPROMPT": "This app aims to provide motivation for the start of your day!",
            "STOP_MESSAGE": "Would you like another quote?",
            "CANCEL_MESSAGE": "Ok, have a great morning. Goodbye!",
            "NO_MESSAGE": "Ok, have a great morning. Goodbye!",
            "HELP_UNHANDLED": "Say yes for another quote, or no to exit the app.",
            "START_UNHANDLED": "Would you like some motivation for the start of the day?",
            "NEW_GAME_MESSAGE": "Welcome to %s. ",
            "WELCOME_MESSAGE": "Morning! No matter how bad things are, you can at least be happy that you work up this morning -- D.L. Hughley."
            "TRIVIA_UNHANDLED": "Would you like another motivational quote for the start of the day?",
            //"ANSWER_CORRECT_MESSAGE": "correct. ",
            //"ANSWER_WRONG_MESSAGE": "wrong. ",
            //"CORRECT_ANSWER_MESSAGE": "The correct answer is %s: %s. ",
            //"ANSWER_IS_MESSAGE": "That answer is ",
            //"TELL_QUESTION_MESSAGE": "Question %s. %s ",
            //"GAME_OVER_MESSAGE": "You got %s out of %s questions correct. Thank you for playing!",
            //"SCORE_IS_MESSAGE": "Your score is %s. "
        }
    },
    "en-US": {
        "translation": {
            "QUESTIONS" : quotes["QUOTES_EN"],
            "GAME_NAME" : "Morning Alexa" // Be sure to change this for your skill.
        }
    },
    "en-GB": {
        "translation": {
            "QUESTIONS" : quotes["QUOTES_EN"],
            "GAME_NAME" : "Morning Alexa" // Be sure to change this for your skill.
        }
    }
};

var Alexa = require("alexa-sdk");
var APP_ID = undefined;  // TODO replace with your app ID (OPTIONAL).

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    // To enable string internationalization (i18n) features, set a resources object.
    alexa.resources = languageString;
    alexa.registerHandlers(newSessionHandlers, startStateHandlers, triviaStateHandlers, helpStateHandlers);
    alexa.execute();
};

var newSessionHandlers = {
    "LaunchRequest": function () {
        this.handler.state = QUOTE_STATES.START;
        this.emitWithState("StartApp", true);
    },
    "AMAZON.StartOverIntent": function() {
        this.handler.state = QUOTE_STATES.START;
        this.emitWithState("StartApp", true);
    },
    "AMAZON.HelpIntent": function() {
        this.handler.state = QUOTE_STATES.HELP;
        this.emitWithState("helpTheUser", true);
    },
    "Unhandled": function () {
        var speechOutput = this.t("START_UNHANDLED"); // Would you like some motivation for the start of the day?
        this.emit(":ask", speechOutput, speechOutput);
    }
};

var startStateHandlers = Alexa.CreateStateHandler(QUOTE_STATES.START, {
    "StartApp": function (newDay) {
        var speechOutput = newDay ? this.t("NEW_DAY_MESSAGE", this.t("APP_NAME")) + this.t("WELCOME_MESSAGE") : "";
        // Select GAME_LENGTH questions for the game
        var translatedQuestions = this.t("QUOTES");
        var gameQuestions = populateGameQuestions(translatedQuestions);
        // Generate a random index for the correct answer, from 0 to 3
        //var correctAnswerIndex = Math.floor(Math.random() * (ANSWER_COUNT));
        // Select and shuffle the answers for each question
        //var roundAnswers = populateRoundAnswers(gameQuestions, 0, correctAnswerIndex, translatedQuestions);
        var currentQuestionIndex = 0;
        var spokenQuestion = Object.keys(translatedQuestions[gameQuestions[currentQuestionIndex]])[0];
        var repromptText = this.t("TELL_QUESTION_MESSAGE", "1", spokenQuestion);

        /*for (var i = 0; i < ANSWER_COUNT; i++) {
            repromptText += (i+1).toString() + ". " + roundAnswers[i] + ". ";
        }*/

        speechOutput += repromptText;
        
        // Trivia answers options
        /*Object.assign(this.attributes, {
            "speechOutput": repromptText,
            "repromptText": repromptText,
            "currentQuesti onIndex": currentQuestionIndex,
            "correctAnswerIndex": correctAnswerIndex + 1,
            "questions": gameQuestions,
            "score": 0,
            "correctAnswerText": translatedQuestions[gameQuestions[currentQuestionIndex]][Object.keys(translatedQuestions[gameQuestions[currentQuestionIndex]])[0]][0]
        });*/

        // Set the current state to trivia mode. The skill will now use handlers defined in triviaStateHandlers
        this.handler.state = QUOTE_STATES.APP;
        this.emit(":askWithCard", speechOutput, repromptText, this.t("APP_NAME"), repromptText);
    }
});

var triviaStateHandlers = Alexa.CreateStateHandler(QUOTE_STATES.APP, {
    /*"AnswerIntent": function () {
        handleUserGuess.call(this, false);
    },
    "DontKnowIntent": function () {
        handleUserGuess.call(this, true);
    },*/
    "AMAZON.StartOverIntent": function () {
        this.handler.state = GAME_STATES.START;
        this.emitWithState("StartGame", false);
    },
    "AMAZON.RepeatIntent": function () {
        this.emit(":ask", this.attributes["speechOutput"], this.attributes["repromptText"]);
    },
    "AMAZON.HelpIntent": function () {
        this.handler.state = GAME_STATES.HELP;
        this.emitWithState("helpTheUser", false);
    },
    "AMAZON.StopIntent": function () {
        this.handler.state = GAME_STATES.HELP;
        var speechOutput = this.t("STOP_MESSAGE");
        this.emit(":ask", speechOutput, speechOutput);
    },
    "AMAZON.CancelIntent": function () {
        this.emit(":tell", this.t("CANCEL_MESSAGE"));
    },
    "Unhandled": function () {
        var speechOutput = this.t("TRIVIA_UNHANDLED", ANSWER_COUNT.toString());
        this.emit(":ask", speechOutput, speechOutput);
    },
    "SessionEndedRequest": function () {
        console.log("Session ended in Morning Alexa state: " + this.event.request.reason);
    }
});

var helpStateHandlers = Alexa.CreateStateHandler(GAME_STATES.HELP, {
    "helpTheUser": function (newGame) {
        var askMessage = newGame ? this.t("ASK_MESSAGE_START") : this.t("REPEAT_QUESTION_MESSAGE") + this.t("STOP_MESSAGE");
        var speechOutput = this.t("HELP_MESSAGE", GAME_LENGTH) + askMessage;
        var repromptText = this.t("HELP_REPROMPT") + askMessage;
        this.emit(":ask", speechOutput, repromptText);
    },
    "AMAZON.StartOverIntent": function () {
        this.handler.state = GAME_STATES.START;
        this.emitWithState("StartGame", false);
    },
    "AMAZON.RepeatIntent": function () {
        var newGame = (this.attributes["speechOutput"] && this.attributes["repromptText"]) ? false : true;
        this.emitWithState("helpTheUser", newGame);
    },
    "AMAZON.HelpIntent": function() {
        var newGame = (this.attributes["speechOutput"] && this.attributes["repromptText"]) ? false : true;
        this.emitWithState("helpTheUser", newGame);
    },
    "AMAZON.YesIntent": function() {
        if (this.attributes["speechOutput"] && this.attributes["repromptText"]) {
            this.handler.state = GAME_STATES.TRIVIA;
            this.emitWithState("AMAZON.RepeatIntent");
        } else {
            this.handler.state = GAME_STATES.START;
            this.emitWithState("StartGame", false);
        }
    },
    "AMAZON.NoIntent": function() {
        var speechOutput = this.t("NO_MESSAGE");
        this.emit(":tell", speechOutput);
    },
    "AMAZON.StopIntent": function () {
        var speechOutput = this.t("STOP_MESSAGE");
        this.emit(":ask", speechOutput, speechOutput);
    },
    "AMAZON.CancelIntent": function () {
        this.emit(":tell", this.t("CANCEL_MESSAGE"));
    },
    "Unhandled": function () {
        var speechOutput = this.t("HELP_UNHANDLED");
        this.emit(":ask", speechOutput, speechOutput);
    },
    "SessionEndedRequest": function () {
        console.log("Session ended in help state: " + this.event.request.reason);
    }
});

function handleUserGuess(userGaveUp) {
    //var answerSlotValid = isAnswerSlotValid(this.event.request.intent);
    var speechOutput = "";
    var speechOutputAnalysis = "";
    var gameQuestions = this.attributes.questions;
    var correctAnswerIndex = parseInt(this.attributes.correctAnswerIndex);
    var currentScore = parseInt(this.attributes.score);
    var currentQuestionIndex = parseInt(this.attributes.currentQuestionIndex);
    var correctAnswerText = this.attributes.correctAnswerText;
    var translatedQuestions = this.t("QUESTIONS");

    /*if (answerSlotValid && parseInt(this.event.request.intent.slots.Answer.value) == this.attributes["correctAnswerIndex"]) {
        currentScore++;
        speechOutputAnalysis = this.t("ANSWER_CORRECT_MESSAGE");
    } else {
        if (!userGaveUp) {
            speechOutputAnalysis = this.t("ANSWER_WRONG_MESSAGE");
        }

        speechOutputAnalysis += this.t("CORRECT_ANSWER_MESSAGE", correctAnswerIndex, correctAnswerText);
    }*/

    // Check if we can exit the game session after GAME_LENGTH questions (zero-indexed)
    if (this.attributes["currentQuestionIndex"] == GAME_LENGTH - 1) {
        speechOutput = userGaveUp ? "" : this.t("ANSWER_IS_MESSAGE");
        speechOutput += speechOutputAnalysis + this.t("GAME_OVER_MESSAGE", currentScore.toString(), GAME_LENGTH.toString());

        this.emit(":tell", speechOutput)
    } else {
        currentQuestionIndex += 1;
        //correctAnswerIndex = Math.floor(Math.random() * (ANSWER_COUNT));
        var spokenQuestion = Object.keys(translatedQuestions[gameQuestions[currentQuestionIndex]])[0];
        //var roundAnswers = populateRoundAnswers.call(this, gameQuestions, currentQuestionIndex, correctAnswerIndex, translatedQuestions);
        var questionIndexForSpeech = currentQuestionIndex + 1;
        var repromptText = this.t("TELL_QUESTION_MESSAGE", questionIndexForSpeech.toString(), spokenQuestion);

        /*for (var i = 0; i < ANSWER_COUNT; i++) {
            repromptText += (i+1).toString() + ". " + roundAnswers[i] + ". "
        }*/

        speechOutput += userGaveUp ? "" : this.t("ANSWER_IS_MESSAGE");
        speechOutput += speechOutputAnalysis + this.t("SCORE_IS_MESSAGE", currentScore.toString()) + repromptText;

        Object.assign(this.attributes, {
            "speechOutput": repromptText,
            "repromptText": repromptText,
            "currentQuestionIndex": currentQuestionIndex,
            //"correctAnswerIndex": correctAnswerIndex + 1,
            "questions": gameQuestions,
            //"score": currentScore,
            "correctAnswerText": translatedQuestions[gameQuestions[currentQuestionIndex]][Object.keys(translatedQuestions[gameQuestions[currentQuestionIndex]])[0]][0]
        });

        this.emit(":askWithCard", speechOutput, repromptText, this.t("GAME_NAME"), repromptText);
    }
}

function populateGameQuestions(translatedQuestions) {
    var gameQuestions = [];
    var indexList = [];
    var index = translatedQuestions.length;

    if (GAME_LENGTH > index){
        throw new Error("Invalid Game Length.");
    }

    for (var i = 0; i < translatedQuestions.length; i++){
        indexList.push(i);
    }

    // Pick GAME_LENGTH random questions from the list to ask the user, make sure there are no repeats.
    for (var j = 0; j < GAME_LENGTH; j++){
        var rand = Math.floor(Math.random() * index);
        index -= 1;

        var temp = indexList[index];
        indexList[index] = indexList[rand];
        indexList[rand] = temp;
        gameQuestions.push(indexList[index]);
    }

    return gameQuestions;
}

/**
 * Get the answers for a given question, and place the correct answer at the spot marked by the
 * correctAnswerTargetLocation variable. Note that you can have as many answers as you want but
 * only ANSWER_COUNT will be selected.
 * */
function populateRoundAnswers(gameQuestionIndexes, correctAnswerIndex, correctAnswerTargetLocation, translatedQuestions) {
    //var answers = [];
    //var answersCopy = translatedQuestions[gameQuestionIndexes[correctAnswerIndex]][Object.keys(translatedQuestions[gameQuestionIndexes[correctAnswerIndex]])[0]].slice();
    //var index = answersCopy.length;

    //if (index < ANSWER_COUNT) {
    //    throw new Error("Not enough answers for question.");
    //}

    // Shuffle the answers, excluding the first element which is the correct answer.
    //for (var j = 1; j < answersCopy.length; j++){
        var rand = Math.floor(Math.random() * (index - 1)) + 1;
        index -= 1;

        var temp = answersCopy[index];
        answersCopy[index] = answersCopy[rand];
        answersCopy[rand] = temp;
    }

    // Swap the correct answer into the target location
    for (var i = 0; i < ANSWER_COUNT; i++) {
        answers[i] = answersCopy[i];
    }
    temp = answers[0];
    answers[0] = answers[correctAnswerTargetLocation];
    answers[correctAnswerTargetLocation] = temp;
    return answers;
}

function isAnswerSlotValid(intent) {
    var answerSlotFilled = intent && intent.slots && intent.slots.Answer && intent.slots.Answer.value;
    var answerSlotIsInt = answerSlotFilled && !isNaN(parseInt(intent.slots.Answer.value));
    return answerSlotIsInt && parseInt(intent.slots.Answer.value) < (ANSWER_COUNT + 1) && parseInt(intent.slots.Answer.value) > 0;
}
