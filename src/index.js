'use strict';
var Alexa = require('alexa-sdk');

//=========================================================================================================================================
//TODO: The items below this comment need your attention.
//=========================================================================================================================================

//Replace with your app ID (OPTIONAL).  You can find this value at the top of your skill's page on http://developer.amazon.com.  
//Make sure to enclose your value in quotes, like this: var APP_ID = "amzn1.ask.skill.bb4045e6-b3e8-4133-b650-72923c5980f1";
var APP_ID = "amzn1.ask.skill.2fbb06b7-6727-4231-9c85-8753d52f36fa";

var SKILL_NAME = "Morning Motivation";
var GET_FACT_MESSAGE = "Here's your quote: ";
var HELP_MESSAGE = "You can say tell me a quote, or, you can say exit... What can I help you with?";
var HELP_REPROMPT = "What can I help you with?";
var STOP_MESSAGE = "Have a great day! Goodbye!";

//=========================================================================================================================================
//TODO: Replace this data with your own.  You can find translations of this data at http://github.com/alexa/skill-sample-node-js-fact/data
//=========================================================================================================================================
var data = [
    "No matter how bad things are, you can at least be happy that you woke up this morning -- D.L. Hughley",
    "Smile in the mirror. Do that every morning and you'll start to see a big difference in your life -- Yoko Ono",
    "There was never a night or a problem that could defeat sunrise or hope -- Bernard Williams",
    "When you arise in the morning, thinkg of what a precious privilege it is to be alive - to breathe, to think, to enjoy, to love -- Marcus Aurelius",
    "Every day I feel is a blessing from God. And I consider it a new beginning. Yeah, everything is beautiful -- Prince",
    "I wake up every morning literally with a smile on my face, grateful for another day I never thought I'd see -- Dick Cheney",
    "I have always been delighted at the prospect of a new day, a fresh try, one more start, with perhaps a bit of magic waiting somewhere behind the morning -- J.B. Priestley",
    "I'm always thinking about creating. My future starts when I wake up every morning... Every day I find something creative to do with my life -- Miles Davis",
    "Be pleasant until ten o'clock in the morning and the rest of the day will take care of itself -- Elbert Hubbard",
    "My favorite things in life don't cost any money. It's really clear that the most precious resource we all have is time -- Steve Jobs",
    "Things don't have to change the world to be important -- Steve Jobs"
];

//=========================================================================================================================================
//Editing anything below this line might break your skill.  
//=========================================================================================================================================
exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        this.emit('GetNewQuoteIntent');
    },
    'GetNewQuoteIntent': function () {
        var factArr = data;
        var factIndex = Math.floor(Math.random() * factArr.length);
        var randomFact = factArr[factIndex];
        var speechOutput = GET_FACT_MESSAGE + randomFact;
        this.emit(':tellWithCard', speechOutput, SKILL_NAME, randomFact)
    },
    'AMAZON.HelpIntent': function () {
        var speechOutput = HELP_MESSAGE;
        var reprompt = HELP_REPROMPT;
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', STOP_MESSAGE);
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', STOP_MESSAGE);
    }
};