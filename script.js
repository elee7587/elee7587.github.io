// Load data
d3.csv("data/country_vaccinations.csv").then(data => {
    // Parse numbers, dates, etc.
    const countryMap = new Map();
    data.forEach(d => {
        const date = d.date;
        const country = d.country;
        const total = +d.total_vaccinations;

        if (!countryMap.has(country) || countryMap.get(country).date < date) {
            countryMap.set(country, {country, date, total});
        }
    });

    let latestData = Array.from(countryMap.values())
        .filter(d => !isNaN(d.total))
        .sort((a, b) => b.total - a.total)
        .slice(0, 15);
    drawBarChart(latestData);
  });
  function drawBarChart(data) {
    const margin = { top: 30, right: 30, bottom: 40, left: 150 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
  
    const svg = d3.select("#viz")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.total)])
      .range([0, width]);
  
    const y = d3.scaleBand()
      .domain(data.map(d => d.country))
      .range([0, height])
      .padding(0.2);
  
    svg.append("g")
      .call(d3.axisLeft(y));
  
    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).ticks(5))
      .selectAll("text")
      .style("text-anchor", "middle");
  
    svg.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", d => y(d.country))
      .attr("width", d => x(d.total))
      .attr("height", y.bandwidth())
      .attr("fill", "steelblue");
  
    svg.selectAll("text.label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", d => x(d.total) + 5)
      .attr("y", d => y(d.country) + y.bandwidth() / 2 + 5)
      .text(d => d.total.toLocaleString())
      .style("font-size", "12px");
  }
  

  