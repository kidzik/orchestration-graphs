/**
 * Connection class
 * @return {Object} - Connection instance
 */
var Connection = function() {

	// Instance to return
	var connection = {};

	// Private variables
	var graph = SingletonGraph.getInstance();
	var paper = graph.paper;
	var set = paper.set();
	var BBox;

	// Private functions

	/**
	 * Update the Raphael path of the connection
	 * such that it links connection.from and connection.to
	 *
	 */
	function updatePath() {
		// adapted from http://dmitrybaranovskiy.github.io/raphael/graffle.html
	    var bb1 = connection.from.getBBox(),
	        bb2 = connection.to.getBBox(),
	        // Attach points for each objects (top, bottom, left, right)
	        p = [{x: bb1.x + bb1.width / 2, y: bb1.y - 1},
	        {x: bb1.x + bb1.width / 2, y: bb1.y + bb1.height + 1},
	        {x: bb1.x - 1, y: bb1.y + bb1.height / 2},
	        {x: bb1.x + bb1.width + 1, y: bb1.y + bb1.height / 2},
	        {x: bb2.x + bb2.width / 2, y: bb2.y - 1},
	        {x: bb2.x + bb2.width / 2, y: bb2.y + bb2.height + 1},
	        {x: bb2.x - 1, y: bb2.y + bb2.height / 2},
	        {x: bb2.x + bb2.width + 1, y: bb2.y + bb2.height / 2}],
	        d = {}, dis = [];
	    for (var i = 0; i < 4; i++) {
	        for (var j = 4; j < 8; j++) {
	            var dx = Math.abs(p[i].x - p[j].x),
	                dy = Math.abs(p[i].y - p[j].y);
	            if ((i == j - 4) ||
	                (((i != 3 && j != 6) || p[i].x < p[j].x) &&
	                 ((i != 2 && j != 7) || p[i].x > p[j].x) && 
	                 ((i != 0 && j != 5) || p[i].y > p[j].y) && 
	                 ((i != 1 && j != 4) || p[i].y < p[j].y))) {
	                dis.push(dx + dy);
	                d[dis[dis.length - 1]] = [i, j];
	            }
	        }
	    }
	    // Compute path from attach points
	    if (dis.length == 0) {
	        var res = [0, 4];
	    } else {
	        res = d[Math.min.apply(Math, dis)];
	    }
	    var x1 = p[res[0]].x,
	        y1 = p[res[0]].y,
	        x4 = p[res[1]].x,
	        y4 = p[res[1]].y;
	    dx = Math.max(Math.abs(x1 - x4) / 2, 10);
	    dy = Math.max(Math.abs(y1 - y4) / 2, 10);
	    var x2 = [x1, x1, x1 - dx, x1 + dx][res[0]].toFixed(3),
	        y2 = [y1 - dy, y1 + dy, y1, y1][res[0]].toFixed(3),
	        x3 = [0, 0, 0, 0, x4, x4, x4 - dx, x4 + dx][res[1]].toFixed(3),
	        y3 = [0, 0, 0, 0, y1 + dy, y1 - dy, y4, y4][res[1]].toFixed(3);
	    
	    // Update path and reposition buttons
	    connection.path.attr({path: ["M", x1.toFixed(3), y1.toFixed(3), "C", x2, y2, x3, y3, x4.toFixed(3), y4.toFixed(3)].join(",")});
		
		if (connection.deleteButton && connection.inspectButton) {
			connection.inspectButton.setPosition(connection.path.getPointAtLength(1/3 * connection.path.getTotalLength()));
			connection.deleteButton.setPosition(connection.path.getPointAtLength(2/3 * connection.path.getTotalLength()));
		}
	}

	/**
	 * Update the BBox object
	 * BBox is the BBox of the path (enlarged if too small)
	 *
	 */
	function updateBBox() {
		BBox = connection.path.getBBox();
		if (BBox.height < 10) {
		 	BBox.y = connection.path.getBBox().y - 5;
		 	BBox.height = connection.path.getBBox().height + 10;
		}
		if (BBox.width < 10) {
		 	BBox.x = connection.path.getBBox().x - 5;
		 	BBox.width = connection.path.getBBox().width + 10;
		}
	}

	// Public variables and functions

	// Raphael elements
	connection.from = null;
	connection.to = null;
	connection.path = null;
	connection.inspectSet = paper.set(); // set of elements that will change style when inspected

	// Buttons
	connection.inspectButton = null;
	connection.deleteButton = null;

	// Complex operator information
	connection.type = null;
	connection.subtype = null;
	connection.label = null;
	connection.sublabel = null;

	/**
	 * Bind Raphael elements to the connection
	 * Called by the Connection builder
	 * @param {Object} params - containing :
	 *		  {sId, sCount, eId, eCount}					if creating new connection
	 *		  {sId, sCount, eId, eCount, raphael elements}	if loading connection
	 * data also contains type, subtype, label and sublabel if operator is complex
	 *
	 */
	connection.initRaphaelElements = function(params) {
		// Initialize elements from params
		if (params.sId && params.sCount && params.eId && params.eCount) {
			connection.from = graph.getActivityFromDbid(params.sId, params.sCount).rectangle;
			connection.to = graph.getActivityFromDbid(params.eId, params.eCount).rectangle;
			if (params.path) {
				connection.path = params.path;
			} else {
				connection.path = paper.path();
			}
		} else {
			throw new Error('Impossible to create connection.');
		}
		connection.update();

		// Initialize sets
		connection.inspectSet.push(connection.path);
		set.push(connection.path);
	};

	/**
	 * Update Raphael path and BBox
	 *
	 */
	connection.update = function() {
		updatePath();
		updateBBox();
	};

	/**
	 * Set Connection type, label, and Raphael elements custom attributes
	 * Called from the Connection builder when creating of loading activity
	 * Called after updating the counter of an activity
	 * @param {Object} data (optional) - contains type and label if loading or creating
	 *
	 */
	connection.setAttributes = function(data) {
		if (data) {
			connection.type = data.type;
			connection.subtype = data.subtype;
			connection.label = data.label;
			connection.sublabel = data.sublabel;
		}
		set.forEach(function(elem) {
			elem.startId = connection.from.dbid;
			elem.startCount = connection.from.counter;
			elem.endId = connection.to.dbid;
			elem.endCount = connection.to.counter;
			// Type is stored as 'otype' attribute (type of element is 'path')
    		elem.optype = connection.type;
    		elem.subtype = connection.subtype;
    		elem.label = connection.label;
    		elem.sublabel = connection.sublabel;
    	});
	};

	/**
	 * Delete this instance from the graph and remove Raphael elements
	 *
	 */
	connection.delete = function() {
		graph.deleteConnection(this);
	    set.forEach(function(element) {
	    	element.remove();
	    });
		connection = null;
	};

	/**
	 * Fill the inspector panel with information about the Connection
	 * Set the inspected object to this Connection
	 *
	 */
	connection.inspect = function() {
		$('#inspectContainer .panel-heading #inspectTitle')
		.html('Operator');
		var htmlContent =
			'<div class="form-group"><label class="col-md-2 text-right">From</label>' + dbActivities[connection.from.dbid].name + '</div>' +
			'<div class="form-group"><label class="col-md-2 text-right">To</label>' + dbActivities[connection.to.dbid].name + '</div>';
		if (connection.type && connection.label) {
			htmlContent +=
			'<div class="form-group">' +
				'<label class="col-md-2 text-right">Type</label>' + 
				connection.subtype + ' (' + connection.type + ')' +
			'</div>' +
			'<div class="form-group">' +
				'<label class="col-md-2 text-right">Label</label>' +
				connection.sublabel + ' (' + connection.label + ')' +
			'</div>';
		} 
		$('#inspectContainer .panel-body').html(htmlContent);
	
		graph.setInspectedObject(connection);
	};

	/**
	 * Binds buttons to this connection,
	 * @param {InspectButton} inspectButton
	 * @param {DeleteButton} deleteButton
	 *
	 */
	connection.bindButtons = function(inspectButton, deleteButton) {
		connection.inspectButton = inspectButton;
		connection.deleteButton = deleteButton;
		set.push(connection.inspectButton.circle, connection.inspectButton.text,
				 connection.deleteButton.circle, connection.deleteButton.text);
		connection.inspectButton.bindTarget(
			connection,
			connection.path.getPointAtLength(1/3 * connection.path.getTotalLength())
		);
		connection.deleteButton.bindTarget(
			connection,
			connection.path.getPointAtLength(2/3 * connection.path.getTotalLength())
		);
	};

	/**
	 * Custom handlers related to this connection
	 * Give them context data if needed (see connectionHandlers)
	 *
	 */
	connection.setCustomHandlers = function() {
		// Show buttons if moving over BBox
		$("#"+graph.id).on('mousemove', {connection: connection}, connectionHandlers.onMouseMove);
	};

	// Getter and setters for private variables
	connection.setFrom = function(rectangle) { connection.from = rectangle; };
	connection.setTo = function(rectangle) { connection.to = rectangle; };
	connection.setPath = function(path) { connection.path = path; };
	connection.getBBox = function() { return BBox; };
	
	return connection;
};
