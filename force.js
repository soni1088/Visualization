function urlData(){ 

// get the data for force directed layout graph
d3.csv("url.csv", function(error, links) {
 
var nodes = {};
  
// Compute the distinct nodes from the links.
links.forEach(function(link) {
  link.source = nodes[link.source] || 
      (nodes[link.source] = {name: link.source});
  link.target = nodes[link.target] || 
      (nodes[link.target] = {name: link.target});
});
 
var width = 1200,
    height = 500,
    color = d3.scale.category20c();
 
var force = d3.layout.force()
    .nodes(d3.values(nodes))
    .links(links)
    .size([width, height])
    .linkDistance(160)
    .charge(-100)
    .on("tick", tick)
    .start();
 
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
    .attr("class", "link")
    .attr("marker-end", "url(#end)");
 
// define the nodes
var node = svg.selectAll(".node")
    .data(force.nodes())
  .enter().append("g")
    .attr("class", "node")
    .on("click", click)
    .on("dblclick", dblclick)
    .call(force.drag);
 
// add the nodes
node.append("circle")
    .attr("r", 5)
    .style("fill", function(d) { return color(d.name); });

// add the text 
node.append("text")
    .attr("x", 12)
    .attr("dy", ".35em")
    .style("fill", "gray")
    .text(function(d) {return d.name;})
    
// add the curvy lines
function tick() {
    path.attr("d", function(d) {
        var dx = d.source.x - d.target.x,
            dy = d.source.y - d.target.y,
            dr = Math.sqrt(dx * dx + dy * dy);
        return "M" + 
            d.source.x + "," + 
            d.source.y + "A" + 
            dr + "," + dr + " 0 0,1 " + 
            d.target.x + "," + 
            d.target.y;
    });
 
    node
        .attr("transform", function(d) { 
            return "translate(" + d.x + "," + d.y + ")"; });
}
 
// action to take on mouse click
function click() {
    d3.select(this).select("text").transition()
        .duration(750)
        .attr("x", 26)
        .style("fill", "blue")
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
        .style("fill", "gray")
        .style("stroke", "none")
        .style("font", "10px sans-serif");
}
 
});
}