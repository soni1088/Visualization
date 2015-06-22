

 
// get the data
d3.json("test.json", function(error, links) {
 
var nodes = {};
 
 
// Compute the distinct nodes from the links.
links.forEach(function(link) {
    link.uri= link[0]["uri"];
    var srcid= [];
    var destid=[];
    var id= [];
    var noes= [];//number of elements in d.src
    var noed=[];
    link.source= link[0]["sources"];
    link.dest= link[0]["destinations"];
    link.target= link[0]["id"];
    noes.push(link.source.length);
    if (noes[0]!==0){
        for (var i=0; i<noes[0];i++){
            srcid.push(link.source[i]);}
    }
    if (noed[0]!==0){
        for (var i=0; i<noed[0];i++){
            destid.push(link.dest[i])
        }
    }
    
    id.push(link.target);
    //info=[];
   
    console.log(srcid);
    link.source = nodes[srcid] || 
        (nodes[srcid]= {name: link.source});
    link.dest= nodes[destid] || 
        (nodes[destid]= {name: link.dest});
    link.target = nodes[id] || 
        (nodes[id] = {name: link.target});
    link.value = +link[0]["id"];
    
});
 
var width = 900,
    height = 700,
    color = d3.scale.category20c();

 
var force = d3.layout.force()
    .nodes(d3.values(nodes))
    .links(links)
    .size([width, height])
    .linkDistance(60)
    .charge(-100)
    .on("tick", tick)
    .start();
// Set the range
var  v = d3.scale.linear().range([0, 1000]);
 
// Scale the range of the data
v.domain([0, d3.max(links, function(d) { return d.value; })]);
 
// asign a type per value to encode opacity
/*links.forEach(function(link) {
	if (v(link.value) <= 25) {
		link.type = "twofive";
	} else if (v(link.value) <= 50 && v(link.value) > 25) {
		link.type = "fivezero";
	} else if (v(link.value) <= 75 && v(link.value) > 50) {
		link.type = "sevenfive";
	} else if (v(link.value) <= 100 && v(link.value) > 75) {
		link.type = "onezerozero";
	}*/

 
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var div = d3.select("body")
    .append("div")                          // declare the tooltip div 
    .attr("class", "tooltip")              // apply the 'tooltip' class
    .style("opacity", 0);
 
// build the arrow.
svg.append("svg:defs").selectAll("marker")
    .data(["end"])      // Different link/path types can be defined here
  .enter().append("svg:marker")    // This section adds in the arrows
    .attr("id", String)
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 15)
    .attr("refY", -1.5)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
  .append("svg:path")
    .attr("d", "M0,-5L10,0L0,5");
 
// add the links and the arrows
var path = svg.append("svg:g").selectAll("path")
    .data(force.links())
  .enter().append("svg:path")
    .attr("class", function(d) { return "link " + d.type; })
    .attr("marker-end", "url(#end)");
 
// define the nodes
var node = svg.selectAll(".node")
    .data(force.nodes())
  .enter().append("g")
    .attr("class", "node")
    .on("click", click)
    .on("dblclick", dblclick)
    /*.on("mouseover", function(d) {      
        div.transition()
            .duration(500)  
            .style("opacity", .9);
        div.html("<strong>URI: </strong> <span style='color:green'>"+ d.uri + "</span>")
            .style("left", (d3.event.pageX + 18) + "px")          
            .style("top", (d3.event.pageY + 18) + "px");})*/
    .call(force.drag);
 
// add the nodes
node.append("circle")
    .attr("r", 5)
    .style("fill", function(d) { return color(d.name); });

 
// add the text 
node.append("text")
    .attr("x", 12)
    .attr("dy", ".35em")
    .text(function(d) { return d.name;})
    
// add the curvy lines
function tick() {
    path.attr("d", function(d) {
        var dx = d.source.x - d.target.x,
            dy = d.source.y - d.target.y,
            dr = Math.sqrt(dx * dx + dy * dy);
        return "M" + 
            d.target.x + "," + 
            d.target.y + "A" + 
            dr + "," + dr + " 0 0,1 " + 
            d.source.x + "," + 
            d.source.y;
    });
 
    node
        .attr("transform", function(d) { 
		    return "translate(" + d.x + "," + d.y + ")"; });
}
 
// action to take on mouse click
function click() {
    d3.select(this).select("text").transition()
        .duration(750)
        .attr("x", 22)
        .style("stroke", "lightsteelblue")
        .style("stroke-width", ".5px")
        .style("font", "30px sans-serif");
    d3.select(this).select("circle").transition()
        .duration(750)
        .attr("r", 16)
}
 
// action to take on mouse double click
function dblclick() {
    d3.select(this).select("circle").transition()
        .duration(750)
        .attr("r", 6);
    d3.select(this).select("text").transition()
        .duration(750)
        .attr("x", 12)
        .style("stroke", "none")
        .style("fill", "black")
        .style("stroke", "none")
        .style("font", "10px sans-serif");
}
 
});

