/**
 * Constructs a new activity set and adds it to the current graph
 * x, y                     position of the new activity on the graph
 * name, description, url   of the activity defined in the activity form
 * 
 */
function activity(x, y, name, description, url) {
    // Creates a set containing a new Raphael rectangle and a new Raphael text
    var activitySet = graph.set();
    var activityRect = graph.rect(x - 30, reposition(y - 20), 60, 40);
    activityRect.attr({
        fill: activityFill,
        "stroke-width": 0,
        title: description,
        href: url
    });
    var activityText = graph.text(x, reposition(y - 20) + 20, correctTextSize(name));
    activityText.attr({fill: "#FFF"});
    activitySet.push(activityRect, activityText);

    // Add custom attributes to Raphael elements
    activitySet.forEach(function(elem) {
        elem.activitySet = activitySet; // allows the drag method to apply on the whole set
        elem.selected = false;          // allows to (de)select an activity
    });

    // Initiates the handlers on the new activity set (drag&drop, click)
    activitySet.drag(move, dragger, up);            // MOVE mode
    activitySet.click(function(event) {
        handleClickOnActivity(event, activitySet);  // SELECT/ERASE mode
    });

    // Double click on activity opens the url in new tab
    activitySet.dblclick(function(event) {
        if (activityRect.attr('href')) {
            window.open(activityRect.attr('href'), '_blank');
        }
    });

    console.log('creating activity');

    // Adds the new set to the global set of activities
    activities.push(activitySet);

    // Default return to MOVE mode
    changeMode("MOVE");
}


/**
 * Initiates the creation of a new activity
 * x, y     position of the new activity on the graph
 *
 */
function newActivityForm(x, y) {
    newActivityX = x;
    newActivityY = y;
    $('#activityForm').modal('show');
}

/**
 * Processes information about a new activity from the activity form
 *
 */
function submitNewActivityForm() {
    $('#activityForm').modal('hide');
    activity(newActivityX, newActivityY, $('#newActivityName')[0].value, $('#newActivityType')[0].value, $('#newActivityUrl')[0].value);
    $('#newActivityName')[0].value = '';
    $('#newActivityType')[0].value = '';
    $('#newActivityUrl')[0].value = '';
}

/**
 * Format activity title size
 *
 */
function correctTextSize(text) {
    var midTextSize = (text.length - text.length%2)/2;
    var thirdTextSize = (text.length - text.length%3)/3
    
    if (text.length <10) {
        return text;
    } else if (text.length < 20) {
        return text.substring(0,midTextSize).concat("\n").concat(text.substring(midTextSize,text.length));
    } else {
        return text.substring(0,thirdTextSize).concat("\n").concat(text.substring(thirdTextSize,thirdTextSize*2)).concat("\n").concat(text.substring(thirdTextSize*2,text.length));
    }
    
}