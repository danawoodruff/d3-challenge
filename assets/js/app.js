// v3-14 DKW
// Create a responsive chart horizontally
function makeResponsive() {
    let svgArea = d3.select("body").select("svg");

    // If there is already an svg container on the page, remove it and reload the chart
    if (!svgArea.empty()) {
        svgArea.remove();
    }
    // let svgWidth = window.innerWidth;
    let svgWidth = 1200;
    let svgHeight = 800;

    // Define the chart's margins as an object
    let margin = {
        top: 60,
        right: 60,
        bottom: 60,
        left: 60
    };

    // Define dimensions of the chart area
    let chartWidth = svgWidth - margin.left - margin.right;
    let chartHeight = svgHeight - margin.top - margin.bottom;

    //Select id 'scatter', append SVG area to it, and set its dimensions
    let svg = d3
        .select("#scatter")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    // Append a group area, then set its margins
    let chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Initial Parameters
    let chosenXAxis = "CP";
    let yAxis = "EVPer10K";

    // Declare scales
    function xScale(EVData, chosenXAxis) {
        // Create scales
        let xLinearScale = d3.scaleLinear()
            .domain([d3.min(EVData, d => d[chosenXAxis]) * 0.8,
            d3.max(EVData, d => d[chosenXAxis]) * 1.2
            ])
            .range([0, chartWidth]);

        return xLinearScale;
    }

    // Updating xAxis var upon click on axis label
    function renderXAxes(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);

        xAxis.transition()
            .duration(1000)
            .call(bottomAxis);

        return xAxis;
    }

    // Updating circles group 
    function renderCircles(circlesGroup, newXScale, chosenXAxis, yScale, yAxis) {

        circlesGroup.transition()
            .duration(500)
            .attr("cx", d => newXScale(d[chosenXAxis]))
            .attr("cy", function (d) { return yScale(d.EVPer10K); })
            
        return circlesGroup;
    } 

 // Load data from EVs.csv
d3.csv("./assets/data/EVs.csv").then(function (EVData) {

    // console.log(EVData);

    // Read the data and cast the EV Registration value to a number
    EVData.forEach(function (data) {
        data.EV_Registration = +data.EV_Registration;
        data.Licensed_Drivers = +data.Licensed_Drivers;
        data.Charge_Ports = +data.Charge_Ports;
        data.EVPer10K = +data.EVPer10K;
    });

    // xLinearScale function above csv import
    let xLinearScale = xScale(EVData, chosenXAxis);

    // Configure a linear scale with a range between the chartHeight and 0
    let yScale = d3.scaleLinear()
        .domain([0, 100])
        .range([chartHeight, 0]);

    let zScale = d3.scaleLinear()
        .domain([419000, 28000000])
        .range([10, 70]);

    // Create two new functions passing the scales in as arguments
    // These will be used to create the chart's axes
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yScale);

    // Append an SVG group element to the chartGroup, create the Y axis inside of it
    let yAxis = chartGroup.append("g")
        .classed("axis", true)
        .call(leftAxis);

    // Append an SVG group element to the chartGroup, create the X axis inside of it
    // Translate the bottom axis to the bottom of the page
    let xAxis = chartGroup.append("g")
        .classed("axis", true)
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(bottomAxis);

    // Axis Titles
    // Create groups for the two different x-axis labels
    let xlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 40})`)
        .attr("text-anchor", "middle")
        .attr("font-size", "16px");    

    let CPLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .classed("aText", true)
        .attr("value", "CP") // value to grab for event listener
        .classed("active", true)
        .text("Charging Stations per Ten EVs");
    
    let driversLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .classed("aText", true)
        .attr("value", "Licensed_Drivers") // value to grab for event listener
        .classed("inactive", true)
        .text("Licensed Drivers");

    let ylabel = chartGroup.append("text")  //y-axis
        .attr("y", 0 - 35)
        .attr("x", 0 - (chartHeight / 2))
        .classed("active", true)
        .attr("text-anchor", "end")
        .attr("font-size", "16px")
        .attr("transform", "rotate(-90)")
        .text("EV Registrations per 10,000 drivers");

        // Add circles for licensed driver population
    let circlesGroup = chartGroup.selectAll("circle")
        .data(EVData)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return xLinearScale(d.CP); })
        .attr("cy", function (d) { return yScale(d.EVPer10K); })
        .attr("r", function (d) { return zScale(d.Licensed_Drivers); })
        .style("fill", "#69b3a2")
        .style("opacity", "0.7")
        .attr("stroke", "black");

        // Add function for tooltip
    let toolTip = d3
        .tip()
        .attr("class", "d3-tip")
        .offset([40, 120])
        .html(function (d) {
            // console.log(d);
            return d;
        })
    
    svg.call(toolTip);

     // x axis labels event listener
    xlabelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            let value = d3.select(this).attr("value");
            if (value != chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = value;

                // console.log(chosenXAxis)

                // Updates x scale for new data
                xLinearScale = xScale(EVData, chosenXAxis);

                // Updates x axis with transition
                xAxis = renderXAxes(xLinearScale, xAxis);

                // Updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yScale, yAxis);

                // Changes classes to change bold text
                if (chosenXAxis === "CP") {
                    CPLabel.classed("active", true).classed("inactive", false);
                    driversLabel.classed("active", false).classed("inactive", true);
                }
                else {
                    CPLabel.classed("active", false).classed("inactive", true);
                    driversLabel.classed("active", true).classed("inactive", false);
                }
            }
        });

    // Add an on.mouseover event to display a tooltip and transition color when selected
    circlesGroup.on("mouseover", function (event, d) {
        toolTip.show(`<strong>State : ${event.State}</strong><br>
                    <strong>EV Registrations : ${d3.format(',')(event.EV_Registration)}</strong><br>
                    <strong>Charging Ports : ${d3.format(',')(event.Charge_Ports)}</strong>`);
        d3.select(this)
            .transition()
            .duration(300)
            .style("fill", "lime");

    })

    // Add a on.mouseout event to make the tooltip invisible
    circlesGroup.on("mouseout", function (event, d) {
        toolTip.hide(event.State);
        d3.select(this)
            .transition()
            .duration(200)
            .style("fill", "#69b3a2");
    });
    });
}
// When the browser loads, makeResponsive() is called.
makeResponsive();

// Event listener for window resize.
d3.select(window).on("resize", makeResponsive);
