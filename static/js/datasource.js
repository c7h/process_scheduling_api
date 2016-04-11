var timeBegin, timeEnd, laneLength;
var lanes, items, quantum_data;
function loadData(url) {
	var data = d3.json(url, function(data){
		//alten chart loeschen falls vorhanden.
		d3.selectAll('.chart').remove(); 
		//neuen chart erstellen mit geladenen daten
		createChart(data);
	});
	return data;
};

// deprecated!
function loadSchedulerList(url) {
	var schedulerList = d3.json(url, function(data){
		slist = data["installed scheduler"];
		return slist;
	});
};

//initiales Daten laden:
//var data = loadData("http://localhost:8000/data.json");