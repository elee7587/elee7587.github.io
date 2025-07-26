// Load data
const countryMap = new Map();
const perCapitaMap = new Map();

d3.csv("data/country_vaccinations.csv").then(data => {
    // Parse numbers, dates, etc.

    data.forEach(d => {
        const date = d.date;
        const country = d.country;
        const total = d.total_vaccinations;
        const perHundred = +d.total_vaccinations_per_hundred

        if (!countryMap.has(country) || countryMap.get(country).date < date) {
            countryMap.set(country, {country, date, total});
        }
        if (!perCapitaMap.has(country) || perCapitaMap.get(country).date < date) {
            perCapitaMap.set(country, { country, date, perHundred });
        }

    });

    let latestData = Array.from(countryMap.values())
        .filter(d => !isNaN(d.total))
        .sort((a, b) => b.total - a.total)
        .slice(0, 15);
    drawBarChart(latestData);
    drawBarChartPerHundred(Array.from(perCapitaMap.values()));
  });
//first chart
function drawBarChart(data) {
const margin = { top: 30, right: 200, bottom: 40, left: 150 };
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


//second chart 
function drawBarChartPerHundred(data) {

const top15 = Array.from(perCapitaMap.values())
    .filter(d => !isNaN(d.perHundred))
    .sort((a, b) => b.perHundred - a.perHundred)
    .slice(0, 15);

const margin = { top: 30, right: 100, bottom: 40, left: 150 };
const width = 800 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

const svg = d3.select("#viz2")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const x = d3.scaleLinear()
    .domain([0, d3.max(top15, d => d.perHundred)])
    .range([0, width]);

const y = d3.scaleBand()
    .domain(top15.map(d => d.country))
    .range([0, height])
    .padding(0.2);

svg.append("g").call(d3.axisLeft(y));

svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).ticks(5));

svg.selectAll("rect")
    .data(top15)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", d => y(d.country))
    .attr("width", d => x(d.perHundred))
    .attr("height", y.bandwidth())
    .attr("fill", "#4daf4a");

svg.selectAll("text.label")
    .data(top15)
    .enter()
    .append("text")
    .attr("class", "label")
    .attr("x", d => x(d.perHundred) + 5)
    .attr("y", d => y(d.country) + y.bandwidth() / 2 + 5)
    .text(d => d.perHundred.toFixed(1))
    .style("font-size", "12px");
}

// Optional helper functions to show/hide elements
function showIntroChart() {
    console.log("Showing Intro Step");
    // You can trigger animations, show/hide elements, or update content here
  }
  
  function showLineChart() {
    console.log("Showing Case Trends");
    // e.g., update an SVG or draw a new chart here
  }
  
  function showPerCapitaChart() {
    console.log("Showing Deaths & Vaccination Rates");
    // You could scroll to #viz2 or highlight that area
  }
  
  // Scroll-triggered behavior
  const steps = d3.selectAll(".step");
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const step = entry.target.getAttribute("data-step");
        console.log("Now at step", step);
  
        // Update visual based on step
        if (step === "1") {
          showIntroChart();
        } else if (step === "2") {
          showLineChart();
        } else if (step === "3") {
          showPerCapitaChart();
        }
        // Add more steps if needed
      }
    });
  }, { threshold: 0.5 });
  
  steps.each(function () {
    observer.observe(this);
  });