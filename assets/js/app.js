// Create a responsive chart horizontally
function handleResize() {
    var svgArea = d3.select("svg");

    // If there is already an svg container on the page, remove it and reload the chart
    if (!svgArea.empty()) {
        svgArea.remove();
        loadChart();
    }
}

function loadChart() {
    let svgWidth = window.innerWidth;
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
    let svg = d3.select("#scatter")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

    // Append a group area, then set its margins
    let chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

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

        // Declare scales
        let xScale = d3.scaleLinear()
            .domain([0, 11])
            .range([0, chartWidth]);

        // Configure a linear scale with a range between the chartHeight and 0
        let yScale = d3.scaleLinear()
            .domain([0, 100])
            .range([chartHeight, 0]);

        let zScale = d3.scaleLinear()
            .domain([419000, 28000000])
            .range([10, 70]);

        // Create two new functions passing the scales in as arguments
        // These will be used to create the chart's axes
        let bottomAxis = d3.axisBottom(xScale);
        let leftAxis = d3.axisLeft(yScale);

        // Append an SVG group element to the chartGroup, create the Y axis inside of it
        chartGroup.append("g")
            .classed("axis", true)
            .call(leftAxis);

        // Append an SVG group element to the chartGroup, create the X axis inside of it
        // Translate the bottom axis to the bottom of the page
        chartGroup.append("g")
            .classed("axis", true)
            .attr("transform", `translate(0, ${chartHeight})`)
            .call(bottomAxis);

        // Axis Titles
        chartGroup.append("text")
            .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 40})`)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .text("Charging Stations per Ten EVs");

        chartGroup.append("text")
            // .attr("transform", `translate(-40, ${chartHeight / 2})`)
            .attr("y", 0 - 35)
            .attr("x", 0 - (chartHeight / 3))
            .attr("text-anchor", "end")
            .attr("font-size", "16px")
            .attr("transform", "rotate(-90)")
            .text("EV Registrations per 10,000 drivers");

        // Add circles for licensed driver population
        let circlesGroup = chartGroup.selectAll("circle")
            .data(EVData)
            .enter()
            .append("circle")
            .attr("cx", function (d) { return xScale(d.CP); })
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
            .html(function(d) {
                // console.log(d);
                return d;
            })
        svg.call(toolTip);
        

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
                .duration(300)
                .style("fill", "#69b3a2");
        });
    });
}
// When the browser loads, loadChart() is called
loadChart();

// Event listener for window resize.
d3.select(window).on("resize", handleResize);
