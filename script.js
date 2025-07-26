// Load data
d3.csv("data/covid_data.csv").then(data => {
    // Parse numbers, dates, etc.
    data.forEach(d => {
      d.date = new Date(d.date);
      d.cases = +d.cases;
      d.deaths = +d.deaths;
    });
  
    // Set up SVG
    const svg = d3.select("svg");
    const width = +svg.attr("width");
    const height = +svg.attr("height");
  
    // Example visualization: line chart for cases
    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date))
      .range([50, width - 50]);
  
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.cases)])
      .range([height - 50, 50]);
  
    const line = d3.line()
      .x(d => x(d.date))
      .y(d => y(d.cases));
  
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", line);
  
    // Add axes
    svg.append("g")
      .attr("transform", `translate(0,${height - 50})`)
      .call(d3.axisBottom(x));
  
    svg.append("g")
      .attr("transform", `translate(50,0)`)
      .call(d3.axisLeft(y));
  
    // (Later) Add scroll-based interaction here
  });
  