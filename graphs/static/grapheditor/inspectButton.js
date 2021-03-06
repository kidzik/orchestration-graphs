/**
 * Inspect button class
 * 
 */
var InspectButton = function() {

	// Instance to return (inheritance from Button)
	var inspectButton = Button.apply(inspectButton);

	// Private variables
	var x, y;
	var graph = SingletonGraph.getInstance();
	var paper = graph.paper;

	// Private functions

	function drawCircle() {
		inspectButton.circle = paper
		.circle(x, y, 7)
		.style('base', 'inspectButton');
    }

	function drawText() {
	    inspectButton.text = paper
	    .text(x, y, '?')
	    .style('base', 'button');
	}

	// Public variables and functions

	/**
	 * Initialize the inspect button by setting circle and text
	 *
	 */
	inspectButton.initRaphaelElements = function(type, params) {
		if (params.inspectCircle && params.inspectText){
			inspectButton.circle = params.inspectCircle;
			inspectButton.text = params.inspectText;
		} else {
			drawCircle();
			drawText();
		}
		inspectButton.circle.description = type + "InspectCircle";
	    inspectButton.text.description = type + "InspectText";
	    inspectButton.hide();
	};

	/**
	 * Custom handlers related to this inspect button
	 *
	 */
	inspectButton.setCustomHandlers = function() {
		// Inspect target on click
		var nodes = [inspectButton.circle.node, inspectButton.text.node];
		$(nodes).on('click', {target: inspectButton.getTarget()}, inspectButtonHandlers.onClick);
	};

	return inspectButton;
};
