

function createChart(data_array) { 
//unpack data_array
var items = data_array.items;
var lanes = data_array.lanes;
var quantum_data = data_array.quantum_data;
var launches = data_array.launches;
var timeBegin = +data_array.time_begin;
var timeEnd = +data_array.time_end;

var m = [20, 15, 15, 120], //top right bottom left
		w = 800 - m[1] - m[3],
		h = 450 - m[0] - m[2],
		miniHeight = lanes.length * 12 + 100,
		mainHeight = h - miniHeight - 100,
		quantumHeight = 45;
//scales
var x = d3.scale.linear()
		.domain([timeBegin, timeEnd])
		.range([0, w]);
var x1 = d3.scale.linear()
		.range([0, w]);
var y1 = d3.scale.linear()
		.domain([0, lanes.length])
		.range([0, mainHeight]);
var y2 = d3.scale.linear()
		.domain([0, lanes.length])
		.range([0, miniHeight]);

//select target by id and append svg element
var chart = d3.select("#visualizer")
			.append("svg")
			.attr("width", w + m[1] + m[3])
			.attr("height", h + m[0] + m[2])
			.attr("class", "chart");

chart.append("defs").append("clipPath")
	.attr("id", "clip")
	.append("rect")
	.attr("width", w)
	.attr("height", mainHeight);

var main = chart.append("g")
			.attr("transform", "translate(" + m[3] + "," + m[0] + ")")
			.attr("width", w)
			.attr("height", mainHeight)
			.attr("class", "main");

var mini = chart.append("g")
			.attr("transform", "translate(" + m[3] + "," + (mainHeight + 40 + m[0]) + ")")
			.attr("width", w)
			.attr("height", miniHeight)
			.attr("class", "mini");

var axis = d3.svg.axis()
			.scale(x)
			.orient('bottom')
			.ticks(20)
			.tickSize(6, 0, 0);

var axis_big = d3.svg.axis()
			 .scale(x1)
			 .orient('bottom')
			 .ticks(5)
			 .tickSize(-mainHeight, 0, 0);

//Zeitscheibenquantum
var quantum_list = [];
quantum_data.forEach(function(d){quantum_list.push(d.quantum);});
var qy = d3.scale.linear()
			.domain([0, d3.max(quantum_list)])
			.range([0, quantumHeight])

var quantum = chart.append('g')
			.attr("transform", "translate(" + m[3] + "," + (mainHeight + miniHeight + quantumHeight + m[0]) + ")")
			.attr('width', w)
			.attr('height', quantumHeight)
			.attr('class', 'quantum');

//append data quantum
quantum.append('g').selectAll('.quants')
	.data(quantum_data)
	.enter().append('rect')
	.attr('class','quantum')
	.attr('x', function(d) {return x(d.timestamp);})
	.attr('y', 20)
	.attr('width', x(4))
	.attr('height', function(d) {return qy(d.quantum)});

quantum.append('text')
	.text('time quantum')
	.attr('class', 'laneText')
	.attr('x', -m[1])
	.attr('y', qy(3))
	.attr("text-anchor", "end")
	.attr('dy', '.5ex');

//main lanes and texts
main.append("g").selectAll(".laneLines")
	.data(items)
	.enter().append("line")
	.attr("x1", m[1])
	.attr("y1", function(d) {return y1(d.lane);})
	.attr("x2", w)
	.attr("y2", function(d) {return y1(d.lane);})
	.attr("stroke", "lightgray")

main.append("g").selectAll(".laneText")
	.data(lanes)
	.enter().append("text")
	.text(function(d) {return d;})
	.attr("x", -m[1])
	.attr("y", function(d, i) {return y1(i + .5);})
	.attr("dy", ".5ex")
	.attr("text-anchor", "end")
	.attr("class", "laneText");


//mini lanes and texts
mini.append("g").selectAll(".laneLines")
	.data(items)
	.enter().append("line")
	.attr("x1", m[1])
	.attr("y1", function(d) {return y2(d.lane);})
	.attr("x2", w)
	.attr("y2", function(d) {return y2(d.lane);})
	.attr("stroke", "lightgray");

mini.append("g").selectAll(".laneText")
	.data(lanes)
	.enter().append("text")
	.text(function(d) {return d;})
	.attr("x", -m[1])
	.attr("y", function(d, i) {return y2(i + .5);})
	.attr("dy", ".5ex")
	.attr("text-anchor", "end")
	.attr("class", "laneText");

var itemRects = main.append("g")
					.attr("clip-path", "url(#clip)");



//define marker arrow
var defs = chart.append('defs');
defs.append("svg:marker")
    .attr("id", "arrowGray")
    .attr("viewBox", "0 0 10 10")
    .attr("refX", "5")
    .attr("refY", "5")
    .attr("markerUnits", "strokeWidth")
    .attr("markerWidth", "10")
    .attr("markerHeight", "5")
    .attr("orient", "auto")
    .append("svg:path")
    .attr("d", "M 0 0 L 10 5 L 0 10 z")
    .attr("fill", "#000");

//mini launch-arrows
mini.append("g").selectAll("miniLaunches")
	.data(launches)
	.enter().append("line")
	.attr("x1", function(d) {return x(d.timestamp);})
	.attr("x2", function(d) {return x(d.timestamp);})
	.attr("y1", function(d) {return y2(d.trigger + .6);})
	.attr("y2", function(d) {return y2(d.target);})
	.attr("class", "launch-ar")
	.attr("marker-end", "url(#arrowGray)");



//mini item rects
mini.append("g").selectAll("miniItems")
	.data(items)
	.enter().append("rect")
	.attr("class", function(d) {return d.state;})
	.attr("x", function(d) {return x(d.start);})
	.attr("y", function(d) {return y2(d.lane + .5) - 5;})
	.attr("width", function(d) {return x(d.end - d.start);})
	.attr("height", 10);

//mini labels
mini.append("g").selectAll(".miniLabels")
	.data(items)
	.enter().append("text")
	.text(function(d) {return d.details;})
	.attr("x", function(d) {return x(d.start);})
	.attr("y", function(d) {return y2(d.lane + .5);})
	.attr("dy", ".5ex");

//axis
mini.append('g')
	.attr('transform', 'translate(0,' + miniHeight + ')')
	.attr('class', 'axis date')
	.call(axis);

main.append('g')
	.attr('transform', 'translate(0,' + mainHeight + ')')
	.attr('class', 'axis date')
	.call(axis_big);

//brush
var brush = d3.svg.brush()
					.x(x)
					.extent([timeEnd*0.2, timeEnd*0.8]) //initial brush positions
					.on("brush", display);

mini.append("g")
	.attr("class", "x brush")
	.call(brush)
	.selectAll("rect")
	.attr("y", 1)
	.attr("height", miniHeight - 1);

display();

function display() {
	var rects, labels,
		minExtent = brush.extent()[0],
		maxExtent = brush.extent()[1],
		visItems = items.filter(function(d) {return d.start < maxExtent && d.end > minExtent;});
		// visItems are visible - on every call of display, check wich items are visible right now

	mini.select(".brush")
		.call(brush.extent([minExtent, maxExtent]));

	x1.domain([minExtent, maxExtent]);

	//update main item rects
	rects = itemRects.selectAll("rect")
	        .data(visItems, function(d) { return d.id; })
		.attr("x", function(d) {return x1(d.start);})
		.attr("width", function(d) {return x1(d.end) - x1(d.start);});
	
	rects.enter().append("rect")
		.attr("class", function(d) {return d.state;})
		.attr("x", function(d) {return x1(d.start);})
		//.attr("y", function(d) {return y1(d.lane) + 10;}) 
		.attr("width", function(d) {return x1(d.end) - x1(d.start);})
		//.attr("height", function(d) {return .7 * y1(1);});
		.attr("y", 		function(d) {return y1(d.lane + .4) - 5;})
		.attr("height", y1(0.4));

	rects.exit().remove();

	//update the item labels
	labels = itemRects.selectAll("text")
		.data(visItems, function (d) { return d.id; })
		//.attr("x", function(d) {return x1(Math.max(d.start, minExtent) + 2);});
		.attr("x", function(d) {return x1(d.start);})


	labels.enter().append("text") 
		.text(function(d) {return d.details;})  //main labels
		//.attr("x", function(d) {return x1(Math.max(d.start, minExtent));})
		.attr("x", function(d) {return x1(d.start);})
		.attr("y", function(d) {return y1(d.lane + .6);}) //.6 was .5
		.attr("text-anchor", "start");

	labels.exit().remove();

	//update main axis
	main.select('.axis').call(axis_big);


};
};