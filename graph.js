
function graphData(){
// Set the dimensions of the canvas / graph

var margin = {top: 20, right: 250, bottom: 60, left: 60},
    width = 960 - margin.left - margin.right,
    w= 850,
    h= 300,
    height = 500- margin.top - margin.bottom;
/*var margin = {top: 30, right: 20, bottom: 30, left: 50},
    width = 600 - margin.left - margin.right,
    w= 500, h= 100
    height = 270 - margin.top - margin.bottom;*/

// Parse the date / time
var parseDate = d3.time.format(" %a, %d %b %Y %H:%M:%S GMT").parse;

// Set the ranges
var x = d3.time.scale().range([0, width]);
var y = d3.scale.linear().range([height, 0]);

// Define the axes
var xAxis = d3.svg.axis().scale(x)
    .orient("bottom").tickFormat(d3.time.format("%M:%S")).ticks(10).ticks(d3.time.minutes, 1).ticks(d3.time.seconds, 10);
var yAxis = d3.svg.axis().scale(y)
    .orient("left").ticks(20);

// Define the line
var valueline = d3.svg.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.id); });

// Define 'div' for tooltips
var div = d3.select("body")
    .append("div")                          // declare the tooltip div 
    .attr("class", "tooltip")              // apply the 'tooltip' class
    .style("opacity", 0);
        
// Adds the svg canvas
var svg = d3.select("body")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("style", "outline: thin solid blue;")  
    .append("g")
        .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");
  
// Get the data
d3.json("graph.json", function(error, data){
    data.forEach(function(d){ 
        d.date= parseDate(d[1]["resp_header"]["Date"]);
        d.id= +d[0]["id"];
        d.src= d[0]["sources"];
        d.dest= d[0]["destinations"]; 
        d.uri= d[0]["uri"];        
    });
  
  
    // Scale the range of the data
    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([0,d3.max(data, function(d) { return d.id; })]);

    // Add the valueline path and by removing this part of the code, removes the line(might be required later)
    /*svg.append("path")
        .attr("class", "line")
        .attr("d", valueline(data))*/
    var cRadius = 0.5, // change cRadius value for adjusting arrow
        markerWidth = 6,
        markerHeight = 6,
        refX = cRadius + (markerWidth * 2),
        refY = -Math.sqrt(cRadius);

    //To build arrows for line
    svg.append("svg:defs").selectAll("marker")
        .data(["end"])          // Different link/path types can be defined here
     .enter().append("svg:marker")    // This section adds in the arrows
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", refX)
        .attr("refY", refY)
        .attr("markerUnits","strokeWidth")
        .attr("markerWidth", markerWidth)
        .attr("markerHeight",markerHeight)
        .attr("orient", "auto")
     .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", "#000");

    // Add the scatterplot
    svg.selectAll("circle")
        .data(data)
      .enter().append("circle")
        .attr("r", 5)
        .attr("cx", function(d) { return x(d.date); })
        .attr("cy", function(d) { return y(d.id); })

        // Tooltip stuff after this
        .on("mouseover", function(d){
            div.transition()    
                .style("opacity", .9);  
            div.html("<strong>ID: </strong> <span style='color:purple'>"+ d.id + "</span>"+ "<br/>"+ "<strong>URI: </strong> <span style='color:purple'>"+ d.uri + "</span>"+ "<br/>"+ "<strong>SRC: </strong> <span style='color:brown'>" + d.src + "</span>"+ "<br/>"  + "<strong>DEST: </strong> <span style='color:brown'>"+ d.dest+ "</span>") 
                .style("left", (d3.event.pageX + 18) + "px")          
                .style("top", (d3.event.pageY + 18) + "px");

            var x1cor= x.invert(d3.select(this).attr("cx"));
            var y1cor = y.invert(d3.select(this).attr("cy"));

           
            if ((data[y1cor][0].sources.length!==0) && (data[y1cor][0].destinations.length!==0)){
                for (var i=0;i<data[y1cor][0].sources.length;i++){
                    var y2cor= data[y1cor][0].sources[i];
                    if(y1cor!==y2cor){
                        var x2cor= parseDate(data[y2cor][1].resp_header.Date);  
                        svg.append("line")
                            .attr("id","myline")
                            .style("stroke","red")
                            .style("stroke-width","2")
                            .attr("x1", function(d) { return x(x2cor);})
                            .attr("y1", function(d) { return y(y2cor);})
                            .attr("x2", function(d) { return x(x1cor);})
                            .attr("y2", function(d) { return y(y1cor);})
                            .attr("marker-end", "url(#end)");
                    }       
                }
                for (var i=0;i<data[y1cor][0].destinations.length;i++){
                    var y2cor= data[y1cor][0].destinations[i];
                    if(y1cor!==y2cor){
                        var x2cor= parseDate(data[y2cor][1].resp_header.Date);  
                        svg.append("line")
                            .attr("id","myline2")
                            .style("stroke","black")
                            .style("stroke-width","2")
                            .style("stroke-dasharray", ("5, 5")) 
                            .attr("x1", function(d) { return x(x1cor);})
                            .attr("y1", function(d) { return y(y1cor);})
                            .attr("x2", function(d) { return x(x2cor);})
                            .attr("y2", function(d) { return y(y2cor);})
                            .attr("marker-end", "url(#end)");
                    }                   
                }  
            }

            else if ((data[y1cor][0].sources.length!==0) || (data[y1cor][0].destinations.length!==0)){
                for (var i=0;i<data[y1cor][0].sources.length;i++){
                    var y2cor= data[y1cor][0].sources[i];
                    if(y1cor!==y2cor){
                        var x2cor= parseDate(data[y2cor][1].resp_header.Date);  
                        svg.append("line")
                            .attr("id","myline")
                            .style("stroke","blue")
                            .style("stroke-width","2")
                            .attr("x1", function(d) { return x(x2cor);})
                            .attr("y1", function(d) { return y(y2cor);})
                            .attr("x2", function(d) { return x(x1cor);})
                            .attr("y2", function(d) { return y(y1cor);})
                            .attr("marker-end", "url(#end)");
                    }       
                }
                for (var i=0;i<data[y1cor][0].destinations.length;i++){
                    var y2cor= data[y1cor][0].destinations[i];
                    if(y1cor!==y2cor){
                        var x2cor= parseDate(data[y2cor][1].resp_header.Date);  
                        svg.append("line")
                            .attr("id","myline2")
                            .style("stroke","green")
                            .style("stroke-width","2")
                            .attr("x1", function(d) { return x(x1cor);})
                            .attr("y1", function(d) { return y(y1cor);})
                            .attr("x2", function(d) { return x(x2cor);})
                            .attr("y2", function(d) { return y(y2cor);})
                            .attr("marker-end", "url(#end)");
                    }                   
                }  
            }         
           
        })
        .on("mouseout", function(d) {              
            div.transition()        
                .duration(1000)      
                .style("opacity", 0)
            d3.selectAll("#myline").remove()
            d3.selectAll("#myline2").remove();      
        });
    

    // Add the X Axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // text label for the x axis
    svg.append("text")             
        .attr("x", 350 )
        .attr("y",  400 )
        .attr("dx", "1em")
        .style("text-anchor", "middle")
        .text("Time (mins:sec)");

    // Add the Y Axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

    //text label for the y-axis
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0-margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Referer Id");


    //Adding legend to the graph
   var color_hash = {  0 : ["Link from", "blue"],
                    1 : ["Link to", "green"],
                    2 : ["Both- Link from", "red"],
                    3 : ["Both- Link to", "black"]
                }
    

    var legend = svg.append("g")
          .attr("class", "legend")
          .attr("x", w - 65)
          .attr("y", 25)
          .attr("height", 100)
          .attr("width", 100);

        legend.selectAll("g")
          .data(data)
          .enter()
          .append("g")
          .each(function(d, i) {
            var g = d3.select(this);
            g.append("rect")
              .attr("x", w- 65)
              .attr("y", i*25)
              .attr("width", 10)
              .attr("height", 2)
              .style("fill", color_hash[i][1]);
            
            g.append("text")
              .attr("x", w- 50 )
              .attr("y", i * 25 + 8)
              .attr("height",30)
              .attr("width",100)
              .style("fill", color_hash[i][1])
              .text(color_hash[i][0]); 
            });



});
}